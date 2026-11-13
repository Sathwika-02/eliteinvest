"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ICellRendererParams,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
  IsFullWidthRowParams,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { getScoreHex } from "@/lib/mock-data";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Wand2,
} from "lucide-react";
import { useCountry } from "@/app/providers";
import {
  stockService,
  type StockLatestRow,
} from "@/lib/services/stock.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useValuation } from "@/contexts/valuation-discovery-context";

ModuleRegistry.registerModules([AllCommunityModule]);

interface StockCurrentProps {
  sector?: string;
  onBack?: () => void;
  onStockClick?: (symbol: string) => void;
}
type StockRow = {
  symbol: string;
  name: string;
};

function getInsightType(
  insight: string,
): "opportunity" | "caution" | "neutral" | "premium" {
  const upper = String(insight || "").toUpperCase();
  if (upper.includes("OPPORTUNITY")) return "opportunity";
  if (upper.includes("CAUTION")) return "caution";
  if (upper.includes("PREMIUM")) return "premium";
  return "neutral";
}

function SymbolRenderer({ value, context }: ICellRendererParams) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        context?.onStockClick?.(String(value ?? ""));
      }}
      style={{
        color: "#2563eb",
        fontWeight: 700,
        fontSize: "14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      type="button"
    >
      {value}
    </button>
  );
}

function SectorRenderer({ value }: ICellRendererParams) {
  return <span style={{ color: "#6b7280", fontSize: "13px" }}>{value}</span>;
}

function AciRenderer({ value }: ICellRendererParams) {
  const num = Number(value);
  return (
    <span
      style={{
        color: getScoreHex(num),
        fontWeight: 700,
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    >
      {Number.isFinite(num) ? num.toFixed(2) : "-"}
    </span>
  );
}

function RankRenderer({ value }: ICellRendererParams) {
  return (
    <span
      style={{
        color: "#9ca3af",
        fontFamily: "monospace",
        fontSize: "13px",
      }}
    >
      {value ?? "-"}
    </span>
  );
}

function InsightBadgeRenderer({ value }: ICellRendererParams) {
  const type = getInsightType(String(value ?? ""));
  const config = {
    opportunity: {
      label: "OPPORTUNITY",
      borderColor: "#22c55e",
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    caution: {
      label: "CAUTION",
      borderColor: "#f59e0b",
      color: "#b45309",
      bg: "#fffbeb",
    },
    neutral: {
      label: "NEUTRAL",
      borderColor: "#cbd5e1",
      color: "#64748b",
      bg: "#f8fafc",
    },
    premium: {
      label: "PREMIUM",
      borderColor: "#ef4444",
      color: "#dc2626",
      bg: "#fef2f2",
    },
  } as const;

  const c = config[type];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "6px",
        border: `1.5px solid ${c.borderColor}`,
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        color: c.color,
        backgroundColor: c.bg,
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}

function DetailRowRenderer({ data: rowData }: ICellRendererParams) {
  const stock = rowData?._detailData as StockLatestRow | undefined;
  if (!stock) return null;

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        padding: "10px 20px 14px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          marginBottom: "6px",
          flexWrap: "wrap",
        }}
      >
        {(
          [
            "kinetic_flow_index",
            "consilium_score",
            "intrinsic_edge_score",
          ] as const
        ).map((key) => {
          const labels: Record<string, string> = {
            kinetic_flow_index: "KFI",
            consilium_score: "CNS",
            intrinsic_edge_score: "IES",
          };
          const v = Number((stock as any)[key]);
          return (
            <span
              key={key}
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {labels[key]}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: getScoreHex(v),
                }}
              >
                {Number.isFinite(v) ? v.toFixed(2) : "-"}
              </span>
            </span>
          );
        })}

        <span
          style={{
            marginLeft: "auto",
            fontSize: "10px",
            fontWeight: 600,
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            padding: "2px 9px",
            color: "#64748b",
            backgroundColor: "#ffffff",
            letterSpacing: "0.04em",
          }}
        >
          {stock.calibration_status}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "#6b7280",
          lineHeight: "1.65",
        }}
      >
        {stock.market_insight}
      </p>
    </div>
  );
}

