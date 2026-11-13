"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountry } from "@/app/providers";
import { marketPulseService } from "@/lib/services/marketPulse.service";

type ApiEnvelope<T> = { success: boolean; data: T; error: any; request_id: string };

type ScoreDefinition = {
  code: string; // "KFI" | "CNS" | "IES" | "ACI"
  name: string;
  description: string;
};

type ScoreDefinitionsData = {
  definitions: ScoreDefinition[];
};

function safePayload<T>(res: any): T {
  return (res?.success !== undefined ? res : res?.data) as T;
}

const DEFAULT_DEFS: Record<
  string,
  {
    accent: string;
    quote: string;
    hint: string;
    hintTone: "good" | "warn";
  }
> = {
  KFI: {
    accent: "bg-blue-500",
    quote: "Is the rally real or fake?",
    hint: "High KFI = broad strength. Low KFI = narrow / weak move.",
    hintTone: "good",
  },
  CNS: {
    accent: "bg-purple-500",
    quote: "What is smart money expecting?",
    hint: "High CNS = professionals optimistic. Low CNS = pessimistic.",
    hintTone: "good",
  },
  IES: {
    accent: "bg-orange-500",
    quote: "Am I buying cheap or expensive?",
    hint: "Low IES = undervalued (bargain zone). High IES = overpriced (expensive zone).",
    hintTone: "warn",
  },
  ACI: {
    accent: "bg-red-500",
    quote: "Bottom line — should I invest now or wait?",
    hint: "Low ACI = Fear / Opportunity. High ACI = Greed / Overpriced.",
    hintTone: "good",
  },
};

// keep order stable like your UI
const ORDER = ["KFI", "CNS", "IES", "ACI"];

export function InfoGuide() {
  const { country } = useCountry();
  const [isOpen, setIsOpen] = useState(false);

  const [loadingDefs, setLoadingDefs] = useState(false);
  const [defs, setDefs] = useState<ScoreDefinition[]>([]);

  useEffect(() => {
    if (!isOpen) return; // fetch only when expanded
    if (!country?.apiCode) return;

    const controller = new AbortController();

    async function load() {
      try {
        setLoadingDefs(true);
        const res = await marketPulseService.scoreDefinitions(country.apiCode as any);
        const payload = safePayload<ApiEnvelope<ScoreDefinitionsData>>(res);
        const list = payload?.data?.definitions ?? [];
        setDefs(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("scoreDefinitions failed:", e);
        setDefs([]);
      } finally {
        setLoadingDefs(false);
      }
    }

    load();
    return () => controller.abort();
  }, [isOpen, country?.apiCode]);

  const orderedDefs = useMemo(() => {
    if (!defs.length) return [];
    const map = new Map(defs.map((d) => [String(d.code || "").toUpperCase(), d]));
    return ORDER.map((c) => map.get(c)).filter(Boolean) as ScoreDefinition[];
  }, [defs]);

  return (
    <Card className="border-border bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer",
          "hover:bg-accent/30 transition-colors rounded-lg"
        )}
        type="button"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            How to Read These Scores
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            — First-time user guide
          </span>
        </div>

        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <CardContent className="pt-0 pb-4">
          <div className="space-y-5">
            {/* 3-Step Funnel */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                The 3-Level Drill-Down Funnel
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StepCard
                  step={1}
                  title="Market Snapshot"
                  description="Is the overall market cheap or expensive right now?"
                />
                <StepCard
                  step={2}
                  title="Explore Sectors"
                  description="Which sector is most beaten-down and has the best opportunity?"
                />
                <StepCard
                  step={3}
                  title="Pick Stocks"
                  description="Within that sector, which specific stock should I look at?"
                />
              </div>
            </div>

            {/* Color Legend */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Score Color Coding
              </h4>

              <div className="flex flex-wrap gap-3">
                <ColorLegend color="#ef4444" range="0-30" label="Bearish / Opportunity" />
                <ColorLegend color="#f97316" range="30-50" label="Cautious" />
                <ColorLegend color="#eab308" range="50-70" label="Neutral" />
                <ColorLegend color="#22c55e" range="70-85" label="Bullish" />
                <ColorLegend color="#16a34a" range="85-100" label="Extremely Bullish" />
              </div>
            </div>

            {/* Score Definitions from API */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Understanding the Scores
              </h4>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                {loadingDefs ? (
                  <div className="space-y-3">
                    {ORDER.map((k) => (
                      <div key={k} className="flex gap-3">
                        <div className="w-1.5 rounded-full shrink-0 bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-full bg-muted rounded animate-pulse" />
                          <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orderedDefs.length ? (
                  orderedDefs.map((d) => {
                    const code = String(d.code || "").toUpperCase();
                    const meta = DEFAULT_DEFS[code] ?? {
                      accent: "bg-slate-500",
                      quote: "",
                      hint: "",
                      hintTone: "good" as const,
                    };

                    return (
                      <DefinitionRow
                        key={code}
                        accent={meta.accent}
                        code={code}
                        title={d.name}
                        quote={""}
                        description={d.description}
                        hint={meta.hint}
                        hintTone={meta.hintTone}
                      />
                    );
                  })
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No score definitions available.
                  </div>
                )}
              </div>
            </div>

            {/* Key Insight */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-bold">Key Insight: </span>
                Think of it as a funnel — Market then Sector then Stock — that
                takes you from "should I invest?" to "exactly which stock to
                consider." Low ACI at any level signals fear and potential
                opportunity; high ACI signals greed and potential risk.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function ColorLegend({
  color,
  range,
  label,
}: {
  color: string;
  range: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5">
      <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs font-mono text-foreground tabular-nums">{range}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function DefinitionRow({
  accent,
  code,
  title,
  quote,
  description,
  hint,
  hintTone = "good",
}: {
  accent: string; // e.g. "bg-blue-500"
  code: string; // "KFI"
  title: string; // from API
  quote: string; // local (optional)
  description: string; // from API
  hint: string; // local (optional)
  hintTone?: "good" | "warn";
}) {
  return (
    <div className="flex gap-3">
      <div className={cn("w-1.5 rounded-full shrink-0", accent)} />
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xs font-semibold text-foreground">
            {code}
            <span className="text-muted-foreground"> — </span>
            {title}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {quote ? <span className="italic">“{quote}”</span> : null}
          {quote ? " — " : null}
          {description}
        </p>

        {!!hint && (
          <p
            className={cn(
              "text-xs font-medium",
              hintTone === "good" ? "text-emerald-600" : "text-amber-600"
            )}
          >
            ✓ {hint}
          </p>
        )}
      </div>
    </div>
  );
}