"use client";

import { useEffect, useRef, useState } from "react";
import {
  technicalService,
  TechnicalGroupRow,
  TechnicalHeatmapRow,
  TechnicalScorecardRow,
  TechnicalSectorRow,
} from "@/lib/services/technical.service";

function unwrap<T>(res: any): T {
  if (res && typeof res === "object" && "data" in res) return res.data as T;
  return res as T;
}

export function useTechnicalDiscovery(
  countryCode?: string,
  symbols: string[] = [],
) {
  const [loading, setLoading] = useState(true);
  const [groupRows, setGroupRows] = useState<TechnicalGroupRow[]>([]);
  const [heatmap, setHeatmap] = useState<TechnicalHeatmapRow[]>([]);
  const [scorecard, setScorecard] = useState<TechnicalScorecardRow | null>(null);
  const [sectors, setSectors] = useState<TechnicalSectorRow[]>([]);

  const symbolKey = symbols.slice().sort().join(",");
  const fetchId = useRef(0);

  useEffect(() => {
    if (!countryCode || symbols.length === 0) {
      setGroupRows([]);
      setHeatmap([]);
      setScorecard(null);
      setSectors([]);
      setLoading(false);
      return;
    }

    const thisId = ++fetchId.current;
    const ac = new AbortController();

    async function fetchData() {
      setLoading(true);
      try {
        const [groupRes, heatmapRes, scorecardRes, sectorsRes] =
          await Promise.all([
            technicalService.getTechnicalGroup(countryCode!, symbols, ac.signal),
            technicalService.getTechnicalHeatmap(countryCode!, symbols, ac.signal),
            technicalService.getScorecard(countryCode!, symbols, ac.signal),
            technicalService.getSectors(countryCode!, ac.signal),
          ]);
          console.log("Scorecard Ress",scorecardRes);

        if (thisId !== fetchId.current) return;

        // ── DEBUG: paste these lines, check browser console, then remove ──
        console.log("scorecardRes (raw):", JSON.stringify(scorecardRes));
        console.log("groupRes (raw):", JSON.stringify(groupRes)?.slice(0, 200));
        // ─────────────────────────────────────────────────────────────────

        const group = unwrap<TechnicalGroupRow[]>(groupRes);
        const heat  = unwrap<TechnicalHeatmapRow[]>(heatmapRes);
        const card  = unwrap<TechnicalScorecardRow>(scorecardRes);
        const sects = unwrap<TechnicalSectorRow[]>(sectorsRes);

        console.log("scorecard (unwrapped):", card);
        console.log("group length:", group?.length);

        setGroupRows(Array.isArray(group) ? group : []);
        setHeatmap(Array.isArray(heat) ? heat : []);
        setScorecard(card ?? null);
        setSectors(Array.isArray(sects) ? sects : []);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("useTechnicalDiscovery error:", err);
      } finally {
        if (thisId === fetchId.current) setLoading(false);
      }
    }

    fetchData();

    return () => { ac.abort(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, symbolKey]);

  return { loading, groupRows, heatmap, scorecard, sectors };
}