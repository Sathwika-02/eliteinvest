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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useCountry } from "@/app/providers";
import { sectorService } from "@/lib/services/sector.service";
import { marketPulseService } from "@/lib/services/marketPulse.service";

const PERIODS = ["1M", "3M"] as const;
const COLORS = [
  "#6366f1", "#f97316", "#06b6d4", "#8b5cf6", "#ec4899",
  "#22c55e", "#eab308", "#ef4444", "#14b8a6", "#f59e0b", "#64748b",
];

type ApiEnvelope<T> = { success: boolean; data: T; error: any; request_id: string };
type SectorLatestRowApi = {
  sector: string;
  alpha_confluence_index: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  calculation_date: string;
};
type SectorHistoryPointApi = {
  calculation_date: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
  sector_value?: string;
};
type SectorHistorySeriesApi = {
  sector: string;
  history: SectorHistoryPointApi[];
};

type HistoryPoint = {
  calculation_date: string;
  index_value: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
};
type IndicesHistoryItem = { index_symbol: string; index_name: string; history: HistoryPoint[] };
type IndicesHistoryResponse = { success: boolean; data: IndicesHistoryItem[]; error: any; request_id: string };

interface SectorHistoricalProps {
  initialSector?: string;
  onBack?: () => void;
}

type AllMetric = "ACI" | "KFI" | "CNS" | "IES";

function safePayload<T>(res: any): T {
  return (res?.success !== undefined ? res : res?.data) as T;
}

