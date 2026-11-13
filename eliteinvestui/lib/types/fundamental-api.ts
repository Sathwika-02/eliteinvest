// Fundamental API Type Definitions
export type GateVerdict = "PASS" | "CAUTION" | "FAIL";
export type FundamentalVerdict = "STRONG_FUNDAMENTAL" | "WEAK_FUNDAMENTAL" | "NEUTRAL";
export type ConvictionLevel = "HIGH" | "MEDIUM" | "LOW";

// 1. Fundamental Gate - Multi-stock (Batch Query)
export interface FundamentalGateStock {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  current_price: number;
  analysis_date: string;
  gate_verdict: GateVerdict;
  fundamental_verdict: FundamentalVerdict;
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
  fundamental_conviction_level: ConvictionLevel;
  fundamental_layman_summary: string;
}

export interface FundamentalGateResponse {
  success: boolean;
  data: FundamentalGateStock[];
  error: Record<string, unknown> | null;
  request_id: string;
}

// 2. Fundamental Gate - Single Stock
export interface FundamentalGateSingleResponse {
  success: boolean;
  data: FundamentalGateStock;
  error: Record<string, unknown> | null;
  request_id: string;
}

// 3. Categories (Breakdown by Valuation Category)
export interface FundamentalCategory {
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
}

export interface FundamentalCategoriesResponse {
  success: boolean;
  data: FundamentalCategory[];
  error: Record<string, unknown> | null;
  request_id: string;
}

// 4. Scorecard (Group Summary)
export interface ScorecardSummary {
  stocks_pass: number;
  stocks_caution: number;
  stocks_fail: number;
  group_avg_score: number;
}

export interface ScorecardResponse {
  success: boolean;
  data: ScorecardSummary;
  error: Record<string, unknown> | null;
  request_id: string;
}

// 5. Sectors Data
export interface SectorData {
  sector: string;
  total_stocks: number;
  analysis_date: string;
  stocks_pass: number;
  stocks_caution: number;
  stocks_fail: number;
  pass_rate_pct: number;
  caution_rate_pct?: number;
  fail_rate_pct?: number;
  avg_fundamental_score?: number;
}

export interface SectorsResponse {
  success: boolean;
  data: SectorData[];
  error: Record<string, unknown> | null;
  request_id: string;
}

// 6. Heatmap Data (Sector x Verdict)
export interface HeatmapCell {
  sector: string;
  verdict: GateVerdict;
  stock_count: number;
  pct_of_sector: number;
}

export interface HeatmapResponse {
  success: boolean;
  data: HeatmapCell[];
  error: Record<string, unknown> | null;
  request_id: string;
}

// 7. Valuation Insights
export interface ValuationInsight {
  symbol: string;
  company_name: string;
  insight_type: string;
  insight_text: string;
  confidence_score: number;
  affected_methods: number;
}

export interface ValuationInsightsResponse {
  success: boolean;
  data: ValuationInsight[];
  error: Record<string, unknown> | null;
  request_id: string;
}

// 8. Screener Results
export interface ScreenerStock {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  fundamental_score: number;
  gate_verdict: GateVerdict;
  upside_percentage: number;
  altman_z_score: number;
  piotroski_f_score: number;
}

export interface ScreenerResponse {
  success: boolean;
  data: ScreenerStock[];
  error: Record<string, unknown> | null;
  request_id: string;
}

// 9. Sector Context
export interface SectorContext {
  sector: string;
  best_stock: ScreenerStock;
  worst_stock: ScreenerStock;
  median_fundamental_score: number;
  pass_rate_pct: number;
}

export interface SectorContextResponse {
  success: boolean;
  data: SectorContext[];
  error: Record<string, unknown> | null;
  request_id: string;
}

// 10. Conviction Data
export interface ConvictionData {
  symbol: string;
  fundamental_conviction_score: number;
  fundamental_conviction_level: ConvictionLevel;
  conviction_drivers: string[];
  conviction_layman_summary: string;
}

export interface ConvictionResponse {
  success: boolean;
  data: ConvictionData[];
  error: Record<string, unknown> | null;
  request_id: string;
}
