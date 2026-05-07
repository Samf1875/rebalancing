import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
  Copy,
  Filter,
  Lightbulb,
  Package,
  Pencil,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import type { AssortmentRow } from '../types';
import { ASSORTMENT_HEADER_RICH } from '../data/assortmentHeaderTooltips';
import { AutoneReceivingLocationIcon } from './icons/AutoneReceivingLocationIcon';
import { HEADER_INFO_TOOLTIPS } from '../data/headerInfoTooltips';
import {
  MOCK_PRODUCT_TRANSFER_LOCATIONS,
  MOCK_PRODUCT_TRANSFER_SUMMARY,
  type ProductTransferLocationRow,
  type ProductTransferStorageCapacity,
  type TuBreakdownItem,
} from '../data/mockProductTransferLocations';
import { TransitionArrowSeparator } from './TransitionArrowSeparator';

function storageCapacityPill(phase: ProductTransferStorageCapacity) {
  if (phase === 'saturated') {
    return (
      <span className="inline-flex max-w-full items-center justify-center rounded-full bg-[#FEE4E2] px-2.5 py-1 font-['Inter',sans-serif] text-[12px] font-medium text-[#B42318]">
        Saturated
      </span>
    );
  }
  return (
    <span className="inline-flex max-w-full items-center justify-center rounded-full bg-[#F2F4F7] px-2.5 py-1 font-['Inter',sans-serif] text-[12px] font-medium text-[#101828]">
      Space remaining
    </span>
  );
}
import { AutoneHeaderInfoTooltip } from './AutoneHeaderInfoTooltip';

const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";
const tableCellNumeric =
  "font-['Inter',sans-serif] text-[14px] font-medium leading-normal text-[#101828]";
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";
const tableRowHoverTd = '';
const headerTitleClass =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";

function renderArrowPair(from: number, to: number): ReactNode {
  return (
    <>
      {from.toLocaleString()}
      <TransitionArrowSeparator />
      {to.toLocaleString()}
    </>
  );
}

function renderCoveragePair(fromPct: number, toPct: number): ReactNode {
  return (
    <>
      {fromPct}%
      <TransitionArrowSeparator />
      {toPct}%
    </>
  );
}

function truncateSku(sku: string, max = 14): string {
  if (sku.length <= max) return sku;
  return `${sku.slice(0, Math.max(0, max - 3))}...`;
}

/** Shared with workspace toolbar — breadcrumb for product → transfers drill-down */
export function ProductTransfersBreadcrumb({
  parentRow,
  onBack,
}: {
  parentRow: AssortmentRow;
  onBack: () => void;
}) {
  const detail = parentRow.productCellDetail;
  const breadcrumbProduct = `${detail.title} [${truncateSku(detail.sku)}]`;
  return (
    <nav
      className="min-w-0 flex-1 font-['Inter',sans-serif] text-sm leading-snug text-[#00050a]"
      aria-label="Breadcrumb"
    >
      <button
        type="button"
        onClick={onBack}
        className="max-w-full truncate text-left font-normal text-[#667085] transition-colors hover:text-[#101828] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0267FF]"
      >
        {breadcrumbProduct}
      </button>
      <span className="mx-1 inline text-[#6A7282]" aria-hidden>
        &gt;
      </span>
      <span className="font-semibold text-[#00050a]">Transfers</span>
    </nav>
  );
}

const TU_POPOVER_PAD = 12;

function TuBreakdownBadge({
  item,
  rowId,
  index,
  isOpen,
  onOpen,
  onClose,
}: {
  item: TuBreakdownItem;
  rowId: string;
  index: number;
  isOpen: boolean;
  onOpen: (payload: { rowId: string; index: number; rect: DOMRect }) => void;
  onClose: () => void;
}) {
  const handleOpen = (el: HTMLButtonElement) => {
    onOpen({ rowId, index, rect: el.getBoundingClientRect() });
  };

  const colorClasses =
    item.kind === 'warehouse'
      ? 'bg-[#6864E6] text-white'
      : item.kind === 'transfer'
        ? 'bg-[#2EB8C2] text-white'
        : item.kind === 'transfer-out'
          ? 'bg-white text-[#2EB8C2] border border-[#2EB8C2]'
          : 'bg-white text-[#6864E6] border border-[#6864E6]';

  return (
    <button
      type="button"
      data-tu-badge=""
      className={`inline-flex h-[26px] w-[50px] shrink-0 cursor-pointer items-center justify-center gap-[5px] rounded-[2px] font-['Inter',sans-serif] text-[11px] font-medium tabular-nums outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-[#0267FF] focus-visible:ring-offset-1 ${colorClasses}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      onMouseEnter={(e) => handleOpen(e.currentTarget)}
      onMouseLeave={onClose}
      onFocus={(e) => handleOpen(e.currentTarget)}
      onBlur={onClose}
    >
      {item.kind === 'transfer' ? (
        <Truck className="size-[18px] shrink-0 -scale-x-100" strokeWidth={2} aria-hidden />
      ) : item.kind === 'transfer-out' ? (
        <Truck className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
      ) : (
        <Package className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
      )}
      {item.count}
    </button>
  );
}

function RowFilterButton({ rowName }: { rowName: string }) {
  const [hovered, setHovered] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleEnter = () => {
    if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect());
    setHovered(true);
  };
  const handleLeave = () => setHovered(false);
  const handleFocus = () => {
    if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect());
    setHovered(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Filter network by connections to ${rowName}`}
        className="inline-flex shrink-0 cursor-pointer text-[#6A7282] opacity-0 outline-none transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0267FF] hover:text-[#101828]"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleFocus}
        onBlur={handleLeave}
      >
        <Filter size={16} strokeWidth={2} aria-hidden />
      </button>
      {hovered && rect
        ? createPortal(
            <div
              role="tooltip"
              className="pointer-events-none fixed z-[70] whitespace-nowrap rounded-full bg-[#12171E] px-3 py-1.5 font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-white shadow-[0_8px_24px_-4px_rgba(15,23,42,0.25)]"
              style={{
                left: rect.left + rect.width / 2,
                top: rect.top - 8,
                transform: 'translate(-50%, -100%)',
              }}
            >
              Filter network by connections to this location
            </div>,
            document.body
          )
        : null}
    </>
  );
}

const transferPopRowText = "font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#101828]";
const transferPopPill =
  "shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]";
const transferPopSection =
  "font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]";

function TransferPopRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="inline-flex size-3.5 shrink-0 items-center justify-center text-[#101828]">{icon}</span>
        <span className={transferPopRowText}>{label}</span>
      </div>
      <span className={transferPopPill}>{value}</span>
    </div>
  );
}

function TransferPopReason({ label }: { label: ReactNode }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="mt-px inline-flex size-3.5 shrink-0 items-center justify-center text-[#101828]">
        <Lightbulb className="size-3.5" strokeWidth={2} aria-hidden />
      </span>
      <span className={transferPopRowText}>{label}</span>
    </div>
  );
}

function formatCurrencyEur(value: number): string {
  return `€${Math.round(value).toLocaleString('en-US')}`;
}

function formatStockArrow(from: number, to: number): ReactNode {
  return (
    <>
      {from.toLocaleString()}
      <TransitionArrowSeparator />
      {to.toLocaleString()}
    </>
  );
}

function formatWeeksCoverageArrow(
  stock: { from: number; to: number },
  forecastPerWeek: number,
  targetWeeks: number
): ReactNode {
  if (forecastPerWeek <= 0) {
    return 'N/A (0 forecast)';
  }
  const fromWeeks = stock.from / forecastPerWeek;
  const toWeeks = stock.to / forecastPerWeek;
  const fmt = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));
  return (
    <>
      {fmt(fromWeeks)}
      <TransitionArrowSeparator />
      {fmt(toWeeks)} ({targetWeeks} target)
    </>
  );
}