function toNum(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function daysFromPeriod(period: string) {
  return period === "1M" ? 30 : 90;
}

export function SectorHistorical({ initialSector, onBack }: SectorHistoricalProps) {
  const { country } = useCountry();
  const [period, setPeriod] = useState<string>("3M");
  const [selectedSector, setSelectedSector] = useState<string>(initialSector || "all");
  const [allMetric, setAllMetric] = useState<AllMetric>("ACI");
  const [showNifty, setShowNifty] = useState(true);

  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [series, setSeries] = useState<SectorHistorySeriesApi[]>([]);
  const [niftyHistory, setNiftyHistory] = useState<HistoryPoint[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const requestedDays = useMemo(() => daysFromPeriod(period), [period]);

  useEffect(() => {
    if (!country?.apiCode) return;
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setErrorMsg("");

        // 1. Fetch Latest Sectors (for Dropdown)
        const latestRes = await sectorService.sectorsLatest(
          country.apiCode,
          "alpha_confluence_index",
          controller.signal
        );
        const latestPayload = safePayload<ApiEnvelope<SectorLatestRowApi[]>>(latestRes);
        const latestRows = latestPayload?.data ?? [];
        const options = latestRows.map((r) => r?.sector).filter((s): s is string => !!s);
        setSectorOptions(options);

        // 2. Fetch Sector History
        if (selectedSector === "all") {
          const top5 = options.slice(0, 5);
          if (!top5.length) {
            setSeries([]);
            return;
          }
          const histRes = await sectorService.sectorsHistory(
            country.apiCode,
            top5,
            requestedDays,
            controller.signal
          );
          const histPayload = safePayload<ApiEnvelope<SectorHistorySeriesApi[]>>(histRes);
          console.log("📊 Sector History Response:", histPayload);
          const rows = histPayload?.data ?? [];
          const normalized = (Array.isArray(rows) ? rows : []).map((s) => ({
            sector: String(s.sector ?? "").trim(),
            history: Array.isArray(s.history) ? s.history : [],
          }));
          console.log("📊 Normalized Series:", normalized);
          setSeries(normalized);
        }

        // 3. Fetch Nifty 50 History
        try {
          const niftyRes = await marketPulseService.indicesHistory(
            country.apiCode,
            "^NSEI",
            requestedDays
          );
          console.log("📈 Nifty Response:", niftyRes);
          const niftyPayload: IndicesHistoryResponse =
            (niftyRes as any)?.success !== undefined ? (niftyRes as any) : (niftyRes as any)?.data;
          const niftyRows = niftyPayload?.data ?? [];
          const niftyRow = niftyRows.find((r) => r.index_symbol === "NIFTY 50") ?? niftyRows[0] ?? null;
          setNiftyHistory(Array.isArray(niftyRow?.history) ? niftyRow.history : []);
        } catch (err) {
          console.warn("Failed to load Nifty history", err);
          setNiftyHistory([]);
        }

      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        console.error("SectorHistorical failed:", e);
        setErrorMsg("Failed to load sector historical data.");
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => controller.abort();
  }, [country.apiCode, selectedSector, requestedDays]);

  const chartData = useMemo(() => {
    if (!series.length) {
      console.log("⚠️ No series data");
      return [];
    }

    // Build maps for each sector
    const maps = series.slice(0, 5).map((s) => {
      const m = new Map<string, SectorHistoryPointApi>();
      (s.history || []).forEach((p) => {
        const date = `${p.calculation_date}T00:00:00`;
        m.set(date, p);
      });
      return { sector: s.sector, map: m };
    });

    // Collect all unique dates
    const dateSet = new Set<string>();
    maps.forEach(({ map }) => {
      for (const k of map.keys()) dateSet.add(k);
    });
    const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));

    console.log("📅 Dates:", dates.length);
    console.log("🏢 Sectors:", maps.map(m => m.sector));

    // Build chart data
    const data = dates.map((date) => {
      const row: Record<string, string | number> = { date };
      maps.forEach(({ sector, map }) => {
        const p = map.get(date);
        const metricValue =
          allMetric === "ACI" ? toNum(p?.alpha_confluence_index) :
          allMetric === "KFI" ? toNum(p?.kinetic_flow_index) :
          allMetric === "CNS" ? toNum(p?.consilium_score) :
          toNum(p?.intrinsic_edge_score);
        
        const key = `${allMetric}:${sector}`;
        row[key] = p ? metricValue : NaN;
      });
      return row;
    });

    // Merge Nifty data
    if (niftyHistory.length > 0 && showNifty) {
      const niftyMap = new Map<string, number>();
      niftyHistory.forEach((p) => {
        const date = `${p.calculation_date}T00:00:00`;
        niftyMap.set(date, toNum(p.index_value));
      });

      data.forEach((row) => {
        const dateKey = String(row.date);
        row.NIFTY = niftyMap.get(dateKey) ?? NaN;
      });
    }

    console.log("📊 First row:", data[0]);
    console.log("📊 Total data points:", data.length);
    return data;
  }, [series, allMetric, niftyHistory, showNifty]);

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading sector historical data...
        </CardContent>
      </Card>
    );
  }

  const visibleSectors = series.slice(0, 5).map(s => s.sector);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors" type="button">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <CardTitle className="text-lg font-bold text-foreground">
              Sector Historical {selectedSector !== "all" ? `• ${selectedSector}` : ""}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-[220px] h-8 text-xs">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors (Top 5)</SelectItem>
                {sectorOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList className="h-8">
                {PERIODS.map((p) => (
                  <TabsTrigger key={p} value={p} className="text-xs px-3 h-7">{p}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            {errorMsg}
          </div>
        )}

        {/* Metric Toggles */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {(["ACI", "KFI", "CNS", "IES"] as AllMetric[]).map((m) => (
            <button
              key={m}
              onClick={() => setAllMetric(m)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                allMetric === m ? "border-border bg-accent/50 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              type="button"
            >
              {m}
            </button>
          ))}
          {niftyHistory.length > 0 && (
            <button
              onClick={() => setShowNifty(!showNifty)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                showNifty ? "border-border bg-accent/50 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              type="button"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#111827", opacity: showNifty ? 1 : 0.3 }} />
              NIFTY 50
            </button>
          )}
        </div>

        {/* Chart */}
        {!chartData.length ? (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            No history data available.
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 18, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                
                {/* Background Zones */}
                <ReferenceArea yAxisId="left" y1={0} y2={30} fill="#ef4444" fillOpacity={0.05} />
                <ReferenceArea yAxisId="left" y1={30} y2={50} fill="#f97316" fillOpacity={0.04} />
                <ReferenceArea yAxisId="left" y1={50} y2={70} fill="#eab308" fillOpacity={0.04} />
                <ReferenceArea yAxisId="left" y1={70} y2={100} fill="#22c55e" fillOpacity={0.05} />

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

                {/* Left Axis: Scores (0-100) */}
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 30, 50, 70, 100]}
                  label={{ value: "Score", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" } }}
                />

                {/* Right Axis: Nifty 50 */}
                {niftyHistory.length > 0 && showNifty && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={54}
                    tickFormatter={(v) => Number(v).toLocaleString("en-IN")}
                    label={{ value: "Index Value", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" } }}
                  />
                )}

                <RechartTooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }}
                  labelFormatter={(l) => {
                    const d = new Date(l);
                    if (Number.isNaN(d.getTime())) return "";
                    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                  }}
                />

                {/* Sector Lines */}
                {visibleSectors.map((sector, i) => {
                  const dataKey = `${allMetric}:${sector}`;
                  return (
                    <Line
                      key={dataKey}
                      yAxisId="left"
                      type="monotone"
                      dataKey={dataKey}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                      name={`${sector} (${allMetric})`}
                    />
                  );
                })}

                {/* Nifty 50 Line */}
                {niftyHistory.length > 0 && showNifty && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="NIFTY"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    strokeDasharray="4 4"
                    name="NIFTY 50"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
1