import { ChevronDown, Pin, X } from 'lucide-react';
import { drillDropdownMenuItemHover } from '../../lib/dropdownMenuClasses';

export const SAVED_FILTER_VIEWS = ["Sam's view", "Adil's view", "Tamir's view"] as const;

export const PINNABLE_SAVED_FILTERS = [
  { id: 'low-confidence', label: 'Low confidence' },
  { id: 'med-confidence', label: 'Med confidence' },
  { id: 'high-confidence', label: 'High confidence' },
  { id: 'best-sellers', label: 'Best sellers' },
  { id: 'slow-movers', label: 'Slow movers' },
] as const;

export type PinnableSavedFilterId = (typeof PINNABLE_SAVED_FILTERS)[number]['id'];

const CHIP_STYLES: Record<PinnableSavedFilterId, string> = {
  'low-confidence': 'border-[#cbd5e1]/80 bg-[#e2e8f0]/90 text-[#334155]',
  'med-confidence': 'border-[#fcd34d]/70 bg-[#fef3c7]/90 text-[#78350f]',
  'high-confidence': 'border-[#86efac]/70 bg-[#dcfce7]/90 text-[#14532d]',
  'best-sellers': 'border-[#c4b5fd]/80 bg-[#ede9fe]/95 text-[#4c1d95]',
  'slow-movers': 'border-[#fbcfe8]/80 bg-[#fce7f3]/95 text-[#831843]',
};

/** Toggle id in ordered pinned list (append when pinning; preserves order). */
export function togglePinnedSavedFilter(
  prev: PinnableSavedFilterId[],
  id: PinnableSavedFilterId
): PinnableSavedFilterId[] {
  if (prev.includes(id)) return prev.filter((x) => x !== id);
  return [...prev, id];
}

export function PinnedFiltersBar({
  pinnedOrder,
  onRemove,
}: {
  pinnedOrder: readonly string[];
  onRemove: (id: PinnableSavedFilterId) => void;
}) {
  if (pinnedOrder.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      {pinnedOrder.map((id) => {
        const meta = PINNABLE_SAVED_FILTERS.find((p) => p.id === id);
        if (!meta) return null;
        const tone = CHIP_STYLES[id as PinnableSavedFilterId];
        return (
          <span
            key={id}
            className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 font-['Inter',sans-serif] text-xs font-medium leading-none ${tone}`}
          >
            <span className="min-w-0 truncate">{meta.label}</span>
            <button
              type="button"
              onClick={() => onRemove(meta.id)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-current opacity-70 transition-opacity hover:opacity-100"
              aria-label={`Remove ${meta.label}`}
            >
              <X size={14} strokeWidth={2} aria-hidden />
            </button>
          </span>
        );
      })}
    </div>
  );
}

type SavedFiltersMenuPanelProps = {
  menuId: string;
  triggerId: string;
  pinnedIds: ReadonlySet<string>;
  onTogglePin: (id: PinnableSavedFilterId) => void;
  onPickView: (label: string) => void;
  /** Vertical offset under trigger (default matches h-8 toolbar). */
  panelTopClass?: string;
};

export function SavedFiltersMenuPanel({
  menuId,
  triggerId,
  pinnedIds,
  onTogglePin,
  onPickView,
  panelTopClass = 'top-[36px]',
}: SavedFiltersMenuPanelProps) {
  return (
    <div
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      className={`absolute right-0 z-50 flex max-h-[min(70vh,420px)] w-[min(100vw-2rem,280px)] min-w-[260px] flex-col rounded-lg border border-[#e9eaeb] bg-white p-2 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.12),0_4px_8px_-4px_rgba(15,23,42,0.08)] ${panelTopClass}`}
    >
      <div className="flex flex-col gap-0.5">
        {SAVED_FILTER_VIEWS.map((label) => (
          <button
            key={label}
            type="button"
            role="menuitem"
            className={`flex h-9 w-full shrink-0 cursor-pointer items-center rounded-md bg-white px-3 py-0 text-left font-['Inter',sans-serif] text-[12px] font-medium leading-normal text-[#00050a] transition-colors ${drillDropdownMenuItemHover}`}
            onClick={() => onPickView(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="my-2 h-px w-full shrink-0 bg-[#e9eaeb]" aria-hidden />
      <div className="flex flex-col gap-0.5">
        {PINNABLE_SAVED_FILTERS.map(({ id, label }) => {
          const pinned = pinnedIds.has(id);
          return (
            <div
              key={id}
              className={`flex h-9 w-full shrink-0 items-center gap-2 rounded-md bg-white px-2 py-0 font-['Inter',sans-serif] text-[12px] font-medium text-[#00050a] ${drillDropdownMenuItemHover}`}
            >
              <button
                type="button"
                role="menuitem"
                className="flex min-h-9 min-w-0 flex-1 cursor-pointer items-center px-1 py-0 text-left leading-normal text-[#00050a]"
                onClick={() => onPickView(label)}
              >
                <span className="min-w-0 truncate">{label}</span>
              </button>
              <button
                type="button"
                aria-label={pinned ? `Unpin ${label}` : `Pin ${label}`}
                aria-pressed={pinned}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(id);
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#6B7280] transition-colors hover:bg-slate-100 hover:text-[#0267FF]"
              >
                <Pin
                  size={16}
                  strokeWidth={2}
                  className={pinned ? 'text-[#0267FF]' : undefined}
                  aria-hidden
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SavedFiltersToolbarTriggerProps = {
  open: boolean;
  triggerId: string;
  menuId: string;
  ariaHaspopup?: 'menu' | 'true';
  onClick: () => void;
  /** Merged after defaults (e.g. h-12 rounded-lg for compact vs spacious toolbars). */
  triggerClassName?: string;
};

export function SavedFiltersToolbarTrigger({
  open,
  triggerId,
  menuId,
  ariaHaspopup = 'menu',
  onClick,
  triggerClassName = '',
}: SavedFiltersToolbarTriggerProps) {
  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-haspopup={ariaHaspopup}
      aria-controls={menuId}
      onClick={onClick}
      className={`flex h-8 min-h-8 shrink-0 items-center justify-between gap-2 rounded border border-[#e9eaeb] bg-white px-3 text-left font-['Inter',sans-serif] text-sm font-normal leading-none text-[#101828] outline-none transition-colors hover:bg-slate-50 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[#0267FF] focus-visible:ring-offset-0 ${triggerClassName}`}
    >
      <span className="whitespace-nowrap">Saved filters</span>
      <ChevronDown
        size={16}
        strokeWidth={2}
        className={`shrink-0 text-[#101828] transition-transform ${open ? 'rotate-180' : ''}`}
        aria-hidden
      />
    </button>
  );
}
