import { api } from "@/lib/apiClient";

// ── Response Types ─────────────────────────────────────────────────────────

export type BasketCoverageRow = {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  has_profile: boolean;
  has_premium_analytics: boolean;
  has_fundamental: boolean;
  has_technical: boolean;
  has_forecast: boolean;
  coverage_status: string;
  price_data_date: string;
  premium_last_updated: string;
  fundamental_date: string;
  technical_date: string;
};

export type BasketCompositionRow = {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  exchange: string;
  current_price: number;
  market_cap: number;
  shares_outstanding: number;
  market_cap_bucket: string;
  pe_ratio: number;
  pb_ratio: number;
  roe: number;
  beta: number;
  dividend_yield_ttm: number;
  sector_rank: number;
  sector_percentile: number;
};

export type BasketPulseRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  market_cap: number;
  return_5d: number;
  return_10d: number;
  return_30d: number;
  rsi_14d: number;
  price_vs_200dma: number;
  price_vs_52w_high: number;
  volume_ratio_5d_30d: number;
  day_50_ma: number;
  day_200_ma: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  range_52w_position_pct: number;
  outlook: string;
  market_phase: string;
  position_status: string;
  mtf_alignment: string;
  momentum_label: string;
  alert_overbought: boolean;
  alert_oversold: boolean;
  alert_volume_spike: boolean;
  alert_near_52w_high: boolean;
  alert_near_52w_low: boolean;
  above_200dma: boolean;
  price_data_date: string;
};

export type BasketConvictionRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  market_cap: number;
  fundamental_conviction_score: number;
  fundamental_verdict: string;
  upside_percentage: number;
  median_intrinsic_value: number;
  filtered_intrinsic_value: number;
  tech_conviction_score: number;
  outlook: string;
  agg_risk_reward: number | null;
  kelly_fraction: number | null;
  suggested_allocation: number;
  pe_ratio: number;
  pe_vs_sector: number;
  pb_ratio: number;
  pb_vs_sector: number;
  composite_score: number;
  conviction_tier: string;
};

export type BasketEntryPlanRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
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
  entry_conservative_low: number;
  entry_conservative_high: number;
  entry_balanced_low: number;
  entry_balanced_high: number;
  entry_aggressive_low: number;
  entry_aggressive_high: number;
  best_support_low: number;
  best_support_high: number;
  best_resist_low: number;
  best_resist_high: number;
  zone_count: number;
  top_zone_type: string;
  top_zone_density: number;
  kelly_fraction: number;
  suggested_allocation: number;
  position_status: string;
  position_message: string;
  timing_score: number;
  outlook: string;
  conviction_score: number;
  conviction_level: string;
  market_phase: string;
  mtf_alignment: string;
  mtf_alignment_score: number;
  atr_pct: number;
  adx: number;
  tech_volatility: number;
};

export type BasketGateReadinessRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  fundamental_score: number;
  fundamental_verdict: string;
  fundamental_conviction_level: string;
  fundamental_conviction_score: number;
  fundamental_gates_passed_count: number;
  fundamental_gates_tested_count: number;
  solvency_gate_passed: boolean | null;
  profitability_gate_passed: boolean | null;
  distress_gate_passed: boolean | null;
  coverage_gate_passed: boolean | null;
  outlook: string;
  tech_conviction_level: string;
  tech_conviction_score: number;
  tech_gates_passed_count: number;
  cloud_gate_passed: boolean | null;
  wave_gate_passed: boolean | null;
  wyckoff_gate_passed: boolean | null;
  trend_gate_passed: boolean | null;
  fundamental_gate_verdict: string;
  technical_gate_verdict: string;
  pipeline_status: string;
  combined_conviction_score: number;
};

export type BasketAnalystForecastRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  price_target_avg: number;
  price_target_high: number;
  price_target_low: number;
  price_target_count: number;
  target_price_change: number;
  target_upside_pct: number;
  recommendation_avg: number;
  analyst_coverage_count: number;
  eps_revision_trend: string;
  eps_growth_next_year: number;
  eps_growth_5yr: number;
  revenue_growth_next_year: number;
  forward_eps: number;
  forward_pe: number;
  current_month_strong_buy: number;
  current_month_buy: number;
  current_month_hold: number;
  current_month_sell: number;
  current_month_strong_sell: number;
  consensus_signal: string;
  forecast_value: number;
  forecast_upper_bound: number;
  forecast_lower_bound: number;
  horizon_days: number;
  ml_predicted_return_pct: number;
  ml_forecast_direction: string;
  avg_absolute_pct_error: number;
  directional_accuracy_pct: number;
};

export type BasketPerformanceRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  market_cap: number;
  return_5d: number;
  return_10d: number;
  return_15d: number;
  return_30d: number;
  rsi_14d: number;
  price_vs_52w_high: number;
  price_vs_200dma: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  day_50_ma: number;
  day_200_ma: number;
  ma_crossover: string;
  momentum_label: string;
  volume_ratio_5d_30d: number;
  atr_14d: number;
};

export type BasketRiskRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  market_cap: number;
  beta: number;
  realized_vol_10d: number;
  realized_vol_20d: number;
  realized_vol_30d: number;
  max_drawdown: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  var_95: number;
  cvar_95: number;
  beta_30d: number;
  beta_60d: number;
  max_dd_15d: number;
  max_dd_30d: number;
  max_dd_60d: number;
  var_95_30d: number;
  var_95_60d: number;
  fifty_two_week_high: number;
  drawdown_from_high_pct: number;
  beta_category: string;
  volatility_regime: string;
  risk_adjusted_label: string;
};

