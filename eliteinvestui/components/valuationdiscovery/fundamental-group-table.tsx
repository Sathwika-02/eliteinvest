"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, PanelRightOpen, Trash2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  FundamentalGroupRow,
  FundamentalPipelineRow,
  FundamentalScorecard,
  FundamentalSectorRow,
} from "@/lib/services/fundamental.service";
import { useFundamental } from "@/contexts/fundamental-context";

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
function fmtCurrency(value?: number | null, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `Rs.${Number(value).toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
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
function scoreTextColor(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "text-emerald-600";
  if (n >= 50) return "text-amber-600";
  return "text-rose-600";
}
function scoreBarBg(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 50) return "bg-emerald-500";
  if (n >= 30) return "bg-amber-500";
  return "bg-rose-500";
}
function upsideColor(upside?: number | null) {
  return Number(upside ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600";
}
function verdictBadgeCls(verdict?: string | null) {
  const v = String(verdict || "").toUpperCase();
  if (v.includes("PASS") || v.includes("STRONG") || v.includes("HIGH"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (v.includes("CAUTION") || v.includes("MODERATE") || v.includes("MEDIUM"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}
function verdictPillStyle(verdict?: string | null) {
  const v = String(verdict || "").toUpperCase();
  if (v.includes("AVOID") || v.includes("FAIL")) return { cls: "bg-rose-100 text-rose-700", bar: "bg-rose-500" };
  if (v.includes("CAUTION")) return { cls: "bg-amber-100 text-amber-700", bar: "bg-amber-500" };
  return { cls: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" };
}
function pipelineStatusStyle(status?: string | null) {
  const s = String(status || "").toUpperCase();
  if (s.includes("REJECT")) return { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400", border: "border-rose-200" };
  if (s.includes("REVIEW")) return { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400", border: "border-amber-200" };
  if (s.includes("PASS") || s.includes("READY")) return { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400", border: "border-emerald-200" };
  return { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300", border: "border-slate-200" };
}
function readinessBarBg(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "bg-emerald-500";
  if (n >= 40) return "bg-amber-500";
  return "bg-rose-400";
}
function readinessTextColor(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "text-emerald-600";
  if (n >= 40) return "text-amber-600";
  return "text-rose-500";
}
function sigVerdictStyle(verdict?: string | null) {
  const v = String(verdict || "").toUpperCase();
  if (v.includes("UNDERVALUED")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (v.includes("FAIRLY")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (v.includes("OVERVALUED")) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}
function formatStatus(status?: string | null) {
  if (!status) return "-";
  return status.replace(/_/g, " ").replace(/\bAT\b/, "at");
}

// ── Sector Snapshot ──────────────────────────

function ScoreMeter({ score }: { score?: number | null }) {
  const n = Math.min(Math.max(Number(score ?? 0), 0), 100);
  return (
    <div className="relative w-full">
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${scoreBarBg(n)}`} style={{ width: `${n}%` }} />
      </div>
      <div className="absolute top-0 h-2 w-px bg-white/80" style={{ left: "30%" }} />
      <div className="absolute top-0 h-2 w-px bg-white/80" style={{ left: "50%" }} />
    </div>
  );
}

