import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Filter, Package, Pencil, Truck } from 'lucide-react';
import type { AssortmentRow } from '../types';
import { ASSORTMENT_HEADER_RICH } from '../data/assortmentHeaderTooltips';
import { AutoneReceivingLocationIcon } from './icons/AutoneReceivingLocationIcon';
import { HEADER_INFO_TOOLTIPS } from '../data/headerInfoTooltips';
import {
  MOCK_PRODUCT_TRANSFER_LOCATIONS,
  MOCK_PRODUCT_TRANSFER_SUMMARY,
  type ProductTransferLocationRow,
  type TuBreakdownItem,
} from '../data/mockProductTransferLocations';
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
}: {
  item: TuBreakdownItem;
  rowId: string;
  index: number;
  isOpen: boolean;
  onOpen: (payload: { rowId: string; index: number; rect: DOMRect }) => void;
}) {
  const wh = item.kind === 'warehouse';
  return (
    <button
      type="button"
      data-tu-badge=""
      className={`inline-flex h-[26px] w-[50px] shrink-0 cursor-pointer items-center justify-center gap-[5px] rounded-[2px] font-['Inter',sans-serif] text-[11px] font-semibold tabular-nums text-white outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-[#0267FF] focus-visible:ring-offset-1 ${
        wh ? 'bg-[#A832D7]' : 'bg-[#2563EB]'
      } ${isOpen ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      onClick={(e) => {
        e.stopPropagation();
        onOpen({ rowId, index, rect: e.currentTarget.getBoundingClientRect() });
      }}
    >
      {wh ? (
        <Package className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
      ) : (
        <Truck className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
      )}
      {item.count}
    </button>
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
  const tuPopoverPanelRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const rows = MOCK_PRODUCT_TRANSFER_LOCATIONS;
  const summary = MOCK_PRODUCT_TRANSFER_SUMMARY;
  const allSelected = rows.length > 0 && rows.every((r) => selected[r.id]);
  const someSelected = rows.some((r) => selected[r.id]);

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const openTuBadgePopover = (payload: { rowId: string; index: number; rect: DOMRect }) => {
    setTuBadgePopover((prev) =>
      prev && prev.rowId === payload.rowId && prev.index === payload.index ? null : payload
    );
  };

  useLayoutEffect(() => {
    if (!tuBadgePopover) {
      setTuPopoverStyle({});
      return;
    }
    const panel = tuPopoverPanelRef.current;
    if (!panel) return;
    const pr = panel.getBoundingClientRect();
    const { rect } = tuBadgePopover;
    let top = rect.bottom + 8;
    let left = rect.left;
    if (top + pr.height > window.innerHeight - TU_POPOVER_PAD) {
      top = Math.max(TU_POPOVER_PAD, rect.top - pr.height - 8);
    }
    if (left + pr.width > window.innerWidth - TU_POPOVER_PAD) {
      left = window.innerWidth - pr.width - TU_POPOVER_PAD;
    }
    if (left < TU_POPOVER_PAD) left = TU_POPOVER_PAD;
    setTuPopoverStyle({
      top,
      left,
      position: 'fixed',
      zIndex: 100,
      visibility: 'visible',
    });
  }, [tuBadgePopover]);

  useEffect(() => {
    if (!tuBadgePopover) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTuBadgePopover(null);
    };
    const onScroll = () => setTuBadgePopover(null);
    const onMouseDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (tuPopoverPanelRef.current?.contains(el)) return;
      if (el.closest('[data-tu-badge]')) return;
      setTuBadgePopover(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [tuBadgePopover]);

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? Object.fromEntries(rows.map((r) => [r.id, true])) : {});
  };

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

  const renderDataRow = (row: ProductTransferLocationRow) => (
    <tr key={row.id} className="bg-white">
      <td
        className={`sticky left-0 z-30 min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
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
        className={`sticky left-14 z-20 min-h-[86px] min-w-min max-w-max box-border bg-white px-4 py-3 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
      >
        <div className="min-w-0">
          <div className="flex min-w-0 flex-nowrap items-center gap-1.5 leading-none">
            <span className={`shrink-0 ${tableCellPrimary}`}>{row.name}</span>
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
    </tr>
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <nav
        className="font-['Inter',sans-serif] text-sm leading-normal text-[#00050a]"
        aria-label="Breadcrumb"
      >
        <button
          type="button"
          onClick={onBack}
          className="text-left text-[#0267FF] underline-offset-2 hover:underline"
        >
          {breadcrumbProduct}
        </button>
        <span className="mx-1 text-[#6A7282]" aria-hidden>
          &gt;
        </span>
        <span className="font-semibold text-[#00050a]">Transfers</span>
      </nav>

      <div
        className="rounded-lg overflow-hidden bg-white border-[0.5px] border-solid border-[#E3E8F0]"
        data-name="Table container"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1240px] border-collapse">
            <thead
              className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:bg-white [&_th]:font-['Inter',sans-serif]"
            >
              <tr className="[&_th]:whitespace-nowrap [&_th]:align-top">
                <th
                  className="sticky left-0 z-30 w-14 min-w-14 max-w-14 bg-white px-4 py-[10px] text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                  scope="col"
                >
                  <label className="flex min-h-[52px] cursor-pointer items-center py-[2px]">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                      aria-label="Select all locations"
                    />
                  </label>
                </th>
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
            const accent = popItem.kind === 'warehouse' ? '#A832D7' : '#2563EB';
            const detailLabel = popItem.kind === 'warehouse' ? 'Stock on-hand' : 'Transfer units';
            return createPortal(
              <div
                ref={tuPopoverPanelRef}
                role="dialog"
                aria-label={`${detailLabel} at ${popRow.name}`}
                data-tu-popover=""
                className="w-[min(18rem,calc(100vw-24px))] rounded-[2px] border-2 bg-white p-3 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.15)]"
                style={{ ...tuPopoverStyle, borderColor: accent, visibility: tuPopoverStyle.visibility ?? 'hidden' }}
              >
                <p className="font-['Inter',sans-serif] text-sm font-semibold leading-snug text-[#101828]">
                  {popRow.name}
                </p>
                <div className="my-2 border-t border-[#E3E8F0]" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {popItem.kind === 'warehouse' ? (
                      <Package className="size-4 shrink-0 text-[#101828]" strokeWidth={2} aria-hidden />
                    ) : (
                      <Truck className="size-4 shrink-0 text-[#101828]" strokeWidth={2} aria-hidden />
                    )}
                    <span className="font-['Inter',sans-serif] text-sm font-normal leading-snug text-[#101828]">
                      {detailLabel}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-[2px] bg-[#F2F4F7] px-2 py-1 font-['Inter',sans-serif] text-sm font-semibold tabular-nums text-[#101828]">
                    {popItem.count}
                  </span>
                </div>
              </div>,
              document.body
            );
          })()
        : null}
    </div>
  );
}
