import { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';

type MetricTone = 'emerald' | 'muted';

type RebalancingWorkspaceSummaryBannerProps = {
  /** First segment in the title line (default: workspace label). */
  headline?: string;
  /** Middle segment after first pipe (e.g. euro potential or row count). */
  primaryMetric?: string;
  /** Visual style for `primaryMetric` (default: emerald highlight). */
  primaryMetricTone?: MetricTone;
  /** Segment after second pipe (e.g. transfers suggested). */
  secondaryMetric?: string;
  /** Visual style for `secondaryMetric` (default: muted). */
  secondaryMetricTone?: MetricTone;
  /** Optional lead paragraph at the top of the Details panel (e.g. task list). */
  detailsIntroExtra?: string;
  /** Muted subline under the title metrics (default: workspace “Based on…” copy). */
  subline?: string;
  /** When true, omit the first metric segment and the separator after the headline (task list). */
  hidePrimaryMetric?: boolean;
  /** When false, hide Zero transfers / Time window rows and the “These parameters…” block in Details. */
  showWorkspaceParameterDetails?: boolean;
};

const metricToneClass: Record<MetricTone, string> = {
  emerald: 'font-semibold text-emerald-600',
  muted: 'font-normal text-[#667085]',
};

/**
 * Summary strip for the rebalancing workspace: potential value, transfer count, optional expanded details.
 */
export function RebalancingWorkspaceSummaryBanner({
  headline = 'Rebalancing',
  primaryMetric = '+€211.7K potential',
  primaryMetricTone = 'emerald',
  secondaryMetric = '206 transfers suggested',
  secondaryMetricTone = 'muted',
  detailsIntroExtra,
  subline = 'Based on: Last 7 days demand • Zero transfers included • Cross-location balancing',
  hidePrimaryMetric = false,
  showWorkspaceParameterDetails = true,
}: RebalancingWorkspaceSummaryBannerProps) {
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#12171e] text-white"
            aria-hidden
          >
            <RefreshCw size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-['Inter',sans-serif] text-sm leading-snug text-[#101828]">
              <span className="font-semibold">{headline}</span>
              {hidePrimaryMetric ? null : (
                <>
                  <span className="text-[#D0D5DD]" aria-hidden>
                    |
                  </span>
                  <span className={metricToneClass[primaryMetricTone]}>{primaryMetric}</span>
                </>
              )}
              <span className="text-[#D0D5DD]" aria-hidden>
                |
              </span>
              <span className={metricToneClass[secondaryMetricTone]}>{secondaryMetric}</span>
            </p>
            <p className="font-['Inter',sans-serif] text-xs font-normal leading-normal text-[#98A2B3]">
              {subline}
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
          {detailsIntroExtra ? (
            <p className="font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#475467]">
              {detailsIntroExtra}
            </p>
          ) : null}
          <p
            className={`font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#475467] ${
              detailsIntroExtra ? 'mt-3' : ''
            }`}
          >
            Rebalancing automatically identifies where stock is over- or under-performing and suggests transfers to
            better match supply with demand. It enables stock movement between locations and prioritizes shifting
            inventory from low-performing locations to those with higher demand.
          </p>

          {showWorkspaceParameterDetails ? (
            <>
              <div className="mt-4 flex flex-col divide-y divide-[#E3E8F0]">
                <div className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-start sm:gap-6 sm:py-3">
                  <div className="w-full shrink-0 sm:w-fit sm:min-w-0">
                    <div className="font-['Inter',sans-serif] text-xs font-normal text-[#667085]">Zero transfers</div>
                    <div className="mt-0.5 font-['Inter',sans-serif] text-sm font-semibold text-[#101828]">
                      Enabled
                    </div>
                  </div>
                  <p className="min-w-0 flex-1 font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#475467]">
                    Includes products with little or no recent movement. This increases coverage but may surface
                    lower-confidence recommendations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2.5 pb-1 sm:flex-row sm:items-start sm:gap-6 sm:pt-3 sm:pb-1.5">
                  <div className="w-full shrink-0 sm:w-fit sm:min-w-0">
                    <div className="font-['Inter',sans-serif] text-xs font-normal text-[#667085]">Time window</div>
                    <div className="mt-0.5 font-['Inter',sans-serif] text-sm font-semibold text-[#101828]">
                      Last 7 days
                    </div>
                  </div>
                  <p className="min-w-0 flex-1 font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#475467]">
                    Focuses on recent sales trends. Shorter windows react faster to demand changes but can be more
                    volatile.
                  </p>
                </div>
              </div>

              <div className="mt-2 border-t border-[#E3E8F0] pt-2">
                <p className="font-['Inter',sans-serif] text-sm font-bold leading-relaxed text-[#475467]">
                  These parameters directly influence how transfer opportunities are calculated, impacting:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 font-['Inter',sans-serif] text-sm leading-relaxed text-[#475467] marker:text-[#475467]">
                  <li>Number of suggested transfers</li>
                  <li>Estimated revenue uplift</li>
                  <li>Which products and locations are prioritized</li>
                </ul>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