/** Placeholder visibility % (before → after); wired to real data later. */
const MOCK_VISIBILITY_SENDING = { fromPct: 20, toPct: 0 };
const MOCK_VISIBILITY_RECEIVING = { fromPct: 60, toPct: 90 };

/** Tooltip for Product visibility impact (same AutoneHeaderInfoTooltip simple mode as column headers). */
const PRODUCT_VISIBILITY_IMPACT_TOOLTIP =
  "Share of this product's sizes present at the location. Different from weeks coverage, which measures whether stock levels meet demand.";

function RecommendedTransferProductVisibilityImpact({
  sendingLabel,
  receivingLabel,
}: {
  sendingLabel: string;
  receivingLabel: string;
}) {
  return (
    <>
      <div className="mb-2 mt-4">
        <AutoneHeaderInfoTooltip
          label="Product visibility impact"
          content={PRODUCT_VISIBILITY_IMPACT_TOOLTIP}
          topAlign="start"
          portalZIndexClass="z-[220]"
          hoverWith={<span className={transferPopSection}>Product visibility impact</span>}
        />
      </div>
      <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
            {sendingLabel}
          </span>
          <span className="inline-flex shrink-0 items-center gap-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
            <span>{MOCK_VISIBILITY_SENDING.fromPct}%</span>
            <TransitionArrowSeparator className="mx-0 shrink-0" />
            <span>{MOCK_VISIBILITY_SENDING.toPct}%</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
            {receivingLabel}
          </span>
          <span className="inline-flex shrink-0 items-center gap-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
            <span>{MOCK_VISIBILITY_RECEIVING.fromPct}%</span>
            <TransitionArrowSeparator className="mx-0 shrink-0" />
            <span>{MOCK_VISIBILITY_RECEIVING.toPct}%</span>
          </span>
        </div>
      </div>
    </>
  );
}

function TransferBadgePopoverContent({
  popRow,
  popItem,
  rows,
  onMoreDetail,
}: {
  popRow: ProductTransferLocationRow;
  popItem: Extract<TuBreakdownItem, { kind: 'transfer' }>;
  rows: ProductTransferLocationRow[];
  onMoreDetail?: () => void;
}) {
  const sourceRow = rows.find((r) => r.id === popItem.fromLocationId);
  const sourceName = sourceRow?.name ?? 'Unknown source';
  return (
    <>
      <p className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
        <span>{sourceName}</span>
        <TransitionArrowSeparator className="mx-0 shrink-0" />
        <span>{popRow.name}</span>
      </p>
      <p className={`${transferPopSection} mt-1`}>Maximum units per trip: 100</p>
      <div className="my-1.5 border-t border-[#E3E8F0]" />

      <p className={`${transferPopSection} mb-1.5`}>Transfer info</p>
      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Transfer units"
          value={popItem.count.toLocaleString()}
        />
      </div>

      <p className={`${transferPopSection} mt-2 mb-1.5`}>Recommendation</p>
      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Transfer units"
          value={popItem.count.toLocaleString()}
        />
        <TransferPopReason label={`Increase revenue by ${formatCurrencyEur(popItem.revenueIncrease)}`} />
      </div>

      {onMoreDetail ? (
        <button
          type="button"
          onClick={onMoreDetail}
          className="mt-2 inline-block cursor-pointer font-['Inter',sans-serif] text-[11px] font-medium leading-snug text-[#0267FF] underline-offset-2 outline-none hover:underline focus-visible:underline"
        >
          More detail...
        </button>
      ) : null}
    </>
  );
}

function TransferOutBadgePopoverContent({
  popRow,
  popItem,
  rows,
  onMoreDetail,
}: {
  popRow: ProductTransferLocationRow;
  popItem: Extract<TuBreakdownItem, { kind: 'transfer-out' }>;
  rows: ProductTransferLocationRow[];
  onMoreDetail?: () => void;
}) {
  const destinationRow = popItem.toLocationId
    ? rows.find((r) => r.id === popItem.toLocationId)
    : undefined;
  const destinationName = destinationRow?.name ?? 'Multiple destinations';
  return (
    <>
      <p className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
        <span>{popRow.name}</span>
        <TransitionArrowSeparator className="mx-0 shrink-0" />
        <span>{destinationName}</span>
      </p>
      <p className={`${transferPopSection} mt-1`}>Maximum units per trip: 100</p>
      <div className="my-1.5 border-t border-[#E3E8F0]" />

      <p className={`${transferPopSection} mb-1.5`}>Transfer info</p>
      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Transfer units"
          value={popItem.count.toLocaleString()}
        />
      </div>

      <p className={`${transferPopSection} mt-2 mb-1.5`}>Recommendation</p>
      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Transfer units"
          value={popItem.count.toLocaleString()}
        />
        <TransferPopReason
          label={`Increase revenue by ${formatCurrencyEur(popItem.revenueIncrease ?? 0)}`}
        />
      </div>

      {onMoreDetail ? (
        <button
          type="button"
          onClick={onMoreDetail}
          className="mt-2 inline-block cursor-pointer font-['Inter',sans-serif] text-[11px] font-medium leading-snug text-[#0267FF] underline-offset-2 outline-none hover:underline focus-visible:underline"
        >
          More detail...
        </button>
      ) : null}
    </>
  );
}

function InTransitBadgePopoverContent({
  popRow,
  popItem,
}: {
  popRow: ProductTransferLocationRow;
  popItem: Extract<TuBreakdownItem, { kind: 'in-transit' }>;
}) {
  return (
    <>
      <p className="font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
        {popRow.name}
      </p>
      <div className="my-1.5 border-t border-[#E3E8F0]" />

      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<Package className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Stock in-transit"
          value={popItem.count.toLocaleString()}
        />
        {popItem.note ? <TransferPopReason label={popItem.note} /> : null}
      </div>
    </>
  );
}

type ProductTransfersTableProps = {
  parentRow: AssortmentRow;
  onBack: () => void;
  /** When false, breadcrumb is rendered by the parent (e.g. aligned in the table-tools row). Default true. */
  showBreadcrumb?: boolean;
  /** When true, render a second header row containing column totals (used by V1; other prototypes leave this off). */
  showTotalsRow?: boolean;
};

