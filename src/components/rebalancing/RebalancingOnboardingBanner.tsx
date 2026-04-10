import { ChevronRight, Megaphone, X } from 'lucide-react';

type RebalancingOnboardingBannerProps = {
  onDismiss: () => void;
  onStartWalkthrough: () => void;
  onOpenHowItWorks: () => void;
};

export function RebalancingOnboardingBanner({
  onDismiss,
  onStartWalkthrough,
  onOpenHowItWorks,
}: RebalancingOnboardingBannerProps) {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-4 rounded-lg border border-[#22272F] bg-[#12171E] px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-4"
      role="region"
      aria-label="Rebalancing introduction"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Megaphone size={22} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <p className="font-['Inter',sans-serif] text-[15px] font-semibold leading-snug text-white sm:text-base">
            Optimize stock across locations
          </p>
          <p className="font-['Inter',sans-serif] text-sm font-normal leading-normal text-[#c9d1d9]">
            Rebalancing suggests transfers between locations to increase sales and reduce overstock.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onStartWalkthrough}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#0267FF] px-4 font-['Inter',sans-serif] text-sm font-semibold text-white transition-colors hover:bg-[#0256d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Start walkthrough
        </button>
        <button
          type="button"
          onClick={onOpenHowItWorks}
          className="inline-flex h-10 items-center gap-1 font-['Inter',sans-serif] text-sm font-semibold text-[#7dd3fc] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dd3fc]"
        >
          Learn how it works
          <ChevronRight size={18} className="shrink-0" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#9AA4B2] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:ml-0"
          aria-label="Dismiss introduction"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
