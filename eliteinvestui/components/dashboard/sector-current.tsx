"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpDown, Grid3x3, TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { useCountry } from "@/app/providers";
import { sectorService } from "@/lib/services/sector.service"; // ✅ adjust path if needed

interface SectorCurrentProps {
  onSectorClick?: (sector: string) => void;
}

type SectorLatestApiRow = {
  kinetic_flow_index: string;
  consilium_score: string;
  intrinsic_edge_score: string;
  alpha_confluence_index: string;
  calculation_date: string;
  sector: string;
  num_stocks_in_sector: number;
  num_stocks_with_data: number;
  days_of_data: number;
  calibration_status: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error: any;
  request_id: string;
};

// Legend items matching Image 1
const LEGEND = [
  { label: "Low (<35)", color: "#dc2626" },
  { label: "Caution (35-45)", color: "#f59e0b" },
  { label: "Positive (55-65)", color: "#22c55e" },
  { label: "Strong (>65)", color: "#16a34a" },
];

function toNum(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

// If you're already importing getScoreHex/getAciTileTheme from mock-data,
// you can keep that. This local version is safe + matches your legend logic.
function getScoreHex(score: number) {
  if (score < 35) return "#dc2626";
  if (score < 45) return "#f59e0b";
  if (score < 55) return "#eab308";
  if (score < 65) return "#22c55e";
  return "#16a34a";
}

function getAciTileTheme(score: number) {
  if (score < 35)
    return { bg: "rgba(220,38,38,0.12)", fg: "rgb(220,38,38)", label: "Low" };
  if (score < 45)
    return {
      bg: "rgba(245,158,11,0.12)",
      fg: "rgb(245,158,11)",
      label: "Caution",
    };
  if (score < 55)
    return {
      bg: "rgba(234,179,8,0.12)",
      fg: "rgb(234,179,8)",
      label: "Neutral",
    };
  if (score < 65)
    return {
      bg: "rgba(34,197,94,0.12)",
      fg: "rgb(34,197,94)",
      label: "Positive",
    };
  return { bg: "rgba(22,163,74,0.14)", fg: "rgb(22,163,74)", label: "Strong" };
}

function safePayload<T>(res: any): T {
  // axios: res.data is payload; if already payload, return as-is
  return (res?.success !== undefined ? res : res?.data) as T;
}

type UiSector = {
  sector: string;
  kinetic_flow_index: number;
  consilium_score: number;
  intrinsic_edge_score: number;
  alpha_confluence_index: number;
  calculation_date: string;
  num_stocks_in_sector: number;
  num_stocks_with_data: number;
  days_of_data: number;
  calibration_status: string;
};

export function SectorCurrent({ onSectorClick }: SectorCurrentProps) {
  const { country } = useCountry();

  const [view, setView] = useState<string>("heatmap");
  const [sortBy, setSortBy] = useState<string>("alpha_confluence_index");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [sectors, setSectors] = useState<UiSector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!country?.apiCode) return;

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);

        // if your backend supports sort_by, keep it
        const res = await sectorService.sectorsLatest(
          country.apiCode,
          "alpha_confluence_index",
          controller.signal,
        );

        const payload = safePayload<ApiEnvelope<SectorLatestApiRow[]>>(res);
        const rows = payload?.data ?? [];

        const mapped: UiSector[] = rows.map((r) => ({
          sector: r.sector,
          kinetic_flow_index: toNum(r.kinetic_flow_index),
          consilium_score: toNum(r.consilium_score),
          intrinsic_edge_score: toNum(r.intrinsic_edge_score),
          alpha_confluence_index: toNum(r.alpha_confluence_index),
          calculation_date: r.calculation_date,
          num_stocks_in_sector: toNum(r.num_stocks_in_sector),
          num_stocks_with_data: toNum(r.num_stocks_with_data),
          days_of_data: toNum(r.days_of_data),
          calibration_status: String(r.calibration_status || ""),
        }));

        setSectors(mapped);
      } catch (e) {
        console.error("sectorsLatest failed:", e);
        setSectors([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [country.apiCode]);

  const sortedSectors = useMemo(() => {
    const list = [...sectors];
    list.sort((a, b) => {
      const aVal = toNum((a as any)[sortBy]);
      const bVal = toNum((b as any)[sortBy]);
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [sectors, sortBy, sortOrder]);

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const totalStocks = useMemo(() => {
    return sectors.reduce((acc, s) => acc + (s.num_stocks_in_sector || 0), 0);
  }, [sectors]);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Grid3x3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground leading-tight">
                Sector Intelligence
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Click sector to explore stocks
              </p>
            </div>

            <Badge variant="outline" className="text-xs text-muted-foreground">
              ⟳ {sectors.length} Sectors
            </Badge>
          </div>

          <Tabs value={view} onValueChange={setView}>
            <TabsList className="h-8">
              <TabsTrigger value="heatmap" className="text-xs px-3 h-7 gap-1">
                <Grid3x3 className="h-3 w-3" />
                Heatmap
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs px-3 h-7 gap-1">
                <TableIcon className="h-3 w-3" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === "heatmap" && (
          <div className="flex items-center gap-4 pt-2 flex-wrap">
            {LEGEND.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-1">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : view === "heatmap" ? (
          <HeatmapView
            sectors={sortedSectors}
            totalStocks={totalStocks}
            onSectorClick={onSectorClick}
          />
        ) : (
          <TableView
            sectors={sortedSectors}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={toggleSort}
            onSectorClick={onSectorClick}
          />
        )}
      </CardContent>
    </Card>
  );
}

function HeatmapView({
  sectors,
  totalStocks,
  onSectorClick,
}: {
  sectors: UiSector[];
  totalStocks: number;
  onSectorClick?: (sector: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      {sectors.map((sector) => {
        const theme = getAciTileTheme(sector.alpha_confluence_index);

        const sizePercent =
          totalStocks > 0
            ? (sector.num_stocks_in_sector / totalStocks) * 100
            : 0;

        const minH = Math.max(72, Math.min(120, 55 + sizePercent * 2.5));

        return (
          <Tooltip key={sector.sector}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSectorClick?.(sector.sector)}
                type="button"
                className="group relative rounded-xl overflow-hidden transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{
                  minHeight: `${minH}px`,
                  backgroundColor: theme.bg,
                  color: theme.fg,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                <div className="relative p-2.5 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-[11px] font-semibold leading-tight truncate">
                      {sector.sector}
                    </p>
                    <p className="text-[10px] opacity-75 mt-0.5 flex items-center gap-0.5">
                      <svg
                        className="h-2.5 w-2.5 opacity-80"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                      </svg>
                      {sector.num_stocks_in_sector} stocks
                    </p>
                  </div>

                  <div className="mt-1">
                    <p className="text-[22px] font-bold font-mono tabular-nums leading-none">
                      {sector.alpha_confluence_index.toFixed(0)}
                    </p>
                    <p className="text-[10px] font-medium opacity-85">
                      {theme.label}
                    </p>
                  </div>
                </div>
              </button>
            </TooltipTrigger>

            <TooltipContent side="top" className="max-w-[220px]">
              <div className="space-y-1.5">
                <p className="font-semibold text-xs">{sector.sector}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                  <span className="text-muted-foreground">KFI:</span>
                  <span className="font-mono">
                    {sector.kinetic_flow_index.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">CNS:</span>
                  <span className="font-mono">
                    {sector.consilium_score.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">IES:</span>
                  <span className="font-mono">
                    {sector.intrinsic_edge_score.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">ACI:</span>
                  <span className="font-bold font-mono">
                    {sector.alpha_confluence_index.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">Stocks:</span>
                  <span className="font-mono">
                    {sector.num_stocks_in_sector}
                  </span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

function TableView({
  sectors,
  sortBy,
  sortOrder,
  onSort,
  onSectorClick,
}: {
  sectors: UiSector[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (col: string) => void;
  onSectorClick?: (sector: string) => void;
}) {
  const columns = [
    { key: "rank", label: "#", sortable: false },
    { key: "sector", label: "Sector", sortable: false },
    { key: "kinetic_flow_index", label: "KFI", sortable: true },
    { key: "consilium_score", label: "CNS", sortable: true },
    { key: "intrinsic_edge_score", label: "IES", sortable: true },
    { key: "alpha_confluence_index", label: "ACI", sortable: true },
    { key: "num_stocks_in_sector", label: "Stocks", sortable: true },
  ];

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs font-semibold text-muted-foreground h-9",
                  col.sortable &&
                    "cursor-pointer hover:text-foreground select-none",
                )}
                onClick={() => col.sortable && onSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sectors.map((sector, i) => {
            const aciColor = getScoreHex(sector.alpha_confluence_index);
            return (
              <TableRow
                key={sector.sector}
                className="cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => onSectorClick?.(sector.sector)}
              >
                <TableCell className="text-xs text-muted-foreground font-mono w-8 tabular-nums">
                  {i + 1}
                </TableCell>
                <TableCell className="text-sm font-semibold text-foreground">
                  {sector.sector}
                </TableCell>
                <TableCell
                  className="text-xs font-mono tabular-nums"
                  style={{ color: getScoreHex(sector.kinetic_flow_index) }}
                >
                  {sector.kinetic_flow_index.toFixed(2)}
                </TableCell>
                <TableCell
                  className="text-xs font-mono tabular-nums"
                  style={{ color: getScoreHex(sector.consilium_score) }}
                >
                  {sector.consilium_score.toFixed(2)}
                </TableCell>
                <TableCell
                  className="text-xs font-mono tabular-nums"
                  style={{ color: getScoreHex(sector.intrinsic_edge_score) }}
                >
                  {sector.intrinsic_edge_score.toFixed(2)}
                </TableCell>
                <TableCell
                  className="font-mono font-bold text-sm tabular-nums"
                  style={{ color: aciColor }}
                >
                  {sector.alpha_confluence_index.toFixed(2)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono tabular-nums">
                  {sector.num_stocks_in_sector}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
