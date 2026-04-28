import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
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
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";
const tableRowHoverTd = '';
const headerTitleClass =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";

function formatArrowPair(from: number, to: number): string {
  return `${from.toLocaleString()} → ${to.toLocaleString()}`;
}

function formatCoveragePair(fromPct: number, toPct: number): string {
  return `${fromPct}% → ${toPct}%`;
}

function truncateSku(sku: string, max = 14): string {
  if (sku.length <= max) return sku;
  return `${sku.slice(0, Math.max(0, max - 3))}...`;
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
      ? 'bg-[#A832D7] text-white'
      : item.kind === 'transfer'
        ? 'bg-[#2563EB] text-white'
        : 'bg-white text-[#A832D7] border border-[#A832D7]';
  const openRingClasses =
    item.kind === 'in-transit' ? '' : 'ring-2 ring-white ring-offset-1 ring-offset-transparent';

  return (
    <button
      type="button"
      data-tu-badge=""
      className={`inline-flex h-[26px] w-[50px] shrink-0 cursor-pointer items-center justify-center gap-[5px] rounded-[2px] font-['Inter',sans-serif] text-[11px] font-semibold tabular-nums outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-[#0267FF] focus-visible:ring-offset-1 ${colorClasses} ${
        isOpen ? openRingClasses : ''
      }`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      onMouseEnter={(e) => handleOpen(e.currentTarget)}
      onMouseLeave={onClose}
      onFocus={(e) => handleOpen(e.currentTarget)}
      onBlur={onClose}
    >
      {item.kind === 'transfer' ? (
        <Truck className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
      ) : (
        <Package className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
      )}
      {item.count}
    </button>
  );
}

const transferPopRowText = "font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#101828]";
const transferPopPill =
  "shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-semibold tabular-nums text-[#101828]";
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
      {from.toLocaleString()} <span className="mx-0.5 font-normal text-[#9CA3AF]">→</span>{' '}
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
      {fmt(fromWeeks)} <span className="mx-0.5 font-normal text-[#9CA3AF]">→</span> {fmt(toWeeks)}{' '}
      ({targetWeeks} target)
    </>
  );
}

