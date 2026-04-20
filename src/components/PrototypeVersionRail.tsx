import type { PrototypeVersionId } from '../lib/prototypeVersion';
import { PROTOTYPE_VERSION_IDS, PROTOTYPE_VERSION_LABELS } from '../lib/prototypeVersion';

type PrototypeVersionRailProps = {
  value: PrototypeVersionId;
  onChange: (id: PrototypeVersionId) => void;
};

export function PrototypeVersionRail({ value, onChange }: PrototypeVersionRailProps) {
  return (
    <div
      className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-[#1e2939] bg-[#0b0f14] px-4 py-2 sm:px-6"
      role="navigation"
      aria-label="Prototype version"
    >
      <span className="font-['Inter',sans-serif] text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
        Prototype
      </span>
      <div
        className="inline-flex rounded-md border border-[#1e2939] bg-[#12171e] p-0.5"
        role="tablist"
        aria-label="Switch prototype version"
      >
        {PROTOTYPE_VERSION_IDS.map((id) => {
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(id)}
              className={`min-w-[2.75rem] rounded px-2.5 py-1 font-['Inter',sans-serif] text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0267FF] ${
                active
                  ? 'bg-[#212b36] text-white shadow-sm'
                  : 'text-[#94a3b8] hover:bg-[#1a222c] hover:text-white'
              }`}
            >
              {PROTOTYPE_VERSION_LABELS[id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
