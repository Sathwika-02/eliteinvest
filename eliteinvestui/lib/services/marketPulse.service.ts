// src/services/marketPulse.service.ts
import { api, API_BASE_URL } from "@/lib/apiClient";
import type { ApiEnvelope, CountryCode } from "./_types";
//Market pulse latest
export type IndicesLatestRow = {
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
  calculation_date: string; // "YYYY-MM-DD"
  index_symbol: string;
  index_name: string;
  index_value: string;
  index_change: string;
  index_change_pct: string;
  days_of_data: number;
  calibration_status: string;
};

export type IndicesLatestResponse = ApiEnvelope<IndicesLatestRow[]>;

/** --------- HISTORY --------- */
export type IndexHistoryPoint = {
  calculation_date: string; // "YYYY-MM-DD"
  index_value: string;
  index_change: string;
  index_change_pct: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
};

export type IndexHistorySeries = {
  index_symbol: string;
  index_name: string;
  history: IndexHistoryPoint[];
};

export type IndicesHistoryResponse = ApiEnvelope<IndexHistorySeries[]>;

function symbolsToQuery(symbols: string[] | string) {
  return Array.isArray(symbols) ? symbols.join(",") : symbols;
}

export type ScoreDefinition = {
  code: "KFI" | "CNS" | "IES" | "ACI" | string;
  name: string;
  description: string;
};

export type ScoreDefinitionsData = {
  definitions: ScoreDefinition[];
};

export type ScoreDefinitionsResponse = ApiEnvelope<ScoreDefinitionsData>;

export const marketPulseService = {
  /**
   * GET /api/v1/{country}/market-pulse/indices/latest?target_date=YYYY-MM-DD
   */
  indicesLatest(country: CountryCode, target_date?: string) {
    console.log("going to indixesLatest", country);
    return api.get<IndicesLatestResponse>(
      `/api/v1/${country}/market-pulse/indices/latest`,
      { params: target_date ? { target_date } : undefined },
    );
  },

  /**
   * GET /api/v1/{country}/market-pulse/indices/history?symbols=...&days=...
   * symbols: comma-separated symbols (ex: "^NSEI,^NIFTY100")
   * days: 1..90
   */
  indicesHistory(
    country: CountryCode,
    symbols: string[] | string,
    days: number = 30,
  ) {
    const safeDays = Math.max(1, Math.min(90, Math.trunc(days || 30)));

    return api.get<IndicesHistoryResponse>(
      `/api/v1/${country}/market-pulse/indices/history`,
      {
        params: {
          symbols: symbolsToQuery(symbols),
          days: safeDays,
        },
      },
    );
  },
   scoreDefinitions(country: CountryCode) {
    return api.get<ScoreDefinitionsResponse>(
      `/api/v1/${country}/market-pulse/score-definitions`,
    );
  },
};
