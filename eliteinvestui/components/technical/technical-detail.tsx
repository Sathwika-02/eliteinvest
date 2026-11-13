"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Activity,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { technicalService } from "@/lib/services/technical.service";
import type {
  TechnicalGroupRow,
  TechnicalMethodRow,
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

// ── Color Helpers ────────────────────────────

function timingColor(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "text-emerald-600";
  if (n >= 45) return "text-amber-600";
  return "text-rose-600";
}
function timingRingColor(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "border-emerald-400";
  if (n >= 45) return "border-amber-400";
  return "border-rose-400";
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
  if (v.includes("CAUTION") || v.includes("MODERATE") || v.includes("WATCH"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}
function rrColor(rr?: number | null) {
  const n = Number(rr ?? 0);
  if (n >= 2.5) return "text-emerald-600";
  if (n >= 1.5) return "text-amber-600";
  return "text-rose-600";
}
function signalColor(signal?: string | null) {
  const s = String(signal || "").toUpperCase();
  if (s.includes("BUY") || s.includes("BULL") || s.includes("LONG"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("SELL") || s.includes("BEAR") || s.includes("SHORT"))
    return "bg-rose-50 text-rose-700 border-rose-200";
  if (s.includes("WATCH") || s.includes("NEUTRAL") || s.includes("CAUTION"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}
function confidenceBarBg(confFraction?: number | null) {
  const n = Number(confFraction ?? 0); // expects 0–1
  if (n >= 0.7) return "bg-emerald-400";
  if (n >= 0.4) return "bg-amber-400";
  return "bg-rose-400";
}

/**
 * Drill through all common API wrapper shapes to get the raw array/object.
 * Handles: T | { data: T } | { data: { data: T } } | { success, data: T }
 */
function extractData<T>(res: any): T {
  if (res == null) return res as T;
  // { success, data, error } — your API envelope
  if ("success" in res && "data" in res) return res.data as T;
  // { data: T } — axios/apiClient wrapper
  if ("data" in res && Object.keys(res).length <= 3) return res.data as T;
  return res as T;
}

// ── Gate Indicator ───────────────────────────

function GateIndicator({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
      passed ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
    }`}>
      {passed
        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        : <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
      <span className={`text-sm font-medium ${passed ? "text-emerald-700" : "text-rose-600"}`}>
        {label}
      </span>
    </div>
  );
}

// ── Signal Distribution ──────────────────────

function SignalDistribution({ stock }: { stock: TechnicalGroupRow }) {
  const total = (stock.positive_count ?? 0) + (stock.negative_count ?? 0) + (stock.watch_count ?? 0) + (stock.neutral_count ?? 0);
  const posW   = total > 0 ? ((stock.positive_count  ?? 0) / total) * 100 : 0;
  const negW   = total > 0 ? ((stock.negative_count  ?? 0) / total) * 100 : 0;
  const watchW = total > 0 ? ((stock.watch_count     ?? 0) / total) * 100 : 0;
  const neutW  = total > 0 ? ((stock.neutral_count   ?? 0) / total) * 100 : 0;

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Signal Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-4">
          <div className="bg-emerald-400 transition-all" style={{ width: `${posW}%` }} />
          <div className="bg-amber-400 transition-all"   style={{ width: `${watchW}%` }} />
          <div className="bg-rose-400 transition-all"    style={{ width: `${negW}%` }} />
          <div className="bg-slate-300 transition-all"   style={{ width: `${neutW}%` }} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Positive", count: stock.positive_count, cls: "bg-emerald-50 text-emerald-700" },
            { label: "Watch",    count: stock.watch_count,    cls: "bg-amber-50 text-amber-700" },
            { label: "Negative", count: stock.negative_count, cls: "bg-rose-50 text-rose-700" },
            { label: "Neutral",  count: stock.neutral_count,  cls: "bg-slate-50 text-slate-600" },
          ].map(({ label, count, cls }) => (
            <div key={label} className={`rounded-xl py-3 text-center ${cls}`}>
              <div className="text-xl font-bold">{count ?? 0}</div>
              <div className="text-[10px] mt-0.5 opacity-80">{label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Price Targets ────────────────────────────

function PriceTargets({ stock }: { stock: TechnicalGroupRow }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Price Levels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Entry Price</div>
            <div className="text-base font-bold text-slate-800">{fmtCurrency(stock.agg_entry_price)}</div>
          </div>
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-rose-400 mb-1">Stop Loss</div>
            <div className="text-base font-bold text-rose-700">{fmtCurrency(stock.agg_stop_loss)}</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Risk: {fmtPct(stock.risk_percent, 1)}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Target 1", price: stock.agg_target_1, pct: stock.target_1_percent },
            { label: "Target 2", price: stock.agg_target_2, pct: stock.target_2_percent },
            { label: "Target 3", price: stock.agg_target_3, pct: stock.target_3_percent },
          ].map(({ label, price, pct }) => (
            <div key={label} className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <div className="text-[10px] uppercase tracking-wide text-emerald-400 mb-1">{label}</div>
              <div className="text-sm font-bold text-emerald-700">{fmtCurrency(price)}</div>
              <div className="text-[10px] text-emerald-500 mt-0.5">{fmtPctSigned(pct, 1)}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
          <span className="text-xs text-slate-500 font-medium">Risk / Reward</span>
          <span className={`text-lg font-bold ${rrColor(stock.agg_risk_reward)}`}>
            {fmtNumber(stock.agg_risk_reward, 2)}×
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Entry Zones ──────────────────────────────

function EntryZones({ stock }: { stock: TechnicalGroupRow }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Entry Zones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { label: "Conservative", low: stock.entry_conservative_low, high: stock.entry_conservative_high, cls: "border-blue-200 bg-blue-50",    badge: "bg-blue-100 text-blue-700" },
          { label: "Balanced",     low: stock.entry_balanced_low,     high: stock.entry_balanced_high,     cls: "border-violet-200 bg-violet-50", badge: "bg-violet-100 text-violet-700" },
          { label: "Aggressive",   low: stock.entry_aggressive_low,   high: stock.entry_aggressive_high,   cls: "border-amber-200 bg-amber-50",   badge: "bg-amber-100 text-amber-700" },
        ].map(({ label, low, high, cls, badge }) => (
          <div key={label} className={`rounded-xl border px-4 py-3 ${cls}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
              <span className="text-sm font-semibold text-slate-800">
                {fmtCurrency(low)} – {fmtCurrency(high)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Supply & Demand Zones ────────────────────

function SupplyDemandZones({ stock }: { stock: TechnicalGroupRow }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Supply & Demand Zones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-emerald-400 mb-1">Best Support</div>
            <div className="text-sm font-semibold text-emerald-700">
              {fmtCurrency(stock.best_support_low)} – {fmtCurrency(stock.best_support_high)}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-rose-400 mb-1">Best Resistance</div>
            <div className="text-sm font-semibold text-rose-700">
              {fmtCurrency(stock.best_resist_low)} – {fmtCurrency(stock.best_resist_high)}
            </div>
          </div>
        </div>
        {stock.top_zone_low && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">Top Zone</span>
              <Badge className="border text-[10px]" variant="outline">
                {stock.top_zone_type || "Zone"}
              </Badge>
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {fmtCurrency(stock.top_zone_low)} – {fmtCurrency(stock.top_zone_high)}
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-400"
                style={{ width: `${Math.min(Number(stock.top_zone_density ?? 0) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Density: {fmtNumber(stock.top_zone_density * 100, 1)}% · {stock.zone_count ?? 0} zones total
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── MTF Panel ────────────────────────────────

function MTFPanel({ stock }: { stock: TechnicalGroupRow }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Multi-Timeframe & Confluence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">MTF Alignment</div>
            <div className="font-semibold text-slate-800 text-sm">{stock.mtf_alignment || "-"}</div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${timingBarBg(stock.mtf_alignment_score)}`}
                style={{ width: `${Math.min(Number(stock.mtf_alignment_score ?? 0), 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Score: {fmtNumber(stock.mtf_alignment_score, 1)}
              {stock.mtf_conflict && <span className="ml-2 text-rose-500">⚠ Conflict</span>}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Confluence Score</div>
            <div className={`text-2xl font-bold ${timingColor(stock.confluence_score)}`}>
              {fmtNumber(stock.confluence_score, 1)}
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Nature Agreement</div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-400"
                style={{ width: `${Math.min(Number(stock.nature_agreement_pct ?? 0), 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {fmtPct(stock.nature_agreement_pct, 1)}
            </span>
          </div>
          {stock.dominant_natures && (
            <div className="mt-1.5 text-xs text-slate-500">Dominant: {stock.dominant_natures}</div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Market Phase", value: stock.market_phase || "-" },
            { label: "ATR %",        value: fmtPct(stock.atr_pct, 2) },
            { label: "ADX",          value: fmtNumber(stock.adx, 1) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <div className="text-sm font-bold text-slate-800">{value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Summary Snapshot ─────────────────────────

function SummarySnapshot({ stock }: { stock: TechnicalGroupRow }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Summary Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Conviction Score</div>
          <div className="text-2xl font-bold text-slate-900">{fmtNumber(stock.conviction_score, 2)}</div>
          <div className="text-xs text-slate-400 mt-0.5">{stock.conviction_level || "-"}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-violet-50 border border-violet-200 p-3">
            <div className="text-lg font-bold text-violet-700">{fmtPct(stock.kelly_fraction * 100, 1)}</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Kelly %</div>
          </div>
          <div className="rounded-xl bg-violet-50 border border-violet-200 p-3">
            <div className="text-lg font-bold text-violet-700">{fmtPct(stock.suggested_allocation, 1)}</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Suggested Allocation</div>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Position Status</div>
          <Badge className={`border text-xs ${verdictBadgeCls(stock.position_status)}`} variant="outline">
            {stock.position_status || "-"}
          </Badge>
          {stock.position_message && (
            <p className="text-xs text-slate-500 mt-2">{stock.position_message}</p>
          )}
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Volatility</div>
          <div className="text-sm font-semibold text-slate-700">{stock.volatility || "-"}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            Data Quality: {fmtNumber(stock.data_quality_score, 1)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Method Card ───────────────────────────────

function MethodCard({ method }: { method: TechnicalMethodRow }) {
  const [open, setOpen] = useState(false);
  // API sends confidence as 0–1 fraction; display as percentage
  const confFraction = Number(method.confidence ?? 0);
  const confPct = confFraction <= 1 ? confFraction * 100 : confFraction;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all">
      <button
        type="button"
        className="w-full text-left p-4"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900 text-sm">
                {method.method_name.replace(/_/g, " ")}
              </span>
              <Badge
                className={`border text-[10px] ${signalColor(method.signal_type)}`}
                variant="outline"
              >
                {method.signal_type || "-"}
              </Badge>
              {method.signal_strength && method.signal_strength !== "NONE" && (
                <Badge
                  className={`border text-[10px] ${verdictBadgeCls(method.signal_strength)}`}
                  variant="outline"
                >
                  {method.signal_strength}
                </Badge>
              )}
            </div>
            {/* Confidence bar */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${confidenceBarBg(confFraction)}`}
                  style={{ width: `${confPct}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-500 shrink-0 w-10 text-right">
                {fmtNumber(confPct, 0)}%
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
              <span className="font-medium">{method.primary_trend || "-"}</span>
              <span>·</span>
              <span>{fmtDate(method.analysis_datetime)}</span>
            </div>
          </div>
          {open
            ? <ChevronUp className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            : <ChevronDown className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            {method.signal_summary || "No summary available."}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Method Analysis ───────────────────────────
// Calls GET /api/v1/{country}/technical-gate/stocks/{symbol}/methods directly

function MethodAnalysis({ symbol, countryCode }: { symbol: string; countryCode: string }) {
  const [methods, setMethods]   = useState<TechnicalMethodRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!symbol || !countryCode) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setMethods([]);

    technicalService
      .getTechnicalMethods(countryCode, symbol)
      .then((res: any) => {
        console.log("Technical methods is called");
        if (cancelled) return;

        console.log("[MethodAnalysis] raw response:", res);

        // Peel off every possible wrapper layer
        const data = extractData<TechnicalMethodRow[]>(res);
        console.log("[MethodAnalysis] extracted data:", data);

        setMethods(Array.isArray(data) ? data : []);
      })
      .catch((err: any) => {
        if (cancelled) return;
        if (err?.name === "AbortError") return;
        console.error("[MethodAnalysis] error:", err);
        setError("Failed to load method signals.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [symbol, countryCode]);

  // Sort: BUY → WATCH → NEUTRAL → SELL, then by confidence desc within group
  const sorted = [...methods].sort((a, b) => {
    const order: Record<string, number> = { BUY: 0, WATCH: 1, NEUTRAL: 2, SELL: 3 };
    const ao = order[a.signal_type?.toUpperCase() ?? ""] ?? 99;
    const bo = order[b.signal_type?.toUpperCase() ?? ""] ?? 99;
    if (ao !== bo) return ao - bo;
    return Number(b.confidence ?? 0) - Number(a.confidence ?? 0);
  });

  // Count signals by type for the summary pills
  const counts = methods.reduce<Record<string, number>>((acc, m) => {
    const k = m.signal_type?.toUpperCase() ?? "UNKNOWN";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-semibold">
              Method Analysis
              {!loading && (
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {methods.length} methods
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual signal results per analytical method
            </p>
          </div>
          {/* Signal type pill counts */}
          {!loading && methods.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(counts).map(([type, count]) => (
                <span
                  key={type}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${signalColor(type)}`}
                >
                  {type} ×{count}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading method signals…</span>
          </div>
        )}
        {!loading && error && (
          <div className="py-8 text-center text-sm text-rose-500">{error}</div>
        )}
        {!loading && !error && methods.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-400">
            No method signals available.
          </div>
        )}
        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((m, i) => (
              <MethodCard key={`${m.method_name}-${i}`} method={m} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Detail Component ────────────────────

interface TechnicalDetailProps {
  symbol:          string;
  countryCode:     string;
  rows:            TechnicalGroupRow[];
  heatmap?:        TechnicalHeatmapRow[];
  selectedSymbols: string[];
  onSelectSymbol:  (symbol: string) => void;
  onBack:          () => void;
}

export function TechnicalDetail({
  symbol,
  countryCode,
  rows,
  heatmap = [],
  selectedSymbols,
  onSelectSymbol,
  onBack,
}: TechnicalDetailProps) {
  if (!countryCode) {
    return (
      <div className="p-8 text-center text-slate-500">
        Country code not available — technical methods cannot be loaded.
      </div>
    );
  }

  const stock = rows.find((r) => r.symbol === symbol);

  if (!stock) {
    return (
      <div className="p-8 text-center text-slate-500">
        Stock data not found for {symbol}.
      </div>
    );
  }

  const timingScore = Number(stock.timing_score ?? 0);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to group view
      </button>

      {selectedSymbols.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSymbols.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => onSelectSymbol(sym)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                sym === symbol
                  ? "border-violet-300 bg-violet-100 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{stock.symbol}</h1>
            <p className="text-sm text-slate-500">{stock.company_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stock.sector} · {stock.industry}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                `₹${fmtNumber(stock.current_price, 2)}`,
                `Timing ${fmtNumber(stock.timing_score, 1)}`,
                `Methods ${stock.methods_analyzed}`,
                `Data ${fmtDate(stock.data_date)}`,
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Score ring */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${timingRingColor(timingScore)}`}>
            <div className="text-center">
              <div className={`text-2xl font-bold leading-none ${timingColor(timingScore)}`}>
                {fmtNumber(timingScore, 0)}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">TIMING</div>
            </div>
          </div>
          <Badge
            className={`border text-xs ${verdictBadgeCls(stock.gate_verdict)}`}
            variant="outline"
          >
            {stock.gate_verdict || stock.outlook || "-"}
          </Badge>
        </div>
      </div>

      {/* Technical Gates */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Technical Gates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <GateIndicator label="Cloud Gate"   passed={!!stock.cloud_gate_passed} />
            <GateIndicator label="Wave Gate"    passed={!!stock.wave_gate_passed} />
            <GateIndicator label="Wyckoff Gate" passed={!!stock.wyckoff_gate_passed} />
            <GateIndicator label="Trend Gate"   passed={!!stock.trend_gate_passed} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{stock.gates_passed_count ?? 0}/4</span>
            {" "}gates passed
            {stock.layman_summary && (
              <span className="text-slate-400 ml-2 line-clamp-1">· {stock.layman_summary}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signal Distribution + Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SignalDistribution stock={stock} />
        <SummarySnapshot stock={stock} />
      </div>

      {/* Price Levels + Entry Zones */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PriceTargets stock={stock} />
        <EntryZones stock={stock} />
      </div>

      {/* MTF + Supply/Demand */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MTFPanel stock={stock} />
        <SupplyDemandZones stock={stock} />
      </div>

      {/* Method Analysis — self-fetching, calls /stocks/{symbol}/methods */}
      <MethodAnalysis symbol={symbol} countryCode={countryCode} />
    </div>
  );
}