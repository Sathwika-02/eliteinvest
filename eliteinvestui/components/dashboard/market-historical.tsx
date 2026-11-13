"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useCountry } from "@/app/providers";
import { marketPulseService } from "@/lib/services/marketPulse.service";

const PERIODS = ["1M", "3M"] as const;

interface ToggleState {
  idx: boolean; // ✅ NEW
  aci: boolean;
  kfi: boolean;
  cns: boolean;
  ies: boolean;
}

type HistoryPoint = {
  calculation_date: string;
  index_value: string;
  index_change: string;
  index_change_pct: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
};

type IndicesHistoryItem = {
  index_symbol: string;
  index_name: string;
  history: HistoryPoint[];
};

type IndicesHistoryResponse = {
  success: boolean;
  data: IndicesHistoryItem[];
  error: any;
  request_id: string;
};

function toNum(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function daysFromPeriod(period: string) {
  return period === "1M" ? 30 : 90;
}

export function MarketHistorical({ selectedIndex }: { selectedIndex: string }) {
  const { country } = useCountry();

  const [period, setPeriod] = useState<string>("3M");
  const [lines, setLines] = useState<ToggleState>({
    idx: true, // ✅ NEW (show index value by default)
    aci: true,
    kfi: false,
    cns: false,
    ies: false,
  });

  const [indexName, setIndexName] = useState<string>("");
  const [historyPoints, setHistoryPoints] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const requestedDays = useMemo(() => daysFromPeriod(period), [period]);

  useEffect(() => {
    let active = true;

    async function fetchHistory() {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await marketPulseService.indicesHistory(
          country.apiCode,
          selectedIndex,
          requestedDays,
        );

        const payload: IndicesHistoryResponse =
          (res as any)?.success !== undefined
            ? (res as any)
            : (res as any)?.data;

        const rows = payload?.data ?? [];
        const row =
          rows.find((r) => r.index_symbol === selectedIndex) ?? rows[0] ?? null;

        if (!active) return;

        setIndexName(row?.index_name ?? "");
        setHistoryPoints(Array.isArray(row?.history) ? row.history : []);
      } catch (e) {
        console.error("indicesHistory failed:", e);
        if (!active) return;
        setIndexName("");
        setHistoryPoints([]);
        setErrorMsg("Failed to load historical market data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (country?.apiCode && selectedIndex) fetchHistory();
    else {
      setLoading(false);
      setIndexName("");
      setHistoryPoints([]);
    }

    return () => {
      active = false;
    };
  }, [country.apiCode, selectedIndex, requestedDays]);

  const chartData = useMemo(() => {
    const sorted = [...historyPoints].sort((a, b) =>
      a.calculation_date.localeCompare(b.calculation_date),
    );

    return sorted.map((p) => ({
      date: `${p.calculation_date}T00:00:00`,
      IDX: toNum(p.index_value), // ✅ NEW
      ACI: toNum(p.alpha_confluence_index),
      KFI: toNum(p.kinetic_flow_index),
      CNS: toNum(p.consilium_score),
      IES: toNum(p.intrinsic_edge_score),
    }));
  }, [historyPoints]);

  const summary = useMemo(() => {
    if (!chartData.length) {
      return { avg_aci: 0, min_aci: 0, max_aci: 0, current_vs_avg: "0" };
    }
    const acis = chartData.map((d) => toNum(d.ACI));
    const avg = acis.reduce((a, b) => a + b, 0) / acis.length;
    const min = Math.min(...acis);
    const max = Math.max(...acis);
    const current = acis[acis.length - 1] ?? 0;
    const diff = current - avg;
    const diffStr = `${diff > 0 ? "+" : ""}${round2(diff)}`;

    return {
      avg_aci: avg,
      min_aci: min,
      max_aci: max,
      current_vs_avg: diffStr,
    };
  }, [chartData]);

  const toggleLine = (key: keyof ToggleState) => {
    setLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading historical market data for {country.name}...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg font-bold text-foreground">
            Market Historical {indexName ? `• ${indexName}` : ""} (
            {country.code})
          </CardTitle>

          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="h-8">
              {PERIODS.map((p) => (
                <TabsTrigger key={p} value={p} className="text-xs px-3 h-7">
                  {p}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        {errorMsg ? (
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            {errorMsg}
          </div>
        ) : null}

        {/* Line toggles */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {(
            [
              { key: "idx" as const, label: "NIFTY", color: "#111827" }, // ✅ NEW
              { key: "aci" as const, label: "ACI", color: "#6366f1" },
              { key: "kfi" as const, label: "KFI", color: "#f97316" },
              { key: "cns" as const, label: "CNS", color: "#06b6d4" },
              { key: "ies" as const, label: "IES", color: "#8b5cf6" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => toggleLine(item.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                lines[item.key]
                  ? "border-border bg-accent/50 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              type="button"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                  opacity: lines[item.key] ? 1 : 0.3,
                }}
              />
              {item.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 18, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.4}
              />

              {/* Background zones only make sense for 0–100 (left axis) */}
              <ReferenceArea
                yAxisId="left"
                y1={0}
                y2={30}
                fill="#ef4444"
                fillOpacity={0.05}
              />
              <ReferenceArea
                yAxisId="left"
                y1={30}
                y2={50}
                fill="#f97316"
                fillOpacity={0.04}
              />
              <ReferenceArea
                yAxisId="left"
                y1={50}
                y2={70}
                fill="#eab308"
                fillOpacity={0.04}
              />
              <ReferenceArea
                yAxisId="left"
                y1={70}
                y2={100}
                fill="#22c55e"
                fillOpacity={0.05}
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Date",
                  position: "insideBottom",
                  offset: -2,
                  style: {
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                  },
                }}
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

              {/* ✅ Left axis for scores (0-100) */}
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                ticks={[0, 30, 50, 70, 100]}
                label={{
                  value: "Score (0–100)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                  },
                }}
              />

              {/* ✅ Right axis for Index value (NIFTY 50 ~ 20k-30k) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v) => Number(v).toLocaleString("en-IN")}
                label={{
                  value: "Index Value",
                  angle: 90,
                  position: "insideRight",
                  style: {
                    textAnchor: "middle",
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                    paddingLeft: "20px",
                  },
                }}
              />

              <RechartTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
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

              {/* ✅ Index line on RIGHT axis */}
              {lines.idx && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="IDX"
                  stroke="#111827"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}

              {/* ✅ Scores on LEFT axis */}
              {lines.aci && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ACI"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366f1" }}
                />
              )}
              {lines.kfi && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="KFI"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              )}
              {lines.cns && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="CNS"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              )}
              {lines.ies && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="IES"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            label="Avg ACI"
            value={toNum(summary.avg_aci).toFixed(1)}
          />
          <SummaryCard
            label="Min ACI"
            value={toNum(summary.min_aci).toFixed(1)}
            color="#ef4444"
          />
          <SummaryCard
            label="Max ACI"
            value={toNum(summary.max_aci).toFixed(1)}
            color="#22c55e"
          />
          <SummaryCard
            label="Current vs Avg"
            value={String(summary.current_vs_avg)}
            trend={
              parseFloat(String(summary.current_vs_avg)) > 0
                ? "up"
                : parseFloat(String(summary.current_vs_avg)) < 0
                  ? "down"
                  : "flat"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  color,
  trend,
}: {
  label: string;
  value: string;
  color?: string;
  trend?: "up" | "down" | "flat";
}) {
  return (
    <div className="rounded-lg bg-muted/50 border border-border p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {trend === "up" && (
          <TrendingUp className="h-3.5 w-3.5 text-score-bullish" />
        )}
        {trend === "down" && (
          <TrendingDown className="h-3.5 w-3.5 text-score-bearish" />
        )}
        {trend === "flat" && (
          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span
          className="text-lg font-bold font-mono tabular-nums"
          style={{ color: color || "hsl(var(--foreground))" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
