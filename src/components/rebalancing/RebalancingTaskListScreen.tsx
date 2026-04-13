import { useState, useMemo, useRef, useEffect } from 'react';
import { GripVertical, MoreVertical } from 'lucide-react';
import { AutoneSearchIcon } from '../icons/AutoneSearchIcon';
import {
  MOCK_REBALANCING_TASKS,
  formatTransferValueEur,
  type RebalancingTaskRow,
} from '../../data/mockRebalancingTasks';

type RebalancingTaskListScreenProps = {
  onOpenTask: (task: RebalancingTaskRow) => void;
};

/** Matches `AutoneHeaderInfoTooltip` trigger + AssortmentTable header row typography (sentence-style labels, no all-caps) */
const HEADER_COLUMN_LABEL_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded px-0.5 font-['Inter',sans-serif] text-[14px] font-semibold leading-none text-[#101828] transition-colors hover:text-[#00050a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0267FF]";

const thClass =
  'h-[62px] min-h-[62px] max-h-[62px] box-border overflow-hidden px-4 py-0 text-left align-middle';

/** Align cell text with label after grip (18px) + gap (8px) inside `px-4` header cells */
const thGripLabel = (label: string) => (
  <span className="inline-flex max-h-[62px] min-h-0 items-center gap-2">
    <GripVertical
      size={18}
      strokeWidth={2}
      className="shrink-0 text-[#9CA3AF]"
      aria-hidden
    />
    <span className={HEADER_COLUMN_LABEL_CLASS}>{label}</span>
  </span>
);

/** Align cell text with label text after grip+gap in header */
const dataCellPad = 'py-3 pl-[42px] pr-4';

export function RebalancingTaskListScreen({ onOpenTask }: RebalancingTaskListScreenProps) {
  const [tab, setTab] = useState<'ongoing' | 'submitted'>('ongoing');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const visibleTasks = useMemo(() => {
    const list = tab === 'ongoing' ? MOCK_REBALANCING_TASKS : [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((task) => {
      const valueStr = formatTransferValueEur(task.transferValueEur).toLowerCase();
      const hay = `${task.name} ${task.createdLabel} ${task.creator} ${task.uniqueTrips} ${task.transferUnits} ${valueStr}`;
      return hay.toLowerCase().includes(q);
    });
  }, [tab, searchQuery]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [searchOpen]);

  return (
    <div
      className="relative left-0 mx-0 flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col gap-4 self-stretch overflow-y-auto bg-white px-6 pt-4 pb-12"
      data-rebalancing-task-list
    >
      <div className="flex w-full min-w-0 flex-wrap items-center gap-3 border-b border-[#e9eaeb] pb-4">
        <div
          className="flex min-w-0 flex-wrap items-center gap-8"
          role="tablist"
          aria-label="Rebalancing tasks"
        >
          {(
            [
              { id: 'ongoing' as const, label: 'Ongoing' },
              { id: 'submitted' as const, label: 'Submitted' },
            ] as const
          ).map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={`flex items-center justify-center border-b-2 px-1 py-3 text-sm transition-colors ${
                  active
                    ? 'border-[#0267FF] font-semibold text-[#00050a]'
                    : 'border-transparent font-normal text-[#4b535c] hover:text-[#00050a]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={searchWrapRef} className="flex w-full min-w-0 items-center justify-start">
        {!searchOpen ? (
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] border border-[#E3E8F0] bg-white text-[#101828] transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0267FF]"
            aria-label="Open search"
            aria-expanded={false}
            onClick={() => setSearchOpen(true)}
          >
            <span className="text-[18px] leading-none text-[#22272F]">
              <AutoneSearchIcon className="!text-[18px]" />
            </span>
          </button>
        ) : (
          <div
            className="flex h-12 w-[150px] min-w-0 shrink-0 items-center gap-2.5 rounded-[4px] border border-[#E3E8F0] bg-white px-3 py-0"
            role="search"
          >
            <span className="pointer-events-none flex shrink-0 text-[18px] leading-none text-[#22272F]" aria-hidden>
              <AutoneSearchIcon className="!text-[18px]" />
            </span>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search..."
              className="min-h-0 min-w-0 flex-1 border-0 bg-transparent py-2 font-['Inter',sans-serif] text-sm text-[#101828] outline-none placeholder:text-[#667085] placeholder:lowercase"
              aria-label="Search rebalancing tasks"
              autoComplete="off"
            />
          </div>
        )}
      </div>

      <div className="min-w-0 overflow-x-auto rounded-lg border-[0.5px] border-solid border-[#E3E8F0]">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="h-[62px] min-h-[62px] max-h-[62px] text-left [&_th]:whitespace-nowrap">
              <th scope="col" className={thClass}>
                {thGripLabel('Name')}
              </th>
              <th scope="col" className={thClass}>
                {thGripLabel('Created')}
              </th>
              <th scope="col" className={thClass}>
                {thGripLabel('Unique trips')}
              </th>
              <th scope="col" className={thClass}>
                {thGripLabel('Transfer units')}
              </th>
              <th scope="col" className={thClass}>
                {thGripLabel('Transfer value')}
              </th>
              <th
                className="h-[62px] min-h-[62px] max-h-[62px] w-12 box-border overflow-hidden px-2 py-0 align-middle"
                scope="col"
                aria-hidden
              />
            </tr>
          </thead>
          <tbody className="[&_td]:border-t-0 [&_td]:border-b-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]">
            {visibleTasks.map((task) => (
              <tr
                key={task.id}
                className="cursor-pointer bg-white hover:bg-slate-50/90"
                onClick={() => onOpenTask(task)}
              >
                <td className={`${dataCellPad} align-middle`}>
                  <span className="max-w-[min(100%,280px)] truncate font-['Inter',sans-serif] text-sm font-semibold text-[#101828]">
                    {task.name}
                  </span>
                </td>
                <td className={`${dataCellPad} align-middle font-['Inter',sans-serif] text-sm text-[#101828]`}>
                  <div className="flex flex-col gap-0.5 leading-tight">
                    <span className="whitespace-nowrap">{task.createdLabel}</span>
                    <span className="font-['Inter',sans-serif] text-xs text-[#6B7280]">{task.creator}</span>
                  </div>
                </td>
                <td className={`${dataCellPad} align-middle font-['Inter',sans-serif] text-sm tabular-nums text-[#101828]`}>
                  {task.uniqueTrips.toLocaleString()}
                </td>
                <td className={`${dataCellPad} align-middle font-['Inter',sans-serif] text-sm tabular-nums text-[#101828]`}>
                  {task.transferUnits.toLocaleString()}
                </td>
                <td className={`${dataCellPad} align-middle font-['Inter',sans-serif] text-sm tabular-nums font-medium text-[#101828]`}>
                  {formatTransferValueEur(task.transferValueEur)}
                </td>
                <td className="px-2 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded text-[#6B7280] transition-colors hover:bg-slate-100 hover:text-[#101828]"
                    aria-label={`Actions for ${task.name}`}
                  >
                    <MoreVertical size={18} strokeWidth={2} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
            {tab === 'submitted' && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-['Inter',sans-serif] text-sm text-[#6B7280]">
                  No submitted rebalancings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
