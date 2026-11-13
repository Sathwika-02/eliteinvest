"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  PanelRightOpen,
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  TechnicalGroupRow,
  TechnicalScorecardRow,
  TechnicalSectorRow,
  TechnicalHeatmapRow,
} from "@/lib/services/technical.service";

// ── Formatters ───────────────────────────────

function fmtNumber(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
}
function fmtPct(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toFixed(digits)}%`;
}
function fmtPctSigned(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const n = Number(value);
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}
function fmtCurrency(value?: number | null, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}
function fmtDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function yesNo(value?: boolean | null) {
  if (value === null || value === undefined) return "-";
  return value ? "Yes" : "No";
}

// ── Color Helpers ────────────────────────────

function timingScoreColor(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "text-emerald-600";
  if (n >= 45) return "text-amber-600";
  return "text-rose-600";
}
function timingBarBg(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "bg-emerald-500";
  if (n >= 45) return "bg-amber-500";
  return "bg-rose-500";
}
function verdictBadgeCls(verdict?: string | null) {
  const v = String(verdict || "").toUpperCase();
  if (v.includes("PASS") || v.includes("STRONG") || v.includes("HIGH") || v.includes("BUY"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (v.includes("CAUTION") || v.includes("MODERATE") || v.includes("MEDIUM") || v.includes("WATCH"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}
function verdictPillStyle(verdict?: string | null) {
  const v = String(verdict || "").toUpperCase();
  if (v.includes("AVOID") || v.includes("FAIL")) return { cls: "bg-rose-100 text-rose-700", bar: "bg-rose-500" };
  if (v.includes("CAUTION") || v.includes("WATCH")) return { cls: "bg-amber-100 text-amber-700", bar: "bg-amber-500" };
  return { cls: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" };
}
function convictionColor(level?: string | null) {
  const v = String(level || "").toUpperCase();
  if (v.includes("HIGH") || v.includes("STRONG")) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (v.includes("MEDIUM") || v.includes("MODERATE")) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-rose-600 bg-rose-50 border-rose-200";
}
function gatePassColor(passed: boolean) {
  return passed
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
}
function mtfColor(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "text-emerald-600";
  if (n >= 40) return "text-amber-600";
  return "text-rose-600";
}
function rrColor(rr?: number | null) {
  const n = Number(rr ?? 0);
  if (n >= 2.5) return "text-emerald-600";
  if (n >= 1.5) return "text-amber-600";
  return "text-rose-600";
}

// ── Sector Card ──────────────────────────────

function SectorScoreMeter({ score }: { score?: number | null }) {
  const n = Math.min(Math.max(Number(score ?? 0), 0), 100);
  return (
    <div className="relative w-full">
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${timingBarBg(n)}`} style={{ width: `${n}%` }} />
      </div>
      <div className="absolute top-0 h-2 w-px bg-white/80" style={{ left: "45%" }} />
      <div className="absolute top-0 h-2 w-px bg-white/80" style={{ left: "70%" }} />
    </div>
  );
}

