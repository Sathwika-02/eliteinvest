// Mock data for the Market Mood Dashboard based on the API spec

export const marketStatusData = {
  success: true,
  data: [
    {
      market_code: "IN",
      market_name: "India",
      exchange_name: "NSE/BSE",
      timezone: "Asia/Kolkata",
      currency: "INR",
      trade_date: "2026-02-25",
      local_time: "14:32:00.000000",
      open_time: "09:15:00",
      close_time: "15:30:00",
      pre_open: "09:00:00",
      post_close: null,
      status: "REGULAR",
      is_open: true,
      has_override: false,
      schedule_source: "FIXED",
      override_diff: null,
      fixed_open_time: "09:15:00",
      fixed_close_time: "15:30:00",
      override_note: null,
      holiday_name: null,
    },
    {
      market_code: "UK",
      market_name: "United Kingdom",
      exchange_name: "LSE",
      timezone: "Europe/London",
      currency: "GBP",
      trade_date: "2026-02-25",
      local_time: "09:02:00.000000",
      open_time: "08:00:00",
      close_time: "16:30:00",
      pre_open: "07:50:00",
      post_close: "16:35:00",
      status: "REGULAR",
      is_open: true,
      has_override: false,
      schedule_source: "FIXED",
      override_diff: null,
      fixed_open_time: "08:00:00",
      fixed_close_time: "16:30:00",
      override_note: null,
      holiday_name: null,
    },
    {
      market_code: "US",
      market_name: "United States",
      exchange_name: "NYSE/NASDAQ",
      timezone: "America/New_York",
      currency: "USD",
      trade_date: "2026-02-25",
      local_time: "04:02:00.000000",
      open_time: "09:30:00",
      close_time: "16:00:00",
      pre_open: "04:00:00",
      post_close: "20:00:00",
      status: "REGULAR",
      is_open: false,
      has_override: false,
      schedule_source: "FIXED",
      override_diff: null,
      fixed_open_time: "09:30:00",
      fixed_close_time: "16:00:00",
      override_note: null,
      holiday_name: null,
    },
  ],
  error: null,
};






export const marketSnapshotData = {
  success: true,
  data: [
     {
      "kinetic_flow_index": "46.28",
      "consilium_score": "65.91",
      "intrinsic_edge_score": "53.81",
      "alpha_confluence_index": "63.25",
      "calculation_date": "2026-02-13",
      "index_symbol": "^NIFTY100",
      "index_name": "NIFTY 100",
      "index_value": "24986.66",
      "index_change": "-90.26",
      "index_change_pct": "-0.2856",
      "days_of_data": 86,
      "calibration_status": "ACTIVE"
    },
    {
      "kinetic_flow_index": "55.95",
      "consilium_score": "56.52",
      "intrinsic_edge_score": "60.50",
      "alpha_confluence_index": "58.23",
      "calculation_date": "2026-02-13",
      "index_symbol": "^NIFTY200",
      "index_name": "NIFTY 200",
      "index_value": "13375.24",
      "index_change": "39.17",
      "index_change_pct": "0.0355",
      "days_of_data": 86,
      "calibration_status": "ACTIVE"
    },
    {
      "kinetic_flow_index": "76.46",
      "consilium_score": "51.96",
      "intrinsic_edge_score": "60.48",
      "alpha_confluence_index": "76.90",
      "calculation_date": "2026-02-13",
      "index_symbol": "^NSEI",
      "index_name": "NIFTY 50",
      "index_value": "24359.80",
      "index_change": "-69.19",
      "index_change_pct": "-0.4723",
      "days_of_data": 86,
      "calibration_status": "ACTIVE"
    },
    {
      "kinetic_flow_index": "57.21",
      "consilium_score": "66.99",
      "intrinsic_edge_score": "70.26",
      "alpha_confluence_index": "59.05",
      "calculation_date": "2026-02-13",
      "index_symbol": "^NIFTY500",
      "index_name": "NIFTY 500",
      "index_value": "23569.18",
      "index_change": "-72.50",
      "index_change_pct": "0.0620",
      "days_of_data": 86,
      "calibration_status": "ACTIVE"
    },
    {
      "kinetic_flow_index": "65.45",
      "consilium_score": "49.54",
      "intrinsic_edge_score": "53.22",
      "alpha_confluence_index": "51.90",
      "calculation_date": "2026-02-13",
      "index_symbol": "^NSEBANK",
      "index_name": "NIFTY BANK",
      "index_value": "50993.60",
      "index_change": "-302.57",
      "index_change_pct": "-0.2329",
      "days_of_data": 86,
      "calibration_status": "ACTIVE"
    },
    {
      "kinetic_flow_index": "76.49",
      "consilium_score": "54.67",
      "intrinsic_edge_score": "52.54",
      "alpha_confluence_index": "52.44",
      "calculation_date": "2026-02-13",
      "index_symbol": "^NIFTYNEXT50",
      "index_name": "NIFTY NEXT 50",
      "index_value": "70857.66",
      "index_change": "54.37",
      "index_change_pct": "-0.4278",
      "days_of_data": 86,
      "calibration_status": "ACTIVE"
    },
    {
      "kinetic_flow_index": "52.17",
      "consilium_score": "58.67",
      "intrinsic_edge_score": "80.33",
      "alpha_confluence_index": "72.51",
      "calculation_date": "2026-02-13",
      "index_symbol": "^NIFTYTOTALMARKET",
      "index_name": "NIFTY TOTAL MARKET",
      "index_value": "12665.08",
      "index_change": "4.60",
      "index_change_pct": "0.0242",
      "days_of_data": 86,
      "calibration_status": "ACTIVE"
    }
  ],
};



