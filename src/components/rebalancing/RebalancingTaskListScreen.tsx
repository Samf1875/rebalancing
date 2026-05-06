import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, MoreVertical, Search } from 'lucide-react';
import {
  MOCK_REBALANCING_TASKS,
  MOCK_SUBMITTED_REBALANCING_TASKS,
  formatTransferValueEur,
  type RebalancingTaskRow,
} from '../../data/mockRebalancingTasks';
import { RebalancingWorkspaceSummaryBanner } from './RebalancingWorkspaceSummaryBanner';

const TASK_LIST_SUBLINE_ONGOING =
  'View and manage all active rebalancing batches in one place. Monitor progress, make edits, and ensure everything stays aligned with your strategy.';
const TASK_LIST_SUBLINE_SUBMITTED = 'View, track, and manage submitted rebalances.';

function RebalancingModuleDetailsBody({
  contextTitle,
  contextDescription,
}: {
  contextTitle: string;
  contextDescription: string;
}) {
  const p =
    "font-['Inter',sans-serif] text-sm font-normal leading-relaxed text-[#475467]";
  const titleSm = "font-['Inter',sans-serif] text-sm font-semibold leading-snug text-[#101828]";
  return (
    <div className="space-y-3 pt-[10px]">
      <div className="space-y-2">
        <p className={titleSm}>{contextTitle}</p>
        <p className={p}>{contextDescription}</p>
      </div>
      <div className="space-y-3">
        <p className={titleSm}>Rebalancing Module</p>
        <p className={p}>Manage and optimize how stock is redistributed across your network.</p>
        <p className={p}>
          Rebalancing allows you to move inventory between alternate sources such as stores or local warehouses rather
          than relying on default replenishment from distribution centers. This helps ensure the right products are
          available in the right locations at the right time.
        </p>
        <p className={p}>Use rebalancing to support three key strategies:</p>
        <ul className="list-none space-y-2 pl-0 font-['Inter',sans-serif] text-sm leading-relaxed text-[#475467]">
          <li>Optimize – Balance stock across locations to maintain consistent coverage and assortment</li>
          <li>Consolidate – Shift inventory to high-performing locations to maximize sell-through</li>
          <li>
            Clean up – Return excess or underperforming stock to warehouses to free up space and prepare for next actions
          </li>
        </ul>
        <p className={p}>
          Rebalancing can be applied across different geographical scopes, from local regions to global networks, giving
          you flexibility to respond to demand at any level.
        </p>
      </div>
    </div>
  );
}

type RebalancingTaskListScreenProps = {
  onOpenTask: (task: RebalancingTaskRow) => void;
  /** Optional — called when the user chooses Re-create from the row actions menu. */
  onRecreateTask?: (task: RebalancingTaskRow) => void;
};

const TASK_ACTIONS_MENU_MIN_PX = 168;
const TASK_ACTIONS_VIEWPORT_PAD = 12;

