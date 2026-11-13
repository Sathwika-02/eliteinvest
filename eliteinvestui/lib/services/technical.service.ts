import { api } from "@/lib/apiClient";

export type TechnicalGroupRow = {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  current_price: number;
  analysis_date: string;
  gate_verdict: string;
  gates_passed_count: number;
  cloud_gate_passed: boolean;
  wave_gate_passed: boolean;
  wyckoff_gate_passed: boolean;
  trend_gate_passed: boolean;
  timing_score: number;
  outlook: string;
  avg_confidence: number;
  data_quality_score: number;
  methods_analyzed: number;
  positive_count: number;
  negative_count: number;
  watch_count: number;
  neutral_count: number;
  conviction_level: string;
  conviction_score: number;
  kelly_fraction: number;
  suggested_allocation: number;
  agg_entry_price: number;
  agg_stop_loss: number;
  agg_target_1: number;
  agg_target_2: number;
  agg_target_3: number;
  agg_risk_reward: number;
  risk_percent: number;
  target_1_percent: number;
  target_2_percent: number;
  target_3_percent: number;
  position_status: string;
  position_message: string;
  entry_conservative_low: number;
  entry_conservative_high: number;
  entry_balanced_low: number;
  entry_balanced_high: number;
  entry_aggressive_low: number;
  entry_aggressive_high: number;
  mtf_alignment: string;
  mtf_alignment_score: number;
  mtf_conflict: boolean;
  nature_agreement_pct: number;
  dominant_natures: string;
  confluence_score: number;
  zone_count: number;
  top_zone_low: number;
  top_zone_high: number;
  top_zone_type: string;
  top_zone_density: number;
  best_support_low: number;
  best_support_high: number;
  best_resist_low: number;
  best_resist_high: number;
  layman_summary: string;
  market_phase: string;
  atr_pct: number;
  adx: number;
  volatility: string;
  data_date: string;
};

export type TechnicalMethodRow = {
  symbol: string;
  company_name: string;
  sector: string;
  method_name: string;
  analysis_datetime: string;
  current_price: number;
  primary_trend: string;
  signal_type: string;
  signal_strength: string;
  confidence: number;
  signal_summary: string;
  visualization_data_json: string;
  data_date: string;
};

export type TechnicalScorecardRow = {
  stocks_pass: number;
  stocks_caution: number;
  stocks_fail: number;
  group_avg_timing: number;
  best_pick: string;
  worst_pick: string;
  avg_group_risk: number;
  avg_method_agreement: number;
  avg_risk_reward: number;
};

export type TechnicalSectorRow = {
  sector: string;
  total_stocks: number;
  analysis_date: string;
  stocks_pass: number;
  stocks_caution: number;
  stocks_fail: number;
  pass_rate_pct: number;
  avg_timing_score: number;
  avg_gates_passed: number;
  avg_confidence: number;
  avg_conviction_score: number;
  avg_risk_reward: number;
  avg_nature_agreement: number;
  avg_confluence_score: number;
  avg_mtf_alignment: number;
  total_positive_signals: number;
  total_negative_signals: number;
  total_watch_signals: number;
  total_neutral_signals: number;
  total_methods_run: number;
  avg_risk_pct: number;
  avg_upside_pct: number;
  dominant_outlook: string;
  best_stock: string;
  worst_stock: string;
};

export type TechnicalHeatmapRow = {
  symbol: string;
  company_name: string;
  sector: string;
  method_name: string;
  signal_color: string;
  signal_type: string;
  primary_trend: string;
  confidence: number;
  signal_strength: string;
  data_date: string;
};

export const technicalService = {
  getTechnicalGroup(country: string, symbols?: string[], signal?: AbortSignal) {
    return api.get<TechnicalGroupRow[]>(
      `/api/v1/${country}/technical-gate/stocks`,
      {
        params: symbols ? { symbols: symbols.join(",") } : undefined,
        signal,
      },
    );
  },

  getTechnicalStock(country: string, symbol: string, signal?: AbortSignal) {
    return api.get<TechnicalGroupRow>(
      `/api/v1/${country}/technical-gate/stocks/${symbol}`,
      { signal },
    );
  },

  getTechnicalMethods(country: string, symbol: string, signal?: AbortSignal) {
    return api.get<TechnicalMethodRow[]>(
      `/api/v1/${country}/technical-gate/stocks/${symbol}/methods`,
      { signal },
    );
  },

  getScorecard(country: string, symbols?: string[], signal?: AbortSignal) {
    return api.get<TechnicalScorecardRow>(
      `/api/v1/${country}/technical-gate/scorecard`,
      {
        params: symbols ? { symbols: symbols.join(",") } : undefined,
        signal,
      },
    );
  },

  getSectors(country: string, signal?: AbortSignal) {
    return api.get<TechnicalSectorRow[]>(
      `/api/v1/${country}/technical-gate/sectors`,
      { signal },
    );
  },

  getTechnicalHeatmap(country: string, symbols: string[], signal?: AbortSignal) {
    return api.get<TechnicalHeatmapRow[]>(
      `/api/v1/${country}/technical-gate/heatmap`,
      {
        params: { symbols: symbols.join(",") },
        signal,
      },
    );
  },
};