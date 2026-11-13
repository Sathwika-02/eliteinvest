"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCountry } from "@/app/providers";
import { Card, CardContent } from "@/components/ui/card";
import { ValuationDiscoveryStepper } from "@/components/fundamentalgate/stepper";
import { FundamentalProvider } from "@/contexts/fundamental-context";
import { FundamentalGroupTable } from "@/components/fundamentalgate/fundamental-group-table";
import { FundamentalDetail } from "@/components/fundamentalgate/fundamental-detail";
import {
  fundamentalService,
  type FundamentalCategoryRow,
  type FundamentalGroupRow,
  type FundamentalHeatmapRow,
  type FundamentalPipelineFunnelRow,
  type FundamentalPipelineRow,
  type FundamentalScorecard,
  type FundamentalScreenerRow,
  type FundamentalSectorRow,
  type FundamentalSignatoryCandidateRow,
} from "@/lib/services/fundamental.service";
import { useValuation } from "@/contexts/valuation-discovery-context";

type ViewMode = "group" | "detail";

type StoredStock = {
  symbol?: string;
  [key: string]: unknown;
};

export default function ValuationDiscoveryPage() {
  const router = useRouter();
  const { country } = useCountry();
  const { state, dispatch } = useValuation();

  const selectedStocks = state.selectedStocks;

  const [viewMode, setViewMode] = useState<ViewMode>("group");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [groupRows, setGroupRows] = useState<FundamentalGroupRow[]>([]);
  const [scorecard, setScorecard] = useState<FundamentalScorecard | null>(null);
  const [sectors, setSectors] = useState<FundamentalSectorRow[]>([]);
  const [pipeline, setPipeline] = useState<FundamentalPipelineRow[]>([]);
  const [heatmap, setHeatmap] = useState<FundamentalHeatmapRow[]>([]);
  const [screener, setScreener] = useState<FundamentalScreenerRow[]>([]);
  const [signatoryCandidates, setSignatoryCandidates] = useState<
    FundamentalSignatoryCandidateRow[]
  >([]);
  const [pipelineFunnel, setPipelineFunnel] = useState<
    FundamentalPipelineFunnelRow[]
  >([]);

  const [stockDetail, setStockDetail] = useState<FundamentalGroupRow | null>(null);
  const [categories, setCategories] = useState<FundamentalCategoryRow[]>([]);
useEffect(() => {
  if (!selectedStocks || selectedStocks.length === 0) {
    setSymbols([]);
    return;
  }

  const selected = selectedStocks
    .map((s) => String(s.symbol || "").trim())
    .filter(Boolean);

  setSymbols(selected);

  if (selected.length > 0) {
    setSelectedSymbol(selected[0]);
  }
}, [selectedStocks]);

  useEffect(() => {
    if (!country?.apiCode || symbols.length === 0) {
      setLoadingGroup(false);
      return;
    }

    const ac = new AbortController();
    let active = true;

    (async () => {
      try {
        setLoadingGroup(true);
        setErrorMsg("");

        const [
          groupRes,
          scoreRes,
          sectorRes,
          heatmapRes,
          pipelineRes,
          screenerRes,
          signatoryRes,
          funnelRes,
        ] = await Promise.all([
          fundamentalService.getFundamentalGroup(
            country.apiCode,
            symbols,
            ac.signal,
          ),
          fundamentalService.getFundamentalScorecard(
            country.apiCode,
            symbols,
            ac.signal,
          ),
          fundamentalService.getFundamentalSectors(country.apiCode, ac.signal),
          fundamentalService.getFundamentalHeatmap(
            country.apiCode,
            symbols,
            ac.signal,
          ),
          fundamentalService.getFundamentalPipeline(country.apiCode, ac.signal),
          fundamentalService.getFundamentalScreener(country.apiCode, ac.signal),
          fundamentalService.getFundamentalSignatoryCandidates(
            country.apiCode,
            ac.signal,
          ),
          fundamentalService.getFundamentalPipelineFunnel(
            country.apiCode,
            ac.signal,
          ),
        ]);

        if (!active) return;

        const groupData = groupRes.data ?? [];
        const scoreData = scoreRes.data ?? null;
        const sectorData = sectorRes.data ?? [];
        const heatmapData = heatmapRes.data ?? [];
        const pipelineData = pipelineRes.data ?? [];
        const screenerData = screenerRes.data ?? [];
        const signatoryData = signatoryRes.data ?? [];
        const funnelData = funnelRes.data ?? [];

        console.log("GroupData",groupData);

        setGroupRows(groupData);
        setScorecard(scoreData);
        setHeatmap(heatmapData);
        setScreener(screenerData);
        setSignatoryCandidates(signatoryData);
        setPipelineFunnel(funnelData);

        const selectedSectorSet = new Set(
          groupData.map((row:any) => row.sector).filter(Boolean),
        );

        setSectors(
          sectorData.filter((row:any) => selectedSectorSet.has(row.sector)),
        );

        const selectedSymbolSet = new Set(symbols);
        setPipeline(
          pipelineData.filter((row:any) => selectedSymbolSet.has(row.symbol)),
        );
      } catch {
        if (!active) return;

        setErrorMsg("Failed to load fundamental evaluation data.");
        setGroupRows([]);
        setScorecard(null);
        setSectors([]);
        setPipeline([]);
        setHeatmap([]);
        setScreener([]);
        setSignatoryCandidates([]);
        setPipelineFunnel([]);
      } finally {
        if (active) setLoadingGroup(false);
      }
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [country?.apiCode, symbols]);

  useEffect(() => {
    if (!country?.apiCode || !selectedSymbol) return;

    const ac = new AbortController();
    let active = true;

    (async () => {
      try {
        setLoadingDetail(true);

        const [detailRes, categoriesRes] = await Promise.all([
          fundamentalService.getFundamentalStock(
            country.apiCode,
            selectedSymbol,
            ac.signal,
          ),
          fundamentalService.getFundamentalCategories(
            country.apiCode,
            selectedSymbol,
            ac.signal,
          ),
        ]);

        if (!active) return;

        setStockDetail(detailRes && "data" in detailRes ? detailRes.data : detailRes ?? null);
        setCategories(categoriesRes && "data" in categoriesRes ? categoriesRes.data : categoriesRes ?? []);
      } catch {
        if (!active) return;
        setStockDetail(null);
        setCategories([]);
      } finally {
        if (active) setLoadingDetail(false);
      }
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [country?.apiCode, selectedSymbol]);

  const selectedHeatmap = useMemo(
    () => heatmap.filter((row) => row.symbol === selectedSymbol),
    [heatmap, selectedSymbol],
  );

  const selectedPipeline = useMemo(
    () => pipeline.find((row) => row.symbol === selectedSymbol) ?? null,
    [pipeline, selectedSymbol],
  );

  return (
    <FundamentalProvider>
      <div className="min-h-screen bg-[#f6faf7] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <ValuationDiscoveryStepper activeStep={1} />

        {errorMsg ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMsg}
          </div>
        ) : null}

        {loadingGroup ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-slate-500">
              Loading valuation discovery...
            </CardContent>
          </Card>
        ) : groupRows.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <div className="text-lg font-semibold text-slate-900">
                No selected stocks found
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Select stocks from the dashboard and click Add To Wizard.
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "group" ? (
          <FundamentalGroupTable
            onSelectStock={(symbol) => {
              setSelectedSymbol(symbol);
              setViewMode("detail");
            }}
            onRemoveStocks={(symbols) => {
              dispatch({ type: "REMOVE_STOCKS", payload: symbols });
              const remaining = state.selectedStocks.filter((s) => !symbols.includes(s.symbol));
              setSymbols(remaining.map((s) => s.symbol));
            }}
            onSelectionChange={(symbols) => {
              setSelectedSymbols(symbols);
            }}
            onNext={(symbols) => {
              setSelectedSymbols(symbols);
              const params = new URLSearchParams();
              if (symbols.length > 0) params.set("symbols", symbols.join(","));
              router.push("/fundamentalgate/technical" + (symbols.length > 0 ? `?${params.toString()}` : ""));
            }}
          />
        ) : (
          <FundamentalDetail
            stockDetail={stockDetail}
            categories={categories}
            heatmap={selectedHeatmap}
            pipeline={selectedPipeline}
            allStocks={groupRows}
            selectedSymbol={selectedSymbol}
            selectedSymbols={selectedSymbols}
            loading={loadingDetail}
            onBack={() => setViewMode("group")}
            onSelectSymbol={setSelectedSymbol}
          />
        )}
      </div>
    </div>
    </FundamentalProvider>
  );
}
