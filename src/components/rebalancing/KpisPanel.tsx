import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Database, LineChart, ListChecks, Table2, X } from 'lucide-react';

type KpisPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function KpisPanel({ open, onClose }: KpisPanelProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kpis-panel-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 transition-opacity"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        className="relative flex h-full w-full max-w-[min(100vw-1rem,28rem)] flex-col border-l border-[#2a3340] bg-[#12171E] shadow-[-8px_0_32px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#2a3340] px-5 py-4">
          <h2 id="kpis-panel-title" className="font-['Inter',sans-serif] text-lg font-semibold text-white">
            Key performance indicators
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[#9AA4B2] transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div className="flex flex-col gap-8">
            <section className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <ListChecks size={20} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-3">
                <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-white">Your configured KPIs</h3>
                <p className="font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#c9d1d9]">
                  Below is the set of KPIs your organisation has switched on for this rebalancing workspace. Only
                  configured metrics are calculated, surfaced in the grid, and used when ranking or explaining rows.
                </p>
                <ul className="m-0 max-h-[min(40vh,320px)] list-none space-y-1.5 overflow-y-auto rounded-lg border border-[#2a3340] bg-[#0d1117] px-3 py-2.5 font-['Inter',sans-serif] text-[13px] leading-snug text-[#e2e8f0]">
                  {[
                    'Stock cover (weeks) by location cluster',
                    'Days of supply (DOS) — store vs warehouse',
                    'Sell-through rate (L7D & L30D)',
                    'Lost sales risk score',
                    'Overstock value at risk',
                    'Transfer fill rate',
                    'On-time in-full (OTIF) %',
                    'Revenue uplift from suggested transfers',
                    'Forecast accuracy (WAPE)',
                    'Arena / location balance index',
                    'Min–max compliance %',
                    'Trip efficiency (units per trip)',
                    'CO₂ kg per 1k units moved',
                    'Margin impact of transfers (€)',
                    'Recommended transfer coverage %',
                    'SKU-level stockout exposure',
                    'Cross-location demand index',
                    'Warehouse allocation vs store need',
                    'Grip depth vs target band',
                    'Initial allocation (IA) score',
                    'Schedule adherence (start / end windows)',
                    'Zero-transfer inclusion flag (coverage)',
                    'Safety stock breach count',
                    'Markdown risk proxy',
                    'Promo overlap density',
                  ].map((label) => (
                    <li key={label} className="flex gap-2 border-b border-[#1e2630] pb-1.5 last:border-b-0 last:pb-0">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#7dd3fc]" aria-hidden />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Database size={20} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-white">This drives what you see</h3>
                <p className="font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#c9d1d9]">
                  Your configured KPIs are computed on top of the same core data pipeline: sales history, stock positions,
                  location attributes, transfer history, and the parameters you set (time window, zero-transfer rules,
                  balancing scope). Each refresh recalculates these metrics, then feeds the assortment table—column
                  values, the Transfer KPIs column, sort orders, KPI chips, and the drivers shown in popovers. Changing
                  which KPIs are enabled or how thresholds are set (in workspace configuration) changes which numbers
                  appear and which product groups rise to the top for recommendations.
                </p>
              </div>
            </section>

            <section className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <LineChart size={20} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-white">Examples</h3>
                <ul className="list-disc space-y-1 pl-5 font-['Inter',sans-serif] text-sm leading-relaxed text-[#c9d1d9]">
                  <li>Stock cover and days of supply by location</li>
                  <li>Lost sales risk or overstock exposure</li>
                  <li>Transfer impact on revenue or margin</li>
                </ul>
              </div>
            </section>
            <section className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Table2 size={20} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-white">In this workspace</h3>
                <p className="font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#c9d1d9]">
                  KPI-style figures appear in column headers and chips on the assortment table. Use sort and filters to
                  focus on the metrics that matter for your review.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
