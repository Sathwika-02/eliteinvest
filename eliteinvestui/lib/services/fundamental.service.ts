import { api } from "@/lib/apiClient";
import type { ApiEnvelope } from "./_types";

export type FundamentalGroupRow = {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  current_price: number;
  analysis_date: string;
  gate_verdict: "PASS" | "CAUTION" | "FAIL" | string;
  fundamental_verdict: string;
  fundamental_gates_passed_count: number;
  fundamental_gates_tested_count: number;
  solvency_gate_passed: boolean;
  profitability_gate_passed: boolean;
  distress_gate_passed: boolean;
  coverage_gate_passed: boolean;
  fundamental_score: number;
  value_depth_score: number;
  growth_quality_score: number;
  business_quality_score: number;
  financial_safety_score: number;
  market_momentum_score: number;
  income_quality_score: number;
  methods_analyzed: number;
  favorable_count: number;
  unfavorable_count: number;
  neutral_count: number;
  altman_z_score: number;
  piotroski_f_score: number;
  coverage_pct: number;
  median_intrinsic_value: number;
  filtered_intrinsic_value: number;
  upside_percentage: number;
  intrinsic_value_count: number;
  intrinsic_value_dispersion_cv: number;
  has_intrinsic_outliers: boolean;
  outlier_count: number;
  philosophy_conflict: boolean;
  philosophy_agreement_pct: number;
  dominant_philosophies: string;
  fundamental_conviction_score: number;
  fundamental_conviction_level: string;
  fundamental_layman_summary: string;
};

export type FundamentalScorecard = {
  stocks_pass: number;
  stocks_caution: number;
  stocks_fail: number;
  group_avg_score: number;
};

export type FundamentalSectorRow = {
  sector: string;
  total_stocks: number;
  analysis_date: string;
  stocks_pass: number;
  stocks_caution: number;
  stocks_fail: number;
  pass_rate_pct: number;
  strong_fundamental_count: number;
  moderate_fundamental_count: number;
  weak_fundamental_count: number;
  avg_fundamental_score: number;
  avg_conviction_score: number;
  avg_upside_pct: number;
  avg_gates_passed: number;
  avg_philosophy_agreement: number;
  avg_value_depth: number;
  avg_growth_quality: number;
  avg_business_quality: number;
  avg_financial_safety: number;
  avg_market_momentum: number;
  avg_income_quality: number;
  avg_altman_z: number;
  avg_piotroski_f: number;
  avg_coverage_pct: number;
  total_favorable_signals: number;
  total_unfavorable_signals: number;
  total_neutral_signals: number;
  total_methods_run: number;
  dominant_verdict: string;
  best_stock: string;
  worst_stock: string;
  highest_upside_stock: string;
};

export type FundamentalHeatmapRow = {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  model_alias: string;
  valuation_date: string;
  current_price: number;
  verdict: string;
  total_score: number;
  method_score: number;
  analyst_score: number;
  intrinsic_value: number;
  mos_price: number;
  upside_percentage: number;
  verdict_color: string;
  expected_value: number;
  expected_value_mos: number;
  confidence_range_width: number;
  drawdown_max_pct: number;
  drawdown_risk_score: number;
  drawdown_risk_category: string;
  drawdown_downside_cushion: number;
  conviction_score: number;
  conviction_level: string;
  model_agreement_score: number;
  data_quality_score: number;
  thesis_summary: string;
  thesis_verdict: string;
  pe_ratio: number;
  pb_ratio: number;
  roe_percentage: number;
  debt_to_equity: number;
  market_cap: number;
};

export type FundamentalCategoryRow = {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  valuation_date: string;
  current_price: number;
  market_cap: number;
  currency: string;
  category_id: number;
  category_display: string;
  category_score: number;
  method_count: number;
  total_methods: number;
  avg_confidence: number;
  median_intrinsic_value: number;
  value_depth_score: number;
  growth_quality_score: number;
  business_quality_score: number;
  financial_safety_score: number;
  market_momentum_score: number;
  income_quality_score: number;
  coverage_pct: number;
  quality_label: string;
  piotroski_score: number;
  piotroski_signal: string;
  altman_z_score: number;
  altman_z_signal: string;
};

