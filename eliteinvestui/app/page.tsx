"use client";

import { useState } from "react";
import { MarketStatusBar } from "@/components/dashboard/market-status-bar";
import { MarketSnapshot } from "@/components/dashboard/market-snapshot";
import { MarketHistorical } from "@/components/dashboard/market-historical";
import { SectorCurrent } from "@/components/dashboard/sector-current";
import { SectorHistorical } from "@/components/dashboard/sector-historical";
import { StockCurrent } from "@/components/dashboard/stock-current";
import { StockHistoricalPage } from "@/components/dashboard/stock-historical";
import { InfoGuide } from "@/components/dashboard/info-guide";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart3,
  LineChart,
  Layers,
  TrendingUp,
  History,
  Activity,
  Gauge,
} from "lucide-react";
import { SectorProgressView } from "@/components/dashboard/sector-progressive";

type ViewState =
  | { type: "dashboard" }
  | { type: "sector-historical"; sector?: string }
  | { type: "stock-list"; sector: string }
  | { type: "stock-historical"; symbol: string };
  // | { type: "sector-momentum"; symbol: string };

export default function HomePage() {
  const [selectedMarket, setSelectedMarket] = useState("IN");
  const [view, setView] = useState<ViewState>({ type: "dashboard" });
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIndex, setSelectedIndex] = useState("^NSEI");
  const [lastStocksSector, setLastStocksSector] = useState<string>("ALL");

  const handleSectorClick = (sector: string) => {
    setLastStocksSector(sector);
    setView({ type: "stock-list", sector });
    setActiveTab("stocks");
  };

  const handleStockClick = (symbol: string) => {
    setLastStocksSector((prev) =>
      view.type === "stock-list" ? view.sector : prev,
    );
    setView({ type: "stock-historical", symbol });
    setActiveTab("stocks");
  };

  const handleBackToDashboard = () => {
    setView({ type: "dashboard" });
  };

  const handleBackToStocks = () => {
    setView((prev) =>
      prev.type === "stock-historical"
        ? { type: "stock-list", sector: lastStocksSector }
        : prev,
    );
    setActiveTab("stocks");
  };

  return (
    <div>
      {/* Market Status Bar */}
      <MarketStatusBar
        selectedMarket={selectedMarket}
        onMarketSelect={setSelectedMarket}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {/* Gradient icon */}
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
              <Activity className="h-4.5 w-4.5" />
            </span>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight tracking-tight">
              <span className="text-brand-gradient">Market Mood</span>{" "}
              <span className="text-gray-800">Dashboard</span>
            </h1>
          </div>

          {/* Subtitle with colored keywords */}
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed ml-12">
            Understand market pulse, identify{" "}
            <span className="text-emerald-600 font-medium">sector opportunities</span>
            , and pick{" "}
            <span className="text-blue-600 font-medium">stocks</span>{" "}
            using proprietary mood scores.
          </p>

          {/* Gradient underline */}
          <div className="mt-3 h-[2px] w-16 rounded-full bg-brand-gradient ml-12" />
        </div>

        {/* Info Guide */}
        <div className="mb-6">
          <InfoGuide />
        </div>

        {/* ── Navigation Tabs ── */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="w-full justify-start h-11 bg-white border border-gray-200 overflow-x-auto shadow-sm rounded-xl gap-0.5 px-1">

            {/* Market Overview — blue */}
            <TabsTrigger
              value="overview"
              className="
                gap-2 text-xs sm:text-sm px-4 h-9 rounded-lg font-medium
                text-gray-500 hover:text-gray-700
                data-[state=active]:bg-blue-50
                data-[state=active]:text-blue-700
                data-[state=active]:border data-[state=active]:border-blue-200
                data-[state=active]:shadow-none
                transition-all duration-150
              "
            >
              <BarChart3 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="hidden sm:inline">Market Overview </span>
            </TabsTrigger>

            {/* Market Historical — violet */}
            <TabsTrigger
              value="historical"
              className="
                gap-2 text-xs sm:text-sm px-4 h-9 rounded-lg font-medium
                text-gray-500 hover:text-gray-700
                data-[state=active]:bg-violet-50
                data-[state=active]:text-violet-700
                data-[state=active]:border data-[state=active]:border-violet-200
                data-[state=active]:shadow-none
                transition-all duration-150
              "
            >
              <History className="h-3.5 w-3.5 text-violet-500 shrink-0" />
              <span className="hidden sm:inline">Market Historical</span>
            </TabsTrigger>

            {/* Sectors — emerald */}
            <TabsTrigger
              value="sectors"
              className="
                gap-2 text-xs sm:text-sm px-4 h-9 rounded-lg font-medium
                text-gray-500 hover:text-gray-700
                data-[state=active]:bg-emerald-50
                data-[state=active]:text-emerald-700
                data-[state=active]:border data-[state=active]:border-emerald-200
                data-[state=active]:shadow-none
                transition-all duration-150
              "
            >
              <Layers className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              Sectors
            </TabsTrigger>

            {/* Stocks — amber */}
            <TabsTrigger
              value="stocks"
              className="
                gap-2 text-xs sm:text-sm px-4 h-9 rounded-lg font-medium
                text-gray-500 hover:text-gray-700
                data-[state=active]:bg-amber-50
                data-[state=active]:text-amber-700
                data-[state=active]:border data-[state=active]:border-amber-200
                data-[state=active]:shadow-none
                transition-all duration-150
              "
            >
              <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              Stocks
            </TabsTrigger>

          </TabsList>

          {/* ── Tab Contents ── */}

          {/* 1. Market Overview */}
          <TabsContent value="overview">
            <MarketSnapshot
              selectedIndex={selectedIndex}
              onIndexChange={setSelectedIndex}
            />
          </TabsContent>

          {/* 2. Market Historical */}
          <TabsContent value="historical">
            <MarketHistorical selectedIndex={selectedIndex} />
          </TabsContent>

          {/* 3. Sectors */}
          <TabsContent value="sectors">
            {/* <SectorCurrent onSectorClick={handleSectorClick} /> */}
            <SectorProgressView />
          </TabsContent>

          {/* 4. Stocks */}
          <TabsContent value="stocks">
            {view.type === "stock-historical" ? (
              <StockHistoricalPage
                symbol={view.symbol}
                onBack={handleBackToStocks}
              />
            ) : (
              <StockCurrent
                sector={view.type === "stock-list" ? view.sector : undefined}
                onBack={
                  view.type === "stock-list" ? handleBackToDashboard : undefined
                }
                onStockClick={handleStockClick}
              />
            )}
          </TabsContent>

        </Tabs>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 mt-8 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Market Mood Dashboard — Data is for educational purposes only.
          </p>
          <p className="text-xs text-gray-400 hidden sm:block">
            Scores updated daily &nbsp;·&nbsp; Not financial advice
          </p>
        </div>
      </footer>
    </div>
  );
}
