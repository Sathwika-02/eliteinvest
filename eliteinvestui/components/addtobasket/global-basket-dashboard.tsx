"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, Shield, AlertTriangle,
  BarChart2, Target, Activity, Layers, DollarSign,
  CheckCircle2, XCircle, RefreshCw, Zap, ChevronDown,
  ChevronUp, Eye, ArrowLeft, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GlobalBasketState } from "@/hooks/useGlobalBasket";
import { globalBasketService } from "@/lib/services/global basket.service";
import type {
  BasketConvictionRow, BasketGateReadinessRow,
  BasketExitSignalRow, BasketPulseRow, BasketPerformanceRow,
  BasketRiskRow, BasketDividendRow, BasketAnalystForecastRow,
  BasketEntryPlanRow, BasketCompositionRow, BasketCoverageRow,
  BasketSyncOverviewRow, BasketSyncRiskCoverageRow,
} from "@/lib/services/global basket.service";

// ── Formatters ─────────────────────────────────────────────────────────────

const fmt   = (v?: number | null, d = 1) => v == null || isNaN(+v) ? "-" : (+v).toFixed(d);
const fmtP  = (v?: number | null, d = 1) => v == null || isNaN(+v) ? "-" : `${(+v).toFixed(d)}%`;
const fmtPS = (v?: number | null, d = 1) => {
  if (v == null || isNaN(+v)) return "-";
  return `${+v >= 0 ? "+" : ""}${(+v).toFixed(d)}%`;
};
const fmtF  = (v?: number | null, d = 1) => v == null || isNaN(+v) ? "-" : `${((+v) * 100).toFixed(d)}%`;
const fmtFS = (v?: number | null, d = 1) => {
  if (v == null || isNaN(+v)) return "-";
  const n = +v * 100;
  return `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
};
const fmtC  = (v?: number | null) => {
  if (v == null || isNaN(+v)) return "-";
  return `₹${(+v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};
const fmtMC = (v?: number | null) => {
  if (v == null) return "-";
  const n = +v;
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `₹${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e7)  return `₹${(n / 1e7).toFixed(1)}Cr`;
  return `₹${n.toFixed(0)}`;
};
const fmtDate = (v?: string | null) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Color helpers ──────────────────────────────────────────────────────────

const posNeg   = (v?: number | null) => +(v ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600";
const scoreClr = (v?: number | null) => {
  const n = +(v ?? 0);
  if (n >= 70) return "text-emerald-600";
  if (n >= 45) return "text-amber-600";
  return "text-rose-600";
};
const scoreBar = (v?: number | null) => {
  const n = +(v ?? 0);
  if (n >= 70) return "bg-emerald-500";
  if (n >= 45) return "bg-amber-500";
  return "bg-rose-500";
};
const verdictCls = (v?: string | null) => {
  const s = String(v || "").toUpperCase();
  if (s.includes("PASS") || s.includes("STRONG") || s.includes("FULL") || s.includes("HEALTHY") || s.includes("HIGH") || s.includes("BUY"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("CAUTION") || s.includes("MODERATE") || s.includes("WATCH") || s.includes("PARTIAL") || s.includes("NEEDS") || s.includes("HOLD"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
};
const outlookPill = (v?: string | null) => {
  const s = String(v || "").toUpperCase();
  if (s.includes("FAVORABLE") || s.includes("BULLISH")) return "bg-emerald-100 text-emerald-700";
  if (s.includes("MONITORING") || s.includes("NEUTRAL")) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
};

// ── Shared sub-components ──────────────────────────────────────────────────

function Bar({ value, max = 100, cls = "bg-violet-400" }: { value?: number | null; max?: number; cls?: string }) {
  const pct = Math.min(Math.max((+(value ?? 0) / max) * 100, 0), 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full rounded-full ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function GIcon({ p }: { p: boolean | null }) {
  if (p === null) return <span className="text-slate-300 text-[10px]">–</span>;
  return p
    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
    : <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
}

function KpiCard({ label, value, color, icon, sub }: {
  label: string; value: string; color: string; icon: React.ReactNode; sub?: string;
}) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="rounded-xl bg-slate-50 p-2 shrink-0">{icon}</div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
          <div className={`text-2xl font-bold leading-tight ${color}`}>{value}</div>
          {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Tab config ─────────────────────────────────────────────────────────────

type Tab = "coverage" | "composition" | "pulse" | "conviction" | "entry" | "gates" |
           "forecast" | "performance" | "risk" | "exits" | "dividends" | "sync";

const TABS: { id: Tab; label: string; desc: string }[] = [
  { id: "coverage",    label: "Coverage",          desc: "First call — what analysis exists" },
  { id: "composition", label: "Composition",        desc: "Sector/industry/cap structure" },
  { id: "pulse",       label: "Watchlist Pulse",    desc: "Dashboard card per tracked stock" },
  { id: "conviction",  label: "Conviction Ranking", desc: "Which stock to invest in first?" },
  { id: "entry",       label: "Entry Plans",        desc: "Execution blueprint" },
  { id: "gates",       label: "Gate Readiness",     desc: "Fund + tech gate status" },
  { id: "forecast",    label: "Analyst Forecast",   desc: "Street consensus + ML" },
  { id: "performance", label: "Performance",        desc: "How is my money doing?" },
  { id: "risk",        label: "Risk Exposure",      desc: "Beta, VaR, drawdown, Sharpe" },
  { id: "exits",       label: "Exit Signals",       desc: "Should I sell?" },
  { id: "dividends",   label: "Dividends",          desc: "Yield, payout, safety" },
  { id: "sync",        label: "Portfolio Sync",     desc: "External holdings + risk gap" },
];

// ── 1. COVERAGE — first call, health check banner ─────────────────────────

function CoverageTab({ rows }: { rows: BasketCoverageRow[] }) {
  const full      = rows.filter(r => r.coverage_status === "FULL").length;
  const partial   = rows.filter(r => r.coverage_status === "PARTIAL").length;
  const missing   = rows.filter(r => r.coverage_status !== "FULL" && r.coverage_status !== "PARTIAL").length;

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Full Coverage",    count: full,    cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
          { label: "Partial Coverage", count: partial, cls: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Missing Data",     count: missing, cls: "bg-rose-50 border-rose-200 text-rose-700" },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${cls}`}>
            <div className="text-3xl font-bold">{count}</div>
            <div className="text-xs mt-1 opacity-75">{label}</div>
          </div>
        ))}
      </div>

      {/* Coverage checks grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(r => {
          const checks = [
            { label: "Profile",     ok: r.has_profile },
            { label: "Premium",     ok: r.has_premium_analytics },
            { label: "Fundamental", ok: r.has_fundamental },
            { label: "Technical",   ok: r.has_technical },
            { label: "Forecast",    ok: r.has_forecast },
          ];
          const passCount = checks.filter(c => c.ok).length;
          return (
            <div key={r.symbol} className={`rounded-2xl border p-4 ${r.coverage_status === "FULL" ? "border-emerald-200 bg-emerald-50/30" : r.coverage_status === "PARTIAL" ? "border-amber-200 bg-amber-50/30" : "border-rose-200 bg-rose-50/30"}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{r.symbol}</div>
                  <div className="text-[10px] text-slate-400">{r.sector} · {r.industry}</div>
                </div>
                <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.coverage_status)}`}>
                  {passCount}/5
                </Badge>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {checks.map(({ label, ok }) => (
                  <div key={label} className="text-center">
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center ${ok ? "bg-emerald-100" : "bg-rose-100"}`}>
                      {ok ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-rose-400" />}
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[9px] text-slate-400">
                Updated: {fmtDate(r.premium_last_updated)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 2. COMPOSITION — sector/industry/cap structure ────────────────────────

function CompositionTab({ rows }: { rows: BasketCompositionRow[] }) {
  // Sector breakdown
  const sectorMap = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.sector] = (acc[r.sector] ?? 0) + 1;
    return acc;
  }, {});
  const capMap = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.market_cap_bucket] = (acc[r.market_cap_bucket] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Sector + cap breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-600 mb-3">Sector Breakdown</div>
          <div className="space-y-2">
            {Object.entries(sectorMap).sort((a, b) => b[1] - a[1]).map(([sector, count]) => (
              <div key={sector} className="flex items-center gap-3">
                <div className="flex-1 text-xs text-slate-600 truncate">{sector}</div>
                <div className="w-24">
                  <Bar value={(count / rows.length) * 100} cls="bg-violet-400" />
                </div>
                <div className="text-xs font-medium text-slate-700 w-6 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-600 mb-3">Market Cap Buckets</div>
          <div className="space-y-2">
            {Object.entries(capMap).sort((a, b) => b[1] - a[1]).map(([cap, count]) => (
              <div key={cap} className="flex items-center gap-3">
                <div className="flex-1 text-xs text-slate-600">{cap}</div>
                <div className="w-24">
                  <Bar value={(count / rows.length) * 100} cls="bg-teal-400" />
                </div>
                <div className="text-xs font-medium text-slate-700 w-6 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock table */}
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b text-[10px] font-semibold uppercase tracking-wide text-slate-500 text-left">
              {["Symbol","Company","Sector","Industry","Price","Mkt Cap","Bucket","P/E","P/B","ROE","Beta","Div Yield","Sector %ile"].map(h => (
                <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.symbol} className="border-b hover:bg-slate-50/60">
                <td className="px-4 py-3 font-semibold text-slate-900">{r.symbol}</td>
                <td className="px-4 py-3 text-xs text-slate-600 max-w-[180px] truncate">{r.company_name}</td>
                <td className="px-4 py-3 text-[10px] text-slate-400">{r.sector}</td>
                <td className="px-4 py-3 text-[10px] text-slate-400">{r.industry}</td>
                <td className="px-4 py-3 font-medium">{fmtC(r.current_price)}</td>
                <td className="px-4 py-3 text-[10px] text-slate-500">{fmtMC(r.market_cap)}</td>
                <td className="px-4 py-3"><Badge variant="outline" className={`text-[9px] border ${verdictCls(r.market_cap_bucket)}`}>{r.market_cap_bucket}</Badge></td>
                <td className="px-4 py-3 text-slate-600">{fmt(r.pe_ratio, 1)}</td>
                <td className="px-4 py-3 text-slate-600">{fmt(r.pb_ratio, 2)}</td>
                <td className="px-4 py-3"><span className={posNeg(r.roe)}>{fmtP(r.roe, 1)}</span></td>
                <td className="px-4 py-3 text-slate-600">{fmt(r.beta, 2)}</td>
                <td className="px-4 py-3 text-emerald-600">{fmtF(r.dividend_yield_ttm, 2)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bar value={r.sector_percentile} cls="bg-violet-400" />
                    <span className="text-[10px] text-slate-400 w-7 shrink-0">{fmt(r.sector_percentile, 0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 3. PULSE — watchlist pulse, dashboard card per stock ──────────────────

function PulseTab({ rows }: { rows: BasketPulseRow[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(r => {
        const alerts = [
          r.alert_overbought && "Overbought",
          r.alert_oversold && "Oversold",
          r.alert_volume_spike && "Vol Spike",
          r.alert_near_52w_high && "Near 52W High",
          r.alert_near_52w_low && "Near 52W Low",
        ].filter((x): x is string => Boolean(x));

        return (
          <div key={r.symbol} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-slate-900">{r.symbol}</div>
                <div className="text-[10px] text-slate-400">{r.company_name}</div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${outlookPill(r.outlook)}`}>{r.outlook}</span>
            </div>

            <div className="text-xl font-bold text-slate-900">{fmtC(r.current_price)}</div>
            <div className="text-[10px] text-slate-400 mb-3">{r.market_phase} · {r.mtf_alignment}</div>

            {/* 52W range bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                <span>{fmtC(r.fifty_two_week_low)}</span>
                <span>52W Range ({fmt(r.range_52w_position_pct, 0)}%)</span>
                <span>{fmtC(r.fifty_two_week_high)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden relative">
                <div className="h-full rounded-full bg-violet-200" style={{ width: `${r.range_52w_position_pct ?? 0}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-violet-600" style={{ left: `${r.range_52w_position_pct ?? 0}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[{ l: "5D", v: r.return_5d }, { l: "10D", v: r.return_10d }, { l: "30D", v: r.return_30d }].map(({ l, v }) => (
                <div key={l} className="rounded-lg bg-slate-50 p-1.5 text-center border border-slate-100">
                  <div className={`text-xs font-semibold ${posNeg(v)}`}>{fmtFS(v)}</div>
                  <div className="text-[9px] text-slate-400">{l}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>RSI: <span className={`font-semibold ${scoreClr(r.rsi_14d)}`}>{fmt(r.rsi_14d, 1)}</span></span>
              <span>vs 200DMA: <span className={posNeg(r.price_vs_200dma)}>{fmtF(r.price_vs_200dma)}</span></span>
              <span>{r.momentum_label}</span>
            </div>

            {alerts.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2 pt-2 border-t border-slate-100">
                {alerts.map(a => <span key={a} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{a}</span>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 4. CONVICTION — which stock to invest in FIRST ────────────────────────

function ConvictionTab({ rows, countryCode }: { rows: BasketConvictionRow[]; countryCode: string }) {
  const [selected, setSelected] = useState<BasketConvictionRow | null>(null);
  const [entryPlan, setEntryPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const sorted = [...rows].sort((a, b) => +(b.composite_score ?? 0) - +(a.composite_score ?? 0));

  const handleViewPlan = async (row: BasketConvictionRow) => {
    setSelected(row);
    setLoadingPlan(true);
    try {
      const res: any = await globalBasketService.getEntryPlan(countryCode, row.symbol);
      const data = res?.data ?? res?.success ? res.data : res;
      setEntryPlan(data ?? null);
    } catch {
      setEntryPlan(null);
    } finally {
      setLoadingPlan(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <button onClick={() => { setSelected(null); setEntryPlan(null); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to conviction ranking
        </button>
        <div className="rounded-2xl border border-violet-200 bg-violet-50/30 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xl font-bold text-slate-900">{selected.symbol}</div>
              <div className="text-sm text-slate-500">{selected.company_name} · {selected.sector}</div>
            </div>
            <div className={`text-3xl font-bold ${scoreClr(selected.composite_score)}`}>{fmt(selected.composite_score, 1)}</div>
          </div>
          {loadingPlan ? (
            <div className="flex items-center gap-2 py-6 text-slate-400"><RefreshCw className="h-4 w-4 animate-spin" /> Loading execution blueprint…</div>
          ) : entryPlan ? (
            <div className="space-y-3 mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Execution Blueprint</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { l: "Entry",    v: fmtC(entryPlan.agg_entry_price), c: "text-slate-800" },
                  { l: "Stop",     v: fmtC(entryPlan.agg_stop_loss),   c: "text-rose-600" },
                  { l: "Target 1", v: fmtC(entryPlan.agg_target_1),    c: "text-emerald-600" },
                  { l: "R/R",      v: `${fmt(entryPlan.agg_risk_reward, 2)}×`, c: scoreClr(entryPlan.agg_risk_reward * 25) },
                ].map(({ l, v, c }) => (
                  <div key={l} className="rounded-xl bg-white border border-slate-200 p-3 text-center">
                    <div className={`text-base font-bold ${c}`}>{v}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-3 text-sm text-slate-600">{entryPlan.position_message}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-400 mb-1">Stocks ranked by composite score — highest conviction first. Click to see execution blueprint.</div>
      {sorted.map((r, idx) => (
        <div key={r.symbol} className={`bg-white rounded-2xl border p-4 hover:border-slate-300 transition-all ${idx === 0 ? "border-violet-300 bg-violet-50/30" : "border-slate-200"}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx === 0 ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                {idx + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{r.symbol}</span>
                  <span className="text-xs text-slate-400">{r.company_name}</span>
                  <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.conviction_tier)}`}>{r.conviction_tier?.replace(/_/g, " ")}</Badge>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${outlookPill(r.outlook)}`}>{r.outlook}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-2xl font-bold ${scoreClr(r.composite_score)}`}>{fmt(r.composite_score, 1)}</div>
                <div className="text-[9px] text-slate-400">Composite</div>
              </div>
              <button
                onClick={() => handleViewPlan(r)}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                View Plan
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { l: "Fund Conv", v: fmt(r.fundamental_conviction_score, 1), c: scoreClr(r.fundamental_conviction_score) },
              { l: "Tech Conv", v: fmt(r.tech_conviction_score, 1),        c: scoreClr(r.tech_conviction_score) },
              { l: "Upside",    v: fmtP(r.upside_percentage, 1),           c: posNeg(r.upside_percentage) },
              { l: "Intrinsic", v: fmtC(r.filtered_intrinsic_value),       c: "text-slate-700" },
            ].map(({ l, v, c }) => (
              <div key={l} className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-center">
                <div className="text-[9px] text-slate-400 mb-0.5">{l}</div>
                <div className={`text-xs font-bold ${c}`}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 5. ENTRY PLANS — multi-stock execution blueprint ─────────────────────

function EntryTab({ rows }: { rows: BasketEntryPlanRow[] }) {
  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-400">Execution blueprint for all stocks — entry, stop, targets, zone ranges.</div>
      <div className="overflow-x-auto">
        <table className="min-w-[1600px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b text-[10px] font-semibold uppercase tracking-wide text-slate-500 text-left">
              {["Symbol","Price","Timing","Outlook","Entry","Stop","T1","T2","T3","R/R","Risk%","Position","Conservative","Balanced","Aggressive","Conviction"].map(h => (
                <th key={h} className="px-3 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.symbol} className="border-b hover:bg-slate-50/60">
                <td className="px-3 py-3 font-semibold text-slate-900">{r.symbol}</td>
                <td className="px-3 py-3 font-medium">{fmtC(r.current_price)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 w-20">
                    <Bar value={r.timing_score} cls={scoreBar(r.timing_score)} />
                    <span className={`text-xs font-bold shrink-0 ${scoreClr(r.timing_score)}`}>{fmt(r.timing_score, 0)}</span>
                  </div>
                </td>
                <td className="px-3 py-3"><span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${outlookPill(r.outlook)}`}>{r.outlook}</span></td>
                <td className="px-3 py-3 font-medium text-slate-800">{fmtC(r.agg_entry_price)}</td>
                <td className="px-3 py-3 text-rose-600 font-medium">{fmtC(r.agg_stop_loss)}</td>
                <td className="px-3 py-3 text-emerald-600">{fmtC(r.agg_target_1)}</td>
                <td className="px-3 py-3 text-emerald-600">{fmtC(r.agg_target_2)}</td>
                <td className="px-3 py-3 text-emerald-600">{fmtC(r.agg_target_3)}</td>
                <td className="px-3 py-3"><span className={`font-semibold ${scoreClr(+(r.agg_risk_reward ?? 0) * 25)}`}>{fmt(r.agg_risk_reward, 2)}×</span></td>
                <td className="px-3 py-3 text-rose-500">{fmtP(r.risk_percent, 1)}</td>
                <td className="px-3 py-3"><Badge variant="outline" className={`text-[9px] border ${verdictCls(r.position_status)}`}>{r.position_status?.replace(/_/g, " ")}</Badge></td>
                <td className="px-3 py-3 text-[10px] text-slate-500 whitespace-nowrap">{fmtC(r.entry_conservative_low)}–{fmtC(r.entry_conservative_high)}</td>
                <td className="px-3 py-3 text-[10px] text-slate-500 whitespace-nowrap">{fmtC(r.entry_balanced_low)}–{fmtC(r.entry_balanced_high)}</td>
                <td className="px-3 py-3 text-[10px] text-slate-500 whitespace-nowrap">{fmtC(r.entry_aggressive_low)}–{fmtC(r.entry_aggressive_high)}</td>
                <td className="px-3 py-3"><span className={`text-xs font-semibold ${scoreClr(r.conviction_score)}`}>{fmt(r.conviction_score, 1)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 7. GATE READINESS ─────────────────────────────────────────────────────

function GatesTab({ rows }: { rows: BasketGateReadinessRow[] }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-400">Fundamental + technical gate status per stock — pipeline readiness check.</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(r => (
          <div key={r.symbol} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <span className="font-semibold text-slate-900">{r.symbol}</span>
                <span className="text-[10px] text-slate-400 ml-2">{r.company_name}</span>
              </div>
              <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.pipeline_status)}`}>{r.pipeline_status?.replace(/_/g, " ")}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] uppercase tracking-wide text-slate-400 mb-1">Fundamental ({r.fundamental_gates_passed_count}/{r.fundamental_gates_tested_count})</div>
                {[
                  { l: "Solvency", p: r.solvency_gate_passed },
                  { l: "Profitability", p: r.profitability_gate_passed },
                  { l: "Distress", p: r.distress_gate_passed },
                  { l: "Coverage", p: r.coverage_gate_passed },
                ].map(({ l, p }) => (
                  <div key={l} className={`flex items-center gap-1.5 text-[10px] rounded-lg px-2 py-1.5 mb-1 border ${p ? "bg-emerald-50 border-emerald-200 text-emerald-700" : p === false ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <GIcon p={p} />{l}
                  </div>
                ))}
                <div className="text-[9px] text-slate-400 mt-1">Score: <span className={`font-semibold ${scoreClr(r.fundamental_score)}`}>{fmt(r.fundamental_score, 1)}</span></div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wide text-slate-400 mb-1">Technical ({r.tech_gates_passed_count}/4)</div>
                {[
                  { l: "Cloud", p: r.cloud_gate_passed },
                  { l: "Wave", p: r.wave_gate_passed },
                  { l: "Wyckoff", p: r.wyckoff_gate_passed },
                  { l: "Trend", p: r.trend_gate_passed },
                ].map(({ l, p }) => (
                  <div key={l} className={`flex items-center gap-1.5 text-[10px] rounded-lg px-2 py-1.5 mb-1 border ${p ? "bg-emerald-50 border-emerald-200 text-emerald-700" : p === false ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <GIcon p={p} />{l}
                  </div>
                ))}
                <div className="text-[9px] text-slate-400 mt-1">Combined: <span className={`font-semibold ${scoreClr(r.combined_conviction_score)}`}>{fmt(r.combined_conviction_score, 1)}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 8. ANALYST FORECAST — street consensus + ML predictions ──────────────

function ForecastTab({ rows }: { rows: BasketAnalystForecastRow[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(r => (
        <div key={r.symbol} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-slate-900">{r.symbol}</div>
              <div className="text-[10px] text-slate-400">{r.company_name}</div>
            </div>
            <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.consensus_signal)}`}>{r.consensus_signal}</Badge>
          </div>

          {/* Street consensus */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 mb-3">
            <div className="text-[9px] uppercase tracking-wide text-slate-400 mb-1">Street Consensus Target</div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-rose-500">{fmtC(r.price_target_low)}</span>
              <span className="font-semibold text-slate-800">{fmtC(r.price_target_avg)}</span>
              <span className="text-emerald-600">{fmtC(r.price_target_high)}</span>
            </div>
            <div className="text-center text-xs">
              <span className={`font-bold ${posNeg(r.target_upside_pct)}`}>{fmtP(r.target_upside_pct, 1)} upside</span>
              <span className="text-slate-400 ml-2">{r.analyst_coverage_count} analysts</span>
            </div>
            <div className="flex gap-1 mt-2 justify-center flex-wrap">
              {r.current_month_strong_buy > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">SBuy: {r.current_month_strong_buy}</span>}
              {r.current_month_buy > 0        && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">Buy: {r.current_month_buy}</span>}
              {r.current_month_hold > 0       && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Hold: {r.current_month_hold}</span>}
              {r.current_month_sell > 0       && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">Sell: {r.current_month_sell}</span>}
            </div>
          </div>

          {/* ML predictions */}
          <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
            <div className="text-[9px] uppercase tracking-wide text-violet-400 mb-2">ML Prediction</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className={`text-sm font-bold ${posNeg(r.ml_predicted_return_pct)}`}>{fmtP(r.ml_predicted_return_pct, 1)}</div>
                <div className="text-[9px] text-slate-400">Predicted Return</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-bold ${scoreClr(r.directional_accuracy_pct)}`}>{fmtP(r.directional_accuracy_pct, 1)}</div>
                <div className="text-[9px] text-slate-400">Directional Acc.</div>
              </div>
            </div>
            <div className="text-[9px] text-slate-400 mt-2 text-center">{r.ml_forecast_direction} · {r.horizon_days}d horizon</div>
          </div>

          <div className="mt-2 text-[9px] text-slate-400 flex justify-between">
            <span>EPS Next Yr: <span className={posNeg(r.eps_growth_next_year)}>{fmtP(r.eps_growth_next_year, 1)}</span></span>
            <span>Fwd P/E: {fmt(r.forward_pe, 1)}</span>
            <span>Rev Trend: {r.eps_revision_trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 9. PERFORMANCE — how is my money doing? ───────────────────────────────

function PerformanceTab({ rows }: { rows: BasketPerformanceRow[] }) {
  // Summary stats
  const pos30 = rows.filter(r => r.return_30d > 0).length;
  const neg30 = rows.filter(r => r.return_30d < 0).length;
  const avgRet30 = rows.length > 0
    ? rows.reduce((s, r) => s + (r.return_30d ?? 0), 0) / rows.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Hero — how is my money doing */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-2xl border p-4 text-center ${avgRet30 >= 0 ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
          <div className={`text-2xl font-bold ${posNeg(avgRet30)}`}>{fmtFS(avgRet30)}</div>
          <div className="text-xs text-slate-500 mt-0.5">Avg 30D Return</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{pos30}</div>
          <div className="text-xs text-slate-500 mt-0.5">Stocks Up (30D)</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
          <div className="text-2xl font-bold text-rose-600">{neg30}</div>
          <div className="text-xs text-slate-500 mt-0.5">Stocks Down (30D)</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b text-[10px] font-semibold uppercase tracking-wide text-slate-500 text-left">
              {["Symbol","Price","5D","10D","15D","30D","RSI","vs 200DMA","vs 52W Hi","MA Cross","Momentum","Vol Ratio","ATR"].map(h => (
                <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...rows].sort((a, b) => b.return_30d - a.return_30d).map(r => (
              <tr key={r.symbol} className="border-b hover:bg-slate-50/60">
                <td className="px-4 py-3 font-semibold text-slate-900">{r.symbol}</td>
                <td className="px-4 py-3 font-medium">{fmtC(r.current_price)}</td>
                <td className="px-4 py-3"><span className={posNeg(r.return_5d)}>{fmtFS(r.return_5d)}</span></td>
                <td className="px-4 py-3"><span className={posNeg(r.return_10d)}>{fmtFS(r.return_10d)}</span></td>
                <td className="px-4 py-3"><span className={posNeg(r.return_15d)}>{fmtFS(r.return_15d)}</span></td>
                <td className="px-4 py-3 font-semibold"><span className={posNeg(r.return_30d)}>{fmtFS(r.return_30d)}</span></td>
                <td className="px-4 py-3 text-slate-600">{fmt(r.rsi_14d, 1)}</td>
                <td className="px-4 py-3"><span className={posNeg(r.price_vs_200dma)}>{fmtFS(r.price_vs_200dma)}</span></td>
                <td className="px-4 py-3"><span className={posNeg(r.price_vs_52w_high)}>{fmtFS(r.price_vs_52w_high)}</span></td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-[9px] border ${r.ma_crossover === "GOLDEN_CROSS" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                    {r.ma_crossover?.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[10px] text-slate-500">{r.momentum_label}</td>
                <td className="px-4 py-3 text-slate-600">{fmt(r.volume_ratio_5d_30d, 2)}</td>
                <td className="px-4 py-3 text-slate-600">{fmtC(r.atr_14d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 10. RISK — beta, VaR, drawdown, Sharpe ───────────────────────────────

function RiskTab({ rows }: { rows: BasketRiskRow[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(r => (
        <div key={r.symbol} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-slate-900">{r.symbol}</div>
              <div className="text-[10px] text-slate-400">{r.sector}</div>
            </div>
            <div className="flex gap-1.5">
              <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.beta_category)}`}>{r.beta_category}</Badge>
              <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.volatility_regime)}`}>{r.volatility_regime}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { l: "Beta",    v: fmt(r.beta, 2),         c: "" },
              { l: "Sharpe",  v: fmt(r.sharpe_ratio, 3), c: posNeg(r.sharpe_ratio) },
              { l: "Sortino", v: fmt(r.sortino_ratio, 3), c: posNeg(r.sortino_ratio) },
              { l: "VaR 95",  v: fmtF(r.var_95, 1),      c: "text-rose-500" },
              { l: "CVaR",    v: fmtF(r.cvar_95, 1),     c: "text-rose-500" },
              { l: "Max DD",  v: fmtF(r.max_drawdown, 1), c: "text-rose-500" },
            ].map(({ l, v, c }) => (
              <div key={l} className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-center">
                <div className={`text-xs font-bold ${c || "text-slate-800"}`}>{v}</div>
                <div className="text-[9px] text-slate-400">{l}</div>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-slate-500 space-y-0.5">
            <div>Vol 30d: <span className="font-medium">{fmtF(r.realized_vol_30d, 1)}</span></div>
            <div>DD from High: <span className="text-rose-500 font-medium">{fmtP(r.drawdown_from_high_pct, 1)}</span> · {r.risk_adjusted_label?.replace(/_/g, " ")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 11. EXIT SIGNALS — should I sell? ─────────────────────────────────────

function ExitsTab({ rows }: { rows: BasketExitSignalRow[] }) {
  const critical = rows.filter(r => r.exit_urgency?.includes("CRITICAL")).length;
  const warning  = rows.filter(r => r.exit_urgency?.includes("WARNING")).length;
  const sorted   = [...rows].sort((a, b) => {
    const o: Record<string, number> = { CRITICAL: 0, STRONG: 1, FUNDAMENTAL_WARNING: 2, MODERATE: 3 };
    return (o[a.exit_urgency ?? ""] ?? 9) - (o[b.exit_urgency ?? ""] ?? 9);
  });

  return (
    <div className="space-y-4">
      {/* Action needed banner */}
      {(critical > 0 || warning > 0) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-800 text-sm">Action Required</div>
            <div className="text-xs text-rose-600 mt-0.5">
              {critical > 0 && <span className="mr-3">{critical} critical exit signal{critical > 1 ? "s" : ""}</span>}
              {warning > 0 && <span>{warning} warning{warning > 1 ? "s" : ""}</span>}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(r => (
          <div key={r.symbol} className={`bg-white rounded-2xl border p-4 ${r.exit_urgency?.includes("CRITICAL") ? "border-rose-300" : r.exit_urgency?.includes("WARNING") ? "border-amber-300" : "border-slate-200"}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900">{r.symbol}</span>
                <span className="text-xs text-slate-400">{r.company_name}</span>
                <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.exit_urgency)}`}>{r.exit_urgency?.replace(/_/g, " ")}</Badge>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${outlookPill(r.outlook)}`}>{r.outlook}</span>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <div className={`text-base font-bold ${scoreClr(r.timing_score)}`}>{fmt(r.timing_score, 0)}</div>
                  <div className="text-[9px] text-slate-400">Timing</div>
                </div>
                <div>
                  <div className="text-base font-bold text-rose-600">{fmtC(r.agg_stop_loss)}</div>
                  <div className="text-[9px] text-slate-400">Stop Loss</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{fmtP(r.stop_loss_distance_pct, 1)}</div>
                  <div className="text-[9px] text-slate-400">Stop Dist</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-3">{r.position_message}</div>
            <div className="grid grid-cols-3 gap-2">
              {[{ l: "Solvency", p: r.solvency_gate_passed }, { l: "Profitability", p: r.profitability_gate_passed }, { l: "Distress", p: r.distress_gate_passed }].map(({ l, p }) => (
                <div key={l} className={`flex items-center gap-1.5 text-[10px] rounded-lg px-2.5 py-1.5 border ${p ? "bg-emerald-50 border-emerald-200 text-emerald-700" : p === false ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                  <GIcon p={p} />{l}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 12. DIVIDENDS ─────────────────────────────────────────────────────────

function DividendsTab({ rows }: { rows: BasketDividendRow[] }) {
  const sorted = [...rows].sort((a, b) => +(b.dividend_yield_ttm ?? 0) - +(a.dividend_yield_ttm ?? 0));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map(r => (
        <div key={r.symbol} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-slate-900">{r.symbol}</div>
              <div className="text-[10px] text-slate-400">{r.company_name}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{fmtF(r.dividend_yield_ttm, 2)}</div>
              <div className="text-[9px] text-slate-400">Yield TTM</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[
              { l: "Annual",     v: fmtC(r.annual_dividend_amount), c: "" },
              { l: "Payout",     v: fmtP(r.payout_ratio, 1), c: "" },
              { l: "Growth",     v: fmtP(r.dividend_growth_rate, 1), c: posNeg(r.dividend_growth_rate) },
              { l: "Safety",     v: r.dividend_safety || "-", c: verdictCls(r.dividend_safety).includes("emerald") ? "text-emerald-600" : "text-amber-600" },
            ].map(({ l, v, c }) => (
              <div key={l} className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-center">
                <div className={`text-xs font-semibold ${c || "text-slate-700"}`}>{v}</div>
                <div className="text-[9px] text-slate-400">{l}</div>
              </div>
            ))}
          </div>
          <div className="mb-1.5">
            <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
              <span>Consistency Score</span><span>{fmt(r.dividend_consistency_score, 0)}/100</span>
            </div>
            <Bar value={r.dividend_consistency_score} cls="bg-emerald-400" />
          </div>
          <div className="text-[9px] text-slate-400">Last Ex: {fmtDate(r.last_ex_date)} · {r.yield_category} · {r.dividend_frequency}</div>
        </div>
      ))}
    </div>
  );
}

// ── 13+14. SYNC — portfolio overview + risk coverage gap ─────────────────

function SyncTab({ overview, riskCoverage }: {
  overview: BasketSyncOverviewRow[];
  riskCoverage: BasketSyncRiskCoverageRow[];
}) {
  const [view, setView] = useState<"overview" | "risk">("overview");
  const riskMap = Object.fromEntries(riskCoverage.map(r => [r.symbol, r]));

  return (
    <div className="space-y-4">
      {/* Sub-tab toggle */}
      <div className="flex gap-2">
        {[
          { id: "overview" as const, label: "Portfolio Overview", desc: "External holdings summary" },
          { id: "risk"     as const, label: "Risk & Coverage Gap", desc: "Risk profile + coverage gaps" },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${view === t.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b text-[10px] font-semibold uppercase tracking-wide text-slate-500 text-left">
                {["Symbol","Company","Sector","Industry","Price","Mkt Cap","Cap Cat","5D","30D","P/E","Div Yield","Beta","Vol 30d","Max DD","Coverage","Health"].map(h => (
                  <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overview.map(r => (
                <tr key={r.symbol} className="border-b hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.symbol}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px] truncate">{r.company_name}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-400">{r.sector}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-400">{r.industry}</td>
                  <td className="px-4 py-3 font-medium">{fmtC(r.current_price)}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-500">{fmtMC(r.market_cap)}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[9px] border ${verdictCls(r.market_cap_category)}`}>{r.market_cap_category}</Badge></td>
                  <td className="px-4 py-3"><span className={posNeg(r.return_5d)}>{fmtFS(r.return_5d)}</span></td>
                  <td className="px-4 py-3 font-semibold"><span className={posNeg(r.return_30d)}>{fmtFS(r.return_30d)}</span></td>
                  <td className="px-4 py-3 text-slate-600">{fmt(r.pe_ratio, 1)}</td>
                  <td className="px-4 py-3 text-emerald-600">{fmtF(r.dividend_yield_ttm, 2)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmt(r.beta, 2)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtF(r.realized_vol_30d, 1)}</td>
                  <td className="px-4 py-3 text-rose-500">{fmtF(r.max_drawdown, 1)}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[9px] border ${verdictCls(r.coverage_level)}`}>{r.coverage_level}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[9px] border ${verdictCls(r.analysis_health)}`}>{r.analysis_health}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "risk" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {riskCoverage.map(r => {
            const ov = overview.find(o => o.symbol === r.symbol);
            return (
              <div key={r.symbol} className={`bg-white rounded-2xl border p-4 hover:border-slate-300 transition-all ${r.drawdown_status === "HEALTHY" ? "border-slate-200" : "border-amber-200"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-900">{r.symbol}</div>
                    <div className="text-[10px] text-slate-400">{r.company_name}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.beta_category)}`}>{r.beta_category}</Badge>
                    <Badge variant="outline" className={`text-[9px] border ${verdictCls(r.drawdown_status)}`}>{r.drawdown_status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { l: "Beta",      v: fmt(r.beta, 2),            c: "" },
                    { l: "Sharpe",    v: fmt(r.sharpe_ratio, 3),    c: posNeg(r.sharpe_ratio) },
                    { l: "VaR 95",    v: fmtF(r.var_95, 1),         c: "text-rose-500" },
                    { l: "Max DD",    v: fmtF(r.max_drawdown, 1),   c: "text-rose-500" },
                    { l: "Tech Conv", v: fmt(r.tech_conviction_score, 1), c: scoreClr(r.tech_conviction_score) },
                    { l: "Timing",    v: fmt(r.timing_score, 0),    c: scoreClr(r.timing_score) },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-center">
                      <div className={`text-xs font-bold ${c || "text-slate-800"}`}>{v}</div>
                      <div className="text-[9px] text-slate-400">{l}</div>
                    </div>
                  ))}
                </div>
                {/* Coverage gap indicator */}
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-[9px] text-slate-500">
                  <span>Fund Verdict: </span>
                  <span className={`font-semibold ${verdictCls(r.fundamental_verdict).includes("emerald") ? "text-emerald-600" : verdictCls(r.fundamental_verdict).includes("amber") ? "text-amber-600" : "text-rose-600"}`}>{r.fundamental_verdict?.replace(/_/g, " ")}</span>
                  <span className="ml-3">Conv: <span className="font-medium text-slate-700">{fmt(r.fundamental_conviction_score, 1)}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Group Statistics ───────────────────────────────────────────────────────

function GroupStatistics({ data }: { data: GlobalBasketState }) {
  const { pulse, gateReadiness, conviction, entryPlans } = data;

  const favorable  = pulse.filter(p => p.outlook?.toUpperCase().includes("FAVORABLE")).length;
  const monitoring = pulse.filter(p => p.outlook?.toUpperCase().includes("MONITORING")).length;
  const neutral    = pulse.filter(p => !p.outlook?.toUpperCase().includes("FAVORABLE") && !p.outlook?.toUpperCase().includes("MONITORING") && !p.outlook?.toUpperCase().includes("UNFAVORABLE")).length;
  const negative   = pulse.filter(p => p.outlook?.toUpperCase().includes("UNFAVORABLE")).length;
  const total      = pulse.length || 1;

  const techPassCount = gateReadiness.filter(g => g.technical_gate_verdict === "PASS").length;
  const fundPassCount = gateReadiness.filter(g => g.fundamental_gate_verdict === "PASS").length;
  const avgTechGates  = gateReadiness.length > 0 ? gateReadiness.reduce((s, g) => s + (g.tech_gates_passed_count ?? 0), 0) / gateReadiness.length : 0;
  const avgFundGates  = gateReadiness.length > 0 ? gateReadiness.reduce((s, g) => s + (g.fundamental_gates_passed_count ?? 0), 0) / gateReadiness.length : 0;

  const extreme  = conviction.filter(c => (c.composite_score ?? 0) >= 90).length;
  const high70   = conviction.filter(c => (c.composite_score ?? 0) >= 70 && (c.composite_score ?? 0) < 90).length;
  const medium50 = conviction.filter(c => (c.composite_score ?? 0) >= 50 && (c.composite_score ?? 0) < 70).length;
  const low      = conviction.filter(c => (c.composite_score ?? 0) < 50).length;

  const verdictCounts = conviction.reduce<Record<string, number>>((acc, c) => {
    const k = c.fundamental_verdict || "UNKNOWN";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-slate-400" />Signal Distribution</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Positive",   count: favorable,  pct: favorable/total*100,  cls: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700" },
            { label: "Monitoring", count: monitoring, pct: monitoring/total*100, cls: "bg-amber-50 border-amber-200",    dot: "bg-amber-400",   text: "text-amber-700" },
            { label: "Neutral",    count: neutral,    pct: neutral/total*100,    cls: "bg-slate-50 border-slate-200",    dot: "bg-slate-300",   text: "text-slate-600" },
            { label: "Negative",   count: negative,   pct: negative/total*100,   cls: "bg-rose-50 border-rose-200",      dot: "bg-rose-500",    text: "text-rose-700" },
          ].map(({ label, count, pct, cls, dot, text }) => (
            <div key={label} className={`rounded-2xl border p-4 ${cls}`}>
              <div className="flex items-center gap-1.5 mb-2"><span className={`w-2 h-2 rounded-full ${dot}`} /><span className="text-xs text-slate-500">{label}</span></div>
              <div className={`text-3xl font-bold ${text}`}>{count}</div>
              <div className="text-xs text-slate-400 mt-0.5">{pct.toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-slate-400" />Gates Status</h3>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          {[
            { label: `Fundamental Passed: ${fundPassCount}/${gateReadiness.length}`, avg: avgFundGates, max: 4 },
            { label: `Technical Passed: ${techPassCount}/${gateReadiness.length}`,   avg: avgTechGates, max: 4 },
          ].map(({ label, avg, max }) => (
            <div key={label}>
              <div className="flex justify-between mb-1"><span className="text-xs text-slate-500">{label}</span><span className="text-xs font-semibold text-slate-600">{fmt(avg, 1)} avg</span></div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${scoreBar(avg * 25)}`} style={{ width: `${(avg/max)*100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-slate-400" />Confluence Analysis</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Extreme (90+)",  count: extreme,  cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
            { label: "High (70–89)",   count: high70,   cls: "bg-teal-50 border-teal-200 text-teal-700" },
            { label: "Medium (50–69)", count: medium50, cls: "bg-amber-50 border-amber-200 text-amber-700" },
            { label: "Low (<50)",      count: low,      cls: "bg-rose-50 border-rose-200 text-rose-700" },
          ].map(({ label, count, cls }) => (
            <div key={label} className={`rounded-2xl border p-4 ${cls}`}>
              <div className="text-[10px] opacity-70 mb-1">{label}</div>
              <div className="text-3xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><BarChart2 className="h-4 w-4 text-slate-400" />Valuation Verdict Breakdown</h3>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
          <div className="flex min-w-max">
            {Object.entries(verdictCounts).map(([verdict, count]) => (
              <div key={verdict} className="flex-1 min-w-[130px] border-r border-slate-100 last:border-0 p-4 text-center">
                <div className="text-2xl font-bold text-slate-800">{count}</div>
                <div className="text-[10px] text-slate-400 mt-1">{verdict.replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunity Zone cards */}
      {entryPlans.filter(e => e.position_status === "IN_ZONE").length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-slate-400" />Opportunity Zone</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entryPlans.filter(e => e.position_status === "IN_ZONE").map(e => (
              <div key={e.symbol} className="rounded-2xl bg-white border border-emerald-200 p-4 hover:border-emerald-300 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div><div className="font-semibold text-slate-900 text-sm">{e.symbol}</div><div className="text-[10px] text-slate-400">{e.company_name}</div></div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">IN ZONE</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {[{ l: "Price", v: fmtC(e.current_price), c: "" }, { l: "Stop", v: fmtC(e.agg_stop_loss), c: "text-rose-600" }, { l: "Timing", v: fmt(e.timing_score, 0), c: scoreClr(e.timing_score) }].map(({ l, v, c }) => (
                    <div key={l} className="rounded-lg bg-slate-50 p-2"><div className={`text-xs font-bold ${c || "text-slate-800"}`}>{v}</div><div className="text-[9px] text-slate-400">{l}</div></div>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-slate-500 truncate">{e.position_message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

interface GlobalBasketDashboardProps {
  data: GlobalBasketState;
  countryCode: string;
}

export function GlobalBasketDashboard({ data, countryCode }: GlobalBasketDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("coverage");

  const { loading, error, coverage, composition, pulse, conviction, entryPlans,
          gateReadiness, analystForecast, performance, risk, exitSignals, dividends,
          syncOverview, syncRiskCoverage } = data;

  const inZone       = entryPlans.filter(e => e.position_status === "IN_ZONE").length;
  const techPass     = gateReadiness.filter(g => g.technical_gate_verdict === "PASS").length;
  const exitWarnings = exitSignals.filter(e => e.exit_urgency?.includes("WARNING") || e.exit_urgency?.includes("CRITICAL")).length;
  const fullCoverage = coverage.filter(c => c.coverage_status === "FULL").length;

  if (loading) {
    return (
      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardContent className="p-10 flex items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading global basket analytics…</span>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="rounded-3xl border-rose-200 bg-rose-50 shadow-sm">
        <CardContent className="p-8 text-center text-rose-600 text-sm">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total Stocks"    value={String(composition.length)} color="text-slate-900"                                            icon={<Layers className="h-4 w-4 text-slate-400" />}      sub={`${fullCoverage} full coverage`} />
        <KpiCard label="In Opp Zone"     value={String(inZone)}             color="text-emerald-600"                                          icon={<Target className="h-4 w-4 text-emerald-400" />}    sub="Position IN_ZONE" />
        <KpiCard label="Gate PASS"        value={String(techPass)}           color="text-emerald-600"                                          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} sub="Tech gate" />
        <KpiCard label="Exit Warnings"   value={String(exitWarnings)}       color={exitWarnings > 0 ? "text-rose-600" : "text-slate-900"}    icon={<AlertTriangle className="h-4 w-4 text-amber-400" />} sub={exitWarnings > 0 ? "Review immediately" : "All clear"} />
      </div>

      {/* Group Statistics */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-slate-400" /> Group Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <GroupStatistics data={data} />
        </CardContent>
      </Card>

      {/* Tabbed analytics — one tab per API use case */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base font-semibold">Analytics</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {TABS.find(t => t.id === activeTab)?.desc}
              </p>
            </div>
            <div className="text-[10px] text-slate-400">{composition.length} stocks · {countryCode.toUpperCase()}</div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 mt-3 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  activeTab === tab.id
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {activeTab === "coverage"    && <CoverageTab     rows={coverage} />}
          {activeTab === "composition" && <CompositionTab  rows={composition} />}
          {activeTab === "pulse"       && <PulseTab        rows={pulse} />}
          {activeTab === "conviction"  && <ConvictionTab   rows={conviction} countryCode={countryCode} />}
          {activeTab === "entry"       && <EntryTab        rows={entryPlans} />}
          {activeTab === "gates"       && <GatesTab        rows={gateReadiness} />}
          {activeTab === "forecast"    && <ForecastTab     rows={analystForecast} />}
          {activeTab === "performance" && <PerformanceTab  rows={performance} />}
          {activeTab === "risk"        && <RiskTab         rows={risk} />}
          {activeTab === "exits"       && <ExitsTab        rows={exitSignals} />}
          {activeTab === "dividends"   && <DividendsTab    rows={dividends} />}
          {activeTab === "sync"        && <SyncTab         overview={syncOverview} riskCoverage={syncRiskCoverage} />}
        </CardContent>
      </Card>
    </div>
  );
}