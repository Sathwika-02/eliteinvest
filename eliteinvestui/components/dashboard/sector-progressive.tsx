"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { LayoutDashboard, ChevronRight } from "lucide-react";
import { useCountry } from "@/app/providers";
import { sectorService } from "@/lib/services/sector.service";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiEnvelope<T> = { success: boolean; data: T; error: any; request_id: string };

type SectorLatestApiRow = {
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
  calculation_date: string;
  sector: string;
  num_stocks_in_sector: number;
  num_stocks_with_data: number;
  days_of_data: number;
  calibration_status: string;
};

type SectorHistoryPointApi = {
  calculation_date: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
};

type SectorHistorySeriesApi = { sector: string; history: SectorHistoryPointApi[] };

type UiSector = {
  sector: string;
  kinetic_flow_index: number;
  consilium_score: number;
  intrinsic_edge_score: number;
  alpha_confluence_index: number;
  calculation_date: string;
  num_stocks_in_sector: number;
  num_stocks_with_data: number;
  days_of_data: number;
  calibration_status: string;
};

type Metric = "ACI" | "KFI" | "CNS" | "IES";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS = [
  { label: "1M", days: 30 },
  { label: "2M", days: 60 },
  { label: "3M", days: 90 },
] as const;

type Period = (typeof PERIODS)[number]["label"];

const METRIC_COLORS: Record<Metric, string> = {
  ACI: "#6366f1",
  KFI: "#f97316",
  CNS: "#06b6d4",
  IES: "#a855f7",
};

const METRIC_LABELS: Record<Metric, string> = {
  ACI: "Alpha Confluence Index",
  KFI: "Kinetic Flow Index",
  CNS: "Consilium Score",
  IES: "Intrinsic Edge Score",
};

