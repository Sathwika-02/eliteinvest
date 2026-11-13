import type { FundamentalSectorRow } from "@/lib/services/fundamental.service";

function fmtNumber(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
}

function fmtPct(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const n = Number(value);
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

function scoreBarColor(score?: number | null): string {
  const n = Number(score ?? 0);
  if (n >= 50) return "bg-emerald-500";
  if (n >= 30) return "bg-amber-500";
  return "bg-rose-500";
}

function scoreTextColor(score?: number | null): string {
  const n = Number(score ?? 0);
  if (n >= 50) return "text-emerald-600";
  if (n >= 30) return "text-amber-600";
  return "text-rose-600";
}

function upsideTextColor(upside?: number | null): string {
  const n = Number(upside ?? 0);
  return n >= 0 ? "text-emerald-600" : "text-rose-600";
}

function verdictStyle(verdict?: string | null): string {
  const v = String(verdict || "").toUpperCase();
  if (v.includes("AVOID") || v.includes("FAIL"))
    return "bg-rose-50 text-rose-700 border border-rose-200";
  if (v.includes("CAUTION"))
    return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
}

interface DimBarProps {
  label: string;
  value?: number | null;
  color: string;
}

function DimBar({ label, value, color }: DimBarProps) {
  const pct = Math.min(Math.max(Number(value ?? 0), 0), 100);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-medium text-slate-500">{fmtNumber(value, 1)}</span>
    </div>
  );
}

interface SectorCardProps {
  row: FundamentalSectorRow;
}

function SectorCard({ row }: SectorCardProps) {
  const total = (row.stocks_pass ?? 0) + (row.stocks_caution ?? 0) + (row.stocks_fail ?? 0);
  const passW = total > 0 ? ((row.stocks_pass ?? 0) / total) * 100 : 0;
  const cautionW = total > 0 ? ((row.stocks_caution ?? 0) / total) * 100 : 0;
  const failW = total > 0 ? ((row.stocks_fail ?? 0) / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="font-semibold text-slate-900 text-sm">{row.sector}</div>
          <div className="text-xs text-slate-400 mt-0.5">{row.total_stocks ?? "-"} stocks</div>
        </div>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${verdictStyle(row.dominant_verdict)}`}
        >
          {row.dominant_verdict || "-"}
        </span>
      </div>

      {/* Avg Score + Upside */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-2xl font-bold ${scoreTextColor(row.avg_fundamental_score)}`}>
          {fmtNumber(row.avg_fundamental_score, 1)}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${scoreBarColor(row.avg_fundamental_score)}`}
            style={{ width: `${Math.min(Number(row.avg_fundamental_score ?? 0), 100)}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${upsideTextColor(row.avg_upside_pct)}`}>
          {fmtPct(row.avg_upside_pct, 1)}
        </span>
      </div>

      {/* Pass / Caution / Fail stacked bar */}
      <div className="mb-2">
        <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 mb-2">
          <div className="bg-emerald-400 rounded-full" style={{ width: `${passW}%` }} />
          <div className="bg-amber-400 rounded-full" style={{ width: `${cautionW}%` }} />
          <div className="bg-rose-400 rounded-full" style={{ width: `${failW}%` }} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 text-center rounded-lg bg-emerald-50 py-1.5">
            <div className="text-sm font-semibold text-emerald-700">{row.stocks_pass ?? 0}</div>
            <div className="text-[10px] text-emerald-600">Pass</div>
          </div>
          <div className="flex-1 text-center rounded-lg bg-amber-50 py-1.5">
            <div className="text-sm font-semibold text-amber-700">{row.stocks_caution ?? 0}</div>
            <div className="text-[10px] text-amber-600">Caution</div>
          </div>
          <div className="flex-1 text-center rounded-lg bg-rose-50 py-1.5">
            <div className="text-sm font-semibold text-rose-700">{row.stocks_fail ?? 0}</div>
            <div className="text-[10px] text-rose-600">Fail</div>
          </div>
        </div>
      </div>

      {/* Dimension mini bars */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 mb-3">
        <DimBar label="Value depth" value={row.avg_value_depth} color="bg-blue-400" />
        <DimBar label="Growth quality" value={row.avg_growth_quality} color="bg-teal-400" />
        <DimBar label="Business quality" value={row.avg_business_quality} color="bg-violet-400" />
        <DimBar label="Financial safety" value={row.avg_financial_safety} color="bg-emerald-400" />
        <DimBar label="Market momentum" value={row.avg_market_momentum} color="bg-amber-400" />
        <DimBar label="Pass rate" value={row.pass_rate_pct} color={scoreBarColor(row.pass_rate_pct)} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>Best</span>
          <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
            {row.best_stock || "-"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-emerald-600 font-medium">+{row.total_favorable_signals ?? 0}</span>
          <span className="text-slate-400">{row.total_neutral_signals ?? 0}</span>
          <span className="text-rose-600 font-medium">−{row.total_unfavorable_signals ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

interface SectorSnapshotProps {
  sectors: FundamentalSectorRow[];
}

export default function SectorSnapshot({ sectors }: SectorSnapshotProps) {
  if (sectors.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-4 text-center">
        No sector snapshot available.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {sectors.map((row) => (
        <SectorCard key={row.sector} row={row} />
      ))}
    </div>
  );
}