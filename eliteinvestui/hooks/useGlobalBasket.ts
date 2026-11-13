"use client";

import { useEffect, useRef, useState } from "react";
import {  
 globalBasketService, BasketCoverageRow, BasketCompositionRow, BasketPulseRow,
  BasketConvictionRow, BasketEntryPlanRow, BasketGateReadinessRow,
  BasketAnalystForecastRow, BasketPerformanceRow, BasketRiskRow,
  BasketExitSignalRow, BasketDividendRow, BasketSyncOverviewRow,
  BasketSyncRiskCoverageRow,
} from "@/lib/services/global basket.service";

function extract<T>(res: any): T {
  if (res == null) return res as T;
  if ("success" in res && "data" in res) return res.data as T;
  if ("data" in res) return res.data as T;
  return res as T;
}

export interface GlobalBasketState {
  loading: boolean;
  error: string | null;
  symbols: string[];
  coverage:          BasketCoverageRow[];
  composition:       BasketCompositionRow[];
  pulse:             BasketPulseRow[];
  conviction:        BasketConvictionRow[];
  entryPlans:        BasketEntryPlanRow[];
  gateReadiness:     BasketGateReadinessRow[];
  analystForecast:   BasketAnalystForecastRow[];
  performance:       BasketPerformanceRow[];
  risk:              BasketRiskRow[];
  exitSignals:       BasketExitSignalRow[];
  dividends:         BasketDividendRow[];
  syncOverview:      BasketSyncOverviewRow[];
  syncRiskCoverage:  BasketSyncRiskCoverageRow[];
}

const EMPTY: GlobalBasketState = {
  loading: false, error: null, symbols: [],
  coverage: [], composition: [], pulse: [], conviction: [],
  entryPlans: [], gateReadiness: [], analystForecast: [],
  performance: [], risk: [], exitSignals: [], dividends: [],
  syncOverview: [], syncRiskCoverage: [],
};

/**
 * Fetches all 13 global basket APIs ONLY for the selected symbols.
 * Every endpoint receives ?symbols=A,B,C — no all-stock queries.
 * Re-fetches when countryCode or selectedSymbols changes.
 */
export function useGlobalBasket(
  countryCode?: string,
  selectedSymbols: string[] = [],   // ← the stocks the user picked
) {
  const [state, setState] = useState<GlobalBasketState>(EMPTY);
  const fetchId = useRef(0);

  // Stable key — sorted so symbol order doesn't cause unnecessary re-fetches
  const symbolKey = selectedSymbols.slice().sort().join(",");

  useEffect(() => {
    if (!countryCode || selectedSymbols.length === 0) {
      setState({ ...EMPTY, loading: false });
      return;
    }

    const thisId = ++fetchId.current;
    const ac  = new AbortController();
    const sig = ac.signal;
    const syms = selectedSymbols; // snapshot for this fetch
    const country = countryCode; // narrower local alias

    setState(p => ({ ...p, loading: true, error: null }));

    async function fetchAll() {
      try {
        // All 13 endpoints in parallel — each gets ?symbols=HDFCBANK,SUNPHARMA,...
        const [
          coverageRes, compositionRes, pulseRes, convictionRes,
          entryPlansRes, gateReadinessRes, analystForecastRes,
          performanceRes, riskRes, exitSignalsRes, dividendsRes,
          syncOverviewRes, syncRiskCoverageRes,
        ] = await Promise.all([
          globalBasketService.getCoverage(country,        syms, sig),
          globalBasketService.getComposition(country,     syms, sig),
          globalBasketService.getPulse(country,           syms, sig),
          globalBasketService.getConviction(country,      syms, sig),
          globalBasketService.getEntryPlans(country,      syms, sig),
          globalBasketService.getGateReadiness(country,   syms, sig),
          globalBasketService.getAnalystForecast(country, syms, sig),
          globalBasketService.getPerformance(country,     syms, sig),
          globalBasketService.getRisk(country,            syms, sig),
          globalBasketService.getExitSignals(country,     syms, sig),
          globalBasketService.getDividends(country,       syms, sig),
          globalBasketService.getSyncOverview(country,    syms, sig),
          globalBasketService.getSyncRiskCoverage(country,syms, sig),
        ]);

        if (thisId !== fetchId.current) return; // stale — discard

        const arr = <T>(res: any): T[] => {
          const d = extract<T[]>(res);
          return Array.isArray(d) ? d : [];
        };

        setState({
          loading: false,
          error: null,
          symbols: syms,
          coverage:         arr<BasketCoverageRow>(coverageRes),
          composition:      arr<BasketCompositionRow>(compositionRes),
          pulse:            arr<BasketPulseRow>(pulseRes),
          conviction:       arr<BasketConvictionRow>(convictionRes),
          entryPlans:       arr<BasketEntryPlanRow>(entryPlansRes),
          gateReadiness:    arr<BasketGateReadinessRow>(gateReadinessRes),
          analystForecast:  arr<BasketAnalystForecastRow>(analystForecastRes),
          performance:      arr<BasketPerformanceRow>(performanceRes),
          risk:             arr<BasketRiskRow>(riskRes),
          exitSignals:      arr<BasketExitSignalRow>(exitSignalsRes),
          dividends:        arr<BasketDividendRow>(dividendsRes),
          syncOverview:     arr<BasketSyncOverviewRow>(syncOverviewRes),
          syncRiskCoverage: arr<BasketSyncRiskCoverageRow>(syncRiskCoverageRes),
        });
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("useGlobalBasket error:", err);
        if (thisId === fetchId.current) {
          setState(p => ({ ...p, loading: false, error: err?.message ?? "Failed to load basket data" }));
        }
      }
    }

    fetchAll();
    return () => { ac.abort(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, symbolKey]); // re-fetch only when country OR symbols change

  return state;
}