const SCORE_ZONES = [
  { y1: 0, y2: 35, fill: "#ef4444", label: "Low", opacity: 0.06 },
  { y1: 35, y2: 45, fill: "#f97316", label: "Caution", opacity: 0.05 },
  { y1: 45, y2: 55, fill: "#eab308", label: "Neutral", opacity: 0.04 },
  { y1: 55, y2: 65, fill: "#22c55e", label: "Positive", opacity: 0.05 },
  { y1: 65, y2: 100, fill: "#16a34a", label: "Strong", opacity: 0.06 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(v: any, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function safePayload<T>(res: any): T {
  return (res?.success !== undefined ? res : res?.data) as T;
}

function getScoreTheme(score: number) {
  if (score < 35) return { bar: "#ef4444", text: "#ef4444", bg: "rgba(239,68,68,0.08)", label: "Low" };
  if (score < 45) return { bar: "#f97316", text: "#f97316", bg: "rgba(249,115,22,0.08)", label: "Caution" };
  if (score < 55) return { bar: "#eab308", text: "#eab308", bg: "rgba(234,179,8,0.08)", label: "Neutral" };
  if (score < 65) return { bar: "#22c55e", text: "#22c55e", bg: "rgba(34,197,94,0.08)", label: "Positive" };
  return { bar: "#16a34a", text: "#16a34a", bg: "rgba(22,163,74,0.08)", label: "Strong" };
}

function getMetricValue(sector: UiSector, metric: Metric): number {
  switch (metric) {
    case "ACI": return sector.alpha_confluence_index;
    case "KFI": return sector.kinetic_flow_index;
    case "CNS": return sector.consilium_score;
    case "IES": return sector.intrinsic_edge_score;
  }
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const date = new Date(label);
  const dateStr = Number.isNaN(date.getTime())
    ? label
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur shadow-xl px-3 py-2.5 min-w-[150px]">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">{dateStr}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => {
          const theme = getScoreTheme(entry.value);
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-[3px] w-4 rounded-full" style={{ backgroundColor: entry.stroke }} />
                <span className="text-[11px] text-muted-foreground">{entry.name}</span>
              </div>
              <span className="text-[12px] font-bold font-mono" style={{ color: theme.text }}>
                {Number(entry.value).toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="space-y-1 px-3 pt-3 pb-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="px-3 py-2.5 rounded-lg">
          <div className="flex justify-between mb-1.5">
            <div className="h-3 bg-muted rounded animate-pulse" style={{ width: `${40 + i * 4}%` }} />
            <div className="h-3 bg-muted rounded animate-pulse w-10" />
          </div>
          <div className="h-1.5 bg-muted rounded-full animate-pulse" style={{ width: `${50 + i * 4}%` }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SectorProgressView() {
  const { country } = useCountry();

  const [sectors, setSectors] = useState<UiSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("ACI");
  const [period, setPeriod] = useState<Period>("3M");
  const [history, setHistory] = useState<SectorHistoryPointApi[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!country?.apiCode) return;
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const res = await sectorService.sectorsLatest(country.apiCode, "alpha_confluence_index", controller.signal);
        const payload = safePayload<ApiEnvelope<SectorLatestApiRow[]>>(res);
        const rows = payload?.data ?? [];
        const mapped: UiSector[] = rows.map((r) => ({
          sector: r.sector,
          kinetic_flow_index: toNum(r.kinetic_flow_index),
          consilium_score: toNum(r.consilium_score),
          intrinsic_edge_score: toNum(r.intrinsic_edge_score),
          alpha_confluence_index: toNum(r.alpha_confluence_index),
          calculation_date: r.calculation_date,
          num_stocks_in_sector: toNum(r.num_stocks_in_sector),
          num_stocks_with_data: toNum(r.num_stocks_with_data),
          days_of_data: toNum(r.days_of_data),
          calibration_status: String(r.calibration_status || ""),
        }));
        mapped.sort((a, b) => b.alpha_confluence_index - a.alpha_confluence_index);
        setSectors(mapped);
        if (mapped.length > 0 && !selectedSector) setSelectedSector(mapped[0].sector);
      } catch (e) {
        console.error("sectorsLatest failed:", e);
        setSectors([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [country.apiCode]);

  useEffect(() => {
    if (!selectedSector || !country?.apiCode) return;
    const controller = new AbortController();
    async function loadHistory() {
      try {
        setHistoryLoading(true);
        const days = PERIODS.find((p) => p.label === period)?.days ?? 90;
        const res = await sectorService.sectorsHistory(country.apiCode, [selectedSector!], days, controller.signal);
        const payload = safePayload<ApiEnvelope<SectorHistorySeriesApi[]>>(res);
        const rows = payload?.data ?? [];
        const match = rows.find((r) => r.sector === selectedSector);
        setHistory(
          Array.isArray(match?.history)
            ? [...match.history].sort((a, b) => a.calculation_date.localeCompare(b.calculation_date))
            : [],
        );
      } catch (e) {
        console.error("sectorsHistory failed:", e);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
    return () => controller.abort();
  }, [selectedSector, period, country.apiCode]);

  const sortedSectors = useMemo(
    () => [...sectors].sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric)),
    [sectors, metric],
  );

  const chartData = useMemo(
    () =>
      history.map((p) => ({
        date: `${p.calculation_date}T00:00:00`,
        ACI: toNum(p.alpha_confluence_index),
        KFI: toNum(p.kinetic_flow_index),
        CNS: toNum(p.consilium_score),
        IES: toNum(p.intrinsic_edge_score),
      })),
    [history],
  );

  const selectedSectorData = useMemo(() => sectors.find((s) => s.sector === selectedSector), [sectors, selectedSector]);

  return (
    <div className="space-y-4">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">Sector Momentum</h2>
            <p className="text-[11px] text-muted-foreground">Select a sector to view historical trend</p>
          </div>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {sectors.length} sectors
          </Badge>
        </div>

        {/* Metric pill selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
          {(["ACI", "KFI", "CNS", "IES"] as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150"
              style={{
                backgroundColor: metric === m ? METRIC_COLORS[m] + "20" : "transparent",
                color: metric === m ? METRIC_COLORS[m] : "hsl(var(--muted-foreground))",
                outline: metric === m ? `1px solid ${METRIC_COLORS[m]}50` : "none",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-4 items-stretch">

        {/* LEFT: Sector List */}
        <Card className="border-border bg-card overflow-hidden h-[640px] flex flex-col min-w-0">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-muted/30">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Ranking · {metric}
            </span>
            <span className="text-[10px] text-muted-foreground">Stocks</span>
          </div>

          {loading ? (
            <SkeletonList />
          ) : (
            <div className="py-1.5 px-2 space-y-0.5 flex-1 overflow-y-auto overflow-x-hidden min-w-0">
              {sortedSectors.map((sector, idx) => {
                const val = getMetricValue(sector, metric);
                const theme = getScoreTheme(val);
                const isSelected = sector.sector === selectedSector;

                return (
                  <button
                    key={sector.sector}
                    type="button"
                    onClick={() => setSelectedSector(sector.sector)}
                    className="w-full min-w-0 text-left rounded-lg px-3 py-2.5 transition-all duration-150 group relative overflow-hidden"
                    style={{
                      backgroundColor: isSelected ? theme.bg : "transparent",
                      outline: isSelected ? `1px solid ${theme.bar}30` : "none",
                    }}
                  >
                    {/* Active indicator */}
                    {isSelected && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                        style={{ backgroundColor: theme.bar }}
                      />
                    )}

                    {/* Row top */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-muted-foreground/50 font-mono w-4 shrink-0 tabular-nums">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`text-xs font-semibold truncate transition-colors ${
                            isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          {sector.sector}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                          style={{ backgroundColor: `${theme.bar}18`, color: theme.text }}
                        >
                          {theme.label}
                        </span>
                        <span
                          className="text-[13px] font-bold font-mono tabular-nums w-[38px] text-right"
                          style={{ color: theme.text }}
                        >
                          {val.toFixed(1)}
                        </span>
                        <ChevronRight
                          className="h-3 w-3 transition-all"
                          style={{
                            color: isSelected ? theme.bar : "transparent",
                          }}
                        />
                      </div>
                    </div>

                    {/* Progress bar row */}
                    <div className="flex items-center gap-2 mt-1.5 pl-6">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, val)}%`,
                            backgroundColor: theme.bar,
                            opacity: isSelected ? 1 : 0.6,
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground/40 tabular-nums w-6 text-right shrink-0">
                        {sector.num_stocks_in_sector}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* RIGHT: History Chart */}
       <Card className="border-border bg-card overflow-hidden h-[640px] flex flex-col min-w-0">
          {/* Chart top bar */}
          <div className="px-5 pt-4 pb-3 border-b border-border">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground">
                    {selectedSector ?? "—"}
                  </h3>
                  {selectedSectorData && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {selectedSectorData.num_stocks_in_sector} stocks
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{METRIC_LABELS[metric]}</p>
              </div>

              {/* 1M / 2M / 3M toggle */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border shrink-0">
                {PERIODS.map(({ label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPeriod(label)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      period === label
                        ? "bg-background text-foreground shadow-sm border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Score stat pills */}
            {selectedSectorData && (
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {(["ACI", "KFI", "CNS", "IES"] as Metric[]).map((m) => {
                  const val = getMetricValue(selectedSectorData, m);
                  const theme = getScoreTheme(val);
                  const isActive = m === metric;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetric(m)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-150"
                      style={{
                        backgroundColor: isActive ? theme.bg : "transparent",
                        borderColor: isActive ? `${theme.bar}40` : "transparent",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: METRIC_COLORS[m], opacity: isActive ? 1 : 0.5 }}
                      />
                      <span className="text-[10px] font-medium text-muted-foreground">{m}</span>
                      <span
                        className="text-xs font-bold font-mono tabular-nums"
                        style={{ color: isActive ? theme.text : "hsl(var(--foreground))" }}
                      >
                        {val.toFixed(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <CardContent className="px-3 pt-3 pb-3 flex-1 min-h-0">
            {historyLoading ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="h-6 w-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
                <span className="text-xs">Loading {period} data...</span>
              </div>
            ) : !chartData.length ? (
              <div className="h-[300px] flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                {selectedSector ? "No history data available." : "Select a sector to view history."}
              </div>
            ) : (
              <>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />

                      {SCORE_ZONES.map((z) => (
                        <ReferenceArea key={z.label} y1={z.y1} y2={z.y2} fill={z.fill} fillOpacity={z.opacity} />
                      ))}

                      <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="4 4" strokeOpacity={0.7} />

                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => {
                          const d = new Date(v);
                          if (Number.isNaN(d.getTime())) return "";
                          return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        }}
                        interval={Math.max(1, Math.floor(chartData.length / 6))}
                      />

                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        ticks={[0, 35, 45, 55, 65, 100]}
                        width={30}
                      />

                      <RechartTooltip content={<CustomTooltip />} />

                      {(["ACI", "KFI", "CNS", "IES"] as Metric[]).map((m) => (
                        <Line
                          key={m}
                          type="monotone"
                          dataKey={m}
                          stroke={METRIC_COLORS[m]}
                          strokeWidth={m === metric ? 2.5 : 1.5}
                          strokeOpacity={m === metric ? 1 : 0.22}
                          dot={false}
                          activeDot={{ r: 4, strokeWidth: 0 }}
                          name={m}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Bottom legend row */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border flex-wrap">
                  <div className="flex items-center gap-1">
                    {(["ACI", "KFI", "CNS", "IES"] as Metric[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMetric(m)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/40 transition-colors"
                      >
                        <span
                          className="rounded-full transition-all"
                          style={{
                            display: "block",
                            height: m === metric ? "3px" : "2px",
                            width: "16px",
                            backgroundColor: METRIC_COLORS[m],
                            opacity: m === metric ? 1 : 0.3,
                          }}
                        />
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: m === metric ? METRIC_COLORS[m] : "hsl(var(--muted-foreground))" }}
                        >
                          {m}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {[{ label: "Low", color: "#ef4444" }, { label: "Neutral", color: "#eab308" }, { label: "Strong", color: "#16a34a" }].map((z) => (
                      <span key={z.label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: z.color, opacity: 0.45 }} />
                        {z.label}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}