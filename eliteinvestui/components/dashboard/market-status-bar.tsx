"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { marketCalendarService, type MarketCalendarStatusRow } from "@/lib/services/marketCalendar.service";
import { useCountry } from "@/app/providers";

// ── Helpers ───────────────────────────────────────────────────────────────────
function countryCodeToFlag(code: string): string {
  const mapped = code === "UK" ? "GB" : code;
  return String.fromCodePoint(
    ...mapped.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0))
  );
}

function toSecs(t: string): number {
  const parts = t.split(":");
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2] ?? "0");
}

function nowSecsInTz(tz: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")!.value);
  const m = parseInt(parts.find((p) => p.type === "minute")!.value);
  const s = parseInt(parts.find((p) => p.type === "second")!.value);
  return h * 3600 + m * 60 + s;
}

function liveTimeStr(tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date());
}
const MARKET_BG_COLORS = {
  IN: "bg-emerald-50/40",
  UK: "bg-blue-50/40",
  US: "bg-amber-50/40",
} as Record<string, string>;

function secsToHHMM(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getSessionFillPct(openSecs: number, closeSecs: number, nowSecs: number): number {
  if (nowSecs <= openSecs) return 0;
  if (nowSecs >= closeSecs) return 100;
  return ((nowSecs - openSecs) / (closeSecs - openSecs)) * 100;
}

function getNextEvent(openSecs: number, closeSecs: number, nowSecs: number, isOpen: boolean): string {
  if (isOpen) {
    const diff = Math.max(0, closeSecs - nowSecs);
    if (diff === 0) return "Closes in 0s";
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = Math.floor(diff % 60);
    if (h > 0) return `Closes in ${h}h ${m}m ${s}s`;
    if (m > 0) return `Closes in ${m}m ${s}s`;
    return `Closes in ${s}s`;
  } else {
    let diff = openSecs - nowSecs;
    if (diff < 0) diff += 86400;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = Math.floor(diff % 60);
    if (h > 0) return `Opens in ${h}h ${m}m ${s}s`;
    if (m > 0) return `Opens in ${m}m ${s}s`;
    return `Opens in ${s}s`;
  }
}

// Per-market color schemes
const MARKET_THEME:any = {
  IN: {
    gradient: "linear-gradient(90deg, #059669, #10b981, #34d399)",
    glow: "rgba(16,185,129,0.4)",
    dot: "bg-emerald-500",
    ping: "bg-emerald-400",
    track: "rgba(16,185,129,0.08)",
    closedGrad: "linear-gradient(90deg,#fca5a5,#f87171)",
  },
  UK: {
    gradient: "linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)",
    glow: "rgba(59,130,246,0.4)",
    dot: "bg-blue-500",
    ping: "bg-blue-400",
    track: "rgba(59,130,246,0.08)",
    closedGrad: "linear-gradient(90deg,#fca5a5,#f87171)",
  },
  US: {
    gradient: "linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)",
    glow: "rgba(245,158,11,0.4)",
    dot: "bg-amber-500",
    ping: "bg-amber-400",
    track: "rgba(245,158,11,0.08)",
    closedGrad: "linear-gradient(90deg,#fca5a5,#f87171)",
  },
} as Record<string, typeof MARKET_THEME["IN"]>;

const RULER_HOURS = Array.from({ length: 13 }, (_, i) => i * 2);
const LABEL_W = 210;
const RIGHT_W = 340;

interface MarketStatusBarProps {
  selectedMarket: string;
  onMarketSelect: (code: string) => void;
}

export function MarketStatusBar({ selectedMarket, onMarketSelect }: MarketStatusBarProps) {
  const { country } = useCountry();
  const [markets, setMarkets] = useState<MarketCalendarStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Fetch market status from API
  useEffect(() => {
    const abortController = new AbortController();

    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await marketCalendarService.status(abortController.signal);
        if (response.success && response.data) {
          setMarkets(response.data);
        } else {
          setError("Failed to fetch market status");
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMarkets();

    // Refresh every 30 seconds
    const intervalId = setInterval(fetchMarkets, 30000);

    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, []);

  // Update clock every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Filter markets based on selected country
  const filteredMarkets = country && country.code !== "ALL"
    ? markets.filter(m => m.market_code === country.code)
    : markets;

  // If no markets match the country, show all (fallback)
  const displayMarkets = markets;

  const browserNowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const needlePct = (browserNowSecs / 86400) * 100;
  const nowLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (loading && markets.length === 0) {
    return (
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl p-8 text-center text-gray-500">
          Loading market status...
        </div>
      </div>
    );
  }

  if (error && markets.length === 0) {
    return (
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl p-8 text-center text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl">

        {/* ── Ruler ── */}
        <div className="flex pt-3 pb-0" style={{ paddingLeft: LABEL_W, paddingRight: RIGHT_W }}>
          <div className="flex-1 relative">

            {/* Hour labels */}
            <div className="relative h-4 mb-1">
              {RULER_HOURS.map((h) => (
                <span
                  key={h}
                  className="absolute -translate-x-1/2 text-[9px] font-medium text-gray-400 tabular-nums"
                  style={{ left: `${(h / 24) * 100}%` }}
                >
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>

            {/* Ruler track */}
            <div className="relative" style={{ height: 16 }}>
              {/* Baseline */}
              <div className="absolute inset-x-0 top-[5px] h-[2px] rounded-full bg-gray-100" />

              {/* Major ticks */}
              {RULER_HOURS.map((h) => (
                <div key={h} className="absolute w-px bg-gray-300"
                  style={{ left: `${(h / 24) * 100}%`, top: 2, height: 10 }} />
              ))}
              {/* Minor ticks */}
              {Array.from({ length: 25 }, (_, i) => i).filter(h => h % 2 !== 0).map(h => (
                <div key={`m${h}`} className="absolute w-px bg-gray-200"
                  style={{ left: `${(h / 24) * 100}%`, top: 4, height: 6 }} />
              ))}

              {/* NOW label above needle */}
              <div
                className="absolute -translate-x-1/2 pointer-events-none z-30"
                style={{ left: `${needlePct}%`, top: -18 }}
              >
                <div className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shadow-sm whitespace-nowrap">
                  {nowLabel}
                </div>
              </div>

              {/* Red needle triangle */}
              <div
                className="absolute -translate-x-1/2 z-30 pointer-events-none"
                style={{ left: `${needlePct}%`, top: 0 }}
              >
                <div className="w-0 h-0" style={{
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: "7px solid #ef4444",
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Market Rows ── */}
        <div className="flex flex-col mt-1 pb-2">
          {displayMarkets.map((market, idx) => {
            const bgColor = MARKET_BG_COLORS[market.market_code] ?? "bg-gray-50/40";
            const theme = MARKET_THEME[market.market_code] ?? MARKET_THEME["IN"];

            const isWeekend = market.is_weekend || market.market_state === "WEEKEND";
            const isHoliday = market.is_holiday;

            const isNonTradingDay = isWeekend || isHoliday;

            /* check if session exists */
            const hasSession =
              !isNonTradingDay &&
              market.open_time &&
              market.close_time;

            /* safe session times */
            const openSecs = hasSession ? toSecs(market.open_time!) : 0;
            const closeSecs = hasSession ? toSecs(market.close_time!) : 0;

            const nowSecs = nowSecsInTz(market.timezone);

            const isOpen = hasSession ? market.is_open : false;

            const isSelected = selectedMarket === market.market_code;

            /* progress only if session exists */
            const fillPct = hasSession
              ? getSessionFillPct(openSecs, closeSecs, nowSecs)
              : 0;

            /* next event */
            const nextEvent = hasSession
              ? getNextEvent(openSecs, closeSecs, nowSecs, isOpen)
              : market.status_message;

            const timeStr = liveTimeStr(market.timezone);

            /* timeline position */
            const barLeftPct = hasSession ? (openSecs / 86400) * 100 : 0;
            const barWidthPct = hasSession ? ((closeSecs - openSecs) / 86400) * 100 : 0;

            const barState: "not-started" | "open" | "closed-today" =
              isOpen ? "open" : fillPct === 0 ? "not-started" : "closed-today";

            const fillGradient =
              barState === "open"
                ? theme.gradient
                : barState === "closed-today"
                  ? theme.closedGrad
                  : undefined;

            const trackBg =
              barState === "open"
                ? theme.track
                : barState === "closed-today"
                  ? "rgba(239,68,68,0.06)"
                  : "rgba(156,163,175,0.10)";

            const showDot =
              hasSession &&
              barState === "open" &&
              fillPct > 1 &&
              fillPct < 99;

            return (
              <button
                key={market.market_code}
                onClick={() => onMarketSelect(market.market_code)}
                className={cn(
                  "w-full flex items-center transition-all duration-150 cursor-pointer text-left group relative",
                  bgColor,
                  idx !== displayMarkets.length - 1 && "border-b border-gray-50",
                  isSelected
                    ? cn(
                      market.market_code === "IN" && "bg-emerald-100/60",
                      market.market_code === "UK" && "bg-blue-100/60",
                      market.market_code === "US" && "bg-amber-100/60",
                    )
                    : "hover:bg-white/60",
                )}
              >
                {/* ── Left label ── */}
                <div
                  className="shrink-0 flex items-center gap-3 py-3 pl-4 pr-3"
                  style={{ width: LABEL_W }}
                >
                  {/* Selected indicator */}
                  <div className={cn(
                    "absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-all",
                    isSelected
                      ? barState === "open" ? "bg-emerald-400" : "bg-rose-400"
                      : "opacity-0"
                  )} />

                  <span className="text-[18px] leading-none">{countryCodeToFlag(market.market_code)}</span>

                  <div className="min-w-0">
                    <span className={cn(
                      "block text-[12px] font-bold leading-tight whitespace-nowrap",
                      isSelected ? "text-gray-900" : "text-gray-700",
                    )}>
                      {market.market_name}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-medium leading-tight mt-px">
                      {market.exchange_name}
                    </span>
                  </div>
                </div>

                {/* ── Center: 24hr bar ── */}
                <div className="flex-1 relative" style={{ height: 48 }}>
                  {/* Full 24hr hairline */}
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-100" />

                  {/* Session block */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${barLeftPct}%`, width: `${barWidthPct}%`, height: 10 }}
                  >
                    {/* Track background */}
                    <div className="absolute inset-0 rounded-full" style={{ background: trackBg }} />

                    {/* Filled portion */}
                    {fillPct > 0 && fillGradient && (
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-1000 ease-linear"
                        style={{
                          width: `${fillPct}%`,
                          background: fillGradient,
                          opacity: barState === "closed-today" ? 0.55 : 1,
                          boxShadow: barState === "open"
                            ? `0 0 8px ${theme.glow}`
                            : undefined,
                        }}
                      />
                    )}

                    {/* Open edge marker */}
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full"
                      style={{
                        background: barState === "open"
                          ? theme.gradient
                          : barState === "closed-today"
                            ? "#f87171"
                            : "#d1d5db",
                      }}
                    />
                    {/* Close edge marker */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-gray-200" />

                    {/* Open time label */}
                    <span className="absolute left-0 -top-[20px] -translate-x-1/2 text-[9px] font-semibold text-gray-500 tabular-nums whitespace-nowrap">
                      {secsToHHMM(openSecs)}
                    </span>
                    {/* Close time label */}
                    <span className="absolute right-0 -top-[20px] translate-x-1/2 text-[9px] font-semibold text-gray-500 tabular-nums whitespace-nowrap">
                      {secsToHHMM(closeSecs)}
                    </span>

                    {/* Pulsing dot — open markets */}
                    {showDot && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                        style={{ left: `${fillPct}%` }}
                      >
                        <span className="relative flex h-4 w-4">
                          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-40", theme.ping)} />
                          <span className={cn("relative inline-flex h-4 w-4 rounded-full ring-2 ring-white shadow-md", theme.dot)} />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Red NOW vertical line */}
                  <div
                    className="absolute top-0 bottom-0 w-[1.5px] -translate-x-1/2 z-20 pointer-events-none"
                    style={{
                      left: `${needlePct}%`,
                      background: "linear-gradient(180deg, rgba(239,68,68,0.8) 0%, rgba(239,68,68,0.3) 100%)",
                    }}
                  />
                </div>

                {/* ── Right: status + clock + countdown ── */}
                <div
                  className="shrink-0 flex items-center gap-3 px-4 py-3"
                  style={{ width: RIGHT_W }}
                >
                  {/* Status badge */}
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0",
                    isOpen
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
                  )}>
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500",
                    )} />
                    {isOpen ? "OPEN" : "CLOSED"}
                  </span>

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-100 shrink-0" />

                  {/* Live clock */}
                  <span className="text-[11px] text-gray-600 tabular-nums font-mono shrink-0 w-[72px]">
                    {timeStr}
                  </span>

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-100 shrink-0" />

                  {/* Countdown */}
                  <span className={cn(
                    "text-[11px] font-bold tabular-nums flex-1 text-right",
                    isOpen ? "text-emerald-600" : "text-rose-500",
                  )}>
                    {nextEvent}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}