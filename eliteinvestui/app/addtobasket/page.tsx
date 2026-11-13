"use client";

import { useMemo } from "react";
import { useCountry } from "@/app/providers";
import { ValuationDiscoveryStepper } from "@/components/fundamentalgate/stepper";
import { AddToBasket } from "@/components/addtobasket/add-to-basket";
import { useValuation } from "@/contexts/valuation-discovery-context";
import { useGlobalBasket } from "@/hooks/useGlobalBasket";
import { GlobalBasketDashboard } from "@/components/addtobasket/global-basket-dashboard";

export default function AddToBasketPage() {
  const { country } = useCountry();
  const { state } = useValuation();

  const countryCode = country?.apiCode ?? "in";

  // Stable symbol list — only the stocks the user selected in previous steps
  const selectedStocks = useMemo(
    () => state.selectedStocks,
    [state.selectedStocks],
  );

  // Extract just the symbol strings for the API calls
  const selectedSymbols = useMemo(
    () => selectedStocks.map((s: any) => s.symbol),
    [selectedStocks],
  );

  // Fetches all 13 global basket APIs with ?symbols=HDFCBANK,SUNPHARMA,...
  // Only re-fetches when countryCode or selectedSymbols actually changes
  const basketData = useGlobalBasket(countryCode, selectedSymbols);

  return (
    <div className="min-h-screen bg-[#f6faf7] p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Step indicator */}
        <ValuationDiscoveryStepper activeStep={3} />

        {/* Add to basket — shows selected stocks + basket picker */}
        <AddToBasket selectedStocks={selectedStocks} />

        {/* Global basket analytics — only for the selected stocks */}
        {selectedSymbols.length > 0 ? (
          <GlobalBasketDashboard
            data={basketData}
            countryCode={countryCode}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            Select stocks in the previous steps to see analytics here.
          </div>
        )}

      </div>
    </div>
  );
}