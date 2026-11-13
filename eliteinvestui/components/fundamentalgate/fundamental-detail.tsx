"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, TrendingUp, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  FundamentalCategoryRow,
  FundamentalGroupRow,
  FundamentalHeatmapRow,
  FundamentalPipelineRow,
} from "@/lib/services/fundamental.service";

function fmtNumber(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return Number(value).toFixed(digits);
}

function fmtPct(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return `${Number(value).toFixed(digits)}%`;
}

function scoreColor(score?: number | null) {
  const n = Number(score ?? 0);
  if (n >= 70) return "text-emerald-600";
  if (n >= 50) return "text-amber-600";
  return "text-rose-600";
}

function verdictTone(verdict?: string | null) {
  const v = String(verdict || "").toUpperCase();
  if (v.includes("PASS") || v.includes("STRONG") || v.includes("HIGH")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (v.includes("CAUTION") || v.includes("MODERATE") || v.includes("MEDIUM")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function gatePill(passed: boolean, label: string) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 ${
        passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-center gap-2">
        {passed ? (
          <BadgeCheck className="h-4 w-4 text-emerald-600" />
        ) : (
          <XCircle className="h-4 w-4 text-rose-600" />
        )}
        <span className="text-sm font-medium text-slate-800">{label}</span>
      </div>
    </div>
  );
}

interface FundamentalDetailProps {
  stockDetail: FundamentalGroupRow | null;
  categories: FundamentalCategoryRow[];
  heatmap: FundamentalHeatmapRow[];
  pipeline: FundamentalPipelineRow | null;
  allStocks: FundamentalGroupRow[];
  selectedSymbol: string;
  selectedSymbols?: string[];
  loading: boolean;
  onBack: () => void;
  onSelectSymbol: (symbol: string) => void;
}

export function FundamentalDetail({
  stockDetail,
  categories,
  heatmap,
  pipeline,
  allStocks,
  selectedSymbol,
  selectedSymbols = [],
  loading,
  onBack,
  onSelectSymbol,
}: FundamentalDetailProps) {
  return (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to group view
        </button>

        {selectedSymbols.length > 1 && (
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {`Selected ${selectedSymbols.indexOf(selectedSymbol) + 1}/${selectedSymbols.length}`}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const index = selectedSymbols.indexOf(selectedSymbol);
                  if (index > 0) onSelectSymbol(selectedSymbols[index - 1]);
                }}
                disabled={selectedSymbols.indexOf(selectedSymbol) <= 0}
              >Prev</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const index = selectedSymbols.indexOf(selectedSymbol);
                  if (index >= 0 && index < selectedSymbols.length - 1)
                    onSelectSymbol(selectedSymbols[index + 1]);
                }}
                disabled={selectedSymbols.indexOf(selectedSymbol) >= selectedSymbols.length - 1}
              >Next</Button>
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {allStocks.map((row) => (
            <button
              key={row.symbol}
              type="button"
              onClick={() => onSelectSymbol(row.symbol)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedSymbol === row.symbol
                  ? "border-violet-300 bg-violet-100 text-violet-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {row.symbol}
            </button>
          ))}
        </div>

        {loading || !stockDetail ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading stock detail...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <TrendingUp className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">
                      {stockDetail.symbol}
                    </h2>
                    <div className="mt-1 text-sm text-slate-500">
                      {stockDetail.company_name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {stockDetail.sector} · {stockDetail.industry}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        ₹ {fmtNumber(stockDetail.current_price, 2)}
                      </Badge>
                      <Badge variant="outline">
                        Score {fmtNumber(stockDetail.fundamental_score, 1)}
                      </Badge>
                      <Badge variant="outline">
                        Methods {stockDetail.methods_analyzed}
                      </Badge>
                      <Badge variant="outline">
                        Coverage {fmtPct(stockDetail.coverage_pct, 1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-300 text-2xl font-bold text-slate-900">
                  {Math.round(stockDetail.fundamental_score || 0)}
                </div>

                <Badge
                  variant="outline"
                  className={`border ${verdictTone(stockDetail.fundamental_verdict)}`}
                >
                  {stockDetail.fundamental_verdict}
                </Badge>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Signal Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="text-sm text-emerald-700">Favorable</div>
                      <div className="mt-2 text-2xl font-bold text-emerald-800">
                        {stockDetail.favorable_count}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm text-slate-600">Neutral</div>
                      <div className="mt-2 text-2xl font-bold text-slate-800">
                        {stockDetail.neutral_count}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <div className="text-sm text-rose-700">Unfavorable</div>
                      <div className="mt-2 text-2xl font-bold text-rose-800">
                        {stockDetail.unfavorable_count}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Fundamental Gates
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {gatePill(stockDetail.solvency_gate_passed, "Solvency Gate")}
                  {gatePill(stockDetail.profitability_gate_passed, "Profitability Gate")}
                  {gatePill(stockDetail.distress_gate_passed, "Distress Gate")}
                  {gatePill(stockDetail.coverage_gate_passed, "Coverage Gate")}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Category Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      No category data available.
                    </div>
                  ) : (
                    categories.map((row, idx) => (
                      <div key={`${row.category_id}-${idx}`}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium text-slate-900">
                              {row.category_display}
                            </div>
                            <div className="text-xs text-slate-500">
                              {row.method_count}/{row.total_methods} methods · {row.quality_label}
                            </div>
                          </div>

                          <div className={`text-sm font-bold ${scoreColor(row.category_score)}`}>
                            {fmtNumber(row.category_score, 1)}
                          </div>
                        </div>

                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${
                              Number(row.category_score) >= 70
                                ? "bg-emerald-500"
                                : Number(row.category_score) >= 50
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                            style={{
                              width: `${Math.max(
                                6,
                                Math.min(100, Number(row.category_score || 0)),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Summary Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Conviction Score</div>
                    <div className="mt-1 text-xl font-bold text-slate-900">
                      {fmtNumber(stockDetail.fundamental_conviction_score, 1)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Philosophy Agreement</div>
                    <div className="mt-1 text-xl font-bold text-slate-900">
                      {fmtPct(stockDetail.philosophy_agreement_pct, 1)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Upside</div>
                    <div className="mt-1 text-xl font-bold text-emerald-700">
                      {fmtPct(stockDetail.upside_percentage, 1)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Median Intrinsic Value</div>
                    <div className="mt-1 text-xl font-bold text-slate-900">
                      ₹ {fmtNumber(stockDetail.median_intrinsic_value, 2)}
                    </div>
                  </div>

                  {pipeline ? (
                    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                      <div className="text-sm text-violet-700">Pipeline Status</div>
                      <div className="mt-1 font-semibold text-violet-900">
                        {pipeline.pipeline_status}
                      </div>
                      <div className="mt-1 text-xs text-violet-700">
                        Readiness {fmtNumber(pipeline.pipeline_readiness_score, 1)}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  44-Method Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {heatmap.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">
                    No heatmap data available.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[980px]">
                      <div className="grid grid-cols-8 border-b bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <div>Model</div>
                        <div>Total Score</div>
                        <div>Verdict</div>
                        <div>Intrinsic Value</div>
                        <div>Upside</div>
                        <div>Conviction</div>
                        <div>Risk</div>
                        <div>P/E / P/B</div>
                      </div>

                      {heatmap.map((row, index) => (
                        <div
                          key={`${row.symbol}-${row.model_alias}-${index}`}
                          className="grid grid-cols-8 items-center border-b px-6 py-4"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">
                              {row.model_alias}
                            </div>
                            <div className="text-xs text-slate-500">
                              {row.thesis_verdict}
                            </div>
                          </div>

                          <div className={`font-bold ${scoreColor(row.total_score)}`}>
                            {fmtNumber(row.total_score, 0)}
                          </div>

                          <div>
                            <Badge
                              variant="outline"
                              className={`border ${verdictTone(row.verdict)}`}
                            >
                              {row.verdict}
                            </Badge>
                          </div>

                          <div className="text-sm text-slate-700">
                            ₹ {fmtNumber(row.intrinsic_value, 2)}
                          </div>

                          <div className="font-medium text-emerald-700">
                            {fmtPct(row.upside_percentage, 1)}
                          </div>

                          <div className="text-sm text-slate-700">
                            {row.conviction_level} ({fmtNumber(row.conviction_score, 0)})
                          </div>

                          <div className="text-sm text-slate-700">
                            {row.drawdown_risk_category}
                          </div>

                          <div className="text-sm text-slate-700">
                            {fmtNumber(row.pe_ratio, 1)} / {fmtNumber(row.pb_ratio, 1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Layman Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">
                  {stockDetail.fundamental_layman_summary || "-"}
                </p>
              </CardContent>
            </Card>

          </div>
        )}
      </CardContent>
    </Card>
  );
}