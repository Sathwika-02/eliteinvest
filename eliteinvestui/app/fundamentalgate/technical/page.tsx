"use client";

import { useMemo, useState } from "react";
import { useCountry } from "@/app/providers";
import { useSearchParams } from "next/navigation";
import { useValuation } from "@/contexts/valuation-discovery-context";
import { useTechnicalDiscovery } from "@/hooks/useTechnicalDiscovery";
import { ValuationDiscoveryStepper } from "@/components/fundamentalgate/stepper";
import { TechnicalGroupTable } from "@/components/technical/technical-group-table";
import { TechnicalDetail } from "@/components/technical/technical-detail";

type ViewMode = "group" | "detail";

export default function TechnicalGatePage() {
  const { country } = useCountry();
  const { state } = useValuation();
  const searchParams = useSearchParams();

  const selectedSymbolsFromUrl = useMemo(() => {
    const param = searchParams.get("symbols");
    if (!param) return [];
    return param
      .split(",")
      .map((sym) => sym.trim())
      .filter(Boolean);
  }, [searchParams]);

  const symbols = useMemo(() => {
    if (selectedSymbolsFromUrl.length > 0) return selectedSymbolsFromUrl;
    return state.selectedStocks.map((s: any) => s.symbol);
  }, [selectedSymbolsFromUrl, state.selectedStocks]);

  const { loading, groupRows, heatmap, sectors, scorecard } =
    useTechnicalDiscovery(country?.apiCode, symbols);

  const [viewMode, setViewMode] = useState<ViewMode>("group");
  const [selectedSymbol, setSelectedSymbol] = useState("");

  const selectedSymbols = useMemo(
    () => state.selectedStocks.map((s:any) => String(s.symbol || "")).filter(Boolean),
    [state.selectedStocks],
  );

  if (loading) {
    return <div className="p-10 text-center">Loading Technical Gate...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <ValuationDiscoveryStepper activeStep={2} />

        {viewMode === "group" ? (
          <TechnicalGroupTable
            rows={groupRows}
            onSelectStock={(symbol) => {
              setSelectedSymbol(symbol);
              setViewMode("detail");
            }}
            sectors={sectors}
            scorecard={scorecard}
          />
        ) : (
          <TechnicalDetail
            symbol={selectedSymbol}
            countryCode={country?.apiCode ?? ""}
            rows={groupRows}
            heatmap={heatmap}
            selectedSymbols={selectedSymbols}
            onSelectSymbol={(symbol) => setSelectedSymbol(symbol)}
            onBack={() => setViewMode("group")}
          />
        )}

      </div>
    </div>
  );
}