import { useState, type ReactNode } from 'react';
import { BarChart3, ChevronDown, ChevronUp, X } from 'lucide-react';
import { RefreshSyncIcon } from '../icons/RefreshSyncIcon';

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
  /**
   * When `showWorkspaceParameterDetails` is false, replaces `detailsIntroExtra` and the default explainer paragraph.
   */
  detailsBody?: ReactNode;
  /** Muted subline under the title metrics (default: workspace “Based on…” copy). */
  subline?: string;
  /** When true, omit the first metric segment and the separator after the headline (task list). */
  hidePrimaryMetric?: boolean;
  /** When false, hide Zero transfers / Time window rows and the “These parameters…” block in Details. */
  showWorkspaceParameterDetails?: boolean;
  /** When set, shows a KPIs control in the banner actions that calls this handler. */
  onOpenKpis?: () => void;
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
  detailsBody,
  subline = 'Based on: Last 7 days demand • Zero transfers included • Cross-location balancing',
  hidePrimaryMetric = false,
  showWorkspaceParameterDetails = true,
  onOpenKpis,
}: RebalancingWorkspaceSummaryBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (dismissed) return null;

  const leadBlock = (
    <>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2EB8C2] text-white"
        aria-hidden
      >
        <RefreshSyncIcon size={24} className="text-inherit" />
      </div>
      <div className="min-w-0 flex-1 grid grid-cols-1 gap-2 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-4 md:gap-y-1 md:items-center">
        <div className="min-w-0 w-full max-w-prose md:w-fit md:max-w-full">
          <p className="flex w-fit max-w-full flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-['Inter',sans-serif] text-sm leading-snug text-[#101828]">
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
            <span className={`${metricToneClass[secondaryMetricTone]} pr-[20px]`}>{secondaryMetric}</span>
          </p>
        </div>
        <div className="min-w-0 max-w-prose md:max-w-none">
          <p className="font-['Inter',sans-serif] text-xs font-normal leading-relaxed text-[#98A2B3]">
            {subline}
          </p>
        </div>
      </div>
    </>
  );

  const actions = (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      {onOpenKpis ? (
        <button
          type="button"
          onClick={onOpenKpis}
          title="Key performance indicators"
          aria-label="Rebalancing KPIs, Key performance indicators"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#E3E8F0] bg-white px-3 font-['Inter',sans-serif] text-sm font-medium text-[#101828] transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0267FF]"
        >
          <BarChart3 size={16} strokeWidth={2} className="shrink-0 text-[#667085]" aria-hidden />
          <span className="leading-none">Rebalancing KPIs</span>
        </button>
      ) : null}
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
  );

  return (
    <div
      className="w-full min-w-0 rounded-xl border border-[#E3E8F0] bg-white px-4 py-3 sm:px-5 sm:py-4"
      role="region"
      aria-label="Rebalancing summary"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">{leadBlock}</div>
        {actions}
      </div>

      {detailsOpen ? (
        <div className="mt-2 w-full min-w-0 border-t border-[#E3E8F0] pt-[10px] text-left">
          <div
            className={`grid min-w-0 w-full grid-cols-1 gap-4 text-left lg:gap-y-4 ${
              showWorkspaceParameterDetails ? 'lg:grid-cols-2 lg:gap-x-10' : ''
            }`}
          >
            <div
              className={`min-w-0 space-y-3 ${
                showWorkspaceParameterDetails ? 'max-w-prose md:max-w-none' : 'w-full'
              }`}
            >
              {!showWorkspaceParameterDetails && detailsBody != null ? (
                detailsBody
              ) : (
                <>
                  {detailsIntroExtra ? (
                    <p className="font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#475467]">
                      {detailsIntroExtra}
                    </p>
                  ) : null}
                  <p className="font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#475467]">
                    Rebalancing automatically identifies where inventory is out of line with demand and suggests
                    transfers to better match supply with demand. It enables stock movement between locations and
                    prioritizes shifting inventory from low-performing locations to those with higher demand.
                  </p>
                </>
              )}
            </div>

            {showWorkspaceParameterDetails ? (
              <div className="min-w-0 flex flex-col divide-y divide-[#E3E8F0] lg:pt-0">
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
            ) : null}

            {showWorkspaceParameterDetails ? (
              <div className="min-w-0 border-t border-[#E3E8F0] pt-4 lg:col-span-2">
                <div className="max-w-3xl">
                  <p className="font-['Inter',sans-serif] text-sm font-bold leading-relaxed text-[#475467]">
                    These parameters directly influence how transfer opportunities are calculated, impacting:
                  </p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 font-['Inter',sans-serif] text-sm leading-relaxed text-[#475467] marker:text-[#475467]">
                    <li>Number of suggested transfers</li>
                    <li>Estimated revenue uplift</li>
                    <li>Which products and locations are prioritized</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