export const scoreDefinitions = {
  KFI: {
    full: "Kinetic Flow Index",
    description:
      "Quantifies the flow-divergence lattice and cross-constituent participation velocity to reveal hidden directional energy.",
    friendly:
      '"Is the rally real or fake?" \u2014 Tells you whether most stocks are participating in the market move, or if just a few heavyweights are dragging the index. High KFI = broad strength, Low KFI = narrow/weak move.',
    label: "Momentum",
  },
  CNS: {
    full: "Consilium Score",
    description:
      "Distills the multi-horizon conviction mesh from institutional forward-guidance layers and professional outlook convergence patterns.",
    friendly:
      '"What is smart money expecting?" \u2014 Shows whether analysts and institutions are upgrading or downgrading their outlook. High CNS = professionals are optimistic, Low CNS = professionals are pessimistic.',
    label: "Sentiment",
  },
  IES: {
    full: "Intrinsic Edge Score",
    description:
      "Calibrates the fundamental dislocation envelope by mapping intrinsic worth corridors against prevailing market pricing surfaces.",
    friendly:
      '"Am I buying cheap or expensive?" \u2014 Compares what stocks are actually worth versus what the market is charging right now. Low IES = stocks are undervalued (bargain zone), High IES = stocks are overpriced (expensive zone).',
    label: "Valuation",
  },
  ACI: {
    full: "Alpha Confluence Index",
    description:
      "Proprietary tri-dimensional fusion engine orchestrating kinetic, conviction, and intrinsic signals through adaptive weighting into a single opportunity-risk continuum.",
    friendly:
      '"Bottom line \u2014 should I invest now or wait?" \u2014 Combines all three signals into one number. Low ACI = Fear/Opportunity (good time to buy), High ACI = Greed/Overpriced (good time to be cautious or exit). This is your primary decision indicator.',
    label: "Composite",
  },
}

export function getScoreColor(score: number): string {
  if (score <= 30) return "text-score-bearish"
  if (score <= 50) return "text-score-cautious"
  if (score <= 70) return "text-score-neutral"
  if (score <= 85) return "text-score-bullish"
  return "text-score-extreme"
}

export function getScoreBgColor(score: number): string {
  if (score <= 30) return "bg-score-bearish"
  if (score <= 50) return "bg-score-cautious"
  if (score <= 70) return "bg-score-neutral"
  if (score <= 85) return "bg-score-bullish"
  return "bg-score-extreme"
}



