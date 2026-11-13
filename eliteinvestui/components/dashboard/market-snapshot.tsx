"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

import { useCountry } from "@/app/providers";
import { marketPulseService } from "@/lib/services/marketPulse.service";
import { AciGauge } from "./aci-gauge";
import { ScoreBreakdown } from "./score-bar";

type IndexRow = {
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
  calculation_date: string;
  index_symbol: string;
  index_name: string;
  index_value: string;
  index_change: string;
  index_change_pct: string;
  days_of_data: number;
  calibration_status: string;
};

function formatDate(d: string) {
  // "2026-02-13" -> "13 Feb 2026"
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function asNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function MarketSnapshot({
  selectedIndex,
  onIndexChange,
}: {
  selectedIndex: string;
  onIndexChange: (value: string) => void;
}) {
  const { country } = useCountry();
  const [indices, setIndices] = useState<IndexRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);

        const res = await marketPulseService.indicesLatest(country.apiCode);
        if (!active) return;

        const rows = res?.data ?? [];
        setIndices(rows);

        if (rows.length > 0) {
          const exists = rows.some((r: IndexRow) => r.index_symbol === selectedIndex);
          if (!exists) onIndexChange(rows[0].index_symbol);
        }
      } catch (err) {
        console.error("Failed to fetch indices:", err);
        setIndices([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [country.apiCode]); // ✅ re-fetch on country change

  const data = useMemo(() => {
    return indices.find((i) => i.index_symbol === selectedIndex);
  }, [selectedIndex, indices]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading market data for {country.name}...
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const indexValue = asNumber(data.index_value);
  const indexChange = asNumber(data.index_change);
  const indexChangePct = asNumber(data.index_change_pct);

  const kfi = asNumber(data.kinetic_flow_index);
  const cns = asNumber(data.consilium_score);
  const ies = asNumber(data.intrinsic_edge_score);
  const aci = asNumber(data.alpha_confluence_index);

  const isNegative = indexChange < 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              Market Snapshot <span className="text-muted-foreground">({country.code})</span>
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              Latest index mood + components (KFI / CNS / IES / ACI)
            </div>
          </div>

          <Badge variant="secondary" className="uppercase tracking-wide">
            {data.index_symbol}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ✅ Top KPI strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Name + Value */}
          <div className="md:col-span-5 rounded-xl border bg-background/40 p-4">
            <div className="text-sm text-muted-foreground">{data.index_name}</div>
            <div className="mt-1 flex items-end gap-2">
              <div className="text-3xl font-mono font-bold">
                {indexValue.toLocaleString(country.code === "IN" ? "en-IN" : "en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold mb-1",
                  isNegative ? "text-red-500" : "text-green-600"
                )}
              >
                {isNegative ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                {isNegative ? "" : "+"}
                {indexChange.toFixed(2)} ({isNegative ? "" : "+"}
                {indexChangePct.toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-3 rounded-xl border bg-background/40 p-4">
            <div className="text-sm text-muted-foreground">Calibration</div>
            <div className="mt-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{data.calibration_status}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Days of data: <span className="font-medium text-foreground">{data.days_of_data}</span>
            </div>
          </div>

          {/* Date */}
          <div className="md:col-span-4 rounded-xl border bg-background/40 p-4">
            <div className="text-sm text-muted-foreground">Calculation Date</div>
            <div className="mt-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{formatDate(data.calculation_date)}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Updated per market session
            </div>
          </div>
        </div>

        {/* ✅ Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Gauge card */}
          <div className="lg:col-span-5 rounded-2xl border bg-background/40 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">ACI Gauge</div>
              <Badge variant="outline" className="font-mono">
                {aci.toFixed(2)}
              </Badge>
            </div>

            <div className="h-[260px] flex items-center justify-center">
              <AciGauge value={aci} />
            </div>

            <div className="text-xs text-muted-foreground text-center">
              ACI = composite mood score based on Momentum, Sentiment, Valuation
            </div>
          </div>

          {/* Breakdown card */}
          <div className="lg:col-span-7 rounded-2xl border bg-background/40 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Score Breakdown</div>
              <div className="text-xs text-muted-foreground">0–100 scale</div>
            </div>

            <div className="mt-4">
              <ScoreBreakdown kfi={kfi} cns={cns} ies={ies} aci={aci} />
            </div>

            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="rounded-lg border bg-background/60 p-2">
                <div className="text-muted-foreground">KFI</div>
                <div className="font-mono font-semibold">{kfi.toFixed(2)}</div>
              </div>
              <div className="rounded-lg border bg-background/60 p-2">
                <div className="text-muted-foreground">CNS</div>
                <div className="font-mono font-semibold">{cns.toFixed(2)}</div>
              </div>
              <div className="rounded-lg border bg-background/60 p-2">
                <div className="text-muted-foreground">IES</div>
                <div className="font-mono font-semibold">{ies.toFixed(2)}</div>
              </div>
              <div className="rounded-lg border bg-background/60 p-2">
                <div className="text-muted-foreground">ACI</div>
                <div className="font-mono font-semibold">{aci.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}