function TransferBadgePopoverContent({
  popRow,
  popItem,
  rows,
}: {
  popRow: ProductTransferLocationRow;
  popItem: Extract<TuBreakdownItem, { kind: 'transfer' }>;
  rows: ProductTransferLocationRow[];
}) {
  const sourceRow = rows.find((r) => r.id === popItem.fromLocationId);
  const sourceName = sourceRow?.name ?? 'Unknown source';
  const availableToSend = sourceRow ? sourceRow.stock.from : 0;
  return (
    <>
      <p className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
        <span>{sourceName}</span>
        <span className="mx-0.5 font-normal text-[#9CA3AF]">→</span>
        <span>{popRow.name}</span>
      </p>
      <div className="my-1.5 border-t border-[#E3E8F0]" />

      <p className={`${transferPopSection} mb-1.5`}>Transfer info</p>
      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Transfer units"
          value={popItem.count.toLocaleString()}
        />
        <TransferPopRow
          icon={<Package className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Available to send"
          value={availableToSend.toLocaleString()}
        />
        <TransferPopRow
          icon={<ArrowLeftRight className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Trip type"
          value={popItem.tripType}
        />
      </div>

      <p className={`${transferPopSection} mt-2 mb-1.5`}>Recommendation</p>
      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<Truck className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Transfer units"
          value={popItem.count.toLocaleString()}
        />
        <TransferPopRow
          icon={<TrendingUp className="size-3.5" strokeWidth={2} aria-hidden />}
          label="Revenue increase"
          value={formatCurrencyEur(popItem.revenueIncrease)}
        />
      </div>

      {popItem.reasons.length > 0 ? (
        <>
          <p className={`${transferPopSection} mt-2 mb-1.5`}>Recommendation reasons</p>
          <div className="flex flex-col gap-1.5">
            {popItem.reasons.map((reason, idx) => (
              <TransferPopReason key={`${popRow.id}-reason-${idx}`} label={reason} />
            ))}
          </div>
        </>
      ) : null}

      <div className="my-2 border-t border-[#E3E8F0]" />

      <p className={`${transferPopSection} mb-1.5`}>Total stock</p>
      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<Package className="size-3.5" strokeWidth={2} aria-hidden />}
          label={sourceName}
          value={
            sourceRow
              ? formatStockArrow(sourceRow.stock.from, sourceRow.stock.to)
              : '—'
          }
        />
        <TransferPopRow
          icon={<Package className="size-3.5" strokeWidth={2} aria-hidden />}
          label={popRow.name}
          value={formatStockArrow(popRow.stock.from, popRow.stock.to)}
        />
      </div>

      <p className={`${transferPopSection} mt-2 mb-1.5`}>Total weeks coverage</p>
      <div className="flex flex-col gap-1.5">
        <TransferPopRow
          icon={<CalendarDays className="size-3.5" strokeWidth={2} aria-hidden />}
          label={sourceName}
          value={
            sourceRow
              ? formatWeeksCoverageArrow(
                  sourceRow.stock,
                  sourceRow.forecastPerWeek,
                  sourceRow.coverage.targetWeeks
                )
              : '—'
          }
        />
        <TransferPopRow
          icon={<CalendarDays className="size-3.5" strokeWidth={2} aria-hidden />}
          label={popRow.name}
          value={formatWeeksCoverageArrow(
            popRow.stock,
            popRow.forecastPerWeek,
            popRow.coverage.targetWeeks
          )}
        />
      </div>
    </>
  );
}

type ProductTransfersTableProps = {
  parentRow: AssortmentRow;
  onBack: () => void;
};

export function ProductTransfersTable({ parentRow, onBack }: ProductTransfersTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showTuBreakdown, setShowTuBreakdown] = useState(false);
  const [tuBadgePopover, setTuBadgePopover] = useState<{
    rowId: string;
    index: number;
    rect: DOMRect;
  } | null>(null);
  const [tuPopoverStyle, setTuPopoverStyle] = useState<CSSProperties>({});
  const [detailPhase, setDetailPhase] = useState<'closed' | 'open' | 'closing'>('closed');
  const [morphRect, setMorphRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const tuPopoverPanelRef = useRef<HTMLDivElement>(null);
  const tuCloseTimerRef = useRef<number | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const detailCardRef = useRef<HTMLDivElement>(null);
  const detailBackdropRef = useRef<HTMLDivElement>(null);
  const rows = MOCK_PRODUCT_TRANSFER_LOCATIONS;
  const summary = MOCK_PRODUCT_TRANSFER_SUMMARY;

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

  const requestCloseDetail = () => {
    setDetailPhase((p) => (p === 'open' ? 'closing' : p));
  };

  useEffect(() => {
    if (detailPhase === 'closed') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestCloseDetail();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [detailPhase]);

  useLayoutEffect(() => {
    const card = detailCardRef.current;
    const backdrop = detailBackdropRef.current;
    if (!card || !backdrop) return;

    const computeMorphTransform = () => {
      const cardRect = card.getBoundingClientRect();
      if (!morphRect || cardRect.width === 0 || cardRect.height === 0) {
        return { transform: 'scale(0.94)', transformOrigin: 'center center' };
      }
      const dx = morphRect.left + morphRect.width / 2 - (cardRect.left + cardRect.width / 2);
      const dy = morphRect.top + morphRect.height / 2 - (cardRect.top + cardRect.height / 2);
      const sx = Math.max(0.05, morphRect.width / cardRect.width);
      const sy = Math.max(0.05, morphRect.height / cardRect.height);
      return {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        transformOrigin: 'center center',
      };
    };

    if (detailPhase === 'open') {
      const start = computeMorphTransform();
      card.style.transition = 'none';
      backdrop.style.transition = 'none';
      card.style.transformOrigin = start.transformOrigin;
      card.style.transform = start.transform;
      card.style.opacity = '0';
      backdrop.style.opacity = '0';
      void card.offsetWidth;
      card.style.transition =
        'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out';
      backdrop.style.transition = 'opacity 220ms ease-out';
      const raf = requestAnimationFrame(() => {
        if (!detailCardRef.current || !detailBackdropRef.current) return;
        detailCardRef.current.style.transform = 'translate(0px, 0px) scale(1, 1)';
        detailCardRef.current.style.opacity = '1';
        detailBackdropRef.current.style.opacity = '1';
      });
      return () => cancelAnimationFrame(raf);
    }

    if (detailPhase === 'closing') {
      const end = computeMorphTransform();
      card.style.transition =
        'transform 220ms cubic-bezier(0.4, 0, 1, 1), opacity 180ms ease-in';
      backdrop.style.transition = 'opacity 180ms ease-in';
      card.style.transformOrigin = end.transformOrigin;
      card.style.transform = end.transform;
      card.style.opacity = '0';
      backdrop.style.opacity = '0';
      const t = window.setTimeout(() => {
        setDetailPhase('closed');
        setMorphRect(null);
      }, 240);
      return () => window.clearTimeout(t);
    }
  }, [detailPhase, morphRect]);

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const detail = parentRow.productCellDetail;
  const breadcrumbProduct = `${detail.title} [${truncateSku(detail.sku)}]`;

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
    return (
    <tr key={row.id} className={rowBgClass}>
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
        className={`sticky left-14 z-20 min-h-[86px] min-w-min max-w-max box-border ${rowBgClass} px-4 py-3 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
      >
        <div className="min-w-0">
          <div className="flex w-full min-w-0 flex-nowrap items-center gap-1.5 leading-none">
            <span className={`shrink-0 ${tableCellPrimary}`}>{row.name}</span>
            {row.transferHub || row.locationFilter ? (
              <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-3">
                {row.transferHub ? (
                  <span
                    className="inline-flex shrink-0 items-center justify-center text-[20px] leading-none text-[#101828]"
                    title="Receiving location"
                    aria-label="Receiving location"
                  >
                    <AutoneReceivingLocationIcon />
                  </span>
                ) : null}
                {row.locationFilter ? (
                  <span className="inline-flex shrink-0 text-[#6A7282]" title="Filtered" aria-label="Filtered">
                    <Filter size={16} strokeWidth={2} aria-hidden />
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <div className={`mt-0.5 ${tableCellSecondary}`}>{row.code}</div>
        </div>
      </td>
      <td className={`min-h-[86px] min-w-[112px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellPrimary}`}>{formatArrowPair(row.stock.from, row.stock.to)}</div>
      </td>
      <td className={`min-h-[86px] min-w-[112px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className="flex min-w-0 flex-col items-end gap-0">
          <div className="tabular-nums text-[14px] font-semibold leading-normal">
            <span className="text-[#101828]">{row.tu.from.toLocaleString()}</span>
            <span className="mx-0.5 font-normal text-[#9CA3AF]">→</span>
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
          <div className={`tabular-nums ${tableCellPrimary}`}>{row.sales.l7d.toLocaleString()}</div>
          <div className={`tabular-nums ${tableCellSecondary}`}>{row.sales.l30d.toLocaleString()}</div>
        </div>
      </td>
      <td className={`min-h-[86px] min-w-[112px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellPrimary}`}>{row.forecastPerWeek.toFixed(2)}</div>
      </td>
      <td className={`min-h-[86px] min-w-[112px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellPrimary}`}>{formatArrowPair(row.stockouts.from, row.stockouts.to)}</div>
      </td>
      <td className={`min-h-[86px] min-w-[140px] px-4 py-3 text-right align-top ${tableRowHoverTd}`}>
        <div className="flex min-w-0 flex-col items-end gap-1">
          <div className={`tabular-nums ${tableCellPrimary}`}>
            {formatCoveragePair(row.coverage.fromPct, row.coverage.toPct)}
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
    <div className="flex min-w-0 flex-col gap-4">
      <nav
        className="font-['Inter',sans-serif] text-sm leading-normal text-[#00050a]"
        aria-label="Breadcrumb"
      >
        <button
          type="button"
          onClick={onBack}
          className="text-left font-normal text-[#667085] transition-colors hover:text-[#101828] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0267FF]"
        >
          {breadcrumbProduct}
        </button>
        <span className="mx-1 text-[#6A7282]" aria-hidden>
          &gt;
        </span>
        <span className="font-semibold text-[#00050a]">Transfers</span>
      </nav>

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
              <tr className="[&_th]:whitespace-nowrap [&_th]:align-top">
                <th
                  className="sticky left-0 z-30 w-14 min-w-14 max-w-14 bg-white px-4 py-[10px] text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                  scope="col"
                  aria-label="Selection"
                />
                <th
                  className="sticky left-14 z-20 min-w-min max-w-max bg-white px-4 py-[10px] text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                  scope="col"
                >
                  {headerStack(
                    <AutoneHeaderInfoTooltip
                      label="Locations"
                      rich={{
                        title: 'Location',
                        icon: 'info',
                        body: HEADER_INFO_TOOLTIPS.locations,
                      }}
                      hoverWith={<span className={headerTitleClass}>Locations</span>}
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th className="min-w-[120px] px-4 py-[10px] text-right" scope="col">
                  {headerStackRight(
                    <AutoneHeaderInfoTooltip
                      label="Stock"
                      rich={{
                        title: 'Stock',
                        icon: 'info',
                        body: HEADER_INFO_TOOLTIPS.stock,
                        footer: {
                          kind: 'footerCaption',
                          text: formatArrowPair(summary.stock.from, summary.stock.to),
                        },
                      }}
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
                <th className="min-w-[120px] px-4 py-[10px] text-right" scope="col">
                  {headerStackRight(
                    <span className="inline-flex items-center justify-end gap-1">
                      <AutoneHeaderInfoTooltip
                        label="TU (transfer units)"
                        rich={{
                          title: 'TU',
                          icon: 'info',
                          body: HEADER_INFO_TOOLTIPS.tu,
                          footer: {
                            kind: 'footerCaption',
                            text: formatArrowPair(summary.tu.from, summary.tu.to),
                          },
                        }}
                        hoverWith={<span className={headerTitleClass}>TU</span>}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTuBreakdown((v) => !v)}
                        className={`rounded p-0.5 text-[#6A7282] outline-none transition-colors hover:bg-slate-100 hover:text-[#101828] focus-visible:ring-2 focus-visible:ring-[#0267FF] focus-visible:ring-offset-0 ${showTuBreakdown ? 'bg-slate-100 text-[#101828]' : ''}`}
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
                      rich={{
                        ...ASSORTMENT_HEADER_RICH.salesL7dL30d,
                        footer: {
                          kind: 'salesMetrics',
                          l7d: summary.sales.l7d.toLocaleString(),
                          l30d: summary.sales.l30d.toLocaleString(),
                        },
                      }}
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
                      rich={{
                        title: 'Forecast per wk.',
                        icon: 'info',
                        body: HEADER_INFO_TOOLTIPS.forecastPerWk,
                        footer: {
                          kind: 'footerCaption',
                          text: `${summary.forecastPerWeek.toFixed(2)} per wk`,
                        },
                      }}
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
                      rich={{
                        title: 'Stockouts',
                        icon: 'info',
                        body: HEADER_INFO_TOOLTIPS.stockouts,
                        footer: {
                          kind: 'footerCaption',
                          text: formatArrowPair(summary.stockouts.from, summary.stockouts.to),
                        },
                      }}
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
                      rich={{
                        title: 'Coverage',
                        icon: 'info',
                        body: HEADER_INFO_TOOLTIPS.coverage,
                        footer: {
                          kind: 'transferTotals',
                          unitsLine: 'before → after',
                          tripsLine: 'target weeks',
                        },
                      }}
                      hoverWith={<span className={headerTitleClass}>Coverage</span>}
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th className="min-w-[160px] bg-[#F9FAFB] px-4 py-[10px] text-left" scope="col">
                  <div className="flex min-h-[52px] flex-col justify-center py-[2px]">
                    <AutoneHeaderInfoTooltip
                      label="Storage capacity"
                      topAlign="start"
                      rich={{
                        title: 'Storage capacity',
                        icon: 'info',
                        body: HEADER_INFO_TOOLTIPS.storageCapacity,
                      }}
                      hoverWith={
                        <span className={`text-left font-['Inter',sans-serif] text-[14px] font-semibold leading-tight text-[#101828]`}>
                          <span className="block">Storage</span>
                          <span className="block">capacity</span>
                        </span>
                      }
                    />
                  </div>
                </th>
              </tr>
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
            const accent = popItem.kind === 'transfer' ? '#2563EB' : '#A832D7';
            const isTransfer = popItem.kind === 'transfer';
            const isInTransit = popItem.kind === 'in-transit';
            const detailLabel =
              popItem.kind === 'warehouse'
                ? 'Stock on-hand'
                : popItem.kind === 'in-transit'
                  ? 'Stock in-transit'
                  : 'Transfer units';
            const forecast = popRow.forecastPerWeek;
            const weeksCoverageText =
              forecast > 0
                ? `${(popItem.count / forecast).toFixed(1)} weeks`
                : 'N/A (0 forecast)';
            const ariaLabel = isTransfer
              ? `Transfer details for ${popRow.name}`
              : `${detailLabel} at ${popRow.name}`;
            return createPortal(
              <div
                ref={tuPopoverPanelRef}
                role="dialog"
                aria-label={ariaLabel}
                data-tu-popover=""
                className={`${
                  isTransfer
                    ? 'w-[min(19rem,calc(100vw-24px))] p-2.5'
                    : 'w-[min(18rem,calc(100vw-24px))] p-2.5'
                } rounded-[2px] border-2 bg-white shadow-[0_8px_24px_-4px_rgba(15,23,42,0.15)]`}
                style={{ ...tuPopoverStyle, borderColor: accent, visibility: tuPopoverStyle.visibility ?? 'hidden' }}
                onMouseEnter={cancelTuClose}
                onMouseLeave={scheduleTuBadgeClose}
              >
                {isTransfer && popItem.kind === 'transfer' ? (
                  <TransferBadgePopoverContent popRow={popRow} popItem={popItem} rows={rows} />
                ) : isInTransit && popItem.kind === 'in-transit' ? (
                  <>
                    <p className="font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                      {popRow.name}
                    </p>
                    <div className="my-1.5 border-t border-[#E3E8F0]" />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Package className="size-3.5 shrink-0 text-[#101828]" strokeWidth={2} aria-hidden />
                        <span className="font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#101828]">
                          {detailLabel}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-semibold tabular-nums text-[#101828]">
                        {popItem.count}
                      </span>
                    </div>
                    {popItem.note ? (
                      <p className="mt-1.5 font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#6A7282]">
                        {popItem.note}
                      </p>
                    ) : null}
                    <div className="my-2 border-t border-[#E3E8F0]" />
                    <p className="font-['Inter',sans-serif] text-[12px] font-semibold leading-snug text-[#101828]">
                      Why wasn’t this SKU/Unit moved?
                    </p>
                    <p className="mt-1 font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#6A7282]">
                      Sol may leave a unit behind if:
                    </p>
                    <ul className="mt-1.5 flex flex-col gap-1 font-['Inter',sans-serif] text-[11px] font-normal leading-snug text-[#101828]">
                      <li className="flex gap-1.5">
                        <span aria-hidden className="mt-[5px] size-1 shrink-0 rounded-full bg-[#A832D7]" />
                        <span>Moving it would leave the sending store too low on stock</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span aria-hidden className="mt-[5px] size-1 shrink-0 rounded-full bg-[#A832D7]" />
                        <span>The receiving store doesn’t need it enough</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span aria-hidden className="mt-[5px] size-1 shrink-0 rounded-full bg-[#A832D7]" />
                        <span>The receiving store has no space</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span aria-hidden className="mt-[5px] size-1 shrink-0 rounded-full bg-[#A832D7]" />
                        <span>The trip is already full</span>
                      </li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        const r = tuPopoverPanelRef.current?.getBoundingClientRect();
                        setMorphRect(
                          r
                            ? { left: r.left, top: r.top, width: r.width, height: r.height }
                            : null
                        );
                        cancelTuClose();
                        setTuBadgePopover(null);
                        setDetailPhase('open');
                      }}
                      className="mt-2 inline-block cursor-pointer font-['Inter',sans-serif] text-[11px] font-medium leading-snug text-[#0267FF] underline-offset-2 outline-none hover:underline focus-visible:underline"
                    >
                      More detail...
                    </button>
                  </>
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
                        <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-semibold tabular-nums text-[#101828]">
                          {popItem.count}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <CalendarDays className="size-3.5 shrink-0 text-[#101828]" strokeWidth={2} aria-hidden />
                          <span className="font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#101828]">
                            Weeks coverage
                          </span>
                        </div>
                        <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-1.5 py-0.5 font-['Inter',sans-serif] text-[11px] font-semibold tabular-nums text-[#101828]">
                          {weeksCoverageText}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>,
              document.body
            );
          })()
        : null}

      {detailPhase !== 'closed'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Why wasn’t this SKU moved?"
              className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8"
            >
              <div
                ref={detailBackdropRef}
                className="absolute inset-0 bg-[#0F172A]/40"
                style={{ opacity: 0, willChange: 'opacity' }}
                onClick={requestCloseDetail}
                aria-hidden
              />
              <div
                ref={detailCardRef}
                className="relative flex max-h-[85vh] w-[min(36rem,calc(100vw-32px))] flex-col overflow-hidden rounded-[6px] bg-white shadow-[0_24px_48px_-12px_rgba(15,23,42,0.25)]"
                style={{ opacity: 0, willChange: 'transform, opacity' }}
              >
                <div className="flex items-start justify-between gap-3 px-5 pt-5">
                  <h2 className="font-['Inter',sans-serif] text-[18px] font-semibold leading-snug text-[#101828]">
                    Why wasn’t this SKU moved?
                  </h2>
                  <button
                    type="button"
                    onClick={requestCloseDetail}
                    className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#6A7282] outline-none transition-colors hover:bg-[#F2F4F7] hover:text-[#101828] focus-visible:ring-2 focus-visible:ring-[#0267FF] focus-visible:ring-offset-1"
                    aria-label="Close"
                  >
                    <X className="size-5" strokeWidth={2} aria-hidden />
                  </button>
                </div>
                <div className="overflow-y-auto px-5 pt-3 pb-5">
                  <p className="font-['Inter',sans-serif] text-[13px] font-normal leading-relaxed text-[#475467]">
                    Sol may leave a unit behind for one or more of these reasons:
                  </p>
                  <ol className="mt-4 flex flex-col gap-3.5">
                    {[
                      {
                        title: 'Warehouse can still supply',
                        body:
                          'If the warehouse has enough stock (based on your set weeks of cover), Sol will not move items between stores. This keeps fulfilment faster and lower cost than store-to-store transfers.',
                      },
                      {
                        title: 'Stock target limits',
                        body:
                          'Each store has a target stock level. Sol will not move this SKU if it would take the receiving store over its target, or over the allowed buffer.',
                      },
                      {
                        title: 'Low value move',
                        body:
                          'Sol only suggests moves that add enough value. If the expected uplift is below the set threshold, the move is not made.',
                      },
                      {
                        title: 'Better option chosen',
                        body:
                          'This SKU may have had other possible destinations. Sol selected a higher value move instead.',
                      },
                      {
                        title: 'Trip capacity reached',
                        body:
                          'Each transfer trip has a limit. Higher value moves may have filled the trip before this SKU was included.',
                      },
                      {
                        title: 'Storage capacity reached',
                        body:
                          'The receiving store may have reached its space limit for this category due to higher value items.',
                      },
                    ].map((reason, idx) => (
                      <li key={reason.title} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-[2px] inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2eb8c2]/15 font-['Inter',sans-serif] text-[12px] font-semibold leading-none text-[#2eb8c2]"
                        >
                          {idx + 1}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="font-['Inter',sans-serif] text-[14px] font-semibold leading-snug text-[#101828]">
                            {reason.title}
                          </p>
                          <p className="font-['Inter',sans-serif] text-[13px] font-normal leading-relaxed text-[#475467]">
                            {reason.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-5 border-t border-[#E3E8F0] pt-4 font-['Inter',sans-serif] text-[12px] font-normal italic leading-relaxed text-[#6A7282]">
                    Sol runs multiple passes. Only the final reason from the last run is shown.
                  </p>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