export function getAciTileTheme(score: number) {
  // Matches your legend style:
  // Low (<35) red, Caution (35-45) amber, Neutral (45-55) slate,
  // Positive (55-65) green, Strong (>65) dark green

  if (score < 35) return { bg: "#dc2626", fg: "#ffffff", label: "Low" };         // red-600
  if (score < 45) return { bg: "#f59e0b", fg: "#111827", label: "Caution" };     // amber-500 (dark text looks better)
  if (score < 55) return { bg: "#64748b", fg: "#ffffff", label: "Neutral" };     // slate-500
  if (score < 65) return { bg: "#22c55e", fg: "#052e16", label: "Positive" };    // green-500 (very dark green text)
  return { bg: "#16a34a", fg: "#ffffff", label: "Strong" };                      // green-600
}

// Optional: keep your old API helpers, but make them match the same palette.
export function getScoreHex(score: number): string {
  return getAciTileTheme(score).bg;
}

export function getScoreLabel(score: number): string {
  const t = getAciTileTheme(score);
  if (t.label === "Low") return "Low";
  if (t.label === "Caution") return "Caution";
  if (t.label === "Neutral") return "Neutral";
  if (t.label === "Positive") return "Positive";
  return "Strong";
}
export const sectorCurrentData = {
  success: true,
  data: {
    calculation_date: "2025-12-10",
    market: "INDIA",
    total_sectors: 11,
    sectors: [
      { sector: "Energy", kinetic_flow_index: 35.45, consilium_score: 48.08, intrinsic_edge_score: 18.8, alpha_confluence_index: 34.11, num_stocks_in_sector: 19, num_stocks_with_data: 19, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Technology", kinetic_flow_index: 23.21, consilium_score: 53.9, intrinsic_edge_score: 53.26, alpha_confluence_index: 43.45, num_stocks_in_sector: 76, num_stocks_with_data: 76, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Utilities", kinetic_flow_index: 22.09, consilium_score: 63.48, intrinsic_edge_score: 52.59, alpha_confluence_index: 46.05, num_stocks_in_sector: 30, num_stocks_with_data: 30, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Consumer Defensive", kinetic_flow_index: 30.68, consilium_score: 42.87, intrinsic_edge_score: 79.18, alpha_confluence_index: 50.91, num_stocks_in_sector: 57, num_stocks_with_data: 55, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Financial Services", kinetic_flow_index: 36.65, consilium_score: 56.47, intrinsic_edge_score: 70.9, alpha_confluence_index: 54.67, num_stocks_in_sector: 130, num_stocks_with_data: 128, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Basic Materials", kinetic_flow_index: 29.58, consilium_score: 41.69, intrinsic_edge_score: 99.33, alpha_confluence_index: 56.86, num_stocks_in_sector: 157, num_stocks_with_data: 155, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Communication Services", kinetic_flow_index: 26.6, consilium_score: 50.36, intrinsic_edge_score: 95.41, alpha_confluence_index: 57.46, num_stocks_in_sector: 25, num_stocks_with_data: 25, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Industrials", kinetic_flow_index: 30.74, consilium_score: 45.83, intrinsic_edge_score: 96.93, alpha_confluence_index: 57.84, num_stocks_in_sector: 209, num_stocks_with_data: 206, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Real Estate", kinetic_flow_index: 25.15, consilium_score: 53.02, intrinsic_edge_score: 100.0, alpha_confluence_index: 59.39, num_stocks_in_sector: 36, num_stocks_with_data: 35, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Consumer Cyclical", kinetic_flow_index: 33.39, consilium_score: 48.79, intrinsic_edge_score: 100.0, alpha_confluence_index: 60.73, num_stocks_in_sector: 167, num_stocks_with_data: 165, days_of_data: 1, calibration_status: "CALIBRATING" },
      { sector: "Healthcare", kinetic_flow_index: 33.26, consilium_score: 52.66, intrinsic_edge_score: 100.0, alpha_confluence_index: 61.97, num_stocks_in_sector: 94, num_stocks_with_data: 93, days_of_data: 1, calibration_status: "CALIBRATING" },
    ],
  },
}

export const stockCurrentData = {
  success: true,
  data: {
    calculation_date: "2026-02-13",
    market: "INDIA",
    sector: "Energy",
    total_stocks: 10,
    page: 1,
    limit: 20,
    stocks: [
      {
        kinetic_flow_index: 51.48,
        consilium_score: 57.90,
        intrinsic_edge_score: 11.53,
        alpha_confluence_index: 51.72,
        calculation_date: "2026-02-13",
        symbol: "HINDUNILVR",
        sector: "Consumer Defensive",
        sector_rank: 0,
        market_rank: 13,
        market_insight: "🟡 CAUTION - Below average valuation with mixed signals. Risks: negative short-term momentum. Positives: analyst targets above current price. Monitor key metrics. Monitor: upcoming earnings and guidance.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 52.43,
        consilium_score: 77.02,
        intrinsic_edge_score: 9.60,
        alpha_confluence_index: 50.98,
        calculation_date: "2026-02-13",
        symbol: "LT",
        sector: "Industrials",
        sector_rank: 0,
        market_rank: 16,
        market_insight: "🟢 OPPORTUNITY ZONE - Trading at notable discount. Risks: near 52-week low. Positives: analyst targets above current price; below sector average valuation. Fundamentals appear supportive. Monitor: support levels and volume.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 53.28,
        consilium_score: 48.52,
        intrinsic_edge_score: 66.72,
        alpha_confluence_index: 51.36,
        calculation_date: "2026-02-13",
        symbol: "TITAN",
        sector: "Consumer Cyclical",
        sector_rank: 2,
        market_rank: 23,
        market_insight: "🟡 NEUTRAL - Fairly valued at current levels. Risks: in lower range of 52-week band. Positives: positive analyst sentiment. No extreme signals either way.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 54.35,
        consilium_score: 85.01,
        intrinsic_edge_score: 44.70,
        alpha_confluence_index: 55.60,
        calculation_date: "2026-02-13",
        symbol: "BHARTIARTL",
        sector: "Communication Services",
        sector_rank: -1,
        market_rank: 26,
        market_insight: "🟡 CAUTION - Below average valuation with mixed signals. Risks: negative short-term momentum. Positives: analyst targets above current price. Monitor key metrics. Monitor: upcoming earnings and guidance.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 75.29,
        consilium_score: 52.93,
        intrinsic_edge_score: 35.20,
        alpha_confluence_index: 50.87,
        calculation_date: "2026-02-13",
        symbol: "TRENT",
        sector: "Consumer Cyclical",
        sector_rank: 2,
        market_rank: 29,
        market_insight: "🟡 CAUTION - Below average valuation with mixed signals. Risks: negative short-term momentum. Positives: analyst targets above current price. Monitor key metrics. Monitor: upcoming earnings and guidance.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 68.67,
        consilium_score: 78.65,
        intrinsic_edge_score: 55.89,
        alpha_confluence_index: 64.05,
        calculation_date: "2026-02-13",
        symbol: "INFY",
        sector: "Technology",
        sector_rank: 0,
        market_rank: 29,
        market_insight: "🟡 NEUTRAL - Fairly valued at current levels. Risks: in lower range of 52-week band. Positives: positive analyst sentiment. No extreme signals either way.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 69.38,
        consilium_score: 49.11,
        intrinsic_edge_score: 21.47,
        alpha_confluence_index: 60.99,
        calculation_date: "2026-02-13",
        symbol: "NESTLEIND",
        sector: "Consumer Defensive",
        sector_rank: 2,
        market_rank: 30,
        market_insight: "🟢 OPPORTUNITY ZONE - Trading at notable discount. Risks: near 52-week low. Positives: analyst targets above current price; below sector average valuation. Fundamentals appear supportive. Monitor: support levels and volume.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 60.80,
        consilium_score: 76.17,
        intrinsic_edge_score: 23.06,
        alpha_confluence_index: 66.65,
        calculation_date: "2026-02-13",
        symbol: "ITC",
        sector: "Consumer Defensive",
        sector_rank: 0,
        market_rank: 31,
        market_insight: "🟡 NEUTRAL - Fairly valued at current levels. Risks: in lower range of 52-week band. Positives: positive analyst sentiment. No extreme signals either way.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 73.55,
        consilium_score: 51.09,
        intrinsic_edge_score: 18.92,
        alpha_confluence_index: 61.89,
        calculation_date: "2026-02-13",
        symbol: "CIPLA",
        sector: "Healthcare",
        sector_rank: 3,
        market_rank: 33,
        market_insight: "🟡 CAUTION - Below average valuation with mixed signals. Risks: negative short-term momentum. Positives: analyst targets above current price. Monitor key metrics. Monitor: upcoming earnings and guidance.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
      {
        kinetic_flow_index: 50.66,
        consilium_score: 56.54,
        intrinsic_edge_score: 82.65,
        alpha_confluence_index: 46.15,
        calculation_date: "2026-02-13",
        symbol: "BPCL",
        sector: "Energy",
        sector_rank: 1,
        market_rank: 34,
        market_insight: "🟡 CAUTION - Below average valuation with mixed signals. Risks: negative short-term momentum. Positives: analyst targets above current price. Monitor key metrics. Monitor: upcoming earnings and guidance.",
        days_of_data: 86,
        calibration_status: "ACTIVE",
      },
    ],
  },
};

// Generate historical data points for charts
function generateHistoricalPoints(baseAci: number, days: number) {
  const points = []
  const now = new Date("2025-12-10")
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const variance = (Math.random() - 0.5) * 20
    const aci = Math.max(10, Math.min(90, baseAci + variance))
    points.push({
      calculation_date: date.toISOString().split("T")[0],
      kinetic_flow_index: Math.max(5, Math.min(95, aci - 15 + (Math.random() - 0.5) * 15)),
      consilium_score: Math.max(5, Math.min(95, aci - 5 + (Math.random() - 0.5) * 20)),
      intrinsic_edge_score: Math.max(5, Math.min(95, aci + 15 + (Math.random() - 0.5) * 25)),
      alpha_confluence_index: Math.round(aci * 100) / 100,
      index_value: 24500 + Math.random() * 2000,
      index_change_pct: (Math.random() - 0.5) * 3,
    })
  }
  return points
}

export const marketHistoricalData = {
  success: true,
  data: {
    index_symbol: "^NSEI",
    index_name: "NIFTY 50",
    period: "3M",
    data_points: generateHistoricalPoints(55, 90),
    summary: {
      avg_aci: 54.2,
      min_aci: 28.5,
      max_aci: 72.3,
      current_vs_avg: "+1.37",
    },
  },
}

export function generateSectorHistoricalData(sector: string, baseAci: number) {
  return {
    sector,
    data_points: generateHistoricalPoints(baseAci, 90),
    summary: {
      avg_aci: baseAci + (Math.random() - 0.5) * 10,
      current_aci: baseAci,
    },
  }
}

export const stockHistoricalData = {
  success: true,
  data: {
    symbol: "RELIANCE",
    sector: "Energy",
    market: "INDIA",
    period: "3M",
    current_data: {
      calculation_date: "2025-12-10",
      kinetic_flow_index: 67.33,
      consilium_score: 58.37,
      intrinsic_edge_score: 31.92,
      alpha_confluence_index: 52.24,
      sector_rank: 13,
      market_rank: 430,
      market_insight: "NEUTRAL - Fairly valued at current levels. Risks: near 52-week high; above sector average valuation. No extreme signals either way.",
    },
    data_points: generateHistoricalPoints(52, 90),
    summary: {
      avg_aci: 50.2,
      min_aci: 38.5,
      min_aci_date: "2025-10-15",
      max_aci: 62.3,
      max_aci_date: "2025-11-20",
      current_vs_avg: "+2.04",
      trend: "STABLE",
    },
  },
}

export function getInsightType(insight: string): "opportunity" | "caution" | "neutral" | "avoid" {
  if (insight.includes("OPPORTUNITY")) return "opportunity"
  if (insight.includes("CAUTION")) return "caution"
  if (insight.includes("AVOID")) return "avoid"
  return "neutral"
}
