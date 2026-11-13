"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useCountry } from "@/app/providers";
import {
  stockService,
  type StockHistoryPoint,
  type StockHistoryResponse,
} from "@/lib/services/stock.service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  ReferenceArea,
} from "recharts";

type Metric = "ACI" | "KFI" | "CNS" | "IES";
const METRICS: Metric[] = ["ACI", "KFI", "CNS", "IES"];
const PERIODS = ["1M", "3M", "6M", "1Y"] as const;

function toNum(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function daysFromPeriod(period: string) {
  // API max 90 -> keep UI same, but disable 6M/1Y
  if (period === "1M") return 30;
  return 90;
}

function insightKind(
  text: string,
): "OPPORTUNITY" | "CAUTION" | "NEUTRAL" | "PREMIUM" {
  const t = String(text || "").toUpperCase();
  if (t.includes("OPPORTUNITY")) return "OPPORTUNITY";
  if (t.includes("CAUTION")) return "CAUTION";
  if (t.includes("PREMIUM")) return "PREMIUM";
  return "NEUTRAL";
}

function badgeStyle(kind: ReturnType<typeof insightKind>) {
  if (kind === "OPPORTUNITY")
    return { border: "#22c55e", fg: "#16a34a", bg: "#f0fdf4" };
  if (kind === "CAUTION")
    return { border: "#f59e0b", fg: "#b45309", bg: "#fffbeb" };
  if (kind === "PREMIUM")
    return { border: "#ef4444", fg: "#dc2626", bg: "#fef2f2" };
  return { border: "#cbd5e1", fg: "#64748b", bg: "#f8fafc" };
}

function metricColor(m: Metric) {
  // keep similar to your screenshot legend
  if (m === "ACI") return "#4f46e5"; // indigo-ish
  if (m === "KFI") return "#f59e0b";
  if (m === "CNS") return "#22c55e";
  return "#a855f7"; // IES
}

function Gauge({ value, label }: { value: number; label: string }) {
  // Semi-circle gauge (0..100)
  const v = Math.max(0, Math.min(100, value));
  const r = 78;
  const cx = 95;
  const cy = 90;

  const startAngle = -180;
  const endAngle = 0;
  const angle = startAngle + (v / 100) * (endAngle - startAngle);

  function polarToXY(angleDeg: number) {
    const rad = (Math.PI / 180) * angleDeg;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  const p0 = polarToXY(startAngle);
  const p1 = polarToXY(endAngle);

  const needle = polarToXY(angle);

  return (
    <div className="flex flex-col items-center">
      <svg width={190} height={120}>
        {/* Base track */}
        <path
          d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Zones overlay (red/orange/yellow/green) */}
        {[
          { from: 0, to: 30, c: "#ef4444" },
          { from: 30, to: 50, c: "#f97316" },
          { from: 50, to: 70, c: "#eab308" },
          { from: 70, to: 100, c: "#22c55e" },
        ].map((z, idx) => {
          const a0 = startAngle + (z.from / 100) * 180;
          const a1 = startAngle + (z.to / 100) * 180;
          const s = polarToXY(a0);
          const e = polarToXY(a1);
          return (
            <path
              key={idx}
              d={`M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`}
              fill="none"
              stroke={z.c}
              strokeWidth="14"
              strokeLinecap="round"
              opacity={0.35}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke="#64748b"
          strokeWidth="3"
        />
        <circle
          cx={cx}
          cy={cy}
          r="5"
          fill="#ffffff"
          stroke="#64748b"
          strokeWidth="2"
        />

        {/* ticks */}
        {[0, 25, 50, 75, 100].map((t) => {
          const a = startAngle + (t / 100) * 180;
          const o = polarToXY(a);
          const i = polarToXY(a);
          // small tick inwards
          const dx = (cx - o.x) * 0.07;
          const dy = (cy - o.y) * 0.07;
          return (
            <line
              key={t}
              x1={o.x}
              y1={o.y}
              x2={i.x + dx}
              y2={i.y + dy}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      <div className="-mt-6 text-center">
        <div className="text-3xl font-bold tabular-nums">{v.toFixed(2)}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function StockHistoricalPage({
  symbol,
  onBack,
}: {
  symbol: string;
  onBack?: () => void;
}) {
  const router = useRouter();
  const params = useParams<{ symbol: string }>();
  const sym = String(symbol || "").toUpperCase();

  const { country } = useCountry();

  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("3M");
  const [metric, setMetric] = useState<Metric>("ACI");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [payload, setPayload] = useState<StockHistoryResponse | null>(null);

  const days = useMemo(() => daysFromPeriod(period), [period]);

  useEffect(() => {
    if (!country?.apiCode || !sym) return;

    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await stockService.singleStockHistory(
          country.apiCode,
          sym,
          days,
          ac.signal,
        );

        // ✅ correct unwrap (axios)
        const data = (res as any)?.data ?? null;
        setPayload(data);
      } catch (e: any) {
        if (e?.name === "AbortError" || e?.name === "CanceledError") return;
        setPayload(null);
        setErrorMsg("Failed to load stock historical data.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [country?.apiCode, sym, days]);

  const latest = payload?.latest;
  const history = useMemo(() => {
    const h = Array.isArray(payload?.history) ? payload!.history : [];
    return [...h].sort((a, b) =>
      a.calculation_date.localeCompare(b.calculation_date),
    );
  }, [payload]);

  const chartData = useMemo(() => {
    return history.map((p: StockHistoryPoint) => ({
      date: `${p.calculation_date}T00:00:00`,
      ACI: toNum(p.alpha_confluence_index),
      KFI: toNum(p.kinetic_flow_index),
      CNS: toNum(p.consilium_score),
      IES: toNum(p.intrinsic_edge_score),
    }));
  }, [history]);

  const metricValues = useMemo(
    () => chartData.map((d) => toNum((d as any)[metric], 0)),
    [chartData, metric],
  );
  const avg = useMemo(
    () =>
      metricValues.length
        ? metricValues.reduce((a, b) => a + b, 0) / metricValues.length
        : 0,
    [metricValues],
  );
  const min = useMemo(
    () => (metricValues.length ? Math.min(...metricValues) : 0),
    [metricValues],
  );
  const max = useMemo(
    () => (metricValues.length ? Math.max(...metricValues) : 0),
    [metricValues],
  );
  const cur = useMemo(
    () =>
      toNum(
        (latest as any)?.alpha_confluence_index,
        toNum(metricValues.at(-1), 0),
      ),
    [latest, metricValues],
  );
  const delta = useMemo(() => cur - avg, [cur, avg]);

  const insightText = String(
    latest?.market_insight || history.at(-1)?.market_insight || "",
  );
  const kind = insightKind(insightText);
  const bs = badgeStyle(kind);

  const sectorName = String(payload?.sector || latest?.sector || "—");
  const sectorRank = latest?.sector_rank ?? "—";
  const marketRank = latest?.market_rank ?? "—";

  const disableLongPeriods = period === "6M" || period === "1Y";

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading stock historical data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.back()}
              className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="text-xl font-bold">{symbol}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {sectorName} <span className="mx-2">|</span> Sector Rank:{" "}
                {sectorRank} <span className="mx-2">|</span> Market Rank:{" "}
                {marketRank}
              </div>
            </div>
          </div>

          {/* Period pills (keep UI like screenshot) */}
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="h-9">
              {PERIODS.map((p) => (
                <TabsTrigger
                  key={p}
                  value={p}
                  className="text-xs px-3 h-8"
                  disabled={p === "6M" || p === "1Y"} // API max 90
                  title={
                    p === "6M" || p === "1Y" ? "API supports max 90 days" : ""
                  }
                >
                  {p}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {errorMsg ? (
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            {errorMsg}
          </div>
        ) : null}

        {/* Layout like screenshot: left gauge + insight, right chart */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* LEFT */}
          <div className="rounded-xl border border-border bg-card p-4">
            <Gauge value={toNum(latest?.alpha_confluence_index)} label="ACI" />

            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">Insight</div>

              <div className="inline-flex items-center gap-2">
                <span
                  style={{
                    border: `1px solid ${bs.border}`,
                    color: bs.fg,
                    background: bs.bg,
                    padding: "3px 10px",
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  {kind}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {insightText || "—"}
              </p>
            </div>

            {/* Stats cards like screenshot */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="text-[11px] text-muted-foreground">
                  Avg {metric}
                </div>
                <div className="text-sm font-bold font-mono tabular-nums">
                  {avg.toFixed(1)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="text-[11px] text-muted-foreground">
                  Cur vs Avg
                </div>
                <div className="text-sm font-bold font-mono tabular-nums">
                  {delta >= 0 ? "↗" : "↘"} {Math.abs(delta).toFixed(2)}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="text-[11px] text-muted-foreground">
                  Min {metric}
                </div>
                <div className="text-sm font-bold font-mono tabular-nums">
                  {min.toFixed(1)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="text-[11px] text-muted-foreground">
                  Max {metric}
                </div>
                <div className="text-sm font-bold font-mono tabular-nums">
                  {max.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-muted-foreground">
              Calibration:{" "}
              <Badge variant="outline" className="text-[10px]">
                {latest?.calibration_status || "—"}
              </Badge>
            </div>
          </div>

          {/* RIGHT */}
          <div className="rounded-xl border border-border bg-card p-4">
            {/* Metric legend / toggle */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {METRICS.map((m) => {
                const active = metric === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition ${
                      active
                        ? "border-border bg-muted/30 text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: metricColor(m),
                        opacity: active ? 1 : 0.35,
                      }}
                    />
                    {m}
                  </button>
                );
              })}
            </div>

            {!chartData.length ? (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                No history data available.
              </div>
            ) : (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 18, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.4}
                    />

                    {/* Zones 0-100 */}
                    <ReferenceArea
                      y1={0}
                      y2={30}
                      fill="#ef4444"
                      fillOpacity={0.05}
                    />
                    <ReferenceArea
                      y1={30}
                      y2={50}
                      fill="#f97316"
                      fillOpacity={0.04}
                    />
                    <ReferenceArea
                      y1={50}
                      y2={70}
                      fill="#eab308"
                      fillOpacity={0.04}
                    />
                    <ReferenceArea
                      y1={70}
                      y2={100}
                      fill="#22c55e"
                      fillOpacity={0.05}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        if (Number.isNaN(d.getTime())) return "";
                        return d.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                      interval={Math.max(1, Math.floor(chartData.length / 6))}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                      ticks={[0, 30, 50, 70, 100]}
                    />

                    <RechartTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "hsl(var(--foreground))",
                      }}
                      labelFormatter={(l) => {
                        const d = new Date(l);
                        if (Number.isNaN(d.getTime())) return "";
                        return d.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey={metric}
                      stroke={metricColor(metric)}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {disableLongPeriods ? (
              <div className="mt-2 text-[11px] text-muted-foreground">
                Note: API supports max <b>90 days</b>, so 6M/1Y are disabled.
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