export function ProductTransfersTable({
  parentRow,
  onBack,
  showBreadcrumb = true,
  showTotalsRow = false,
}: ProductTransfersTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showTuBreakdown, setShowTuBreakdown] = useState(false);
  /** Tracks pointer hover anywhere over the TU column (header, totals, or any body cell). */
  const [tuColumnHover, setTuColumnHover] = useState(false);
  const tuColumnHoverProps = {
    onMouseEnter: () => setTuColumnHover(true),
    onMouseLeave: () => setTuColumnHover(false),
  };
  const [tuBadgePopover, setTuBadgePopover] = useState<{
    rowId: string;
    index: number;
    rect: DOMRect;
  } | null>(null);
  const [tuPopoverStyle, setTuPopoverStyle] = useState<CSSProperties>({});
  const [warehouseDetail, setWarehouseDetail] = useState<{
    rowName: string;
    count: number;
    weeksCoverage: string;
    stockOnHand: number;
    reasons: string[];
  } | null>(null);
  const [transferDetail, setTransferDetail] = useState<{
    direction: 'in' | 'out';
    sourceName: string;
    destinationName: string;
    transferUnits: number;
    availableToSend: number;
    tripType: string;
    revenueIncrease: number;
    reasons: string[];
    source?: ProductTransferLocationRow;
    destination?: ProductTransferLocationRow;
  } | null>(null);
  /** Placeholder drawer from green truck (transfer-in) pop-up "More detail…" only */
  const [greenTruckTransferDetailDrawerOpen, setGreenTruckTransferDetailDrawerOpen] = useState(false);
  const tuPopoverPanelRef = useRef<HTMLDivElement>(null);
  const tuCloseTimerRef = useRef<number | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rows = MOCK_PRODUCT_TRANSFER_LOCATIONS;
  const detail = parentRow.productCellDetail;

  const cancelTuClose = () => {
    if (tuCloseTimerRef.current != null) {
      window.clearTimeout(tuCloseTimerRef.current);
      tuCloseTimerRef.current = null;
    }
  };

  const openTuBadgePopover = (payload: { rowId: string; index: number; rect: DOMRect }) => {
    cancelTuClose();
    setTuBadgePopover(payload);
  };

  const scheduleTuBadgeClose = () => {
    cancelTuClose();
    tuCloseTimerRef.current = window.setTimeout(() => {
      setTuBadgePopover(null);
      tuCloseTimerRef.current = null;
    }, 120);
  };

  useEffect(() => () => cancelTuClose(), []);

  useEffect(() => {
    if (!warehouseDetail) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWarehouseDetail(null);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [warehouseDetail]);

  useLayoutEffect(() => {
    if (!tuBadgePopover) {
      setTuPopoverStyle({});
      return;
    }
    const panel = tuPopoverPanelRef.current;
    if (!panel) return;
    const pr = panel.getBoundingClientRect();
    const { rect } = tuBadgePopover;

    const tableRect = tableContainerRef.current?.getBoundingClientRect();
    const viewportTop = TU_POPOVER_PAD;
    const viewportBottom = window.innerHeight - TU_POPOVER_PAD;
    const minTop = Math.max(viewportTop, (tableRect?.top ?? viewportTop) + TU_POPOVER_PAD);
    const maxBottom = Math.min(
      viewportBottom,
      (tableRect?.bottom ?? viewportBottom) - TU_POPOVER_PAD
    );

    let left = rect.right;
    if (left + pr.width > window.innerWidth - TU_POPOVER_PAD) {
      left = rect.left - pr.width;
    }
    if (left < TU_POPOVER_PAD) left = TU_POPOVER_PAD;

    const triggerCenter = rect.top + rect.height / 2;
    let top = triggerCenter - pr.height / 2;
    if (top + pr.height > maxBottom) top = maxBottom - pr.height;
    if (top < minTop) top = minTop;
    if (top + pr.height > viewportBottom) top = viewportBottom - pr.height;
    if (top < viewportTop) top = viewportTop;

    setTuPopoverStyle({
      top,
      left,
      position: 'fixed',
      zIndex: 100,
      visibility: 'visible',
    });
  }, [tuBadgePopover, rows]);

  useEffect(() => {
    if (!tuBadgePopover) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelTuClose();
        setTuBadgePopover(null);
      }
    };
    const onScroll = () => {
      cancelTuClose();
      setTuBadgePopover(null);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [tuBadgePopover]);

  useEffect(() => {
    if (!transferDetail) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTransferDetail(null);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [transferDetail]);

  useEffect(() => {
    if (!greenTruckTransferDetailDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGreenTruckTransferDetailDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [greenTruckTransferDetailDrawerOpen]);

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const headerStack = (title: ReactNode, sub: ReactNode) => (
    <div className="flex min-h-[52px] flex-col justify-center gap-1 py-[2px] text-left">
      {title}
      {sub}
    </div>
  );

  const headerStackRight = (title: ReactNode, sub: ReactNode) => (
    <div className="flex min-h-[52px] flex-col items-end justify-center gap-1 py-[2px] text-right">
      {title}
      {sub}
    </div>
  );

  const renderDataRow = (row: ProductTransferLocationRow) => {
    const isSaturated = row.storageCapacity === 'saturated';
    const rowBgClass = isSaturated ? 'bg-[#FEF3F2]' : 'bg-white';
    const isSendingHub = row.tuBreakdown?.some((item) => item.kind === 'transfer-out') ?? false;
    const hubDirection: 'in' | 'out' = isSendingHub ? 'out' : 'in';
    const hubLabel = isSendingHub ? 'Sending location' : 'Receiving location';
    return (
    <tr key={row.id} className={`group ${rowBgClass}`}>
      <td
        className={`sticky left-0 z-30 min-h-[86px] w-14 min-w-14 max-w-14 box-border ${rowBgClass} px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
      >
        <input
          type="checkbox"
          checked={!!selected[row.id]}
          onChange={(e) => toggleRow(row.id, e.target.checked)}
          className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
          aria-label={`Select ${row.name}`}
        />
      </td>
      <td
        className={`sticky left-14 z-20 min-h-[86px] box-border ${rowBgClass} px-4 py-3 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd} ${
          showTotalsRow ? 'w-[200px] min-w-[200px] max-w-[200px]' : 'min-w-min max-w-max'
        }`}
      >
        <div className="min-w-0">
          <div className="flex w-full min-w-0 flex-nowrap items-center gap-1.5 leading-none">
            <span className={`min-w-0 truncate ${tableCellPrimary}`}>{row.name}</span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-3">
              <RowFilterButton rowName={row.name} />
              {row.transferHub ? (
                <span
                  className="inline-flex shrink-0 items-center justify-center text-[20px] leading-none text-[#101828]"
                  title={hubLabel}
                  aria-label={hubLabel}
                >
                  <AutoneReceivingLocationIcon direction={hubDirection} />
                </span>
              ) : null}
            </span>
          </div>
          <div className={`mt-0.5 ${tableCellSecondary}`}>{row.code}</div>
        </div>
      </td>
      <td className={`min-h-[86px] ${showTotalsRow ? 'min-w-[96px]' : 'min-w-[112px]'} px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellNumeric}`}>{renderArrowPair(row.stock.from, row.stock.to)}</div>
      </td>
      <td
        className={`min-h-[86px] min-w-[112px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}
        {...tuColumnHoverProps}
      >
        <div className="flex min-w-0 flex-col items-end gap-0">
          <div className="tabular-nums text-[14px] font-medium leading-normal">
            <span className="text-[#101828]">{row.tu.from.toLocaleString()}</span>
            <TransitionArrowSeparator />
            <span className="text-[#101828]">{row.tu.to.toLocaleString()}</span>
          </div>
          {showTuBreakdown && row.tuBreakdown != null && row.tuBreakdown.length > 0 ? (
            <div className="mt-2 flex w-full flex-wrap justify-end gap-1">
              {row.tuBreakdown.map((item, idx) => (
                <TuBreakdownBadge
                  key={`${row.id}-tu-${idx}`}
                  item={item}
                  rowId={row.id}
                  index={idx}
                  isOpen={
                    tuBadgePopover != null && tuBadgePopover.rowId === row.id && tuBadgePopover.index === idx
                  }
                  onOpen={openTuBadgePopover}
                  onClose={scheduleTuBadgeClose}
                />
              ))}
            </div>
          ) : null}
        </div>
      </td>
      <td className={`min-h-[86px] min-w-[100px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className="flex min-w-0 flex-col items-end gap-1">
          <div className={`tabular-nums ${tableCellNumeric}`}>{row.sales.l7d.toLocaleString()}</div>
          <div className={`tabular-nums ${tableCellSecondary}`}>{row.sales.l30d.toLocaleString()}</div>
        </div>
      </td>
      <td className={`min-h-[86px] min-w-[112px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellNumeric}`}>{row.forecastPerWeek.toFixed(2)}</div>
      </td>
      <td className={`min-h-[86px] min-w-[112px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellNumeric}`}>{renderArrowPair(row.stockouts.from, row.stockouts.to)}</div>
      </td>
      <td className={`min-h-[86px] min-w-[140px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className="flex min-w-0 flex-col items-end gap-1">
          <div className={`tabular-nums ${tableCellNumeric}`}>
            {renderCoveragePair(row.coverage.fromPct, row.coverage.toPct)}
          </div>
          <div className={`tabular-nums ${tableCellSecondary}`}>{row.coverage.targetWeeks}</div>
        </div>
      </td>
      <td className={`min-h-[86px] min-w-[160px] px-4 py-3 text-center align-middle ${tableRowHoverTd}`}>
        {storageCapacityPill(row.storageCapacity)}
      </td>
    </tr>
    );
  };

  return (
    <div className={`flex min-w-0 flex-col ${showBreadcrumb ? 'gap-3' : 'gap-0'}`}>
      {showBreadcrumb ? (
        <ProductTransfersBreadcrumb parentRow={parentRow} onBack={onBack} />
      ) : null}

      <div
        ref={tableContainerRef}
        className="rounded-lg overflow-hidden bg-white border-[0.5px] border-solid border-[#E3E8F0]"
        data-name="Table container"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse">
            <thead
              className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:bg-white [&_th]:font-['Inter',sans-serif]"
            >
              <tr
                className={`[&_th]:whitespace-nowrap [&_th]:align-top${
                  showTotalsRow
                    ? ' [&_th]:!pb-0 [&_th]:!border-b-0 [&_th>div]:!min-h-[28px] [&_th>div>:last-child]:hidden'
                    : ''
                }`}
              >
                <th
                  className="sticky left-0 z-30 w-14 min-w-14 max-w-14 bg-white px-4 py-[10px] text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                  scope="col"
                  aria-label="Selection"
                />
                <th
                  className={`sticky left-14 z-20 bg-white px-4 py-[10px] text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${
                    showTotalsRow
                      ? 'w-[200px] min-w-[200px] max-w-[200px]'
                      : 'min-w-min max-w-max'
                  }`}
                  scope="col"
                >
                  {headerStack(
                    <AutoneHeaderInfoTooltip
                      label="Locations"
                      content={HEADER_INFO_TOOLTIPS.locations}
                      hoverWith={<span className={headerTitleClass}>Locations</span>}
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th className={`${showTotalsRow ? 'min-w-[96px]' : 'min-w-[120px]'} px-4 py-[10px] text-right`} scope="col">
                  {headerStackRight(
                    <AutoneHeaderInfoTooltip
                      label="Stock"
                      content={HEADER_INFO_TOOLTIPS.stock}
                      hoverWith={
                        <span className={`inline-flex items-center gap-1 ${headerTitleClass}`}>
                          Stock
                          <ChevronDown size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
                        </span>
                      }
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th
                  className="min-w-[120px] px-4 py-[10px] text-right"
                  scope="col"
                  {...tuColumnHoverProps}
                >
                  {headerStackRight(
                    <span className="inline-flex items-center justify-end gap-1">
                      <AutoneHeaderInfoTooltip
                        label="TU (transfer units)"
                        content={HEADER_INFO_TOOLTIPS.tu}
                        hoverWith={<span className={headerTitleClass}>TU</span>}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTuBreakdown((v) => !v)}
                        className={`rounded p-0.5 text-[#6A7282] outline-none transition-[color,background-color,opacity] hover:bg-slate-100 hover:text-[#101828] focus-visible:ring-2 focus-visible:ring-[#0267FF] focus-visible:ring-offset-0 ${showTuBreakdown ? 'bg-slate-100 text-[#101828]' : ''}${
                          showTotalsRow && !showTuBreakdown && !tuColumnHover
                            ? ' opacity-0 focus-visible:opacity-100'
                            : ''
                        }`}
                        aria-pressed={showTuBreakdown}
                        aria-label={
                          showTuBreakdown
                            ? 'Hide warehouse and transfer breakdown under TU'
                            : 'Show warehouse and transfer breakdown under TU'
                        }
                      >
                        <Pencil size={14} className="shrink-0" strokeWidth={2} aria-hidden />
                      </button>
                    </span>,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th className="min-w-[120px] px-4 py-[10px] text-right" scope="col">
                  {headerStackRight(
                    <AutoneHeaderInfoTooltip
                      label="Sales"
                      content={ASSORTMENT_HEADER_RICH.salesL7dL30d.body}
                      hoverWith={<span className={headerTitleClass}>Sales</span>}
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th className="min-w-[120px] px-4 py-[10px] text-left" scope="col">
                  {headerStack(
                    <AutoneHeaderInfoTooltip
                      label="Forecast per week"
                      content={HEADER_INFO_TOOLTIPS.forecastPerWk}
                      hoverWith={<span className={headerTitleClass}>Forecast per wk.</span>}
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th className="min-w-[120px] px-4 py-[10px] text-right" scope="col">
                  {headerStackRight(
                    <AutoneHeaderInfoTooltip
                      label="Stockouts"
                      content={HEADER_INFO_TOOLTIPS.stockouts}
                      hoverWith={<span className={headerTitleClass}>Stockouts</span>}
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th className="min-w-[152px] px-4 py-[10px] text-right" scope="col">
                  {headerStackRight(
                    <AutoneHeaderInfoTooltip
                      label="Coverage"
                      topAlign="start"
                      content={HEADER_INFO_TOOLTIPS.coverage}
                      hoverWith={<span className={headerTitleClass}>Coverage</span>}
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th
                  className={`${
                    showTotalsRow ? 'min-w-[176px]' : 'min-w-[160px]'
                  } bg-[#F9FAFB] px-4 py-[10px] text-left`}
                  scope="col"
                >
                  {showTotalsRow ? (
                    headerStack(
                      <AutoneHeaderInfoTooltip
                        label="Storage capacity"
                        topAlign="start"
                        content={HEADER_INFO_TOOLTIPS.storageCapacity}
                        hoverWith={
                          <span
                            className={`whitespace-nowrap text-left font-['Inter',sans-serif] text-[14px] font-semibold leading-tight text-[#101828]`}
                          >
                            Storage capacity
                          </span>
                        }
                      />,
                      <span className="invisible text-[12px] leading-snug" aria-hidden>
                        —
                      </span>
                    )
                  ) : (
                    <div className="flex min-h-[52px] flex-col justify-center py-[2px]">
                      <AutoneHeaderInfoTooltip
                        label="Storage capacity"
                        topAlign="start"
                        content={HEADER_INFO_TOOLTIPS.storageCapacity}
                        hoverWith={
                          <span
                            className={`text-left font-['Inter',sans-serif] text-[14px] font-semibold leading-tight text-[#101828]`}
                          >
                            <span className="block">Storage</span>
                            <span className="block">capacity</span>
                          </span>
                        }
                      />
                    </div>
                  )}
                </th>
              </tr>
              {showTotalsRow && (
                <tr
                  className="font-['Inter',sans-serif] [&_th]:whitespace-nowrap"
                  aria-label="Column totals"
                >
                  <th
                    className="sticky left-0 z-30 h-[40px] min-h-[40px] max-h-[40px] w-14 min-w-14 max-w-14 bg-white px-4 py-0 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                    aria-hidden
                  />
                  <th
                    className="sticky left-14 z-20 h-[40px] min-h-[40px] max-h-[40px] w-[200px] min-w-[200px] max-w-[200px] bg-white px-4 py-0 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                    aria-hidden
                  />
                  <th className="h-[40px] min-h-[40px] max-h-[40px] min-w-[96px] bg-white px-4 pt-0 pb-2 text-right align-top">
                    <div className={`tabular-nums ${tableCellNumeric}`}>
                      {renderArrowPair(
                        MOCK_PRODUCT_TRANSFER_SUMMARY.stock.from,
                        MOCK_PRODUCT_TRANSFER_SUMMARY.stock.to
                      )}
                    </div>
                  </th>
                  <th
                    className="h-[40px] min-h-[40px] max-h-[40px] bg-white px-4 pt-0 pb-2 text-right align-top"
                    {...tuColumnHoverProps}
                  >
                    <div className={`tabular-nums ${tableCellNumeric}`}>
                      {renderArrowPair(
                        MOCK_PRODUCT_TRANSFER_SUMMARY.tu.from,
                        MOCK_PRODUCT_TRANSFER_SUMMARY.tu.to
                      )}
                    </div>
                  </th>
                  <th className="h-[40px] min-h-[40px] max-h-[40px] bg-white px-4 pt-0 pb-2 text-right align-top">
                    <div className="flex min-w-0 flex-col items-end gap-1">
                      <div className={`tabular-nums ${tableCellNumeric}`}>
                        {MOCK_PRODUCT_TRANSFER_SUMMARY.sales.l7d.toLocaleString()} L7D
                      </div>
                      <div className={`tabular-nums ${tableCellSecondary}`}>
                        {MOCK_PRODUCT_TRANSFER_SUMMARY.sales.l30d.toLocaleString()} L30D
                      </div>
                    </div>
                  </th>
                  <th className="h-[40px] min-h-[40px] max-h-[40px] bg-white px-4 pt-0 pb-2 text-right align-top">
                    <div className={`tabular-nums ${tableCellNumeric}`}>
                      {MOCK_PRODUCT_TRANSFER_SUMMARY.forecastPerWeek.toFixed(2)}
                    </div>
                  </th>
                  <th className="h-[40px] min-h-[40px] max-h-[40px] bg-white px-4 pt-0 pb-2 text-right align-top">
                    <div className={`tabular-nums ${tableCellNumeric}`}>
                      {renderArrowPair(
                        MOCK_PRODUCT_TRANSFER_SUMMARY.stockouts.from,
                        MOCK_PRODUCT_TRANSFER_SUMMARY.stockouts.to
                      )}
                    </div>
                  </th>
                  <th className="h-[40px] min-h-[40px] max-h-[40px] bg-white px-4 pt-0 pb-2 text-right align-top">
                    <div className="flex min-w-0 flex-col items-end gap-1">
                      <div className={`inline-flex items-center justify-end gap-0.5 ${tableCellNumeric}`}>
                        <span>before</span>
                        <TransitionArrowSeparator className="mx-0 shrink-0" />
                        <span>after</span>
                      </div>
                      <div className={tableCellSecondary}>target weeks</div>
                    </div>
                  </th>
                  <th
                    className="h-[40px] min-h-[40px] max-h-[40px] min-w-[176px] bg-[#F9FAFB] px-4 py-0 align-top"
                    aria-hidden
                  />
                </tr>
              )}
            </thead>
            <tbody className="[&_td]:border-t-0 [&_td]:border-b-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]">
              {rows.map((r) => renderDataRow(r))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 bg-white px-4 py-2 text-xs text-[#00050a]">
          <span>{rows.length} locations</span>
        </div>
      </div>

      {tuBadgePopover != null
        ? (() => {
            const popRow = rows.find((r) => r.id === tuBadgePopover.rowId);
            const popItem = popRow?.tuBreakdown?.[tuBadgePopover.index];
            if (!popRow || !popItem) return null;
            const accent =
              popItem.kind === 'transfer' || popItem.kind === 'transfer-out' ? '#2EB8C2' : '#6864E6';
            const isTransfer = popItem.kind === 'transfer';
            const isTransferOut = popItem.kind === 'transfer-out';
            const isInTransit = popItem.kind === 'in-transit';
            const isExtensiveTransfer = isTransfer || isTransferOut;
            const isWidePopover = isExtensiveTransfer || isInTransit;
            const detailLabel =
              popItem.kind === 'warehouse'
                ? 'Stock on-hand'
                : popItem.kind === 'in-transit'
                  ? 'Stock in-transit'
                  : 'Transfer units';
            const forecast = popRow.forecastPerWeek;
            const weeksCoverageText =
              forecast > 0
                ? `${(popItem.count / forecast).toFixed(1)} (${popRow.coverage.targetWeeks} target)`
                : 'N/A (0 forecast)';
            const ariaLabel = isExtensiveTransfer
              ? `Transfer details for ${popRow.name}`
              : `${detailLabel} at ${popRow.name}`;
            return createPortal(
              <div
                ref={tuPopoverPanelRef}
                role="dialog"
                aria-label={ariaLabel}
                data-tu-popover=""
                className={`${
                  isWidePopover
                    ? 'w-[min(19rem,calc(100vw-24px))] p-2.5'
                    : 'w-[min(18rem,calc(100vw-24px))] p-2.5'
                } rounded-[2px] border-2 bg-white shadow-[0_8px_24px_-4px_rgba(15,23,42,0.15)]`}
                style={{ ...tuPopoverStyle, borderColor: accent, visibility: tuPopoverStyle.visibility ?? 'hidden' }}
                onMouseEnter={cancelTuClose}
                onMouseLeave={scheduleTuBadgeClose}
              >
                {isTransfer && popItem.kind === 'transfer' ? (
                  <TransferBadgePopoverContent
                    popRow={popRow}
                    popItem={popItem}
                    rows={rows}
                    onMoreDetail={() => {
                      cancelTuClose();
                      setTuBadgePopover(null);
                      setGreenTruckTransferDetailDrawerOpen(true);
                    }}
                  />
                ) : isTransferOut && popItem.kind === 'transfer-out' ? (
                  <TransferOutBadgePopoverContent
                    popRow={popRow}
                    popItem={popItem}
                    rows={rows}
                    onMoreDetail={() => {
                      cancelTuClose();
                      if (popItem.kind !== 'transfer-out') return;
                      const destRow = popItem.toLocationId
                        ? rows.find((r) => r.id === popItem.toLocationId)
                        : undefined;
                      setTransferDetail({
                        direction: 'out',
                        source: popRow,
                        destination: destRow,
                        sourceName: popRow.name,
                        destinationName: destRow?.name ?? 'Multiple destinations',
                        transferUnits: popItem.count,
                        availableToSend: popRow.stock.from,
                        tripType: popItem.tripType ?? '—',
                        revenueIncrease: popItem.revenueIncrease ?? 0,
                        reasons: popItem.reasons ?? [],
                      });
                      setTuBadgePopover(null);
                    }}
                  />
                ) : isInTransit && popItem.kind === 'in-transit' ? (
                  <InTransitBadgePopoverContent popRow={popRow} popItem={popItem} />
                ) : (
                  <>
                    <p className="font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                      {popRow.name}
                    </p>
                    <div className="my-1.5 border-t border-[#E3E8F0]" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Package className="size-3.5 shrink-0 text-[#101828]" strokeWidth={2} aria-hidden />
                          <span className="font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#101828]">
                            {detailLabel}
                          </span>
                        </div>
                        <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                          {popItem.count}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <CalendarDays className="size-3.5 shrink-0 text-[#101828]" strokeWidth={2} aria-hidden />
                          <span className="whitespace-nowrap font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#101828]">
                            Weeks coverage
                          </span>
                        </div>
                        <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                          {weeksCoverageText}
                        </span>
                      </div>
                    </div>
                    {popItem.kind === 'warehouse' ? (
                      <button
                        type="button"
                        onClick={() => {
                          cancelTuClose();
                          setWarehouseDetail({
                            rowName: popRow.name,
                            count: popItem.count,
                            weeksCoverage: weeksCoverageText,
                            stockOnHand: popRow.stock.from,
                            reasons:
                              popItem.kind === 'warehouse' && popItem.reasons
                                ? popItem.reasons
                                : [],
                          });
                          setTuBadgePopover(null);
                        }}
                        className="mt-2 inline-block cursor-pointer font-['Inter',sans-serif] text-[11px] font-medium leading-snug text-[#0267FF] underline-offset-2 outline-none hover:underline focus-visible:underline"
                      >
                        More detail...
                      </button>
                    ) : null}
                  </>
                )}
              </div>,
              document.body
            );
          })()
        : null}

      {greenTruckTransferDetailDrawerOpen
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-0 z-[210] flex justify-end"
              role="dialog"
              aria-modal="true"
              aria-labelledby="green-truck-transfer-drawer-title"
            >
              <div
                className="pointer-events-auto relative flex h-full w-[420px] max-w-[min(420px,calc(100vw-1rem))] shrink-0 flex-col border-l border-[#E3E8F0] bg-white shadow-[-12px_0_36px_-12px_rgba(15,23,42,0.18)]"
                style={{ animation: 'tu-warehouse-drawer-in 220ms cubic-bezier(0.22, 1, 0.36, 1)' }}
              >
                <style>{`@keyframes tu-warehouse-drawer-in { from { transform: translateX(16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E3E8F0] px-5 py-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-['Inter',sans-serif] text-[11px] font-medium uppercase tracking-wide text-[#2EB8C2]">
                      Recommended transfer
                    </p>
                    <h2
                      id="green-truck-transfer-drawer-title"
                      className="flex flex-wrap items-center gap-1 font-['Inter',sans-serif] text-[16px] font-semibold leading-snug text-[#101828]"
                    >
                      <span>PR AC Lille</span>
                      <TransitionArrowSeparator className="mx-0 shrink-0" />
                      <span>Lulli Eshop</span>
                    </h2>
                    <p className="font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#6A7282]">
                      Trip capacity (max 10,000)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGreenTruckTransferDetailDrawerOpen(false)}
                    className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#6A7282] outline-none transition-colors hover:bg-[#F2F4F7] hover:text-[#101828] focus-visible:ring-2 focus-visible:ring-[#2EB8C2] focus-visible:ring-offset-1"
                    aria-label="Close"
                  >
                    <X className="size-5" strokeWidth={2} aria-hidden />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <p className={`${transferPopSection} mb-2`}>Product</p>
                  <div className="flex items-center gap-3 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#f5f5f5]">
                      <img
                        src="/images/product-botin-fringes-arena.png"
                        alt="Botin fringes arena"
                        className="pointer-events-none absolute inset-0 size-full max-w-none object-contain"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="font-['Inter',sans-serif] text-[14px] font-semibold leading-snug text-[#101828]">
                        Botin fringes arena
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0 font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#101828]">
                        <div>
                          <span className="text-[#6A7282]">Colour: </span>Arena
                        </div>
                        <div>
                          <span className="text-[#6A7282]">Size: </span>TU
                        </div>
                      </div>
                      <div className="inline-flex max-w-full min-w-0 items-center gap-2 self-start">
                        <span className="min-w-0 truncate font-['Inter',sans-serif] text-[12px] font-normal tabular-nums leading-snug text-[#101828]">
                          S26-0696-002-704
                        </span>
                        <button
                          type="button"
                          onClick={() => void navigator.clipboard.writeText('S26-0696-002-704')}
                          className="m-0 inline-flex size-5 shrink-0 items-center justify-center rounded p-0 text-[#6A7282] outline-none transition-colors hover:bg-[#E3E8F0] hover:text-[#101828] focus-visible:ring-2 focus-visible:ring-[#2EB8C2] focus-visible:ring-offset-0"
                          aria-label="Copy SKU"
                        >
                          <Copy className="size-3.5" strokeWidth={2} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className={`${transferPopSection} mb-2 mt-4`}>Transfer</p>
                  <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                    <TransferPopRow
                      icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Transfer units"
                      value="4"
                    />
                    <TransferPopRow
                      icon={<Package className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Available to send"
                      value="4"
                    />
                    <TransferPopRow
                      icon={<ArrowLeftRight className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Trip type"
                      value="Rebalancing"
                    />
                  </div>

                  <p className={`${transferPopSection} mb-2 mt-4`}>Recommendation</p>
                  <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                    <TransferPopRow
                      icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Transfer units"
                      value="4"
                    />
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-[2px] inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2EB8C2]/10 text-[#2EB8C2]"
                      >
                        <Lightbulb className="size-3" strokeWidth={2} aria-hidden />
                      </span>
                      <p className="pt-0.5 font-['Inter',sans-serif] text-[12px] font-normal leading-relaxed text-[#101828]">
                        Increase revenue by €380
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-[2px] inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2EB8C2]/10 text-[#2EB8C2]"
                      >
                        <Lightbulb className="size-3" strokeWidth={2} aria-hidden />
                      </span>
                      <p className="pt-0.5 font-['Inter',sans-serif] text-[12px] font-normal leading-relaxed text-[#101828]">
                        SKU unassorted in PR AC Lille
                      </p>
                    </div>
                  </div>

                  <RecommendedTransferProductVisibilityImpact
                    sendingLabel="Sending store: PR AC Lille"
                    receivingLabel="Receiving store: Lulli Eshop"
                  />

                  <p className={`${transferPopSection} mb-2 mt-4`}>Stock check</p>
                  <div className="flex flex-col gap-3 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                    <div className="flex flex-col gap-1.5">
                      <p className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                        <span className="inline-flex shrink-0 items-center justify-center text-[20px] leading-none text-[#101828]">
                          <AutoneReceivingLocationIcon direction="out" />
                        </span>
                        Sending store: PR AC Lille
                      </p>
                      <ul className="ml-1 flex flex-col gap-1 border-l border-[#E3E8F0] pl-2.5">
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Total stock
                          </span>
                          <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                            {formatStockArrow(4, 0)}
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Department storage capacity
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                            <span>35</span>
                            <TransitionArrowSeparator className="mx-0 shrink-0" />
                            <span>45 (max 50)</span>
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Total weeks coverage
                          </span>
                          <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium text-[#101828]">
                            N/A (unassorted)
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Forecast
                          </span>
                          <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                            0.00 per week
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-[#E3E8F0] pt-3">
                      <p className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                        <span className="inline-flex shrink-0 items-center justify-center text-[20px] leading-none text-[#101828]">
                          <AutoneReceivingLocationIcon direction="in" />
                        </span>
                        Receiving store: Lulli Eshop
                      </p>
                      <ul className="ml-1 flex flex-col gap-1 border-l border-[#E3E8F0] pl-2.5">
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Total stock
                          </span>
                          <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                            {formatStockArrow(9, 9)}
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Department storage capacity
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                            <span>170</span>
                            <TransitionArrowSeparator className="mx-0 shrink-0" />
                            <span>172 (max 190)</span>
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Total weeks coverage
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                            <span>11.7</span>
                            <TransitionArrowSeparator className="mx-0 shrink-0" />
                            <span>11.7 (1 target)</span>
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Forecast
                          </span>
                          <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                            0.77 per week
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                            Warehouse coverage
                          </span>
                          <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                            {formatStockArrow(0, 0)}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {warehouseDetail
        ? createPortal(
            <div
              className="fixed inset-0 z-[210] flex justify-end"
              role="dialog"
              aria-modal="true"
              aria-labelledby="warehouse-detail-title"
              onClick={() => setWarehouseDetail(null)}
            >
              <button
                type="button"
                aria-label="Close panel"
                onClick={() => setWarehouseDetail(null)}
                className="absolute bottom-0 right-0 bg-[#0F172A]/40"
              />
              <div
                className="relative flex h-full w-full max-w-[min(100vw-1rem,28rem)] animate-[slideInRight_220ms_cubic-bezier(0.22,1,0.36,1)] flex-col border-l border-[#E3E8F0] bg-white shadow-[-12px_0_36px_-12px_rgba(15,23,42,0.18)]"
                style={{
                  animationName: 'tu-warehouse-drawer-in',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <style>{`@keyframes tu-warehouse-drawer-in { from { transform: translateX(16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E3E8F0] px-5 py-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-['Inter',sans-serif] text-[11px] font-medium uppercase tracking-wide text-[#6864E6]">
                      Stock on-hand
                    </p>
                    <h2
                      id="warehouse-detail-title"
                      className="font-['Inter',sans-serif] text-[16px] font-semibold leading-snug text-[#101828]"
                    >
                      {warehouseDetail.rowName}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWarehouseDetail(null)}
                    className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#6A7282] outline-none transition-colors hover:bg-[#F2F4F7] hover:text-[#101828] focus-visible:ring-2 focus-visible:ring-[#0267FF] focus-visible:ring-offset-1"
                    aria-label="Close"
                  >
                    <X className="size-5" strokeWidth={2} aria-hidden />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                    <TransferPopRow
                      icon={<Package className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Stock on-hand"
                      value={warehouseDetail.stockOnHand.toLocaleString()}
                    />
                    <TransferPopRow
                      icon={<CalendarDays className="size-3.5" strokeWidth={2} aria-hidden />}
                      label={
                        <span className="whitespace-nowrap">Weeks coverage</span>
                      }
                      value={warehouseDetail.weeksCoverage.replace(/\s*\+\s*trip time/gi, '')}
                    />
                  </div>

                  <div className="mt-4 border-t border-[#E3E8F0] pt-4">
                    <p className={`${transferPopSection} mb-2`}>Stock check</p>
                    <div className="flex flex-col gap-3 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                      <div className="flex flex-col gap-1.5">
                        <p className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                          <span className="inline-flex shrink-0 items-center justify-center text-[20px] leading-none text-[#6864E6]">
                            <Package className="size-[1em]" strokeWidth={2} aria-hidden />
                          </span>
                          Lulli Eshop
                        </p>
                        <ul className="ml-1 flex flex-col gap-1 border-l border-[#E3E8F0] pl-2.5">
                          <li className="flex items-center justify-between gap-2">
                            <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                              Total stock
                            </span>
                            <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                              {formatStockArrow(9, 9)}
                            </span>
                          </li>
                          <li className="flex items-center justify-between gap-2">
                            <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                              Department storage capacity
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                              <span>170</span>
                              <TransitionArrowSeparator className="mx-0 shrink-0" />
                              <span>172 (max 190)</span>
                            </span>
                          </li>
                          <li className="flex items-center justify-between gap-2">
                            <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                              Total weeks coverage
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                              <span>11.7</span>
                              <TransitionArrowSeparator className="mx-0 shrink-0" />
                              <span>11.7 (1 target)</span>
                            </span>
                          </li>
                          <li className="flex items-center justify-between gap-2">
                            <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                              Forecast
                            </span>
                            <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                              0.77 per week
                            </span>
                          </li>
                          <li className="flex items-center justify-between gap-2">
                            <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                              Warehouse coverage
                            </span>
                            <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                              {formatStockArrow(0, 0)}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[#E3E8F0] pt-4">
                    <p className={`${transferPopSection} mb-2`}>Recommendations considered</p>
                    <p className={`${transferPopSection} mb-3`}>
                      Transfers that were evaluated but not included in the final recommendation proposal
                    </p>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                        <p className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                          <span className="inline-flex shrink-0 items-center justify-center text-[20px] leading-none text-[#101828]">
                            <AutoneReceivingLocationIcon direction="in" />
                          </span>
                          Receiving store: PR PP Nancy
                        </p>
                        <div className="ml-1 flex flex-col gap-1.5 border-l border-[#E3E8F0] pl-2.5">
                          <TransferPopRow
                            icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
                            label="Transfer units"
                            value="1"
                          />
                          <div className="flex items-start gap-2">
                            <span
                              aria-hidden
                              className="mt-[2px] inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2EB8C2]/10 text-[#2EB8C2]"
                            >
                              <Lightbulb className="size-3" strokeWidth={2} aria-hidden />
                            </span>
                            <p className="pt-0.5 font-['Inter',sans-serif] text-[12px] font-normal leading-relaxed text-[#101828]">
                              Store met target coverage with higher value moves
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                        <p className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                          <span className="inline-flex shrink-0 items-center justify-center text-[20px] leading-none text-[#101828]">
                            <AutoneReceivingLocationIcon direction="in" />
                          </span>
                          Receiving store: GL PP Biarritz
                        </p>
                        <div className="ml-1 flex flex-col gap-1.5 border-l border-[#E3E8F0] pl-2.5">
                          <TransferPopRow
                            icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
                            label="Transfer units"
                            value="2"
                          />
                          <div className="flex items-start gap-2">
                            <span
                              aria-hidden
                              className="mt-[2px] inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2EB8C2]/10 text-[#2EB8C2]"
                            >
                              <Lightbulb className="size-3" strokeWidth={2} aria-hidden />
                            </span>
                            <p className="pt-0.5 font-['Inter',sans-serif] text-[12px] font-normal leading-relaxed text-[#101828]">
                              Other stock moves chosen to meet trip capacity minimum
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                        <p className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                          <span className="inline-flex shrink-0 items-center justify-center text-[20px] leading-none text-[#101828]">
                            <AutoneReceivingLocationIcon direction="in" />
                          </span>
                          Receiving store: PR AC Toulon
                        </p>
                        <div className="ml-1 flex flex-col gap-1.5 border-l border-[#E3E8F0] pl-2.5">
                          <TransferPopRow
                            icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
                            label="Transfer units"
                            value="1"
                          />
                          <div className="flex items-start gap-2">
                            <span
                              aria-hidden
                              className="mt-[2px] inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2EB8C2]/10 text-[#2EB8C2]"
                            >
                              <Lightbulb className="size-3" strokeWidth={2} aria-hidden />
                            </span>
                            <p className="pt-0.5 font-['Inter',sans-serif] text-[12px] font-normal leading-relaxed text-[#101828]">
                              Unassorted location chosen
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {transferDetail
        ? createPortal(
            <div
              className="fixed inset-0 z-[210] flex justify-end"
              role="dialog"
              aria-modal="true"
              aria-labelledby="transfer-detail-title"
              onClick={() => setTransferDetail(null)}
            >
              <button
                type="button"
                aria-label="Close panel"
                onClick={() => setTransferDetail(null)}
                className="absolute bottom-0 right-0 bg-[#0F172A]/40"
              />
              <div
                className="relative flex h-full w-full max-w-[min(100vw-1rem,28rem)] flex-col border-l border-[#E3E8F0] bg-white shadow-[-12px_0_36px_-12px_rgba(15,23,42,0.18)]"
                style={{ animation: 'tu-warehouse-drawer-in 220ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <style>{`@keyframes tu-warehouse-drawer-in { from { transform: translateX(16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E3E8F0] px-5 py-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-['Inter',sans-serif] text-[11px] font-medium uppercase tracking-wide text-[#2EB8C2]">
                      {transferDetail.direction === 'out' ? 'Transfer out' : 'Transfer in'}
                    </p>
                    <h2
                      id="transfer-detail-title"
                      className="flex flex-wrap items-center gap-1 font-['Inter',sans-serif] text-[16px] font-semibold leading-snug text-[#101828]"
                    >
                      <span>{transferDetail.sourceName}</span>
                      <TransitionArrowSeparator className="mx-0 shrink-0" />
                      <span>{transferDetail.destinationName}</span>
                    </h2>
                    <p className="font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#6A7282]">
                      Trip capacity (max 10,000)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransferDetail(null)}
                    className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#6A7282] outline-none transition-colors hover:bg-[#F2F4F7] hover:text-[#101828] focus-visible:ring-2 focus-visible:ring-[#2EB8C2] focus-visible:ring-offset-1"
                    aria-label="Close"
                  >
                    <X className="size-5" strokeWidth={2} aria-hidden />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <p className={`${transferPopSection} mb-2`}>Product</p>
                  <div className="flex items-center gap-3 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                    <div className="relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded bg-[#f5f5f5]">
                      <img
                        src={detail.imageSrc}
                        alt={detail.title}
                        className="pointer-events-none absolute inset-0 size-full max-w-none object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-['Inter',sans-serif] text-[14px] font-semibold leading-snug text-[#101828]">
                        {detail.title}
                      </div>
                      <div className="mt-0.5 truncate font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#6A7282]">
                        {detail.sku}
                      </div>
                      <div className="mt-0.5 font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#6A7282]">
                        {detail.colorLabel}
                      </div>
                    </div>
                  </div>

                  <p className={`${transferPopSection} mt-4 mb-2`}>Transfer info</p>
                  <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                    <TransferPopRow
                      icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Transfer units"
                      value={transferDetail.transferUnits.toLocaleString()}
                    />
                    <TransferPopRow
                      icon={<Package className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Available to send"
                      value={transferDetail.availableToSend.toLocaleString()}
                    />
                    <TransferPopRow
                      icon={<ArrowLeftRight className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Trip type"
                      value={transferDetail.tripType}
                    />
                  </div>

                  <p className={`${transferPopSection} mt-4 mb-2`}>Recommendation</p>
                  <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                    <TransferPopRow
                      icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Transfer units"
                      value={transferDetail.transferUnits.toLocaleString()}
                    />
                    <TransferPopRow
                      icon={<TrendingUp className="size-3.5" strokeWidth={2} aria-hidden />}
                      label="Revenue increase"
                      value={formatCurrencyEur(transferDetail.revenueIncrease)}
                    />
                  </div>

                  {transferDetail.reasons.length > 0 ? (
                    <>
                      <p className={`${transferPopSection} mt-4 mb-2`}>Recommendation reasons</p>
                      <ul className="flex flex-col gap-2">
                        {transferDetail.reasons.map((reason, idx) => (
                          <li key={`tr-drawer-reason-${idx}`} className="flex items-start gap-2">
                            <span
                              aria-hidden
                              className="mt-[2px] inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2EB8C2]/10 text-[#2EB8C2]"
                            >
                              <Lightbulb className="size-3" strokeWidth={2} aria-hidden />
                            </span>
                            <p className="pt-0.5 font-['Inter',sans-serif] text-[12px] font-normal leading-relaxed text-[#101828]">
                              {reason}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  <RecommendedTransferProductVisibilityImpact
                    sendingLabel={`Sending store: ${transferDetail.sourceName}`}
                    receivingLabel={`Receiving store: ${transferDetail.destinationName}`}
                  />

                  <div className="mt-5 border-t border-[#E3E8F0] pt-4">
                    <p className={`${transferPopSection} mb-2`}>Total stock</p>
                    <div className="flex flex-col gap-2.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                      {transferDetail.source ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                            <Package
                              className="size-3.5 shrink-0 text-[#101828]"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="font-['Inter',sans-serif] text-[11px] font-medium leading-snug text-[#6A7282]">
                              Sending store
                            </span>
                            <span className="font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                              {transferDetail.sourceName}
                            </span>
                          </div>
                          <ul className="ml-5 flex flex-col gap-1 border-l border-[#E3E8F0] pl-2.5">
                            <li className="flex items-center justify-between gap-2">
                              <span className="inline-flex flex-wrap items-center gap-x-0.5 font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                                <span>Total stock before</span>
                                <TransitionArrowSeparator className="mx-0 shrink-0" />
                                <span>after</span>
                              </span>
                              <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                                {formatStockArrow(
                                  transferDetail.source.stock.from,
                                  transferDetail.source.stock.to
                                )}
                              </span>
                            </li>
                            <li className="flex items-center justify-between gap-2">
                              <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                                Coverage + target (if unassorted)
                              </span>
                              <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                                {formatWeeksCoverageArrow(
                                  transferDetail.source.stock,
                                  transferDetail.source.forecastPerWeek,
                                  transferDetail.source.coverage.targetWeeks
                                )}
                              </span>
                            </li>
                            <li className="flex items-center justify-between gap-2">
                              <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                                Forecast
                              </span>
                              <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                                {transferDetail.source.forecastPerWeek.toFixed(2)} per week
                              </span>
                            </li>
                          </ul>
                        </div>
                      ) : null}
                      {transferDetail.destination ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                            <Package
                              className="size-3.5 shrink-0 text-[#101828]"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="font-['Inter',sans-serif] text-[11px] font-medium leading-snug text-[#6A7282]">
                              Receiving store
                            </span>
                            <span className="font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                              {transferDetail.destinationName}
                            </span>
                          </div>
                          <ul className="ml-5 flex flex-col gap-1 border-l border-[#E3E8F0] pl-2.5">
                            <li className="flex items-center justify-between gap-2">
                              <span className="inline-flex flex-wrap items-center gap-x-0.5 font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                                <span>Total stock before</span>
                                <TransitionArrowSeparator className="mx-0 shrink-0" />
                                <span>after</span>
                              </span>
                              <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                                {formatStockArrow(
                                  transferDetail.destination.stock.from,
                                  transferDetail.destination.stock.to
                                )}
                              </span>
                            </li>
                            <li className="flex items-center justify-between gap-2">
                              <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                                Coverage + target
                              </span>
                              <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                                {formatWeeksCoverageArrow(
                                  transferDetail.destination.stock,
                                  transferDetail.destination.forecastPerWeek,
                                  transferDetail.destination.coverage.targetWeeks
                                )}
                              </span>
                            </li>
                            <li className="flex items-center justify-between gap-2">
                              <span className="font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                                Forecast
                              </span>
                              <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                                {transferDetail.destination.forecastPerWeek.toFixed(2)} per week
                              </span>
                            </li>
                            <li className="flex items-center justify-between gap-2">
                              <span className="inline-flex flex-wrap items-center gap-x-0.5 font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                                <span>Warehouse units before</span>
                                <TransitionArrowSeparator className="mx-0 shrink-0" />
                                <span>after</span>
                              </span>
                              <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-medium tabular-nums text-[#101828]">
                                {transferDetail.destination.warehouseUnits != null
                                  ? formatStockArrow(
                                      transferDetail.destination.warehouseUnits.from,
                                      transferDetail.destination.warehouseUnits.to
                                    )
                                  : '—'}
                              </span>
                            </li>
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <p className={`${transferPopSection} mt-4 mb-2`}>Total weeks coverage</p>
                    <div className="flex flex-col gap-1.5 rounded-[6px] border border-[#E3E8F0] bg-[#FAFBFC] p-3">
                      {transferDetail.source ? (
                        <TransferPopRow
                          icon={<CalendarDays className="size-3.5" strokeWidth={2} aria-hidden />}
                          label={transferDetail.sourceName}
                          value={formatWeeksCoverageArrow(
                            transferDetail.source.stock,
                            transferDetail.source.forecastPerWeek,
                            transferDetail.source.coverage.targetWeeks
                          )}
                        />
                      ) : null}
                      {transferDetail.destination ? (
                        <TransferPopRow
                          icon={<CalendarDays className="size-3.5" strokeWidth={2} aria-hidden />}
                          label={transferDetail.destinationName}
                          value={formatWeeksCoverageArrow(
                            transferDetail.destination.stock,
                            transferDetail.destination.forecastPerWeek,
                            transferDetail.destination.coverage.targetWeeks
                          )}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
