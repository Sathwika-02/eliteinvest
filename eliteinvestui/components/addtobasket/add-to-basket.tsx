"use client";

import { useState } from "react";
import {
  ShoppingCart, Plus, Check, ChevronDown,
  Trash2, X, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────

type Stock = {
  symbol: string;
  name?: string;
  sector?: string;
  current_price?: number;
};

// Mock basket type — replace with your actual basket type from context/API
type UserBasket = {
  id: string;
  name: string;
  stock_count: number;
  basket_type: "WATCHLIST" | "PORTFOLIO" | "STRATEGY";
};

interface AddToBasketProps {
  selectedStocks: Stock[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function basketTypeIcon(type: string) {
  if (type === "WATCHLIST") return "👁";
  if (type === "PORTFOLIO") return "💼";
  return "🎯";
}

function basketTypeCls(type: string) {
  if (type === "WATCHLIST") return "bg-blue-50 text-blue-700 border-blue-200";
  if (type === "PORTFOLIO") return "bg-violet-50 text-violet-700 border-violet-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

// ── Mock baskets for UI — replace with your real API call ──────────────────
// In your real app, fetch this from your basket list API
const MOCK_BASKETS: UserBasket[] = [
  { id: "1", name: "My India Watchlist",       stock_count: 8,  basket_type: "WATCHLIST" },
  { id: "2", name: "Tech Growth Portfolio",     stock_count: 12, basket_type: "PORTFOLIO" },
  { id: "3", name: "Dividend Champions India",  stock_count: 15, basket_type: "STRATEGY"  },
  { id: "4", name: "US Growth Leaders",         stock_count: 5,  basket_type: "PORTFOLIO" },
];

// ── Main Component ─────────────────────────────────────────────────────────

export function AddToBasket({ selectedStocks }: AddToBasketProps) {
  const [selectedBasketId, setSelectedBasketId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const [newBasketName, setNewBasketName]        = useState("");
  const [showNewBasket, setShowNewBasket]        = useState(false);
  const [newBasketType, setNewBasketType]        = useState<UserBasket["basket_type"]>("WATCHLIST");
  const [status, setStatus]                     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [removedSymbols, setRemovedSymbols]     = useState<string[]>([]);

  const visibleStocks = selectedStocks.filter(s => !removedSymbols.includes(s.symbol));
  const selectedBasket = MOCK_BASKETS.find(b => b.id === selectedBasketId);

  const handleRemoveStock = (symbol: string) => {
    setRemovedSymbols(prev => [...prev, symbol]);
  };

  const handleConfirm = async () => {
    if (!selectedBasketId && !showNewBasket) return;
    if (showNewBasket && !newBasketName.trim()) return;
    if (visibleStocks.length === 0) return;

    setStatus("loading");
    try {
      // TODO: replace with your real API call
      // e.g. await basketService.addStocks(selectedBasketId, visibleStocks.map(s => s.symbol))
      // or   await basketService.createBasket({ name: newBasketName, type: newBasketType, symbols: ... })
      await new Promise(r => setTimeout(r, 1200)); // simulated delay
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const canConfirm = visibleStocks.length > 0 && (selectedBasketId !== null || (showNewBasket && newBasketName.trim().length > 0));

  // ── Success state ──────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <Card className="rounded-3xl border-emerald-200 bg-emerald-50 shadow-sm">
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-800">
              {visibleStocks.length} stock{visibleStocks.length !== 1 ? "s" : ""} added successfully
            </div>
            <div className="text-sm text-emerald-600 mt-1">
              Added to{" "}
              <span className="font-semibold">
                {showNewBasket ? newBasketName : selectedBasket?.name}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {visibleStocks.map(s => (
              <Badge key={s.symbol} variant="outline" className="border-emerald-300 bg-white text-emerald-700">
                {s.symbol}
              </Badge>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => { setStatus("idle"); setSelectedBasketId(null); setShowNewBasket(false); setNewBasketName(""); setRemovedSymbols([]); }}
          >
            Add More Stocks
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
            <ShoppingCart className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Add to Basket</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your selected stocks and send them to a basket
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* ── Selected Stocks ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Selected Stocks ({visibleStocks.length})
            </span>
            {removedSymbols.length > 0 && (
              <button
                className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                onClick={() => setRemovedSymbols([])}
              >
                Restore all
              </button>
            )}
          </div>

          {visibleStocks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <AlertCircle className="h-5 w-5 text-slate-300 mx-auto mb-2" />
              <div className="text-sm text-slate-400">No stocks selected</div>
              <div className="text-xs text-slate-300 mt-0.5">Go back to select stocks first</div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              {visibleStocks.map((stock, i) => (
                <div
                  key={stock.symbol}
                  className={`flex items-center justify-between px-4 py-3 ${i !== visibleStocks.length - 1 ? "border-b border-slate-100" : ""} hover:bg-slate-50/60 transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-violet-600">{stock.symbol.slice(0, 3)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{stock.symbol}</div>
                      {stock.name && (
                        <div className="text-[10px] text-slate-400 max-w-[200px] truncate">{stock.name}</div>
                      )}
                    </div>
                    {stock.sector && (
                      <Badge variant="outline" className="text-[9px] border-slate-200 text-slate-500 hidden sm:flex">
                        {stock.sector}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {stock.current_price != null && (
                      <span className="text-xs font-medium text-slate-700">
                        ₹{Number(stock.current_price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveStock(stock.symbol)}
                      className="text-slate-300 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Basket Selection ── */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Choose Basket
          </div>

          {/* Existing basket dropdown */}
          {!showNewBasket && (
            <div className="relative mb-3">
              <button
                type="button"
                onClick={() => setDropdownOpen(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                  selectedBasketId
                    ? "border-violet-300 bg-violet-50 text-violet-800"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedBasket ? (
                    <>
                      <span>{basketTypeIcon(selectedBasket.basket_type)}</span>
                      <span className="font-medium">{selectedBasket.name}</span>
                      <Badge variant="outline" className={`text-[9px] border ${basketTypeCls(selectedBasket.basket_type)}`}>
                        {selectedBasket.stock_count} stocks
                      </Badge>
                    </>
                  ) : (
                    <span>Select an existing basket…</span>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  {MOCK_BASKETS.map(basket => (
                    <button
                      key={basket.id}
                      type="button"
                      onClick={() => { setSelectedBasketId(basket.id); setDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${
                        selectedBasketId === basket.id ? "bg-violet-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{basketTypeIcon(basket.basket_type)}</span>
                        <div>
                          <div className="font-medium text-slate-800">{basket.name}</div>
                          <div className="text-[10px] text-slate-400">{basket.stock_count} stocks</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[9px] border ${basketTypeCls(basket.basket_type)}`}>
                          {basket.basket_type}
                        </Badge>
                        {selectedBasketId === basket.id && <Check className="h-4 w-4 text-violet-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create new basket toggle */}
          <button
            type="button"
            onClick={() => { setShowNewBasket(v => !v); setSelectedBasketId(null); }}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all ${
              showNewBasket
                ? "border-violet-300 bg-violet-50 text-violet-700"
                : "border-dashed border-slate-300 text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50"
            }`}
          >
            <Plus className={`h-4 w-4 ${showNewBasket ? "rotate-45" : ""} transition-transform`} />
            {showNewBasket ? "Cancel — pick existing basket instead" : "Create a new basket"}
          </button>

          {/* New basket form */}
          {showNewBasket && (
            <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/40 p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Basket Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Value Picks"
                  value={newBasketName}
                  onChange={e => setNewBasketName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Basket Type</label>
                <div className="flex gap-2">
                  {(["WATCHLIST", "PORTFOLIO", "STRATEGY"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewBasketType(type)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                        newBasketType === type
                          ? basketTypeCls(type) + " border-current"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span>{basketTypeIcon(type)}</span>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Failed to add stocks. Please try again.
          </div>
        )}

        {/* ── Confirm button ── */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-400">
            {visibleStocks.length} stock{visibleStocks.length !== 1 ? "s" : ""} will be added
            {(selectedBasket || (showNewBasket && newBasketName)) && (
              <> to <span className="font-medium text-slate-600">
                {showNewBasket ? `"${newBasketName}"` : selectedBasket?.name}
              </span></>
            )}
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || status === "loading"}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 min-w-[140px]"
          >
            {status === "loading" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding…</>
            ) : (
              <><ShoppingCart className="mr-2 h-4 w-4" />Add to Basket</>
            )}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}