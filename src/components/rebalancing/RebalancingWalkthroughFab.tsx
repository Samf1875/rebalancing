import { Megaphone } from 'lucide-react';

type RebalancingWalkthroughFabProps = {
  onOpen: () => void;
};

export function RebalancingWalkthroughFab({ onOpen }: RebalancingWalkthroughFabProps) {
  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[85] flex max-w-[min(100vw-1.5rem,calc(100vw-5rem))] items-center justify-end"
      role="presentation"
    >
      <div className="pointer-events-auto flex min-w-0 items-center">
        <div className="flex items-center rounded-md bg-[#1F2937] px-3 py-2 shadow-lg">
          <span className="font-['Inter',sans-serif] text-sm font-medium text-white">
            Show walkthrough
          </span>
        </div>
        <div
          className="h-0 w-0 shrink-0 border-y-[7px] border-y-transparent border-l-[8px] border-l-[#1F2937]"
          aria-hidden
        />
        <button
          type="button"
          onClick={onOpen}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0267FF] text-white shadow-lg transition-colors hover:bg-[#0258e6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0267FF]"
          aria-label="Show walkthrough"
        >
          <Megaphone size={26} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
