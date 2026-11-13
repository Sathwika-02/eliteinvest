"use client";

import { cn } from "@/lib/utils";
import { getScoreHex, scoreDefinitions } from "@/lib/mock-data";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreBarProps {
  scoreKey: "KFI" | "CNS" | "IES" | "ACI";
  value: number;
  showTooltip?: boolean;
}

export function ScoreBar({
  scoreKey,
  value,
  showTooltip = true,
}: ScoreBarProps) {
  const def = scoreDefinitions[scoreKey];
  const color = getScoreHex(value);

  return (
    <div className="flex items-center gap-3 group">
      <div className="flex items-center gap-1.5 w-28 shrink-0">
        <span className="text-xs font-bold text-foreground tracking-wide">
          {scoreKey}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          ({def.label})
        </span>
        {showTooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-3 w-3" />
                <span className="sr-only">Info about {def.full}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[300px]">
              <p className="font-semibold text-background mb-1">{def.full}</p>
              <p className="text-background/80 text-[11px] leading-relaxed">
                {def.friendly}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative">
        {/* Zone indicators */}
        <div className="absolute inset-0 flex">
          <div className="w-[30%] bg-[#ef4444]/10" />
          <div className="w-[20%] bg-[#f97316]/10" />
          <div className="w-[20%] bg-[#eab308]/10" />
          <div className="w-[15%] bg-[#22c55e]/10" />
          <div className="w-[15%] bg-[#16a34a]/10" />
        </div>
        <div
          className="h-full rounded-full relative transition-all duration-1000 ease-out"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span
        className="text-sm font-mono font-bold w-12 text-right tabular-nums"
        style={{ color }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

interface ScoreBreakdownProps {
  kfi: number;
  cns: number;
  ies: number;
  aci: number;
}

export function ScoreBreakdown({ kfi, cns, ies, aci }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      <ScoreBar scoreKey="KFI" value={kfi} />
      <ScoreBar scoreKey="CNS" value={cns} />
      <ScoreBar scoreKey="IES" value={ies} />
      <div className="pt-2 border-t border-border">
        <ScoreBar scoreKey="ACI" value={aci} />
      </div>
    </div>
  );
}