function SectorCard({ row }: { row: FundamentalSectorRow }) {
  const total = (row.stocks_pass ?? 0) + (row.stocks_caution ?? 0) + (row.stocks_fail ?? 0);
  const passW = total > 0 ? ((row.stocks_pass ?? 0) / total) * 100 : 0;
  const cautionW = total > 0 ? ((row.stocks_caution ?? 0) / total) * 100 : 0;
  const failW = total > 0 ? ((row.stocks_fail ?? 0) / total) * 100 : 0;
  const vStyle = verdictPillStyle(row.dominant_verdict);
  const isPositiveUpside = Number(row.avg_upside_pct ?? 0) >= 0;
  const dims = [
    { label: "Value", value: row.avg_value_depth, color: "bg-blue-400" },
    { label: "Growth", value: row.avg_growth_quality, color: "bg-teal-400" },
    { label: "Business", value: row.avg_business_quality, color: "bg-violet-400" },
    { label: "Safety", value: row.avg_financial_safety, color: "bg-emerald-400" },
    { label: "Momentum", value: row.avg_market_momentum, color: "bg-amber-400" },
    { label: "Income", value: row.avg_income_quality, color: "bg-pink-400" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all">
      <div className={`h-1 w-full ${vStyle.bar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-base leading-tight">{row.sector}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{row.total_stocks ?? "-"} stocks · {fmtDate(row.analysis_date)}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${vStyle.cls}`}>
            {row.dominant_verdict?.replace(/_/g, " ") || "-"}
          </span>
        </div>

        <div className="flex items-end gap-5 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Avg Score</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${scoreTextColor(row.avg_fundamental_score)}`}>{fmtNumber(row.avg_fundamental_score, 1)}</span>
              <span className="text-slate-300 text-sm">/100</span>
            </div>
          </div>
          <div className="mb-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Avg Upside</p>
            <div className={`flex items-center gap-1 text-sm font-semibold ${upsideColor(row.avg_upside_pct)}`}>
              {isPositiveUpside ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {fmtPctSigned(row.avg_upside_pct, 1)}
            </div>
          </div>
          <div className="mb-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Pass Rate</p>
            <span className={`text-sm font-semibold ${scoreTextColor(row.pass_rate_pct)}`}>{fmtPct(row.pass_rate_pct, 1)}</span>
          </div>
          <div className="mb-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Conviction</p>
            <span className="text-sm font-semibold text-slate-700">{fmtNumber(row.avg_conviction_score, 2)}</span>
          </div>
        </div>

        <ScoreMeter score={row.avg_fundamental_score} />

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
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${Math.min(Math.max(Number(d.value ?? 0), 0), 100)}%` }} />
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
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{row.best_stock || "-"}</span>
            </div>
            {row.worst_stock && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Worst</span>
                <span className="font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{row.worst_stock}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-emerald-600 font-medium">+{row.total_favorable_signals ?? 0}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">{row.total_neutral_signals ?? 0}</span>
            <span className="text-slate-300">·</span>
            <span className="text-rose-500 font-medium">-{row.total_unfavorable_signals ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectorSnapshot({ sectors }: { sectors: FundamentalSectorRow[] }) {
  if (sectors.length === 0) return <div className="text-sm text-slate-500 py-8 text-center">No sector data available.</div>;
  const sorted = [...sectors].sort((a, b) => Number(b.avg_fundamental_score ?? 0) - Number(a.avg_fundamental_score ?? 0));
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((row) => <SectorCard key={row.sector} row={row} />)}
    </div>
  );
}

// ── Pipeline Readiness ───────────────────────

function PipelineCard({ row }: { row: FundamentalPipelineRow }) {
  const status = pipelineStatusStyle(row.pipeline_status);
  const initials = (row.symbol || "??").slice(0, 2).toUpperCase();
  const readiness = Number(row.pipeline_readiness_score ?? 0);
  const buy = row.sig_models_buy ?? 0;
  const hold = row.sig_models_hold ?? 0;
  const avoid = row.sig_models_avoid ?? 0;
  const totalModels = row.sig_models_evaluated ?? buy + hold + avoid;
  const buyW = totalModels > 0 ? (buy / totalModels) * 100 : 0;
  const holdW = totalModels > 0 ? (hold / totalModels) * 100 : 0;
  const avoidW = totalModels > 0 ? (avoid / totalModels) * 100 : 0;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-sm transition-all ${status.border}`}>
      <div className={`h-0.5 w-full ${status.dot}`} />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-900 text-sm">{row.symbol}</span>
              {row.company_name && row.company_name !== row.symbol && (
                <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{row.company_name}</span>
              )}
            </div>
            {row.sector && <span className="text-[10px] text-slate-400">{row.sector}{row.industry ? ` · ${row.industry}` : ""}</span>}
          </div>
          <div className="text-right shrink-0">
            <div className={`text-lg font-bold leading-none ${readinessTextColor(readiness)}`}>{fmtNumber(readiness, 1)}</div>
            <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">readiness</div>
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
          <div className={`h-full rounded-full ${readinessBarBg(readiness)}`} style={{ width: `${Math.min(readiness, 100)}%` }} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.bg} ${status.text} ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {formatStatus(row.pipeline_status)}
          </span>
          {row.sig_dominant_verdict && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${sigVerdictStyle(row.sig_dominant_verdict)}`}>
              {row.sig_dominant_verdict.replace(/_/g, " ")}
            </span>
          )}
          {row.sig_avg_upside_pct != null && (
            <span className={`text-[11px] font-semibold ml-auto ${upsideColor(row.sig_avg_upside_pct)}`}>
              {fmtPctSigned(row.sig_avg_upside_pct, 1)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="rounded-lg bg-slate-50 p-2 text-center">
            <div className="text-[11px] font-semibold text-slate-800 truncate">{fmtCurrency(row.current_price)}</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Price</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center">
            <div className="text-[11px] font-semibold text-slate-800 truncate">{fmtCurrency(row.sig_avg_intrinsic_value)}</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Intrinsic</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-center">
            <div className={`text-[11px] font-semibold ${scoreTextColor(row.fundamental_score)}`}>{fmtNumber(row.fundamental_score, 1)}</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">F-Score</div>
          </div>
        </div>

        {totalModels > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-[9px] text-slate-400 mb-1">
              <span>{totalModels} model{totalModels !== 1 ? "s" : ""}</span>
              <span className="flex gap-2">
                {buy > 0 && <span className="text-emerald-600 font-medium">{buy} buy</span>}
                {hold > 0 && <span className="text-amber-600 font-medium">{hold} hold</span>}
                {avoid > 0 && <span className="text-rose-600 font-medium">{avoid} avoid</span>}
              </span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
              {buyW > 0 && <div className="bg-emerald-400" style={{ width: `${buyW}%` }} />}
              {holdW > 0 && <div className="bg-amber-400" style={{ width: `${holdW}%` }} />}
              {avoidW > 0 && <div className="bg-rose-400" style={{ width: `${avoidW}%` }} />}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[10px] text-slate-500">
          <div className="flex gap-3">
            <span>Gates <span className="font-semibold text-slate-700">{row.fundamental_gates_passed_count ?? "-"}/{row.fundamental_gates_tested_count ?? "-"}</span></span>
            <span>Z <span className="font-semibold text-slate-700">{fmtNumber(row.altman_z_score, 2)}</span></span>
            <span>F <span className="font-semibold text-slate-700">{fmtNumber(row.piotroski_f_score, 0)}</span></span>
          </div>
          {row.sig_agreement_pct != null && (
            <span>{fmtNumber(row.sig_agreement_pct, 0)}% agreement</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineReadiness({ pipeline }: { pipeline: FundamentalPipelineRow[] }) {
  if (pipeline.length === 0) return <div className="text-sm text-slate-500 py-8 text-center">No pipeline data available.</div>;
  const statusOrder = ["PASS", "UNDER_REVIEW", "REJECTED_AT_SIGNATORY", "UNKNOWN"];
  const groups = pipeline.reduce<Record<string, FundamentalPipelineRow[]>>((acc, row) => {
    const key = row.pipeline_status || "UNKNOWN";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
  const sortedKeys = Object.keys(groups).sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b));

  return (
    <div className="space-y-6">
      {sortedKeys.map((status) => {
        const s = pipelineStatusStyle(status);
        const count = groups[status].length;
        return (
          <div key={status}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {formatStatus(status)}
              </div>
              <span className="text-xs text-slate-400">{count} stock{count !== 1 ? "s" : ""}</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groups[status].map((row, idx) => (
                <PipelineCard key={`${row.symbol}-${idx}`} row={row} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main ─────────────────────────────────────

interface FundamentalGroupTableProps {
  onSelectStock: (symbol: string) => void;
  onRemoveStocks?: (symbols: string[]) => void;
  onSelectionChange?: (symbols: string[]) => void;
  onNext?: (symbols: string[]) => void;
}

export function FundamentalGroupTable({ onSelectStock, onRemoveStocks, onSelectionChange, onNext }: FundamentalGroupTableProps) {
  const {
    groupRows,
    scorecard,
    sectors,
    pipeline,
    loading,
  } = useFundamental();
  const rows = groupRows;
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const router = useRouter();
  const avgUpside = rows.length > 0
    ? rows.reduce((sum, row) => sum + Number(row.upside_percentage || 0), 0) / rows.length
    : 0;
  const allSelected = useMemo(() => rows.length > 0 && selectedSymbols.length === rows.length, [rows, selectedSymbols]);
  const isSelected = (symbol: string) => selectedSymbols.includes(symbol);
  const updateSelection = (next: string[]) => {
    setSelectedSymbols(next);
    if (onSelectionChange) onSelectionChange(next);
  };
  const toggleRow = (symbol: string) =>
    updateSelection(selectedSymbols.includes(symbol) ? selectedSymbols.filter((s) => s !== symbol) : [...selectedSymbols, symbol]);
  const toggleSelectAll = () => updateSelection(allSelected ? [] : rows.map((r) => r.symbol));
  const handleRemoveSelected = () => {
    if (selectedSymbols.length === 0) return;
    if (onRemoveStocks) onRemoveStocks(selectedSymbols);
    setSelectedSymbols([]);
  };
  useEffect(() => {
    if (rows.length > 0) {
      setSelectedSymbols(rows.map((r) => r.symbol));
    }
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-emerald-100 bg-[#edf8ef]">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">Gate 1: Fundamental Evaluation</div>
              <p className="text-sm text-slate-600">Start with stock group comparison, then drill into stock detail.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-violet-600 hover:bg-violet-700"><LayoutGrid className="mr-2 h-4 w-4" />Group View</Button>
              <Button variant="outline" onClick={() => {
                const symbolToShow =
                  selectedSymbols.length > 0
                    ? selectedSymbols[0]
                    : rows[0]?.symbol;

                if (symbolToShow) {
                  onSelectStock(symbolToShow);
                }
              }}><PanelRightOpen className="mr-2 h-4 w-4" />Stock Detail</Button>
              <Button variant="destructive" onClick={handleRemoveSelected} disabled={selectedSymbols.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />Remove Selected ({selectedSymbols.length})
              </Button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              { label: "Stocks Loaded", value: String(rows.length), color: "text-slate-900" },
              { label: "Avg Score", value: fmtNumber(scorecard?.group_avg_score, 1), color: "text-slate-900" },
              { label: "Pass / Caution / Fail", value: `${scorecard?.stocks_pass ?? 0} / ${scorecard?.stocks_caution ?? 0} / ${scorecard?.stocks_fail ?? 0}`, color: "text-slate-900" },
              { label: "Avg Upside", value: fmtPct(avgUpside, 1), color: "text-emerald-700" },
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

      {/* Table */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Fundamental Comparison</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[2900px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 rounded border-slate-300" /></th>
                  {["Stock", "Company", "Sector", "Industry", "Current Price", "Analysis Date", "Score", "Gates", "Solvency", "Profitability", "Distress", "Coverage Gate", "Conviction", "Conviction Score", "Upside", "Favorable", "Neutral", "Unfavorable", "Methods", "Value Depth", "Growth Quality", "Business Quality", "Financial Safety", "Market Momentum", "Income Quality", "Altman Z", "Piotroski F", "Coverage %", "Median IV", "Filtered IV", "IV Count", "Dispersion CV", "Has Outliers", "Outlier Count", "Philosophy Conflict", "Philosophy Agreement", "Dominant Philosophies", "Fundamental Verdict", "Gate Verdict", "Summary"].map((h) => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.symbol} className="border-b align-top hover:bg-slate-50/70">
                    <td className="px-4 py-4"><input type="checkbox" checked={isSelected(row.symbol)} onChange={() => toggleRow(row.symbol)} className="h-4 w-4 rounded border-slate-300" /></td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{row.symbol}</td>
                    <td className="px-4 py-4 text-slate-700">{row.company_name || "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{row.sector || "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{row.industry || "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.current_price, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtDate(row.analysis_date)}</td>
                    <td className="px-4 py-4"><div className={`font-bold ${scoreTextColor(row.fundamental_score)}`}>{fmtNumber(row.fundamental_score, 1)}</div></td>
                    <td className="px-4 py-4 text-slate-700">{row.fundamental_gates_passed_count}/{row.fundamental_gates_tested_count}</td>
                    <td className="px-4 py-4 text-slate-700">{yesNo(row.solvency_gate_passed)}</td>
                    <td className="px-4 py-4 text-slate-700">{yesNo(row.profitability_gate_passed)}</td>
                    <td className="px-4 py-4 text-slate-700">{yesNo(row.distress_gate_passed)}</td>
                    <td className="px-4 py-4 text-slate-700">{yesNo(row.coverage_gate_passed)}</td>
                    <td className="px-4 py-4"><Badge className={`border ${verdictBadgeCls(row.fundamental_conviction_level)}`} variant="outline">{row.fundamental_conviction_level || "-"}</Badge></td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.fundamental_conviction_score, 1)}</td>
                    <td className="px-4 py-4 font-medium text-emerald-700">{fmtPct(row.upside_percentage, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{row.favorable_count ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{row.neutral_count ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{row.unfavorable_count ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{row.methods_analyzed ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.value_depth_score, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.growth_quality_score, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.business_quality_score, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.financial_safety_score, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.market_momentum_score, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.income_quality_score, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.altman_z_score, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.piotroski_f_score, 0)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtPct(row.coverage_pct, 1)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.median_intrinsic_value, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.filtered_intrinsic_value, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">{row.intrinsic_value_count ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtNumber(row.intrinsic_value_dispersion_cv, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">{yesNo(row.has_intrinsic_outliers)}</td>
                    <td className="px-4 py-4 text-slate-700">{row.outlier_count ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-700">{yesNo(row.philosophy_conflict)}</td>
                    <td className="px-4 py-4 text-slate-700">{fmtPct(row.philosophy_agreement_pct, 1)}</td>
                    <td className="px-4 py-4 text-slate-700 max-w-[220px]"><div className="line-clamp-2">{row.dominant_philosophies || "-"}</div></td>
                    <td className="px-4 py-4"><Badge className={`border ${verdictBadgeCls(row.fundamental_verdict)}`} variant="outline">{row.fundamental_verdict || "-"}</Badge></td>
                    <td className="px-4 py-4"><Badge className={`border ${verdictBadgeCls(row.gate_verdict)}`} variant="outline">{row.gate_verdict || "-"}</Badge></td>
                    <td className="px-4 py-4 text-slate-700 max-w-[320px]"><div className="line-clamp-3">{row.fundamental_layman_summary || "-"}</div></td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => { onSelectStock(row.symbol); }}>View</Button>
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
              <p className="text-xs text-slate-400 mt-0.5">Sorted by avg fundamental score · {sectors.length} sectors</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4"><SectorSnapshot sectors={sectors} /></CardContent>
      </Card>

      {/* Pipeline Readiness */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Pipeline Readiness</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Grouped by signatory review status · {pipeline.length} stocks</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4"><PipelineReadiness pipeline={pipeline} /></CardContent>
      </Card>

      {/* ── Previous / Next navigation ── */}
      <div className="flex items-center justify-between pt-2 pb-4">
        {/* Previous → Dashboard stock section */}
        <button
          type="button"
          onClick={() => router.push("/valuationdiscovery")}
          className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 hover:border-slate-300 hover:bg-slate-50 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Previous</div>
            <div className="text-sm font-semibold text-slate-700">Stock Selection</div>
            <div className="text-[11px] text-slate-400">Dashboard · selected stocks</div>
          </div>
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-slate-300" />
            <div className="h-2 w-6 rounded-full bg-violet-500" />
            <div className="h-2 w-2 rounded-full bg-slate-200" />
          </div>
          <span className="text-xs text-slate-400 ml-1">Gate 1 of 3</span>
        </div>

        {/* Next → Technical gate */}
        <button
          type="button"
          onClick={() => {
            if (onNext) {
              onNext(selectedSymbols);
            } else {
              router.push("/valuationdiscovery/technical");
            }
          }}
          className="group flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3.5 hover:border-violet-300 hover:bg-violet-100 transition-all"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-violet-400 mb-0.5">Next</div>
            <div className="text-sm font-semibold text-violet-700">Technical Gate</div>
            <div className="text-[11px] text-violet-400">Gate 2 · momentum & trend</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-200 group-hover:bg-violet-300 transition-colors">
            <ChevronRight className="h-4 w-4 text-violet-600" />
          </div>
        </button>
      </div>

    </div>
  );
}