export function StockCurrent({
  sector,
  onBack,
  onStockClick,
}: StockCurrentProps) {
  const router = useRouter();
  const { country } = useCountry();
  const { state, dispatch } = useValuation();

  const [search, setSearch] = useState("");
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(() =>
    state.selectedStocks.map((s) => s.symbol),
  );

  const sectorsLoadedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [stocks, setStocks] = useState<StockLatestRow[]>([]);
  const [total, setTotal] = useState(0);

  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [isGridReady, setIsGridReady] = useState(false);

  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    setSelectedSymbols(state.selectedStocks.map((s) => s.symbol));
  }, [state.selectedStocks]);

  useEffect(() => {
    if (!isGridReady) return;

    const api = gridRef.current?.api;
    if (!api) return;

    const selectedSet = new Set(selectedSymbols);
    api.forEachNode((node: any) => {
      if (node.data?._isDetail) return;
      const shouldSelect = selectedSet.has(String(node.data?.symbol ?? ""));
      if (node.isSelected() !== shouldSelect) {
        node.setSelected(shouldSelect);
      }
    });
  }, [selectedSymbols, stocks, isGridReady]);

  useEffect(() => {
    if (!country?.apiCode) return;
    if (sectorsLoadedRef.current) return;

    const ac = new AbortController();
    (async () => {
      try {
        const res = await stockService.stocksLatest(
          country.apiCode,
          { sort_by: "market_rank", limit: 200, offset: 0 },
          ac.signal,
        );

        const apiData = (res as any)?.data?.data ?? (res as any)?.data;
        const stockList: StockLatestRow[] = Array.isArray(apiData?.stocks)
          ? apiData.stocks
          : [];

        const sectors: string[] = Array.from(
          new Set(
            stockList
              .map((s: any) => String(s.sector || "").trim())
              .filter(Boolean),
          ),
        ).sort((a: any, b: any) => a.localeCompare(b));

        setAvailableSectors(sectors);
        sectorsLoadedRef.current = true;
      } catch {
        sectorsLoadedRef.current = true;
      }
    })();

    return () => ac.abort();
  }, [country?.apiCode]);

  useEffect(() => {
    if (!country?.apiCode) return;

    const ac = new AbortController();
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const apiSector =
          selectedSector === "ALL" ? (sector ?? undefined) : selectedSector;

        const res = await stockService.stocksLatest(
          country.apiCode,
          {
            sector: apiSector,
            sort_by: "market_rank",
            limit,
            offset,
          },
          ac.signal,
        );

        if (!active) return;

        const apiData = (res as any)?.data?.data ?? (res as any)?.data;
        setStocks(Array.isArray(apiData?.stocks) ? apiData.stocks : []);
        setTotal(Number(apiData?.total ?? 0));
        setExpandedSymbol(null);
      } catch {
        if (!active) return;
        setStocks([]);
        setTotal(0);
        setErrorMsg("Failed to load stocks.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [country?.apiCode, sector, selectedSector, limit, offset]);

  const filteredStocks = useMemo(() => {
    let list = stocks.map((s, i) => ({ ...s, _rowNum: offset + i + 1 }));
    if (!search) return list;

    const q = search.toLowerCase();
    return list.filter(
      (s) =>
        (s.symbol || "").toLowerCase().includes(q) ||
        (s.sector || "").toLowerCase().includes(q) ||
        String(s.market_rank ?? "").includes(q) ||
        String(s.alpha_confluence_index ?? "").includes(q) ||
        (s.market_insight || "").toLowerCase().includes(q),
    );
  }, [stocks, search, offset]);

  const rowData = useMemo(() => {
    const rows: any[] = [];
    filteredStocks.forEach((stock) => {
      rows.push({ ...stock, _isDetail: false });
      if (stock.symbol === expandedSymbol) {
        rows.push({
          _isDetail: true,
          _detailData: stock,
          symbol: `__detail__${stock.symbol}`,
        });
      }
    });
    return rows;
  }, [filteredStocks, expandedSymbol]);

  const handleStockClick = useCallback(
    (symbol: string) => {
      const sym = String(symbol || "").trim();
      if (!sym) return;

      if (onStockClick) return onStockClick(sym);

      router.push(`/stocks/${encodeURIComponent(sym)}`);
    },
    [onStockClick, router],
  );
  const handleAddToWizard = useCallback(() => {
      const selectedStocks = stocks.filter((stock) =>
      selectedSymbols.includes(stock.symbol)
    );

    if (!selectedStocks.length) return;

    dispatch({
      type: "SET_STOCKS",
      payload: selectedStocks,
    });


    router.push("/fundamentalgate");
  }, [filteredStocks, selectedSymbols, router]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "",
        colId: "_select",
        width: 52,
        minWidth: 52,
        maxWidth: 52,
        checkboxSelection: (params) => !params.data?._isDetail,
        headerCheckboxSelection: false,
        sortable: false,
        suppressMovable: true,
        pinned: "left",
      },
      {
        field: "_rowNum",
        headerName: "#",
        width: 50,
        minWidth: 50,
        maxWidth: 50,
        sortable: false,
        suppressMovable: true,
        cellStyle: () => ({
          display: "flex",
          alignItems: "center",
          color: "#9ca3af",
          fontSize: "13px",
          fontFamily: "monospace",
        }),
      },
      {
        field: "market_rank",
        headerName: "Mkt #",
        width: 76,
        minWidth: 76,
        maxWidth: 90,
        sortable: true,
        cellRenderer: RankRenderer,
        cellStyle: { display: "flex", alignItems: "center" } as any,
      },
      {
        field: "symbol",
        headerName: "Symbol",
        minWidth: 140,
        flex: 1.1,
        sortable: true,
        cellRenderer: SymbolRenderer,
        cellStyle: { display: "flex", alignItems: "center" } as any,
      },
      {
        field: "sector",
        headerName: "Sector",
        minWidth: 160,
        flex: 1.8,
        sortable: true,
        cellRenderer: SectorRenderer,
        cellStyle: { display: "flex", alignItems: "center" } as any,
      },
      {
        field: "alpha_confluence_index",
        headerName: "ACI",
        minWidth: 110,
        flex: 0.9,
        sortable: true,
        sort: "asc",
        cellRenderer: AciRenderer,
        cellStyle: { display: "flex", alignItems: "center" } as any,
        comparator: (valueA: any, valueB: any) =>
          Number(valueA || 0) - Number(valueB || 0),
      },
      {
        field: "market_insight",
        headerName: "Insight",
        minWidth: 150,
        flex: 1.1,
        sortable: false,
        cellRenderer: InsightBadgeRenderer,
        cellStyle: { display: "flex", alignItems: "center" } as any,
      },
      {
        colId: "_chevron",
        headerName: "",
        width: 44,
        minWidth: 44,
        maxWidth: 44,
        sortable: false,
        suppressMovable: true,
        cellRenderer: ({ data: d }: ICellRendererParams) => (
          <span
            style={{
              color: "#9ca3af",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            {expandedSymbol === d?.symbol ? "▲" : "▽"}
          </span>
        ),
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        } as any,
      },
    ],
    [expandedSymbol],
  );

  const defaultColDef: ColDef = useMemo(
    () => ({ resizable: true, suppressMovable: false }),
    [],
  );

  const isFullWidthRow = useCallback((params: IsFullWidthRowParams) => {
    return params.rowNode.data?._isDetail === true;
  }, []);

  const fullWidthCellRenderer = useMemo(() => DetailRowRenderer, []);
  const getRowHeight = useCallback(
    (params: any) => (params.data?._isDetail ? 90 : 56),
    [],
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
    setIsGridReady(true);
  }, []);

  const context = useMemo(
    () => ({ onStockClick: handleStockClick }),
    [handleStockClick],
  );

  const sectorLabel =
    selectedSector === "ALL" ? (sector ?? "Market") : selectedSector;

  const pageFrom = total === 0 ? 0 : offset + 1;
  const pageTo = Math.min(offset + limit, total);
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                {sectorLabel} Stocks
              </CardTitle>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  {loading ? "Loading..." : `${total} stocks`}
                </Badge>

                {!loading && total > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Showing {pageFrom}–{pageTo}
                  </span>
                )}

                {selectedSymbols.length > 0 && (
                  <Badge className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-100">
                    {selectedSymbols.length} selected
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={selectedSector}
              onValueChange={(v) => {
                setSelectedSector(v);
                setOffset(0);
              }}
            >
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sectors</SelectItem>
                {availableSectors.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search symbol or sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 w-[220px] text-sm border-border"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddToWizard}
              disabled={selectedSymbols.length === 0}
              className="h-9 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
            >
              <Wand2 className="h-4 w-4" />
              Add To Wizard
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 pb-6 px-6">
        {errorMsg ? (
          <div className="mb-3 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            {errorMsg}
          </div>
        ) : null}

        <style>{`
          .stock-grid {
            --ag-font-family: inherit;
            --ag-font-size: 13px;
            --ag-row-height: 56px;
            --ag-header-height: 44px;
            --ag-header-background-color: #f8fafc;
            --ag-background-color: #ffffff;
            --ag-odd-row-background-color: #ffffff;
            --ag-border-color: #e2e8f0;
            --ag-row-border-color: #f1f5f9;
            --ag-row-hover-color: #fafafa;
            --ag-selected-row-background-color: #faf5ff;
            --ag-header-column-separator-display: none;
            --ag-cell-horizontal-padding: 14px;
            --ag-row-border-style: solid;
            --ag-row-border-width: 1px;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .stock-grid .ag-header-cell-label {
            font-weight: 600;
            font-size: 12px;
            color: #374151;
          }
          .stock-grid .ag-header-cell::after { display: none !important; }
          .stock-grid .ag-header { border-bottom: 1px solid #e2e8f0; }
          .stock-grid .ag-cell:focus { outline: none !important; border: none !important; }
          .stock-grid .ag-row { cursor: pointer; }
          .stock-grid .ag-full-width-row { cursor: default; }
          .stock-grid .ag-full-width-row:hover { background-color: #f8fafc !important; }
        `}</style>

        <div className="stock-grid ag-theme-quartz">
          <AgGridReact
            theme="legacy"
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            onSelectionChanged={(event) => {
              const rows = event.api
                .getSelectedRows()
                .filter((row: any) => !row?._isDetail);
              setSelectedSymbols(rows.map((row: any) => String(row.symbol)));
            }}
            onGridReady={onGridReady}
            domLayout="autoHeight"
            context={context}
            isFullWidthRow={isFullWidthRow}
            fullWidthCellRenderer={fullWidthCellRenderer}
            getRowHeight={getRowHeight}
            getRowId={(p) => p.data.symbol}
            onRowClicked={(e) => {
              if (e.data?._isDetail) return;
              const sym = e.data?.symbol;
              setExpandedSymbol((prev) => (prev === sym ? null : sym));
            }}
            animateRows={true}
            suppressCellFocus={true}
            suppressScrollOnNewData={true}
            overlayNoRowsTemplate={
              loading
                ? `<span style="color:#6b7280;font-size:13px;">Loading...</span>`
                : `<span style="color:#6b7280;font-size:13px;">No stocks found</span>`
            }
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {total > 0 ? `Showing ${pageFrom}–${pageTo} of ${total}` : "—"}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canPrev || loading}
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
              className={`h-8 w-8 rounded-md border border-border flex items-center justify-center ${!canPrev || loading
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-muted/50"
                }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              disabled={!canNext || loading}
              onClick={() => setOffset((o) => o + limit)}
              className={`h-8 w-8 rounded-md border border-border flex items-center justify-center ${!canNext || loading
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-muted/50"
                }`}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}