function TechnicalSectorCard({ row }: { row: TechnicalSectorRow }) {
  const total = (row.stocks_pass ?? 0) + (row.stocks_caution ?? 0) + (row.stocks_fail ?? 0);
  const passW = total > 0 ? ((row.stocks_pass ?? 0) / total) * 100 : 0;
  const cautionW = total > 0 ? ((row.stocks_caution ?? 0) / total) * 100 : 0;
  const failW = total > 0 ? ((row.stocks_fail ?? 0) / total) * 100 : 0;
  const vStyle = verdictPillStyle(row.dominant_outlook);

  const dims = [
    { label: "Timing", value: row.avg_timing_score, color: "bg-violet-400" },
    { label: "Confidence", value: row.avg_confidence, color: "bg-blue-400" },
    { label: "Conviction", value: (row.avg_conviction_score ?? 0) * 10, color: "bg-teal-400" },
    { label: "MTF Align", value: row.avg_mtf_alignment, color: "bg-emerald-400" },
    { label: "Confluence", value: row.avg_confluence_score, color: "bg-amber-400" },
    { label: "Nature Agr.", value: row.avg_nature_agreement, color: "bg-pink-400" },
  ];

  const isPositiveRR = Number(row.avg_risk_reward ?? 0) >= 1.5;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all">
      <div className={`h-1 w-full ${vStyle.bar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-base leading-tight">{row.sector}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {row.total_stocks ?? "-"} stocks · {fmtDate(row.analysis_date)}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${vStyle.cls}`}>
            {row.dominant_outlook?.replace(/_/g, " ") || "-"}
          </span>
        </div>

        <div className="flex items-end gap-5 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Avg Timing</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${timingScoreColor(row.avg_timing_score)}`}>
                {fmtNumber(row.avg_timing_score, 1)}
              </span>
              <span className="text-slate-300 text-sm">/100</span>
            </div>
          </div>
          <div className="mb-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Pass Rate</p>
            <span className={`text-sm font-semibold ${timingScoreColor(row.pass_rate_pct)}`}>
              {fmtPct(row.pass_rate_pct, 1)}
            </span>
          </div>
          <div className="mb-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Avg RR</p>
            <span className={`text-sm font-semibold ${rrColor(row.avg_risk_reward)}`}>
              {fmtNumber(row.avg_risk_reward, 2)}
            </span>
          </div>
          <div className="mb-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Avg Risk</p>
            <span className="text-sm font-semibold text-slate-700">{fmtPct(row.avg_risk_pct, 1)}</span>
          </div>
        </div>

        <SectorScoreMeter score={row.avg_timing_score} />

        <div className="mt-4 grid grid-cols-2 gap-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Distribution</p>
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
              <div className="bg-emerald-400" style={{ width: `${passW}%` }} />
              <div className="bg-amber-400" style={{ width: `${cautionW}%` }} />
              <div className="bg-rose-400" style={{ width: `${failW}%` }} />
            </div>
            <div className="flex gap-2 text-center">
              <div className="flex-1 rounded-xl bg-emerald-50 py-2">
                <div className="text-base font-bold text-emerald-700">{row.stocks_pass ?? 0}</div>
                <div className="text-[10px] text-emerald-500 mt-0.5">Pass</div>
              </div>
              <div className="flex-1 rounded-xl bg-amber-50 py-2">
                <div className="text-base font-bold text-amber-700">{row.stocks_caution ?? 0}</div>
                <div className="text-[10px] text-amber-500 mt-0.5">Caution</div>
              </div>
              <div className="flex-1 rounded-xl bg-rose-50 py-2">
                <div className="text-base font-bold text-rose-700">{row.stocks_fail ?? 0}</div>
                <div className="text-[10px] text-rose-500 mt-0.5">Fail</div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Dimensions</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {dims.map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] text-slate-400">{d.label}</span>
                    <span className="text-[10px] font-medium text-slate-600">{fmtNumber(d.value, 1)}</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${d.color}`}
                      style={{ width: `${Math.min(Math.max(Number(d.value ?? 0), 0), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Best</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {row.best_stock || "-"}
              </span>
            </div>
            {row.worst_stock && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Worst</span>
                <span className="font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  {row.worst_stock}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-emerald-600 font-medium">+{row.total_positive_signals ?? 0}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">{row.total_neutral_signals ?? 0}</span>
            <span className="text-slate-300">·</span>
            <span className="text-rose-500 font-medium">-{row.total_negative_signals ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalSectorSnapshot({ sectors }: { sectors: TechnicalSectorRow[] }) {
  if (sectors.length === 0)
    return <div className="text-sm text-slate-500 py-8 text-center">No sector data available.</div>;
  const sorted = [...sectors].sort(
    (a, b) => Number(b.avg_timing_score ?? 0) - Number(a.avg_timing_score ?? 0),
  );
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((row) => (
        <TechnicalSectorCard key={row.sector} row={row} />
      ))}
    </div>
  );
}

// ── Heatmap ──────────────────────────────────

function HeatmapCell({ color, signal, method }: { color: string; signal: string; method: string }) {
  const bg =
    color === "green"
      ? "bg-emerald-100 border-emerald-200 text-emerald-700"
      : color === "red"
        ? "bg-rose-100 border-rose-200 text-rose-700"
        : color === "yellow"
          ? "bg-amber-100 border-amber-200 text-amber-700"
          : "bg-slate-100 border-slate-200 text-slate-500";

  return (
    <div
      className={`rounded-lg border px-2 py-1.5 text-center ${bg}`}
      title={`${method}: ${signal}`}
    >
      <div className="text-[9px] font-medium truncate">{method.replace(/_/g, " ")}</div>
      <div className="text-[9px] truncate opacity-75">{signal}</div>
    </div>
  );
}

function TechnicalHeatmapSection({ heatmap }: { heatmap: TechnicalHeatmapRow[] }) {
  if (!heatmap || heatmap.length === 0)
    return <div className="text-sm text-slate-500 py-8 text-center">No heatmap data available.</div>;

  const symbols = Array.from(new Set(heatmap.map((r) => r.symbol)));
  const methods = Array.from(new Set(heatmap.map((r) => r.method_name)));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="py-2 pr-4 text-left text-[10px] uppercase tracking-wide text-slate-400 font-semibold sticky left-0 bg-white">
              Symbol
            </th>
            {methods.map((m) => (
              <th
                key={m}
                className="py-2 px-1 text-[10px] uppercase tracking-wide text-slate-400 font-semibold text-center whitespace-nowrap"
              >
                {m.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {symbols.map((sym) => {
            const rows = heatmap.filter((r) => r.symbol === sym);
            return (
              <tr key={sym} className="border-t border-slate-50">
                <td className="py-2 pr-4 font-semibold text-slate-900 sticky left-0 bg-white">{sym}</td>
                {methods.map((m) => {
                  const cell = rows.find((r) => r.method_name === m);
                  if (!cell) return <td key={m} className="px-1 py-1"><div className="w-16 h-8 rounded-lg bg-slate-50 border border-slate-100" /></td>;
                  return (
                    <td key={m} className="px-1 py-1">
                      <HeatmapCell
                        color={cell.signal_color}
                        signal={cell.signal_type}
                        method={m}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ───────────────────────────

interface TechnicalGroupTableProps {
  rows: TechnicalGroupRow[];
  scorecard?: TechnicalScorecardRow | null;
  sectors?: TechnicalSectorRow[];
  heatmap?: TechnicalHeatmapRow[];
  onSelectStock: (symbol: string) => void;
  onRemoveStocks?: (symbols: string[]) => void;
  onSelectionChange?: (symbols: string[]) => void;
}

export function TechnicalGroupTable({
  rows,
  scorecard,
  sectors = [],
  heatmap = [],
  onSelectStock,
  onRemoveStocks,
  onSelectionChange,
}: TechnicalGroupTableProps) {
  const router = useRouter();
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  const allSelected = useMemo(
    () => rows.length > 0 && selectedSymbols.length === rows.length,
    [rows, selectedSymbols],
  );

  const isSelected = (symbol: string) => selectedSymbols.includes(symbol);
  const updateSelection = (next: string[]) => {
    setSelectedSymbols(next);
    onSelectionChange?.(next);
  };
  const toggleRow = (symbol: string) =>
    updateSelection(
      selectedSymbols.includes(symbol)
        ? selectedSymbols.filter((s) => s !== symbol)
        : [...selectedSymbols, symbol],
    );
  const toggleSelectAll = () => updateSelection(allSelected ? [] : rows.map((r) => r.symbol));
  const handleRemoveSelected = () => {
    if (selectedSymbols.length === 0) return;
    onRemoveStocks?.(selectedSymbols);
    setSelectedSymbols([]);
  };

  useEffect(() => {
    if (rows.length > 0) setSelectedSymbols(rows.map((r) => r.symbol));
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-violet-100 bg-[#f3f0ff]">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">Gate 2: Technical Evaluation</div>
              <p className="text-sm text-slate-600">
                Analyse momentum, trend structure, and entry timing for each stock.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-violet-600 hover:bg-violet-700">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Group View
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const sym =
                    selectedSymbols.length > 0 ? selectedSymbols[0] : rows[0]?.symbol;
                  if (sym) onSelectStock(sym);
                }}
              >
                <PanelRightOpen className="mr-2 h-4 w-4" />
                Stock Detail
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveSelected}
                disabled={selectedSymbols.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Selected ({selectedSymbols.length})
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              { label: "Stocks Loaded", value: String(rows.length), color: "text-slate-900" },
              {
                label: "Avg Timing Score",
                value: fmtNumber(scorecard?.group_avg_timing, 1),
                color: timingScoreColor(scorecard?.group_avg_timing),
              },
              {
                label: "Pass / Caution / Fail",
                value: `${scorecard?.stocks_pass ?? 0} / ${scorecard?.stocks_caution ?? 0} / ${scorecard?.stocks_fail ?? 0}`,
                color: "text-slate-900",
              },
              {
                label: "Avg Risk/Reward",
                value: fmtNumber(scorecard?.avg_risk_reward, 2),
                color: rrColor(scorecard?.avg_risk_reward),
              },
            ].map(({ label, value, color }) => (
              <Card key={label} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
                  <div className={`mt-2 text-2xl font-bold ${color}`}>{value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scorecard strip */}
      {scorecard && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: <Activity className="h-4 w-4 text-violet-500" />,
              label: "Best Pick",
              value: scorecard.best_pick || "-",
              sub: "Highest timing score",
            },
            {
              icon: <Target className="h-4 w-4 text-rose-500" />,
              label: "Worst Pick",
              value: scorecard.worst_pick || "-",
              sub: "Lowest timing score",
            },
            {
              icon: <Shield className="h-4 w-4 text-amber-500" />,
              label: "Avg Method Agreement",
              value: fmtPct(scorecard.avg_method_agreement, 1),
              sub: `Risk: ${fmtPct(scorecard.avg_group_risk, 1)}`,
            },
          ].map(({ icon, label, value, sub }) => (
            <Card key={label} className="rounded-2xl border-slate-100 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-xl bg-slate-50 p-2">{icon}</div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
                  <div className="font-bold text-slate-900">{value}</div>
                  <div className="text-[11px] text-slate-400">{sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Table */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Technical Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[3200px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </th>
                  {[
                    "Stock","Company","Sector","Industry","Price","Date",
                    "Gate Verdict","Gates Passed","Timing Score","Outlook",
                    "Cloud Gate","Wave Gate","Wyckoff Gate","Trend Gate",
                    "Conviction","Conv. Score","Kelly %","Allocation %",
                    "Entry","Stop","T1","T2","T3","R/R",
                    "Risk %","T1 %","T2 %","T3 %",
                    "Entry (Cons.)","Entry (Bal.)","Entry (Aggr.)",
                    "MTF Align","MTF Score","MTF Conflict",
                    "Nature Agr.","Dominant Natures","Confluence",
                    "Zones","Top Zone","Top Zone Type",
                    "Best Support","Best Resist",
                    "Market Phase","ATR %","ADX","Volatility",
                    "Avg Conf.","Data Quality","Methods","Positive","Negative","Watch","Neutral",
                    "Summary",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.symbol} className="border-b align-top hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected(row.symbol)}
                        onChange={() => toggleRow(row.symbol)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{row.symbol}</td>
                    <td className="px-4 py-4 text-slate-700">{row.company_name || "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{row.sector || "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{row.industry || "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.current_price, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtDate(row.analysis_date)}</td>
                    <td className="px-4 py-4">
                      <Badge className={`border ${verdictBadgeCls(row.gate_verdict)}`} variant="outline">
                        {row.gate_verdict || "-"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${timingScoreColor(row.gates_passed_count * 25)}`}>
                        {row.gates_passed_count ?? "-"}/4
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${timingBarBg(row.timing_score)}`}
                            style={{ width: `${Math.min(Number(row.timing_score ?? 0), 100)}%` }}
                          />
                        </div>
                        <span className={`font-bold ${timingScoreColor(row.timing_score)}`}>
                          {fmtNumber(row.timing_score, 1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`border ${verdictBadgeCls(row.outlook)}`} variant="outline">
                        {row.outlook || "-"}
                      </Badge>
                    </td>
                    {/* Gate booleans */}
                    {[row.cloud_gate_passed, row.wave_gate_passed, row.wyckoff_gate_passed, row.trend_gate_passed].map(
                      (g, i) => (
                        <td key={i} className="px-4 py-4">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${gatePassColor(!!g)}`}
                          >
                            {yesNo(g)}
                          </span>
                        </td>
                      ),
                    )}
                    <td className="px-4 py-4">
                      <Badge className={`border ${convictionColor(row.conviction_level)}`} variant="outline">
                        {row.conviction_level || "-"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.conviction_score, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtPct(row.kelly_fraction * 100, 1)}</td>
                    <td className="px-4 py-4 font-medium text-violet-700">{fmtPct(row.suggested_allocation, 1)}</td>
                    {/* Price levels */}
                    <td className="px-4 py-4 font-medium text-slate-800">{fmtCurrency(row.agg_entry_price)}</td>
                    <td className="px-4 py-4 text-rose-600 font-medium">{fmtCurrency(row.agg_stop_loss)}</td>
                    <td className="px-4 py-4 text-emerald-600">{fmtCurrency(row.agg_target_1)}</td>
                    <td className="px-4 py-4 text-emerald-600">{fmtCurrency(row.agg_target_2)}</td>
                    <td className="px-4 py-4 text-emerald-600">{fmtCurrency(row.agg_target_3)}</td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${rrColor(row.agg_risk_reward)}`}>
                        {fmtNumber(row.agg_risk_reward, 2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-rose-600">{fmtPct(row.risk_percent, 1)}</td>
                    <td className="px-4 py-4 text-emerald-600">{fmtPct(row.target_1_percent, 1)}</td>
                    <td className="px-4 py-4 text-emerald-600">{fmtPct(row.target_2_percent, 1)}</td>
                    <td className="px-4 py-4 text-emerald-600">{fmtPct(row.target_3_percent, 1)}</td>
                    {/* Entry ranges */}
                    <td className="px-4 py-4 text-slate-600 text-xs whitespace-nowrap">
                      {fmtCurrency(row.entry_conservative_low)} – {fmtCurrency(row.entry_conservative_high)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs whitespace-nowrap">
                      {fmtCurrency(row.entry_balanced_low)} – {fmtCurrency(row.entry_balanced_high)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs whitespace-nowrap">
                      {fmtCurrency(row.entry_aggressive_low)} – {fmtCurrency(row.entry_aggressive_high)}
                    </td>
                    {/* MTF */}
                    <td className="px-4 py-4 text-slate-700">{row.mtf_alignment || "-"}</td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${mtfColor(row.mtf_alignment_score)}`}>
                        {fmtNumber(row.mtf_alignment_score, 1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          row.mtf_conflict
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        }`}
                      >
                        {yesNo(row.mtf_conflict)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{fmtPct(row.nature_agreement_pct, 1)}</td>
                    <td className="px-4 py-4 text-slate-700 max-w-[180px]">
                      <div className="line-clamp-2">{row.dominant_natures || "-"}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${timingScoreColor(row.confluence_score)}`}>
                        {fmtNumber(row.confluence_score, 1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{row.zone_count ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs whitespace-nowrap">
                      {fmtCurrency(row.top_zone_low)} – {fmtCurrency(row.top_zone_high)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{row.top_zone_type || "-"}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs whitespace-nowrap">
                      {fmtCurrency(row.best_support_low)} – {fmtCurrency(row.best_support_high)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs whitespace-nowrap">
                      {fmtCurrency(row.best_resist_low)} – {fmtCurrency(row.best_resist_high)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{row.market_phase || "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtPct(row.atr_pct, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.adx, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{row.volatility || "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtPct(row.avg_confidence, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.data_quality_score, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{row.methods_analyzed ?? "-"}</td>
                    <td className="px-4 py-4 text-emerald-600 font-medium">{row.positive_count ?? "-"}</td>
                    <td className="px-4 py-4 text-rose-600 font-medium">{row.negative_count ?? "-"}</td>
                    <td className="px-4 py-4 text-amber-600">{row.watch_count ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-500">{row.neutral_count ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-700 max-w-[320px]">
                      <div className="line-clamp-3">{row.layman_summary || "-"}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectStock(row.symbol)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sector Snapshot */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Sector Snapshot</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Sorted by avg timing score · {sectors.length} sectors
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <TechnicalSectorSnapshot sectors={sectors} />
        </CardContent>
      </Card>

      {/* Heatmap */}
      {heatmap.length > 0 && (
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-1">
            <div>
              <CardTitle className="text-base font-semibold">Method Signal Heatmap</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Signal colour by method across all stocks
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <TechnicalHeatmapSection heatmap={heatmap} />
          </CardContent>
        </Card>
      )}

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <button
          type="button"
          onClick={() => router.push("/fundamentalgate")}
          className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 hover:border-slate-300 hover:bg-slate-50 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Previous</div>
            <div className="text-sm font-semibold text-slate-700">Fundamental Gate</div>
            <div className="text-[11px] text-slate-400">Gate 1 · valuation & quality</div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-slate-300" />
            <div className="h-2 w-2 rounded-full bg-slate-300" />
            <div className="h-2 w-6 rounded-full bg-violet-500" />
          </div>
          <span className="text-xs text-slate-400 ml-1">Gate 2 of 3</span>
        </div>

        <button
          type="button"
          onClick={() => router.push("/addtobasket")}
          className="group flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3.5 hover:border-violet-300 hover:bg-violet-100 transition-all"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-violet-400 mb-0.5">Next</div>
            <div className="text-sm font-semibold text-violet-700">Risk Gate</div>
            <div className="text-[11px] text-violet-400">Gate 3 · position sizing</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-200 group-hover:bg-violet-300 transition-colors">
            <ChevronRight className="h-4 w-4 text-violet-600" />
          </div>
        </button>
      </div>
    </div>
  );
}