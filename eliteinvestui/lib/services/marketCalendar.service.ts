// src/services/marketcalendar.service.ts
import { api } from "@/lib/apiClient";
import type { ApiEnvelope } from "./_types";

/**
 * Market Calendar - Status
 * GET /api/v1/market-calendar/status
 * Returns real-time status for every active market from vw_market_status.
 */

export type MarketCalendarStatusRow = {
  // Keeping these flexible because your Swagger may add/remove fields.
  // You can tighten this type once you paste the exact response shape.
  [key: string]: any;
};

export type MarketCalendarStatusResponse = ApiEnvelope<MarketCalendarStatusRow[]>;

export const marketCalendarService = {
  /**
   * GET /api/v1/market-calendar/status
   * No parameters
   */
  status(signal?: AbortSignal) {
    return api.get<MarketCalendarStatusResponse>(
      `/api/v1/market-calendar/status`,
      { signal }
    );
  },
};