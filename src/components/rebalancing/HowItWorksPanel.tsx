import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileOutput, LayoutGrid, Send, Target, X } from 'lucide-react';

type HowItWorksPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function HowItWorksPanel({ open, onClose }: HowItWorksPanelProps) {
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
    <div className="fixed inset-0 z-[110] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="how-it-works-title">
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
          <h2 id="how-it-works-title" className="font-['Inter',sans-serif] text-lg font-semibold text-white">
            How it works
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
                <Target size={20} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-white">Goal</h3>
                <p className="font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#c9d1d9]">
                  Balance stock across locations to avoid lost sales and overstock.
                </p>
              </div>
            </section>
            <section className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <LayoutGrid size={20} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-white">Inputs</h3>
                <ul className="list-disc space-y-1 pl-5 font-['Inter',sans-serif] text-sm leading-relaxed text-[#c9d1d9]">
                  <li>Sales history</li>
                  <li>Stock levels</li>
                  <li>Location demand</li>
                </ul>
              </div>
            </section>
            <section className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <FileOutput size={20} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-white">Output</h3>
                <ul className="list-disc space-y-1 pl-5 font-['Inter',sans-serif] text-sm leading-relaxed text-[#c9d1d9]">
                  <li>Suggested transfers</li>
                  <li>Estimated revenue gain</li>
                </ul>
              </div>
            </section>
            <section className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Send size={20} className="text-[#7dd3fc]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-white">How to use it</h3>
                <ul className="list-disc space-y-1 pl-5 font-['Inter',sans-serif] text-sm leading-relaxed text-[#c9d1d9]">
                  <li>Review suggested transfers and revenue impact in the table.</li>
                  <li>Select product groups and generate recommendations when you are ready.</li>
                  <li>Use Locations and Trips tabs for store- and shipment-level detail.</li>
                  <li>Commit changes to apply your assortment decisions.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
