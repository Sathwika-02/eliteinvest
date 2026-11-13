"use client";

import { useEffect, useState } from "react";
import {
  fundamentalService,
  type FundamentalGroupRow,
  type FundamentalScorecard,
  type FundamentalSectorRow,
  type FundamentalHeatmapRow,
  type FundamentalPipelineRow,
  type FundamentalScreenerRow,
  type FundamentalSignatoryCandidateRow,
  type FundamentalPipelineFunnelRow,
} from "@/lib/services/fundamental.service";

export function useFundamentalDiscovery(
  countryCode?: string,
  symbols: string[] = [],
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [groupRows, setGroupRows] = useState<FundamentalGroupRow[]>([]);
  const [scorecard, setScorecard] = useState<FundamentalScorecard | null>(null);
  const [sectors, setSectors] = useState<FundamentalSectorRow[]>([]);
  const [pipeline, setPipeline] = useState<FundamentalPipelineRow[]>([]);
  const [heatmap, setHeatmap] = useState<FundamentalHeatmapRow[]>([]);
  const [screener, setScreener] = useState<FundamentalScreenerRow[]>([]);
  const [signatoryCandidates, setSignatoryCandidates] =
    useState<FundamentalSignatoryCandidateRow[]>([]);
  const [pipelineFunnel, setPipelineFunnel] =
    useState<FundamentalPipelineFunnelRow[]>([]);

  useEffect(() => {
    const currentCode = countryCode;
    if (!currentCode || symbols.length === 0) {
      setGroupRows([]);
      setLoading(false);
      return;
    }

    const code = currentCode;
    const ac = new AbortController();
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

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
            code,
            symbols,
            ac.signal,
          ),
          fundamentalService.getFundamentalScorecard(
            code,
            symbols,
            ac.signal,
          ),
          fundamentalService.getFundamentalSectors(code, ac.signal),
          fundamentalService.getFundamentalHeatmap(
            code,
            symbols,
            ac.signal,
          ),
          fundamentalService.getFundamentalPipeline(code, ac.signal),
          fundamentalService.getFundamentalScreener(code, ac.signal),
          fundamentalService.getFundamentalSignatoryCandidates(
            code,
            ac.signal,
          ),
          fundamentalService.getFundamentalPipelineFunnel(
            code,
            ac.signal,
          ),
        ]);

        if (!active) return;

        const groupData = Array.isArray(groupRes) ? groupRes : groupRes?.data ?? [];
        const sectorData = Array.isArray(sectorRes) ? sectorRes : sectorRes?.data ?? [];
        const pipelineData = Array.isArray(pipelineRes) ? pipelineRes : pipelineRes?.data ?? [];
        console.log("Group Data",groupData,sectorData,pipelineData);

        setGroupRows(groupData);
        setScorecard(scoreRes && "data" in scoreRes ? scoreRes.data : scoreRes ?? null);
        setHeatmap(heatmapRes && "data" in heatmapRes ? heatmapRes.data : heatmapRes ?? []);
        setScreener(screenerRes && "data" in screenerRes ? screenerRes.data : screenerRes ?? []);
        setSignatoryCandidates(signatoryRes && "data" in signatoryRes ? signatoryRes.data : signatoryRes ?? []);
        setPipelineFunnel(funnelRes && "data" in funnelRes ? funnelRes.data : funnelRes ?? []);

        /**
         * Filter sectors based on selected stocks
         */
        const sectorSet = new Set(
          groupData.map((row) => row.sector).filter(Boolean),
        );

        setSectors(
          sectorData.filter((row) => sectorSet.has(row.sector)),
        );

        /**
         * Filter pipeline based on selected symbols
         */
        const symbolSet = new Set(symbols);

        setPipeline(
          pipelineData.filter((row) => symbolSet.has(row.symbol)),
        );

      } catch (err) {
        if (!active) return;
        console.error(err);
        setError("Failed to load fundamental evaluation data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
      ac.abort();
    };

  }, [countryCode, symbols]);

  return {
    loading,
    error,
    groupRows,
    scorecard,
    sectors,
    pipeline,
    heatmap,
    screener,
    signatoryCandidates,
    pipelineFunnel,
  };
}