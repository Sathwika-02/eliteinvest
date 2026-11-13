// src/services/sector.service.ts

import { api } from "@/lib/apiClient";
import type { ApiEnvelope, CountryCode } from "./_types";

/* =========================================================
   TYPES
========================================================= */

/** Latest sector row */
export type SectorLatestRow = {
  sector_name: string;
  sector_value: string;
  sector_change: string;
  sector_change_pct: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
  calculation_date: string; // "YYYY-MM-DD"
};

export type SectorsLatestResponse = ApiEnvelope<SectorLatestRow[]>;

/** History point */
export type SectorHistoryPoint = {
 calculation_date: string;
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;

  // optional (only if some endpoints return them)
  sector_value?: string;
  sector_change?: string;
  sector_change_pct?: string;
};

/** Multiple sector history series */
export type SectorHistorySeries = {
  sector: string;          // ✅ API uses `sector`
  history: SectorHistoryPoint[];
};

export type SectorsHistoryResponse = ApiEnvelope<SectorHistorySeries[]>;



/* =========================================================
   HELPERS
========================================================= */

function sectorsToQuery(sectors: string[] | string) {
  if (!sectors || (Array.isArray(sectors) && sectors.length === 0)) {
    throw new Error("At least one sector is required");
  }

  return Array.isArray(sectors) ? sectors.join(",") : sectors;
}

/* =========================================================
   SERVICE
========================================================= */

export const sectorService = {
  /**
   * GET /api/v1/{country}/market-pulse/sectors/latest
   * Optional query:
   *   ?sort_by=alpha_confluence_index
   */
  sectorsLatest(country: CountryCode, sort_by?: string, signal?: AbortSignal) {
    return api.get<SectorsLatestResponse>(
      `/api/v1/${country}/market-pulse/sectors/latest`,
      {
        params: sort_by ? { sort_by } : undefined,
        signal,
      },
    );
  },

  /**
   * GET /api/v1/{country}/market-pulse/sectors/history
   * Example:
   *   ?sectors=Financial Services,IT,Energy&days=30
   */
  sectorsHistory(
    country: CountryCode,
    sectors: string[] | string,
    days: number = 30,
    signal?: AbortSignal,
  ) {
    const safeDays = Math.max(1, Math.min(90, Math.trunc(days || 30)));

    return api.get<SectorsHistoryResponse>(
      `/api/v1/${country}/market-pulse/sectors/history`,
      {
        params: {
          sectors: sectorsToQuery(sectors),
          days: safeDays,
        },
        signal,
      },
    );
  },

  /**
   * GET /api/v1/{country}/market-pulse/sectors/{sectorName}/history
   * Example:
   *   /sectors/Financial Services/history?days=30
   */
  singleSectorHistory(
    country: CountryCode,
    sectorName: string,
    days: number = 30,
    signal?: AbortSignal,
  ) {
    if (!sectorName) {
      throw new Error("sectorName is required");
    }

    const safeDays = Math.max(1, Math.min(90, Math.trunc(days || 30)));

    return api.get<ApiEnvelope<SectorHistoryPoint[]>>(
      `/api/v1/${country}/market-pulse/sectors/${encodeURIComponent(
        sectorName,
      )}/history`,
      {
        params: { days: safeDays },
        signal,
      },
    );
  },
};

/* =========================================================
   OPTIONAL: SECTOR CONSTANTS (India)
========================================================= */

export const IN_SECTORS = {
  FINANCIAL_SERVICES: "Financial Services",
  IT: "IT",
  ENERGY: "Energy",
  FMCG: "FMCG",
  PHARMA: "Pharma",
  AUTO: "Auto",
  METAL: "Metal",
};