/** Matches `AutoneHeaderInfoTooltip` trigger + AssortmentTable header row typography (sentence-style labels, no all-caps) */
const HEADER_COLUMN_LABEL_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded px-0.5 font-['Inter',sans-serif] text-[14px] font-semibold leading-none text-[#101828] transition-colors hover:text-[#00050a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0267FF]";

const thClass =
  'h-[62px] min-h-[62px] max-h-[62px] box-border overflow-hidden px-4 py-0 text-left align-middle';

const thClassRight =
  'h-[62px] min-h-[62px] max-h-[62px] box-border overflow-hidden px-4 py-0 text-right align-middle';

/** Align cell text with label after grip (18px) + gap (8px) inside `px-4` header cells */
const thGripLabel = (label: string) => (
  <span className="flex h-full items-center gap-2">
    <GripVertical
      size={18}
      strokeWidth={2}
      className="shrink-0 text-[#9CA3AF]"
      aria-hidden
    />
    <span className={HEADER_COLUMN_LABEL_CLASS}>{label}</span>
  </span>
);

/** Numeric columns: grip + label grouped to the right edge */
const thGripLabelRight = (label: string) => (
  <span className="flex h-full w-full items-center justify-end gap-2">
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

/** Numeric columns — right-aligned, no grip offset */
const dataCellPadRight = 'py-3 px-4 text-right';

export function RebalancingTaskListScreen({ onOpenTask, onRecreateTask }: RebalancingTaskListScreenProps) {
  const [tab, setTab] = useState<'ongoing' | 'submitted'>('ongoing');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [taskActionsMenu, setTaskActionsMenu] = useState<{
    task: RebalancingTaskRow;
    top: number;
    left: number;
  } | null>(null);
  const taskActionsMenuRef = useRef<HTMLDivElement>(null);

  const visibleTasks = useMemo(() => {
    const list = tab === 'ongoing' ? MOCK_REBALANCING_TASKS : MOCK_SUBMITTED_REBALANCING_TASKS;
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

  useEffect(() => {
    if (!taskActionsMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTaskActionsMenu(null);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-task-actions-menu]') || t.closest('[data-task-actions-trigger]')) return;
      setTaskActionsMenu(null);
    };
    const onScroll = () => setTaskActionsMenu(null);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [taskActionsMenu]);

  return (
    <div
      className="relative left-0 mx-0 flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col gap-4 self-stretch overflow-y-auto bg-white px-6 pt-4 pb-12"
      data-rebalancing-task-list
    >
      <div className="flex w-full min-w-0 flex-col gap-3">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-3">
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
                      ? 'border-[#2EB8C2] font-semibold text-[#00050a]'
                      : 'border-transparent font-normal text-[#4b535c] hover:text-[#00050a]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <RebalancingWorkspaceSummaryBanner
          headline={tab === 'ongoing' ? 'Rebalancing: Ongoing' : 'Rebalancing: Submitted'}
          hidePrimaryMetric
          secondaryMetric={
            tab === 'ongoing'
              ? `${visibleTasks.length} rebalancings ongoing`
              : `${visibleTasks.length} rebalancings submitted`
          }
          secondaryMetricTone="muted"
          subline={tab === 'ongoing' ? TASK_LIST_SUBLINE_ONGOING : TASK_LIST_SUBLINE_SUBMITTED}
          detailsBody={
            <RebalancingModuleDetailsBody
              contextTitle={tab === 'ongoing' ? 'Rebalancing: Ongoing' : 'Rebalancing: Submitted'}
              contextDescription={tab === 'ongoing' ? TASK_LIST_SUBLINE_ONGOING : TASK_LIST_SUBLINE_SUBMITTED}
            />
          }
          showWorkspaceParameterDetails={false}
        />
      </div>

      <div ref={searchWrapRef} className="flex w-full min-w-0 items-center justify-end">
        {!searchOpen ? (
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-[#E3E8F0] bg-white text-[#101828] transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0267FF]"
            aria-label="Open search"
            aria-expanded={false}
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} strokeWidth={1.75} className="text-[#101828]" aria-hidden />
          </button>
        ) : (
          <div
            className="flex h-10 w-[150px] min-w-0 shrink-0 items-center gap-2.5 rounded-[4px] border border-[#E3E8F0] bg-white px-3 py-0"
            role="search"
          >
            <span className="pointer-events-none flex shrink-0 text-[#101828]" aria-hidden>
              <Search size={16} strokeWidth={1.75} />
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
          <thead className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0]">
            <tr className="h-[62px] min-h-[62px] max-h-[62px] text-left [&_th]:whitespace-nowrap">
              <th scope="col" className={thClass}>
                {thGripLabel('Name')}
              </th>
              <th scope="col" className={thClassRight}>
                {thGripLabelRight('Created')}
              </th>
              <th scope="col" className={thClassRight}>
                {thGripLabelRight('Unique trips')}
              </th>
              <th scope="col" className={thClassRight}>
                {thGripLabelRight('Transfer units')}
              </th>
              <th scope="col" className={thClassRight}>
                {thGripLabelRight('Transfer value')}
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
                <td className={`${dataCellPadRight} align-middle font-['Inter',sans-serif] text-sm text-[#101828]`}>
                  <div className="flex flex-col items-end gap-0.5 leading-tight text-right">
                    <span className="whitespace-nowrap">{task.createdLabel}</span>
                    <span className="font-['Inter',sans-serif] text-xs text-[#6B7280]">{task.creator}</span>
                  </div>
                </td>
                <td className={`${dataCellPadRight} align-middle font-['Inter',sans-serif] text-sm tabular-nums text-[#101828]`}>
                  {task.uniqueTrips.toLocaleString()}
                </td>
                <td className={`${dataCellPadRight} align-middle font-['Inter',sans-serif] text-sm tabular-nums text-[#101828]`}>
                  {task.transferUnits.toLocaleString()}
                </td>
                <td className={`${dataCellPadRight} align-middle font-['Inter',sans-serif] text-sm tabular-nums font-medium text-[#101828]`}>
                  {formatTransferValueEur(task.transferValueEur)}
                </td>
                <td className="px-2 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    data-task-actions-trigger=""
                    className="flex h-9 w-9 items-center justify-center rounded text-[#6B7280] transition-colors hover:bg-slate-100 hover:text-[#101828] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0267FF]"
                    aria-label={`Actions for ${task.name}`}
                    aria-expanded={taskActionsMenu?.task.id === task.id}
                    aria-haspopup="menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const left = Math.max(
                        TASK_ACTIONS_VIEWPORT_PAD,
                        Math.min(
                          rect.right - TASK_ACTIONS_MENU_MIN_PX,
                          window.innerWidth - TASK_ACTIONS_MENU_MIN_PX - TASK_ACTIONS_VIEWPORT_PAD
                        )
                      );
                      setTaskActionsMenu((prev) =>
                        prev?.task.id === task.id
                          ? null
                          : { task, top: rect.bottom + 4, left }
                      );
                    }}
                  >
                    <MoreVertical size={18} strokeWidth={2} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
            {visibleTasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-['Inter',sans-serif] text-sm text-[#6B7280]">
                  {tab === 'ongoing' ? 'No ongoing rebalancings.' : 'No submitted rebalancings yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {taskActionsMenu != null &&
        createPortal(
          <div
            ref={taskActionsMenuRef}
            data-task-actions-menu=""
            role="menu"
            aria-label="Task actions"
            className="fixed z-[90] min-w-[168px] overflow-hidden rounded-lg border border-[#E3E8F0] bg-white py-1 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.12),0_4px_8px_-4px_rgba(15,23,42,0.08)]"
            style={{
              top: taskActionsMenu.top,
              left: taskActionsMenu.left,
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left font-['Inter',sans-serif] text-sm font-medium text-[#101828] transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              onClick={() => {
                onRecreateTask?.(taskActionsMenu.task);
                setTaskActionsMenu(null);
              }}
            >
              Re-create
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
