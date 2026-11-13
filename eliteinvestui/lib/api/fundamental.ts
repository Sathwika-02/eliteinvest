// Fundamental API Service - First 10 Endpoints
import {
  FundamentalGateResponse,
  FundamentalGateSingleResponse,
  FundamentalCategoriesResponse,
  ScorecardResponse,
  SectorsResponse,
  HeatmapResponse,
  ValuationInsightsResponse,
  ScreenerResponse,
  SectorContextResponse,
  ConvictionResponse,
} from '@/lib/types/fundamental-api';

const BASE_URL = process.env.NEXT_PUBLIC_FUNDAMENTAL_API_URL || 
  'https://eliteinvest-api.azurewebsites.net/api/v1/in';

class FundamentalAPIService {
  // 1. Fundamental Gate - Multiple Stocks (Batch Query)
  async getMultipleStocksFundamental(symbols: string[]): Promise<FundamentalGateResponse> {
    const symbolsParam = symbols.join(',');
    const response = await fetch(
      `${BASE_URL}/fundamental-gate/stocks?symbols=${symbolsParam}`
    );
    if (!response.ok) throw new Error(`Failed to fetch fundamental data: ${response.statusText}`);
    return response.json();
  }

  // 2. Fundamental Gate - Single Stock
  async getSingleStockFundamental(symbol: string): Promise<FundamentalGateSingleResponse> {
    const response = await fetch(`${BASE_URL}/fundamental-gate/stocks/${symbol}`);
    if (!response.ok) throw new Error(`Failed to fetch fundamental data for ${symbol}`);
    return response.json();
  }

  // 3. Fundamental Categories - Breakdown by Valuation Category
  async getStockCategories(symbol: string): Promise<FundamentalCategoriesResponse> {
    const response = await fetch(`${BASE_URL}/fundamental-gate/stocks/${symbol}/categories`);
    if (!response.ok) throw new Error(`Failed to fetch categories for ${symbol}`);
    return response.json();
  }

  // 4. Scorecard - Group Summary
  async getScorecard(symbols: string[]): Promise<ScorecardResponse> {
    const symbolsParam = symbols.join(',');
    const response = await fetch(`${BASE_URL}/fundamental-gate/scorecard?symbols=${symbolsParam}`);
    if (!response.ok) throw new Error('Failed to fetch scorecard');
    return response.json();
  }

  // 5. Sectors Data
  async getSectors(): Promise<SectorsResponse> {
    const response = await fetch(`${BASE_URL}/fundamental-gate/sectors`);
    if (!response.ok) throw new Error('Failed to fetch sectors');
    return response.json();
  }

  // 6. Heatmap Data (Sector x Verdict)
  async getHeatmap(): Promise<HeatmapResponse> {
    const response = await fetch(`${BASE_URL}/fundamental-gate/heatmap`);
    if (!response.ok) throw new Error('Failed to fetch heatmap');
    return response.json();
  }

  // 7. Valuation Insights
  async getValuationInsights(symbol: string): Promise<ValuationInsightsResponse> {
    const response = await fetch(`${BASE_URL}/fundamental-gate/stocks/${symbol}/insights`);
    if (!response.ok) throw new Error(`Failed to fetch insights for ${symbol}`);
    return response.json();
  }

