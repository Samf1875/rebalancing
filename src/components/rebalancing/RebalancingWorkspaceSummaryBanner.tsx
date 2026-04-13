import { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';

/**
 * Summary strip for the rebalancing workspace: potential value, transfer count, optional expanded details.
 */
export function RebalancingWorkspaceSummaryBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="w-full min-w-0 rounded-xl border border-[#E3E8F0] bg-white px-4 py-3 sm:px-5 sm:py-4"
      role="region"
      aria-label="Rebalancing summary"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0267FF] text-white"
            aria-hidden
          >
            <RefreshCw size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-['Inter',sans-serif] text-sm leading-snug text-[#101828]">
              <span className="font-semibold">Rebalancing</span>
              <span className="text-[#D0D5DD]" aria-hidden>
                |
              </span>
              <span className="font-semibold text-emerald-600">+€211.7K potential</span>
              <span className="text-[#D0D5DD]" aria-hidden>
                |
              </span>
              <span className="font-normal text-[#667085]">206 transfers suggested</span>
            </p>
            <p className="font-['Inter',sans-serif] text-xs font-normal leading-normal text-[#98A2B3]">
              Based on: L7D demand • Zero transfers included
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start sm:mt-0.5">
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E3E8F0] bg-white px-3 font-['Inter',sans-serif] text-sm font-medium text-[#101828] transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0267FF]"
          >
            Details
            {detailsOpen ? (
              <ChevronUp size={16} strokeWidth={2} className="shrink-0 text-[#667085]" aria-hidden />
            ) : (
              <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-[#667085]" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#667085] transition-colors hover:bg-slate-100 hover:text-[#101828] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0267FF]"
            aria-label="Dismiss summary"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {detailsOpen ? (
        <div className="mt-4 flex flex-col border-t border-[#E3E8F0] pt-4">
          <p className="font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#475467]">
            This view redistributes stock based on recent demand signals to maximize revenue across locations.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-['Inter',sans-serif] text-xs font-normal text-[#667085]">Mode</span>
              <span className="font-['Inter',sans-serif] text-sm font-semibold text-[#101828]">Rebalancing</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-['Inter',sans-serif] text-xs font-normal text-[#667085]">Zero transfers</span>
              <span className="font-['Inter',sans-serif] text-sm font-semibold text-[#101828]">Enabled</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-['Inter',sans-serif] text-xs font-normal text-[#667085]">Time window</span>
              <span className="font-['Inter',sans-serif] text-sm font-semibold text-[#101828]">Last 7 days</span>
            </div>
          </div>
          <p className="mt-4 font-['Inter',sans-serif] text-xs font-normal leading-normal text-[#98A2B3]">
            Impacts: Transfers, Recommended transfers, Revenue increase
          </p>
        </div>
      ) : null}
    </div>
  );
}