export type FundamentalPipelineRow = {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  current_price: number;
  sig_models_evaluated: number;
  sig_models_buy: number;
  sig_models_hold: number;
  sig_models_avoid: number;
  signatory_consensus: string;
  sig_agreement_pct: number;
  sig_avg_intrinsic_value: number;
  sig_avg_upside_pct: number;
  sig_avg_score: number;
  sig_conviction_score: number;
  sig_dominant_verdict: string;
  sig_valuation_date: string;
  fundamental_gate_verdict: string;
  fundamental_verdict: string;
  fundamental_score: number;
  fundamental_gates_passed_count: number;
  fundamental_gates_tested_count: number;
  solvency_gate_passed: boolean;
  profitability_gate_passed: boolean;
  distress_gate_passed: boolean;
  coverage_gate_passed: boolean;
  fundamental_conviction_score: number;
  fundamental_conviction_level: string;
  fundamental_upside_pct: number;
  altman_z_score: number;
  piotroski_f_score: number;
  philosophy_agreement_pct: number;
  fundamental_layman_summary: string;
  fundamental_analysis_date: string;
  pipeline_status: string;
  pipeline_readiness_score: number;
};

export type FundamentalSignatoryCandidateRow = {
  [key: string]: any;
};

export type FundamentalScreenerRow = {
  [key: string]: any;
};

export type FundamentalPipelineFunnelRow = {
  [key: string]: any;
};

export type FundamentalGroupResponse = ApiEnvelope<FundamentalGroupRow[]>;
export type FundamentalStockResponse = ApiEnvelope<FundamentalGroupRow>;
export type FundamentalCategoriesResponse = ApiEnvelope<FundamentalCategoryRow[]>;
export type FundamentalScorecardResponse = ApiEnvelope<FundamentalScorecard>;
export type FundamentalSectorsResponse = ApiEnvelope<FundamentalSectorRow[]>;
export type FundamentalHeatmapResponse = ApiEnvelope<FundamentalHeatmapRow[]>;
export type FundamentalPipelineResponse = ApiEnvelope<FundamentalPipelineRow[]>;
export type FundamentalSignatoryCandidatesResponse = ApiEnvelope<FundamentalSignatoryCandidateRow[]>;
export type FundamentalScreenerResponse = ApiEnvelope<FundamentalScreenerRow[]>;
export type FundamentalPipelineFunnelResponse = ApiEnvelope<FundamentalPipelineFunnelRow[]>;

export const fundamentalService = {
  getFundamentalGroup(country: string, symbols: string[], signal?: AbortSignal) {
    return api.get<FundamentalGroupResponse>(
      `/api/v1/${country}/fundamental-gate/stocks`,
      {
        params: { symbols: symbols.join(",") },
        signal,
      },
    );
  },

  getFundamentalStock(country: string, symbol: string, signal?: AbortSignal) {
    return api.get<FundamentalStockResponse>(
      `/api/v1/${country}/fundamental-gate/stocks/${encodeURIComponent(symbol)}`,
      { signal },
    );
  },

  getFundamentalCategories(country: string, symbol: string, signal?: AbortSignal) {
    return api.get<FundamentalCategoriesResponse>(
      `/api/v1/${country}/fundamental-gate/stocks/${encodeURIComponent(symbol)}/categories`,
      { signal },
    );
  },

  getFundamentalScorecard(country: string, symbols: string[], signal?: AbortSignal) {
    return api.get<FundamentalScorecardResponse>(
      `/api/v1/${country}/fundamental-gate/scorecard`,
      {
        params: { symbols: symbols.join(",") },
        signal,
      },
    );
  },

  getFundamentalSectors(country: string, signal?: AbortSignal) {
    return api.get<FundamentalSectorsResponse>(
      `/api/v1/${country}/fundamental-gate/sectors`,
      { signal },
    );
  },

  getFundamentalHeatmap(country: string, symbols: string[], signal?: AbortSignal) {
    return api.get<FundamentalHeatmapResponse>(
      `/api/v1/${country}/fundamental-gate/heatmap`,
      {
        params: { symbols: symbols.join(",") },
        signal,
      },
    );
  },

  getFundamentalPipeline(country: string, signal?: AbortSignal) {
    return api.get<FundamentalPipelineResponse>(
      `/api/v1/${country}/fundamental-gate/pipeline`,
      { signal },
    );
  },

  getFundamentalPipelineFunnel(country: string, signal?: AbortSignal) {
    return api.get<FundamentalPipelineFunnelResponse>(
      `/api/v1/${country}/fundamental-gate/pipeline/funnel`,
      { signal },
    );
  },

  getFundamentalSignatoryCandidates(country: string, signal?: AbortSignal) {
    return api.get<FundamentalSignatoryCandidatesResponse>(
      `/api/v1/${country}/fundamental-gate/signatory-candidates`,
      { signal },
    );
  },

  getFundamentalScreener(country: string, signal?: AbortSignal) {
    return api.get<FundamentalScreenerResponse>(
      `/api/v1/${country}/fundamental-gate/screener`,
      { signal },
    );
  },
};