  // 8. Screener Results
  async getScreenerResults(filters?: Record<string, unknown>): Promise<ScreenerResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, String(value));
      });
    }
    const response = await fetch(`${BASE_URL}/fundamental-gate/screener?${params}`);
    if (!response.ok) throw new Error('Failed to fetch screener results');
    return response.json();
  }

  // 9. Sector Context
  async getSectorContext(): Promise<SectorContextResponse> {
    const response = await fetch(`${BASE_URL}/fundamental-gate/sector-context`);
    if (!response.ok) throw new Error('Failed to fetch sector context');
    return response.json();
  }

  // 10. Conviction Data
  async getConvictionData(symbols: string[]): Promise<ConvictionResponse> {
    const symbolsParam = symbols.join(',');
    const response = await fetch(`${BASE_URL}/fundamental-gate/conviction?symbols=${symbolsParam}`);
    if (!response.ok) throw new Error('Failed to fetch conviction data');
    return response.json();
  }

  // 11. Technical Analysis Gate (Step 2)
  async getTechnicalAnalysis(symbols: string[]): Promise<any> {
    try {
      const symbolsParam = symbols.join(',');
      const response = await fetch(`${BASE_URL}/technical-gate/stocks?symbols=${symbolsParam}`);
      if (!response.ok) {
        console.log('[v0] Technical API not available, returning mock data');
        return this.mockTechnicalData(symbols);
      }
      return response.json();
    } catch {
      return this.mockTechnicalData(symbols);
    }
  }

  // 12. Portfolio Risk Assessment
  async getRiskAssessment(symbols: string[]): Promise<any> {
    try {
      const symbolsParam = symbols.join(',');
      const response = await fetch(`${BASE_URL}/portfolio/risk-assessment?symbols=${symbolsParam}`);
      if (!response.ok) {
        console.log('[v0] Risk assessment API not available, returning mock data');
        return this.mockRiskData(symbols);
      }
      return response.json();
    } catch {
      return this.mockRiskData(symbols);
    }
  }

  // 13. Portfolio Diversification
  async getPortfolioDiversification(symbols: string[]): Promise<any> {
    try {
      const symbolsParam = symbols.join(',');
      const response = await fetch(`${BASE_URL}/portfolio/diversification?symbols=${symbolsParam}`);
      if (!response.ok) {
        console.log('[v0] Diversification API not available, returning mock data');
        return this.mockDiversificationData(symbols);
      }
      return response.json();
    } catch {
      return this.mockDiversificationData(symbols);
    }
  }

  // Mock data for technical analysis
  private mockTechnicalData(symbols: string[]) {
    return {
      success: true,
      data: symbols.map(symbol => ({
        symbol,
        technical_verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION',
        technical_score: Math.round(Math.random() * 100),
        rsi: Math.round(Math.random() * 100),
        macd_signal: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
        moving_average_50: (Math.random() * 100 + 50).toFixed(2),
        moving_average_200: (Math.random() * 100 + 50).toFixed(2),
        trend_strength: (Math.random() * 100).toFixed(2),
        volume_trend: Math.random() > 0.5 ? 'INCREASING' : 'DECREASING',
      })),
    };
  }

  // Mock data for risk assessment
  private mockRiskData(symbols: string[]) {
    return {
      success: true,
      data: {
        portfolio_risk_score: Math.round(Math.random() * 100),
        portfolio_volatility: (Math.random() * 20 + 10).toFixed(2),
        beta: (Math.random() * 1.5 + 0.5).toFixed(2),
        max_drawdown: (Math.random() * -30).toFixed(2),
        sharpe_ratio: (Math.random() * 2).toFixed(2),
        stocks: symbols.map(symbol => ({
          symbol,
          individual_risk: Math.round(Math.random() * 100),
          correlation_to_market: (Math.random() * 1).toFixed(2),
          downside_risk: (Math.random() * 20).toFixed(2),
        })),
      },
    };
  }

  // Mock data for diversification
  private mockDiversificationData(symbols: string[]) {
    const sectors = ['Technology', 'Finance', 'Healthcare', 'Utilities', 'Industrial', 'Consumer'];
    const sectorMap: Record<string, string> = {};
    
    symbols.forEach(s => {
      sectorMap[s] = sectors[Math.floor(Math.random() * sectors.length)];
    });

    return {
      success: true,
      data: {
        diversification_score: Math.round(Math.random() * 100),
        sector_concentration: (Math.random() * 100).toFixed(2),
        sector_breakdown: symbols.map(symbol => ({
          symbol,
          sector: sectorMap[symbol],
          weight: (Math.random() * 100 / symbols.length).toFixed(2),
        })),
        correlation_matrix: this.generateCorrelationMatrix(symbols.length),
      },
    };
  }

  private generateCorrelationMatrix(size: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = i === j ? 1 : Math.round((Math.random() * 100) / 100 * 100) / 100;
      }
    }
    return matrix;
  }

  // 14. Signatory Candidates (Multi-Model Consensus)
  async getSignatoryCandidates(limit: number = 20): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/fundamental-gate/signatory-candidates?limit=${limit}`);
      if (!response.ok) {
        console.log('[v0] Signatory candidates API not available, returning mock data');
        return this.mockSignatoryCandidatesData(limit);
      }
      return response.json();
    } catch {
      return this.mockSignatoryCandidatesData(limit);
    }
  }

  // 15. Pipeline (Stocks with Fundamental + Signatory Data)
  async getPipeline(limit: number = 20): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/fundamental-gate/pipeline?limit=${limit}`);
      if (!response.ok) {
        console.log('[v0] Pipeline API not available, returning mock data');
        return this.mockPipelineData(limit);
      }
      return response.json();
    } catch {
      return this.mockPipelineData(limit);
    }
  }

  // 16. Pipeline Funnel (Status Breakdown)
  async getPipelineFunnel(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/fundamental-gate/pipeline/funnel`);
      if (!response.ok) {
        console.log('[v0] Pipeline funnel API not available, returning mock data');
        return this.mockPipelineFunnelData();
      }
      return response.json();
    } catch {
      return this.mockPipelineFunnelData();
    }
  }

  // 17. Technical Gate Stocks (Comprehensive Technical Analysis)
  async getTechnicalGateAnalysis(symbols?: string[]): Promise<any> {
    try {
      let url = `${BASE_URL}/technical-gate/stocks`;
      if (symbols && symbols.length > 0) {
        const symbolsParam = symbols.join(',');
        url += `?symbols=${symbolsParam}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        console.log('[v0] Technical gate API not available, returning mock data');
        return this.mockTechnicalGateData(symbols || []);
      }
      return response.json();
    } catch {
      return this.mockTechnicalGateData(symbols || []);
    }
  }

  // Mock data for signatory candidates
  private mockSignatoryCandidatesData(limit: number) {
    const candidates = [];
    const verdicts = ['BUY_CONSENSUS', 'HOLD_CONSENSUS', 'AVOID_CONSENSUS'];
    const colors = ['green', 'yellow', 'red'];
    
    for (let i = 0; i < Math.min(limit, 10); i++) {
      const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
      candidates.push({
        symbol: `STOCK${i}`,
        company_name: `Company ${i} Ltd.`,
        sector: ['Technology', 'Finance', 'Healthcare', 'Utilities'][Math.floor(Math.random() * 4)],
        current_price: Math.round(Math.random() * 1000 + 100),
        market_cap: Math.random() * 1000000000000,
        models_evaluated: Math.round(Math.random() * 5) + 1,
        models_buy: Math.round(Math.random() * 3),
        models_hold: Math.round(Math.random() * 2),
        models_avoid: Math.round(Math.random() * 3),
        signatory_consensus: verdict,
        model_agreement_pct: Math.round(Math.random() * 100),
        avg_intrinsic_value: Math.round(Math.random() * 5000 + 100),
        avg_mos_price: Math.round(Math.random() * 3000 + 50),
        avg_upside_pct: Math.round(Math.random() * 1000),
        avg_total_score: Math.round(Math.random() * 100),
        dominant_verdict: verdict === 'BUY_CONSENSUS' ? 'UNDERVALUED' : verdict === 'HOLD_CONSENSUS' ? 'FAIRLY_VALUED' : 'OVERVALUED',
      });
    }
    return { success: true, data: candidates };
  }

  // Mock data for pipeline
  private mockPipelineData(limit: number) {
    const pipeline = [];
    const statuses = ['READY_FOR_TECHNICAL', 'CONDITIONAL_PASS', 'UNDER_REVIEW', 'REJECTED_AT_FUNDAMENTAL', 'REJECTED_AT_SIGNATORY'];
    
    for (let i = 0; i < Math.min(limit, 10); i++) {
      pipeline.push({
        symbol: `PIPE${i}`,
        company_name: `Pipeline Company ${i}`,
        sector: ['Technology', 'Finance', 'Healthcare', 'Utilities'][Math.floor(Math.random() * 4)],
        current_price: Math.round(Math.random() * 1000 + 100),
        fundamental_gate_verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION',
        fundamental_score: Math.round(Math.random() * 100),
        fundamental_verdict: Math.random() > 0.5 ? 'STRONG_FUNDAMENTAL' : 'MODERATE_FUNDAMENTAL',
        fundamental_upside_pct: Math.round(Math.random() * 200),
        altman_z_score: (Math.random() * 5).toFixed(2),
        piotroski_f_score: Math.round(Math.random() * 9),
        pipeline_status: statuses[Math.floor(Math.random() * statuses.length)],
        pipeline_readiness_score: Math.round(Math.random() * 100),
      });
    }
    return { success: true, data: pipeline };
  }

  // Mock data for pipeline funnel
  private mockPipelineFunnelData() {
    return {
      success: true,
      data: [
        { pipeline_status: 'READY_FOR_TECHNICAL', stocks: 37, avg_readiness: 3.38 },
        { pipeline_status: 'CONDITIONAL_PASS', stocks: 36, avg_readiness: 3.47 },
        { pipeline_status: 'UNDER_REVIEW', stocks: 145, avg_readiness: 0.74 },
        { pipeline_status: 'REJECTED_AT_FUNDAMENTAL', stocks: 21, avg_readiness: 0 },
        { pipeline_status: 'REJECTED_AT_SIGNATORY', stocks: 1103, avg_readiness: 1.27 },
      ],
    };
  }

  // Mock data for technical gate analysis
  private mockTechnicalGateData(symbols: string[]) {
    const data = symbols.length > 0 
      ? symbols.map(symbol => this.generateTechnicalGateRecord(symbol))
      : Array(5).fill(null).map((_, i) => this.generateTechnicalGateRecord(`TECH${i}`));

    return {
      success: true,
      data,
    };
  }

  private generateTechnicalGateRecord(symbol: string) {
    const qualityScores = {
      value_depth: Math.round(Math.random() * 100),
      growth_quality: Math.round(Math.random() * 100),
      business_quality: Math.round(Math.random() * 100),
      financial_safety: Math.round(Math.random() * 100),
      market_momentum: Math.round(Math.random() * 100),
      income_quality: Math.round(Math.random() * 100),
    };

    const avgQuality = Math.round(
      Object.values(qualityScores).reduce((a, b) => a + b, 0) / 6
    );

    const technicalMethods = [
      { name: 'Ichimoku', verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION', confidence: Math.round(Math.random() * 100) },
      { name: 'Gann', verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION', confidence: Math.round(Math.random() * 100) },
      { name: 'Fibonacci', verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION', confidence: Math.round(Math.random() * 100) },
      { name: 'Harmonic Patterns', verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION', confidence: Math.round(Math.random() * 100) },
    ];

    return {
      symbol,
      company_name: `${symbol} Ltd.`,
      gate_verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION',
      gates_passed_count: Math.round(Math.random() * 4),
      // Individual Gate Status
      solvency_gate_passed: Math.random() > 0.2,
      profitability_gate_passed: Math.random() > 0.2,
      distress_gate_passed: Math.random() > 0.2,
      coverage_gate_passed: Math.random() > 0.2,
      solvency_score: Math.round(Math.random() * 100),
      profitability_score: Math.round(Math.random() * 100),
      distress_score: Math.round(Math.random() * 100),
      coverage_score: Math.round(Math.random() * 100),
      // Quality Scores (6 dimensions)
      quality_scores: qualityScores,
      avg_quality_score: avgQuality,
      // Cloud, Wave, Wyckoff, Trend Gates
      cloud_gate_passed: Math.random() > 0.3,
      wave_gate_passed: Math.random() > 0.3,
      wyckoff_gate_passed: Math.random() > 0.3,
      trend_gate_passed: Math.random() > 0.3,
      timing_score: Math.round(Math.random() * 100),
      outlook: Math.random() > 0.4 ? 'HIGHLY_FAVORABLE' : 'MODERATELY_FAVORABLE',
      conviction_level: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
      conviction_tier: ['HIGH_CONVICTION', 'MODERATE_CONVICTION', 'LOW_CONVICTION'][Math.floor(Math.random() * 3)],
      conviction_score: Math.round(Math.random() * 100),
      kelly_fraction: (Math.random() * 0.5).toFixed(3),
      suggested_allocation: (Math.random() * 0.3).toFixed(2),
      // Entry Prices
      agg_entry_price: (Math.random() * 1000 + 100).toFixed(2),
      agg_stop_loss: (Math.random() * 900 + 50).toFixed(2),
      agg_target_1: (Math.random() * 1200 + 150).toFixed(2),
      agg_target_2: (Math.random() * 1300 + 200).toFixed(2),
      agg_target_3: (Math.random() * 1400 + 250).toFixed(2),
      agg_risk_reward: (Math.random() * 5 + 1).toFixed(2),
      risk_percent: (Math.random() * 5).toFixed(2),
      target_1_percent: (Math.random() * 10 + 1).toFixed(2),
      target_2_percent: (Math.random() * 15 + 2).toFixed(2),
      target_3_percent: (Math.random() * 20 + 3).toFixed(2),
      position_status: Math.random() > 0.5 ? 'IN_ZONE' : 'OUT_OF_ZONE',
      mtf_alignment: 'FULL_BULLISH',
      mtf_alignment_score: 1,
      confluence_score: Math.round(Math.random() * 100),
      zone_count: Math.round(Math.random() * 5) + 1,
      top_zone_low: (Math.random() * 900 + 50).toFixed(2),
      top_zone_high: (Math.random() * 1100 + 200).toFixed(2),
      top_zone_type: Math.random() > 0.5 ? 'support' : 'resistance',
      best_support_low: (Math.random() * 800 + 40).toFixed(2),
      best_support_high: (Math.random() * 1000 + 150).toFixed(2),
      best_resist_low: (Math.random() * 1100 + 200).toFixed(2),
      best_resist_high: (Math.random() * 1300 + 300).toFixed(2),
      volatility: Math.random() > 0.5 ? 'MEDIUM' : 'LOW',
      atr_pct: (Math.random() * 5).toFixed(2),
      adx: (Math.random() * 50 + 20).toFixed(2),
      data_quality_score: Math.round(Math.random() * 100),
      methods_analyzed: Math.round(Math.random() * 20) + 10,
      // Technical Methods
      technical_methods: technicalMethods,
      philosophy_agreement: Math.round(Math.random() * 100),
      // Entry Plan Strategies
      conservative_entry_low: (Math.random() * 800 + 50).toFixed(2),
      conservative_entry_high: (Math.random() * 950 + 100).toFixed(2),
      balanced_entry_low: (Math.random() * 900 + 75).toFixed(2),
      balanced_entry_high: (Math.random() * 1050 + 150).toFixed(2),
      aggressive_entry_low: (Math.random() * 950 + 100).toFixed(2),
      aggressive_entry_high: (Math.random() * 1150 + 200).toFixed(2),
    };
  }

  // GLOBAL BASKET APIs (14 APIs)

  // 18. Global Basket Overview
  async getBasketOverview(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/overview`);
      if (!response.ok) return this.mockBasketOverviewData();
      return response.json();
    } catch {
      return this.mockBasketOverviewData();
    }
  }

  // 19. Global Basket Composition
  async getBasketComposition(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/composition`);
      if (!response.ok) return this.mockBasketCompositionData();
      return response.json();
    } catch {
      return this.mockBasketCompositionData();
    }
  }

  // 20. Global Basket Tracking - Pulse
  async getBasketPulse(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/tracking/pulse`);
      if (!response.ok) return this.mockBasketPulseData();
      return response.json();
    } catch {
      return this.mockBasketPulseData();
    }
  }

  // 21. Global Basket Tracking - Conviction
  async getBasketConviction(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/tracking/conviction`);
      if (!response.ok) return this.mockBasketConvictionData();
      return response.json();
    } catch {
      return this.mockBasketConvictionData();
    }
  }

  // 22. Global Basket Tracking - Entry Plans (All)
  async getBasketEntryPlans(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/tracking/entry-plans`);
      if (!response.ok) return this.mockBasketEntryPlansData();
      return response.json();
    } catch {
      return this.mockBasketEntryPlansData();
    }
  }

  // 23. Global Basket Tracking - Entry Plans (Single Stock)
  async getBasketEntryPlanForStock(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/tracking/entry-plans/${symbol}`);
      if (!response.ok) return this.mockBasketEntryPlanSingleData(symbol);
      return response.json();
    } catch {
      return this.mockBasketEntryPlanSingleData(symbol);
    }
  }

  // 24. Global Basket Tracking - Gate Readiness
  async getBasketGateReadiness(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/tracking/gate-readiness`);
      if (!response.ok) return this.mockBasketGateReadinessData();
      return response.json();
    } catch {
      return this.mockBasketGateReadinessData();
    }
  }

  // 25. Global Basket Tracking - Analyst Forecast
  async getBasketAnalystForecast(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/tracking/analyst-forecast`);
      if (!response.ok) return this.mockBasketAnalystForecastData();
      return response.json();
    } catch {
      return this.mockBasketAnalystForecastData();
    }
  }

  // 26. Global Basket Investment - Performance
  async getBasketPerformance(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/investment/performance`);
      if (!response.ok) return this.mockBasketPerformanceData();
      return response.json();
    } catch {
      return this.mockBasketPerformanceData();
    }
  }

  // 27. Global Basket Investment - Risk
  async getBasketRisk(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/investment/risk`);
      if (!response.ok) return this.mockBasketRiskData();
      return response.json();
    } catch {
      return this.mockBasketRiskData();
    }
  }

  // 28. Global Basket Investment - Exit Signals
  async getBasketExitSignals(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/global-basket/investment/exit-signals`);
      if (!response.ok) return this.mockBasketExitSignalsData();
      return response.json();
    } catch {
      return this.mockBasketExitSignalsData();
    }
  }

  // 29. Technical Gate Scorecard
  async getTechnicalGateScorecard(symbols: string[]): Promise<any> {
    try {
      const symbolsParam = symbols.join(',');
      const response = await fetch(`${BASE_URL}/technical-gate/scorecard?symbols=${symbolsParam}`);
      if (!response.ok) return this.mockTechnicalGateScorecardData(symbols);
      return response.json();
    } catch {
      return this.mockTechnicalGateScorecardData(symbols);
    }
  }

  // 30. Technical Gate Sectors
  async getTechnicalGateSectors(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/technical-gate/sectors`);
      if (!response.ok) return this.mockTechnicalGateSectorsData();
      return response.json();
    } catch {
      return this.mockTechnicalGateSectorsData();
    }
  }

  // Mock data generators for Basket APIs
  private mockBasketOverviewData() {
    return {
      success: true,
      data: {
        total_stocks: 15,
        value_invested: 500000,
        current_value: 545000,
        overall_return_pct: 9,
        portfolio_conviction: 'MEDIUM',
        rebalance_recommendation: 'NO_ACTION',
      },
    };
  }

  private mockBasketCompositionData() {
    return {
      success: true,
      data: Array(5).fill(null).map((_, i) => ({
        symbol: `STOCK${i}`,
        company_name: `Company ${i} Ltd.`,
        sector: ['Technology', 'Finance', 'Healthcare', 'Utilities', 'Industrial'][i],
        current_price: Math.random() * 1000 + 100,
        market_cap: Math.random() * 1000000000000,
        pe_ratio: Math.random() * 50 + 5,
        pb_ratio: Math.random() * 10 + 0.5,
        roe: Math.random() * 50 + 5,
        beta: Math.random() * 1.5 + 0.5,
        dividend_yield_ttm: Math.random() * 5,
        sector_rank: Math.round(Math.random() * 100),
        sector_percentile: Math.round(Math.random() * 100),
      })),
    };
  }

  private mockBasketPulseData() {
    return {
      success: true,
      data: Array(5).fill(null).map((_, i) => ({
        symbol: `STOCK${i}`,
        company_name: `Company ${i} Ltd.`,
        sector: ['Technology', 'Finance', 'Healthcare', 'Utilities', 'Industrial'][i],
        current_price: Math.random() * 1000 + 100,
        return_5d: (Math.random() - 0.5) * 10,
        return_10d: (Math.random() - 0.5) * 15,
        return_30d: (Math.random() - 0.5) * 30,
        rsi_14d: Math.round(Math.random() * 100),
        price_vs_200dma: Math.random() * 0.2 - 0.1,
        market_phase: ['TRENDING', 'RANGING', 'REVERSAL'][Math.floor(Math.random() * 3)],
        outlook: ['FAVORABLE', 'MONITORING', 'UNFAVORABLE'][Math.floor(Math.random() * 3)],
        mtf_alignment: 'PARTIAL_BULLISH',
        momentum_label: ['STRONG', 'FLAT', 'WEAK'][Math.floor(Math.random() * 3)],
      })),
    };
  }

  private mockBasketConvictionData() {
    return {
      success: true,
      data: Array(5).fill(null).map((_, i) => ({
        symbol: `STOCK${i}`,
        current_price: Math.random() * 1000 + 100,
        fundamental_conviction_score: Math.round(Math.random() * 100),
        fundamental_verdict: Math.random() > 0.5 ? 'STRONG_FUNDAMENTAL' : 'MODERATE_FUNDAMENTAL',
        upside_percentage: Math.round(Math.random() * 200),
        tech_conviction_score: Math.round(Math.random() * 100),
        composite_score: Math.round(Math.random() * 100),
        conviction_tier: ['HIGH_CONVICTION', 'MODERATE_CONVICTION', 'LOW_CONVICTION'][Math.floor(Math.random() * 3)],
      })),
    };
  }

  private mockBasketEntryPlansData() {
    return { success: true, data: Array(5).fill(null).map((_, i) => this.generateEntryPlanRecord(`STOCK${i}`)) };
  }

  private mockBasketEntryPlanSingleData(symbol: string) {
    return { success: true, data: this.generateEntryPlanRecord(symbol) };
  }

  private generateEntryPlanRecord(symbol: string) {
    return {
      symbol,
      company_name: `${symbol} Ltd.`,
      current_price: Math.random() * 1000 + 100,
      agg_entry_price: Math.random() * 1000 + 100,
      agg_stop_loss: Math.random() * 900 + 50,
      agg_target_1: Math.random() * 1200 + 150,
      agg_target_2: Math.random() * 1300 + 200,
      agg_target_3: Math.random() * 1400 + 250,
      risk_percent: Math.random() * 5,
      target_1_percent: Math.random() * 10,
      target_2_percent: Math.random() * 20,
      target_3_percent: Math.random() * 30,
      entry_conservative_low: Math.random() * 900 + 50,
      entry_conservative_high: Math.random() * 1100 + 100,
      entry_balanced_low: Math.random() * 950 + 75,
      entry_balanced_high: Math.random() * 1150 + 125,
      entry_aggressive_low: Math.random() * 1000 + 100,
      entry_aggressive_high: Math.random() * 1200 + 150,
      kelly_fraction: (Math.random() * 0.5).toFixed(3),
      suggested_allocation: (Math.random() * 0.3).toFixed(2),
      timing_score: Math.round(Math.random() * 100),
      conviction_score: Math.round(Math.random() * 100),
      conviction_level: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
    };
  }

  private mockBasketGateReadinessData() {
    return {
      success: true,
      data: Array(5).fill(null).map((_, i) => ({
        symbol: `STOCK${i}`,
        fundamental_score: Math.round(Math.random() * 100),
        fundamental_verdict: Math.random() > 0.5 ? 'PASS' : 'CAUTION',
        tech_conviction_score: Math.round(Math.random() * 100),
        cloud_gate_passed: Math.random() > 0.3,
        wave_gate_passed: Math.random() > 0.3,
        wyckoff_gate_passed: Math.random() > 0.3,
        trend_gate_passed: Math.random() > 0.3,
        fundamental_gate_verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION',
        technical_gate_verdict: Math.random() > 0.3 ? 'PASS' : 'CAUTION',
        pipeline_status: ['READY_FOR_TECHNICAL', 'CONDITIONAL_PASS', 'UNDER_REVIEW'][Math.floor(Math.random() * 3)],
        combined_conviction_score: Math.round(Math.random() * 100),
      })),
    };
  }

  private mockBasketAnalystForecastData() {
    return {
      success: true,
      data: Array(5).fill(null).map((_, i) => ({
        symbol: `STOCK${i}`,
        current_price: Math.random() * 1000 + 100,
        price_target_avg: Math.random() * 1200 + 120,
        target_upside_pct: Math.round(Math.random() * 100),
        analyst_coverage_count: Math.round(Math.random() * 20) + 5,
        eps_growth_next_year: Math.random() * 50,
        consensus_signal: ['BUY', 'HOLD', 'SELL'][Math.floor(Math.random() * 3)],
        ml_predicted_return_pct: Math.random() * 30 - 10,
        directional_accuracy_pct: Math.round(Math.random() * 100),
      })),
    };
  }

  private mockBasketPerformanceData() {
    return {
      success: true,
      data: Array(5).fill(null).map((_, i) => ({
        symbol: `STOCK${i}`,
        current_price: Math.random() * 1000 + 100,
        return_5d: (Math.random() - 0.5) * 10,
        return_10d: (Math.random() - 0.5) * 15,
        return_15d: (Math.random() - 0.5) * 20,
        return_30d: (Math.random() - 0.5) * 30,
        rsi_14d: Math.round(Math.random() * 100),
        ma_crossover: Math.random() > 0.5 ? 'GOLDEN_CROSS' : 'DEATH_CROSS',
        momentum_label: ['POSITIVE', 'MIXED', 'NEGATIVE'][Math.floor(Math.random() * 3)],
        atr_14d: Math.random() * 100,
      })),
    };
  }

  private mockBasketRiskData() {
    return {
      success: true,
      data: Array(5).fill(null).map((_, i) => ({
        symbol: `STOCK${i}`,
        current_price: Math.random() * 1000 + 100,
        beta: Math.random() * 1.5 + 0.5,
        realized_vol_10d: Math.random() * 0.3,
        realized_vol_20d: Math.random() * 0.4,
        realized_vol_30d: Math.random() * 0.5,
        max_drawdown: (Math.random() - 1) * 0.5,
        sharpe_ratio: Math.random() * 1,
        sortino_ratio: Math.random() * 1.5,
        var_95: (Math.random() - 1) * 0.1,
        cvar_95: (Math.random() - 1) * 0.15,
        beta_category: ['LOW', 'MODERATE', 'HIGH'][Math.floor(Math.random() * 3)],
        volatility_regime: Math.random() > 0.5 ? 'LOW' : 'HIGH',
        risk_adjusted_label: ['ABOVE_AVG', 'BELOW_AVG', 'AVG'][Math.floor(Math.random() * 3)],
      })),
    };
  }

  private mockBasketExitSignalsData() {
    return {
      success: true,
      data: Array(5).fill(null).map((_, i) => ({
        symbol: `STOCK${i}`,
        current_price: Math.random() * 1000 + 100,
        agg_stop_loss: Math.random() * 900 + 50,
        agg_target_1: Math.random() * 1200 + 150,
        agg_risk_reward: Math.random() * 5 + 1,
        stop_loss_distance_pct: Math.random() * 10,
        fundamental_verdict: Math.random() > 0.5 ? 'BUY' : 'SELL',
        position_status: Math.random() > 0.5 ? 'IN_ZONE' : 'OUT_OF_ZONE',
        exit_signal_strength: Math.random() > 0.5 ? 'STRONG' : 'WEAK',
      })),
    };
  }

  private mockTechnicalGateScorecardData(symbols: string[]) {
    return {
      success: true,
      data: {
        stocks_pass: Math.floor(symbols.length * 0.6),
        stocks_caution: Math.floor(symbols.length * 0.3),
        stocks_fail: Math.floor(symbols.length * 0.1),
        group_avg_timing: Math.round(Math.random() * 100),
        best_pick: symbols[0],
        worst_pick: symbols[symbols.length - 1],
        avg_group_risk: Math.random() * 5,
        avg_method_agreement: Math.round(Math.random() * 100),
        avg_risk_reward: Math.random() * 10,
      },
    };
  }

  private mockTechnicalGateSectorsData() {
    const sectors = ['Financial Services', 'Technology', 'Healthcare', 'Utilities', 'Industrials'];
    return {
      success: true,
      data: sectors.map(sector => ({
        sector,
        total_stocks: Math.round(Math.random() * 100) + 20,
        stocks_pass: Math.round(Math.random() * 50),
        stocks_caution: Math.round(Math.random() * 50),
        pass_rate_pct: Math.round(Math.random() * 100),
        avg_timing_score: Math.round(Math.random() * 100),
        avg_gates_passed: Math.random() * 4,
        avg_confidence: Math.random(),
        avg_conviction_score: Math.round(Math.random() * 100),
        avg_risk_reward: Math.random() * 10,
        best_stock: 'TOPSTOCK',
        worst_stock: 'WORSTSTOCK',
      })),
    };
  }
}

export const fundamentalAPI = new FundamentalAPIService();
