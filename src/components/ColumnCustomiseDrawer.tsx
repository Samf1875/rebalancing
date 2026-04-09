import { useEffect } from 'react';
import { X } from 'lucide-react';
import {
  TABLE_COLUMN_CUSTOMISE_OPTIONS,
  type TableColumnVisibilityKey,
} from '../tableColumnCustomise';

type ColumnCustomiseDrawerProps = {
  open: boolean;
  onClose: () => void;
  visibility: Record<TableColumnVisibilityKey, boolean>;
  onChange: (key: TableColumnVisibilityKey, visible: boolean) => void;
};

export function ColumnCustomiseDrawer({
  open,
  onClose,
  visibility,
  onChange,
}: ColumnCustomiseDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="column-customise-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 transition-opacity"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-[420px] flex-col bg-white shadow-[-12px_0_32px_-8px_rgba(15,23,42,0.16)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e9eaeb] px-6 py-5">
          <h2
            id="column-customise-title"
            className="font-['Inter',sans-serif] text-lg font-semibold leading-tight text-[#00050a]"
          >
            Customise columns
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-[#101828] transition-colors hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-4 font-['Inter',sans-serif] text-sm font-medium text-[#6B7280]">Available columns</p>
          <ul className="flex flex-col gap-1">
            {TABLE_COLUMN_CUSTOMISE_OPTIONS.map(({ id, label }) => (
              <li key={id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={visibility[id]}
                    onChange={(e) => onChange(id, e.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-2 border-[#D1D5DB] text-[#2563EB] accent-[#2563EB] focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-0"
                  />
                  <span className="font-['Inter',sans-serif] text-sm font-normal text-[#00050a]">{label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
