// src/services/stock.service.ts

import { api } from "@/lib/apiClient";
import type { ApiEnvelope, CountryCode } from "./_types";

/* =========================================================
   TYPES
========================================================= */

export type StockLatestRow = {
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;

  calculation_date: string; // "YYYY-MM-DD"
  symbol: string;
  sector: string;

  sector_rank: number;
  market_rank: number;

  market_insight: string;

  days_of_data: number;
  calibration_status: string; // e.g. "ACTIVE"
};

export type StocksLatestData = {
  stocks: StockLatestRow[];
  total: number;
  limit: number;
  offset: number;
};

export type StocksLatestResponse = ApiEnvelope<StocksLatestData>;

export type StockHistoryPoint = {
  calculation_date: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
  sector_rank?: number;
  market_rank?: number;
  market_insight?: string;
};

export type StockHistoryResponse = {
  symbol: string;
  sector: string;
  latest: StockLatestRow;
  history: StockHistoryPoint[];
};
export type SingleStockHistoryResponse = ApiEnvelope<StockHistoryResponse>;
/* =========================================================
   HELPERS
========================================================= */

function clampInt(v: any, min: number, max: number, fallback: number) {
  const n = Math.trunc(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function nonEmptyString(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : undefined;
}

/* =========================================================
   SERVICE
========================================================= */

export const stockService = {
  /**
   * GET /api/v1/{country}/market-pulse/stocks/latest
   *
   * Query params:
   *  - sector?: string
   *  - sort_by?: string (default: "market_rank")
   *  - limit?: number (1..100)
   *  - offset?: number (>=0)
   */
  stocksLatest(
    country: CountryCode,
    opts?: {
      sector?: string | null;
      sort_by?: string;
      limit?: number;
      offset?: number;
    },
    signal?: AbortSignal,
  ) {
    const limit = clampInt(opts?.limit, 1, 100, 20);
    const offset = clampInt(opts?.offset, 0, Number.MAX_SAFE_INTEGER, 0);
    console.log("Stockss latest");

    const params: Record<string, any> = {
      sort_by: nonEmptyString(opts?.sort_by) ?? "market_rank",
      limit,
      offset,
    };

    const sector = nonEmptyString(opts?.sector);
    if (sector) params.sector = sector;

    return api.get<StocksLatestResponse>(
      `/api/v1/${country}/market-pulse/stocks/latest`,
      { params, signal },
    );
  },
  singleStockHistory(
    country: string,
    symbol: string,
    days: number = 30,
    signal?: AbortSignal,
  ) {
    if (!symbol) throw new Error("symbol is required");

    const safeDays = Math.max(1, Math.min(90, Math.trunc(days || 30)));

    return api.get<SingleStockHistoryResponse>(
      `/api/v1/${country}/market-pulse/stocks/${encodeURIComponent(symbol)}`,
      {
        params: { days: safeDays },
        signal,
      },
    );
  },
};
