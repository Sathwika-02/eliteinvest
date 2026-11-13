"use client";

import { useMemo, useState } from "react";
import { useCountry } from "@/app/providers";
import { ValuationDiscoveryStepper } from "@/components/fundamentalgate/stepper";
import { useValuation } from "@/contexts/valuation-discovery-context";
import { useGlobalBasket } from "@/hooks/useGlobalBasket";
import { AddToBasket } from "@/components/addtobasket/add-to-basket";
import { GlobalBasketDashboard } from "@/components/addtobasket/global-basket-dashboard";

export default function AddToBasketPage() {
  const { country } = useCountry();
  const { state } = useValuation();
  const selectedStocks = state.selectedStocks;

  const countryCode = country?.apiCode ?? "in";

  // Fetch all 13 global basket APIs in parallel
  const basketData = useGlobalBasket(countryCode);

  return (
    <div className="min-h-screen bg-[#f6faf7] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <ValuationDiscoveryStepper activeStep={3} />

        {/* Add to Basket action */}
        <AddToBasket selectedStocks={selectedStocks} />

        {/* Full global basket analytics dashboard */}
        <GlobalBasketDashboard data={basketData} countryCode={countryCode} />
      </div>
    </div>
  );
}