export type BasketExitSignalRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  outlook: string;
  timing_score: number;
  tech_conviction_level: string;
  tech_conviction_score: number;
  agg_stop_loss: number;
  agg_target_1: number | null;
  agg_risk_reward: number | null;
  risk_percent: number;
  position_status: string;
  position_message: string;
  stop_loss_distance_pct: number;
  fundamental_verdict: string;
  fundamental_conviction_score: number;
  fundamental_conviction_level: string;
  solvency_gate_passed: boolean | null;
  profitability_gate_passed: boolean | null;
  distress_gate_passed: boolean | null;
  exit_urgency: string;
  max_drawdown: number;
  day_50_ma: number;
  day_200_ma: number;
};

export type BasketDividendRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  market_cap: number;
  dividend_yield_ttm: number;
  payout_ratio: number;
  annual_dividend_amount: number;
  dividend_frequency: string;
  dividend_growth_rate: number;
  last_dividend_date: string;
  last_dividend_amount: number;
  dividend_consistency_score: number;
  eps_ttm: number;
  pe_ratio: number;
  free_cash_flow: number;
  dividend_safety: string;
  last_ex_date: string;
  last_actual_dividend: number;
  yield_category: string;
};

export type BasketSyncOverviewRow = {
  symbol: string;
  company_name: string;
  sector: string;
  industry: string;
  current_price: number;
  market_cap: number;
  market_cap_category: string;
  return_5d: number;
  return_10d: number;
  return_15d: number;
  return_30d: number;
  pe_ratio: number;
  pb_ratio: number;
  dividend_yield_ttm: number;
  beta: number;
  realized_vol_30d: number;
  max_drawdown: number;
  coverage_level: string;
  analysis_health: string;
};

export type BasketSyncRiskCoverageRow = {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  beta: number;
  realized_vol_30d: number;
  max_drawdown: number;
  sharpe_ratio: number;
  var_95: number;
  market_cap: number;
  fundamental_verdict: string;
  fundamental_conviction_score: number;
  outlook: string;
  tech_conviction_score: number;
  timing_score: number;
  beta_category: string;
  drawdown_status: string;
};

// ── Service ────────────────────────────────────────────────────────────────

function serializeSymbols(symbols?: string[]) {
  if (!symbols || symbols.length === 0) return "";
  return `?symbols=${encodeURIComponent(symbols.join(","))}`;
}

export const globalBasketService = {
  // 1. Coverage — which stocks have full analysis
  getCoverage(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketCoverageRow[]>(
      `/api/v1/${country}/global-basket/coverage${suffix}`,
      { signal },
    );
  },

  // 2. Composition — fundamentals snapshot of every basket stock
  getComposition(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketCompositionRow[]>(
      `/api/v1/${country}/global-basket/composition${suffix}`,
      { signal },
    );
  },

  // 3. Tracking / Pulse — price momentum, RSI, alerts
  getPulse(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketPulseRow[]>(
      `/api/v1/${country}/global-basket/tracking/pulse${suffix}`,
      { signal },
    );
  },

  // 4. Tracking / Conviction — fundamental + technical conviction scores
  getConviction(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketConvictionRow[]>(
      `/api/v1/${country}/global-basket/tracking/conviction${suffix}`,
      { signal },
    );
  },

  // 5. Tracking / Entry Plans — all stocks
  getEntryPlans(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketEntryPlanRow[]>(
      `/api/v1/${country}/global-basket/tracking/entry-plans${suffix}`,
      { signal },
    );
  },

  // 6. Tracking / Entry Plans — single stock
  getEntryPlan(country: string, symbol: string, signal?: AbortSignal) {
    return api.get<BasketEntryPlanRow>(
      `/api/v1/${country}/global-basket/tracking/entry-plans/${symbol}`,
      { signal },
    );
  },

  // 7. Tracking / Gate Readiness — fundamental + technical gate status
  getGateReadiness(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketGateReadinessRow[]>(
      `/api/v1/${country}/global-basket/tracking/gate-readiness${suffix}`,
      { signal },
    );
  },

  // 8. Tracking / Analyst Forecast — price targets, consensus, ML forecast
  getAnalystForecast(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketAnalystForecastRow[]>(
      `/api/v1/${country}/global-basket/tracking/analyst-forecast${suffix}`,
      { signal },
    );
  },

  // 9. Investment / Performance — returns, MA, momentum
  getPerformance(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketPerformanceRow[]>(
      `/api/v1/${country}/global-basket/investment/performance${suffix}`,
      { signal },
    );
  },

  // 10. Investment / Risk — beta, vol, drawdown, Sharpe, VaR
  getRisk(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketRiskRow[]>(
      `/api/v1/${country}/global-basket/investment/risk${suffix}`,
      { signal },
    );
  },

  // 11. Investment / Exit Signals — stop levels, exit urgency
  getExitSignals(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketExitSignalRow[]>(
      `/api/v1/${country}/global-basket/investment/exit-signals${suffix}`,
      { signal },
    );
  },

  // 12. Investment / Dividends — yield, payout, consistency
  getDividends(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketDividendRow[]>(
      `/api/v1/${country}/global-basket/investment/dividends${suffix}`,
      { signal },
    );
  },

  // 13. Sync / Overview — master snapshot combining all data
  getSyncOverview(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketSyncOverviewRow[]>(
      `/api/v1/${country}/global-basket/sync/overview${suffix}`,
      { signal },
    );
  },

  // 14. Sync / Risk Coverage — risk + conviction combined view
  getSyncRiskCoverage(country: string, symbols?: string[], signal?: AbortSignal) {
    const suffix = serializeSymbols(symbols);
    return api.get<BasketSyncRiskCoverageRow[]>(
      `/api/v1/${country}/global-basket/sync/risk-coverage${suffix}`,
      { signal },
    );
  },
};