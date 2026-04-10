import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Your rebalancing dashboard',
    body: 'This is your rebalancing dashboard. It shows products that can benefit from stock transfers between locations.',
  },
  {
    title: 'Product groups',
    body: 'Each row is a product group. Review sales, coverage, and inventory in the columns to see how stock is distributed today.',
  },
  {
    title: 'Suggested transfers',
    body: 'This is the number of units we suggest moving to maximize sales. Transfers reduce overstock, fill understocks, and balance inventory across locations.',
  },
  {
    title: 'Locations & trips',
    body: 'Switch to the Locations or Trips tabs to explore transfers by store or by shipment, and to align with operational constraints.',
  },
  {
    title: 'You are ready',
    body: 'Select groups, generate recommendations from the action bar, adjust allocations if needed, then commit when you are satisfied. Use sort, filters, and column settings to focus your review.',
  },
];

type RebalancingWalkthroughProps = {
  open: boolean;
  stepIndex: number;
  onStepIndexChange: (index: number) => void;
  onClose: () => void;
  onComplete: () => void;
};

export function RebalancingWalkthrough({
  open,
  stepIndex,
  onStepIndexChange,
  onClose,
  onComplete,
}: RebalancingWalkthroughProps) {
  const total = STEPS.length;
  const step = STEPS[stepIndex] ?? STEPS[0];
  const isLast = stepIndex >= total - 1;

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

  if (!open || !step) return null;

  const goNext = () => {
    if (isLast) {
      onComplete();
      onClose();
    } else {
      onStepIndexChange(stepIndex + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) onStepIndexChange(stepIndex - 1);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-[#2a3340] bg-[#12171E] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md text-[#9AA4B2] transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close walkthrough"
        >
          <X size={18} />
        </button>
        <p className="mb-2 font-['Inter',sans-serif] text-xs font-medium uppercase tracking-wide text-[#7dd3fc]">
          Step {stepIndex + 1} of {total}
        </p>
        <h2 id="walkthrough-title" className="pr-8 font-['Inter',sans-serif] text-lg font-semibold text-white">
          {step.title}
        </h2>
        <p className="mt-3 font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#c9d1d9]">
          {step.body}
        </p>
        <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-[#0267FF]' : 'w-1.5 bg-white/25'}`}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#2a3340] pt-5">
          <button
            type="button"
            onClick={onClose}
            className="font-['Inter',sans-serif] text-sm font-medium text-[#9AA4B2] underline-offset-2 hover:text-white hover:underline"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={goBack}
              className="inline-flex h-10 items-center justify-center rounded-md border border-[#3d4a5c] bg-transparent px-4 font-['Inter',sans-serif] text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#0267FF] px-4 font-['Inter',sans-serif] text-sm font-semibold text-white transition-colors hover:bg-[#0256d9]"
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
