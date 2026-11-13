"use client";

import { createContext, useContext, useMemo } from "react";
import { useCountry } from "@/app/providers";
import { useValuation } from "./valuation-discovery-context";
import { useFundamentalDiscovery } from "@/hooks/useFundamentalDiscovery";

type FundamentalContextType = ReturnType<typeof useFundamentalDiscovery>;

const FundamentalContext = createContext<FundamentalContextType | null>(null);

export function FundamentalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useValuation();
  const { country } = useCountry();

  const symbols = useMemo(
    () => state.selectedStocks.map((s: any) => s.symbol),
    [state.selectedStocks],
  );

  const data = useFundamentalDiscovery(country?.apiCode, symbols);

  return (
    <FundamentalContext.Provider value={data}>
      {children}
    </FundamentalContext.Provider>
  );
}

export function useFundamental() {
  const ctx = useContext(FundamentalContext);

  if (!ctx) {
    throw new Error("useFundamental must be used inside FundamentalProvider");
  }

  return ctx;
}