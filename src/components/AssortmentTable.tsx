import { useState, useEffect, useCallback, useMemo, type DragEvent, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  GripVertical,
} from 'lucide-react';
import type { AssortmentRow, ModalKind } from '../types';
import { defaultTableColumnVisibility, type TableColumnVisibilityKey } from '../tableColumnCustomise';
import { ASSORTMENT_HEADER_RICH } from '../data/assortmentHeaderTooltips';
import { HEADER_INFO_TOOLTIPS } from '../data/headerInfoTooltips';
import { AutoneHeaderInfoTooltip } from './AutoneHeaderInfoTooltip';
import { AssortmentCellKpiTrigger, type AssortmentCellKpiContent } from './AssortmentCellKpiTrigger';
import { ProductDetailsPopover } from './ProductDetailsPopover';
import { TransitionArrowSeparator } from './TransitionArrowSeparator';
import {
  ALL_TAB_AGGREGATED_STICKY_COL_PX,
  ALL_TAB_AGG_SUB_COL_WIDTHS,
} from '../lib/allTabAggregatedStickyLayout';

/** Body cell primary label (titles, names) — Inter 14px semibold #101828 */
const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";

/** Body numeric cells — Inter 14px medium #101828 */
const tableCellNumeric =
  "font-['Inter',sans-serif] text-[14px] font-medium leading-normal text-[#101828]";

/** Body cell secondary / supporting text — Inter 12px regular #6A7282 */
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";

/** Matches thead totals row primary / secondary numeric styling (export for All-tab aggregated header slot). */
export const assortmentTotalsPrimaryClass = `${tableCellNumeric} tabular-nums !leading-[18px]`;
export const assortmentTotalsSecondaryClass = `${tableCellSecondary} tabular-nums !leading-[16px]`;

/** Grip in thead — compact handle (~12px), matches header row density. */
const tableHeaderGripIcon =
  'h-3 w-3 shrink-0 text-[#6A7282]';

/** Matches ProductTransfersTable / LocationProductsDrillView header label inset. */
const theadHeaderCellPy = 'py-[10px]';

/** Row cells stay white (no hover fill). */
const tableRowHoverTd = '';

/**
 * V1-only ("All" tab) dummy "to location" data used for the third sticky sub-column
 * when `productDetailsAggregated` is true. Picked deterministically by row index so
 * the same row always shows the same destination during demos. Mix of cities and
 * cluster categories to mirror the variety of values in `row.locationCluster.name`.
 */
/** Demo "to location" counts — exported so All-tab header totals match body rows. */
export const AGGREGATED_DUMMY_TO_LOCATIONS: { name: string; count: number }[] = [
  { name: 'Paris', count: 5 },
  { name: 'Toulouse', count: 3 },
  { name: 'Strasbourg', count: 4 },
  { name: 'Lille', count: 2 },
  { name: 'Nantes', count: 4 },
  { name: 'Rennes', count: 3 },
  { name: 'Outlet', count: 3 },
  { name: 'Pop-up', count: 2 },
];

function formatCoverageWeeks(n: number): string {
  return `${n} ${n === 1 ? 'week' : 'weeks'}`;
}

/** Revenue increase column: €211.7K vs €7.96K (1 vs 2 decimal places in K). */
function formatRevenueIncreaseEurK(eur: number): string {
  const k = eur / 1000;
  const frac = k >= 100 ? 1 : 2;
  return `€${k.toFixed(frac)}K`;
}

/** KPI hover popover copy for the sticky product column — tied to row SKU, locations, stockouts, transfers. */
function kpiPopoverProduct(row: AssortmentRow): AssortmentCellKpiContent {
  const { from, to } = row.stockouts;
  const pct = from > 0 ? Math.round(((from - to) / from) * 100) : 0;
  const improved = to < from;
  return {
    column: 'product',
    title: 'Stockouts',
    rangeText: `${from.toLocaleString()} → ${to.toLocaleString()}`,
    deltaText: from === to ? undefined : `${improved ? '-' : '+'}${Math.abs(pct)}%`,
    deltaPositive: improved,
    summary: (
      <>
        Expected change for{' '}
        <span className="font-semibold text-[#101828]">{row.productCellDetail.title}</span> ({row.productCellDetail.sku}
        ): from <span className="font-semibold text-emerald-700">{from.toLocaleString()}</span> to{' '}
        <span className="font-semibold text-emerald-700">{to.toLocaleString()} units</span> across{' '}
        {row.locationCluster.name}.
      </>
    ),
    drivers: [
      {
        tone: 'warning',
        text: `Arena exposure across ${row.locationCluster.locationCount} location${row.locationCluster.locationCount === 1 ? '' : 's'}`,
      },
      {
        tone: 'positive',
        text: `L7D sales ${row.sales.l7d.toLocaleString()} units`,
      },
      {
        tone: 'negative',
        text: `Revenue upside vs baseline ${formatRevenueIncreaseEurK(row.revenueIncreaseEur)}`,
      },
    ],
    footerHighlight: `+${row.recommendedTransfers.primary.toLocaleString()}`,
    footerRest: ` units transfer suggested to rebalance ${row.locationCluster.name}`,
  };
}

const theadCellBg = 'bg-white';

/** Columns with grip handles — reorderable (IA after post–Stockouts block). */
const BASE_GRIP_COLUMN_IDS = [
  'transfers',
  'rebalTransfers',
  'reorderTransfers',
  'replenishTransfers',
  'sales',
  'scheduleStart',
  'targetCoverage',
  'gripLocations',
] as const;

const DRILL_GRIP_COLUMN_IDS = [
  'drillMinQty',
  'drillInventory',
  'drillTarget',
  'drillForecast',
  'drillSkuLocs',
] as const;

export type GripColumnId =
  | (typeof BASE_GRIP_COLUMN_IDS)[number]
  | (typeof DRILL_GRIP_COLUMN_IDS)[number];

const DRILL_GRIP_ID_SET = new Set<string>(DRILL_GRIP_COLUMN_IDS);

const GRIP_VISIBILITY_KEY: Partial<Record<GripColumnId, TableColumnVisibilityKey>> = {
  transfers: 'transfers',
  scheduleStart: 'recommendedTransfers',
  sales: 'revenueIncrease',
  targetCoverage: 'stockouts',
  gripLocations: 'locations',
};

/**
 * Split sticky header for the All tab: thead has titles + primary totals + secondary totals.
 * `controlsRow` renders as the first tbody row directly beneath thead (columns 1–2).
 */
export type ProductDetailsSplitHeaderSlots = {
  titlesRow: ReactNode;
  totalsRow: ReactNode;
  controlsRow: ReactNode;
};

interface AssortmentTableProps {
  rows: AssortmentRow[];
  designOnly?: boolean;
  onSelectRow: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onAssort: (row: AssortmentRow) => void;
  onUnassort: (row: AssortmentRow) => void;
  onSumIaChange: (id: string, value: number) => void;
  onAvgIaChange: (id: string, value: number) => void;
  onOpenModal?: (kind: ModalKind, row?: AssortmentRow) => void;
  onCommit?: (id: string) => void;
  onRevert?: (id: string) => void;
  onEditRow?: (row: AssortmentRow, openFrom: 'assortment' | 'initial-allocation') => void;
  /** When set, Commit/Revert in Status column open this modal instead of committing/reverting immediately */
  onRequestCommit?: (row: AssortmentRow) => void;
  onRequestRevert?: (row: AssortmentRow) => void;
  /** When true, show SKU / Min Qty / Inventory / drill columns (e.g. from parent breadcrumbs). */
  productDrillDownActive?: boolean;
  /** Per-column visibility from the Customise columns drawer; omitted keys default to visible. */
  columnVisibility?: Partial<Record<TableColumnVisibilityKey, boolean>>;
  /** Opens product-level drill-down (e.g. location transfers). Clicks on inputs/buttons do not fire. */
  onRowClick?: (row: AssortmentRow) => void;
  /** When true, suppress every in-cell `KPI` chip + popover (used by V1; other prototypes leave this off). */
  hideKpiBadges?: boolean;
  /** When true, render a second header row containing column totals styled like a compact data row (used by V1). */
  showTotalsRow?: boolean;
  /**
   * When provided, replaces the "Product details" sticky column header text with
   * arbitrary content (e.g. aggregation dropdowns) and widens the sticky column to
   * accommodate the slot. Used by the V1 "All" aggregate-review tab.
   */
  productDetailsHeaderSlot?: ReactNode;
  /**
   * When set with `showTotalsRow`, renders titles + primary totals + secondary totals in thead,
   * and `controlsRow` in the first tbody row beneath thead (V1 All tab).
   */
  productDetailsSplitHeaderSlots?: ProductDetailsSplitHeaderSlots;
  /**
   * When true, the "Product details" sticky column body splits into three
   * sub-columns aligned with the V1 All-view aggregation dropdowns
   * (Product group / Location group / Locations to). Also hides the
   * standalone gripLocations column since locations now live in sub-col 2.
   */
  productDetailsAggregated?: boolean;
}

export function AssortmentTable({
  rows,
  designOnly = false,
  onSelectRow,
  onSelectAll: _onSelectAll,
  onAssort: _onAssort,
  onUnassort: _onUnassort,
  onSumIaChange: _onSumIaChange,
  onAvgIaChange: _onAvgIaChange,
  onOpenModal: _onOpenModal,
  onCommit: _onCommit,
  onRevert: _onRevert,
  onEditRow: _onEditRow,
  onRequestCommit: _onRequestCommit,
  onRequestRevert: _onRequestRevert,
  productDrillDownActive = false,
  columnVisibility: columnVisibilityProp,
  onRowClick,
  hideKpiBadges = false,
  showTotalsRow = false,
  productDetailsHeaderSlot,
  productDetailsSplitHeaderSlots,
  productDetailsAggregated = false,
}: AssortmentTableProps) {
  const mergedColumnVisibility = {
    ...defaultTableColumnVisibility(),
    ...columnVisibilityProp,
  };

  const showProductDetails = mergedColumnVisibility.productDetails;

  const useSplitProductHeader = Boolean(
    showProductDetails && showTotalsRow && productDetailsSplitHeaderSlots
  );
  const useMergedProductHeaderCell = Boolean(
    showProductDetails && showTotalsRow && productDetailsHeaderSlot && !useSplitProductHeader
  );
  const wideStickyProductCol = Boolean(productDetailsHeaderSlot || productDetailsSplitHeaderSlots);

  const aggregatedSplitStickyHeader =
    productDetailsAggregated && useSplitProductHeader && productDetailsSplitHeaderSlots;
  const stickyProductColWidthClass = aggregatedSplitStickyHeader
    ? `w-[${ALL_TAB_AGGREGATED_STICKY_COL_PX}px] min-w-[${ALL_TAB_AGGREGATED_STICKY_COL_PX}px] max-w-[${ALL_TAB_AGGREGATED_STICKY_COL_PX}px]`
    : wideStickyProductCol
      ? 'w-[560px] min-w-[560px] max-w-[560px]'
      : 'w-[280px] min-w-[280px] max-w-[280px]';

  /** Split header: title band + two totals bands (checkbox rowspan); dropdowns render above thead. */
  const splitHeaderTitleRowDims = 'h-[48px] min-h-[48px] max-h-[48px]';
  const splitTotalsPrimaryRowDims = 'h-[20px] min-h-[20px] max-h-[20px]';
  const splitTotalsSubRowDims = 'h-[20px] min-h-[20px] max-h-[20px]';
  const splitHeaderCheckboxSpanDims = 'h-[88px] min-h-[88px] max-h-[88px]'; /* 48 + 20 + 20 */
  const gripHeaderTitleMainJustify = 'justify-start';
  const totalsOnlyTitleRow =
    showTotalsRow && !useMergedProductHeaderCell && !useSplitProductHeader;
  const gripHeaderRowDims =
    useSplitProductHeader && showTotalsRow
      ? splitHeaderTitleRowDims
      : useMergedProductHeaderCell && showTotalsRow
        ? 'h-[60px] min-h-[60px] max-h-[60px]'
        : totalsOnlyTitleRow
          ? 'h-[48px] min-h-[48px] max-h-[48px]'
          : 'h-[62px] min-h-[62px] max-h-[62px]';
  /** Split title row is fixed 48px tall — use top inset only so labels fit inside the band. */
  const gripHeaderCellPy =
    useSplitProductHeader && showTotalsRow ? 'pt-4 pb-0' : theadHeaderCellPy;

  /** Extra columns once any row has generated recommendations (data set on generate). */
  const showRecommendationColumns = rows.some(
    (r) =>
      r.sumIaRecommendation != null || r.assortmentRecommendationLabel != null
  );

  const [gripColumnOrder, setGripColumnOrder] = useState<GripColumnId[]>(() => [
    ...BASE_GRIP_COLUMN_IDS,
  ]);

  const tableMinWidthClass = productDrillDownActive
    ? showRecommendationColumns
      ? 'min-w-[2310px]'
      : 'min-w-[2080px]'
    : showRecommendationColumns
      ? aggregatedSplitStickyHeader
        ? `min-w-[${1810 + (ALL_TAB_AGGREGATED_STICKY_COL_PX - 560)}px]`
        : 'min-w-[1810px]'
      : aggregatedSplitStickyHeader
        ? `min-w-[${1810 + (ALL_TAB_AGGREGATED_STICKY_COL_PX - 560)}px]`
        : 'min-w-[1810px]';

  useEffect(() => {
    if (productDrillDownActive) {
      setGripColumnOrder((prev) => {
        const base = prev.filter((id) => !DRILL_GRIP_ID_SET.has(id));
        const missing = DRILL_GRIP_COLUMN_IDS.filter((id) => !base.includes(id as GripColumnId));
        return [...base, ...missing];
      });
    } else {
      setGripColumnOrder((prev) => prev.filter((id) => !DRILL_GRIP_ID_SET.has(id)));
    }
  }, [productDrillDownActive]);

  const reorderGripColumns = useCallback((fromId: GripColumnId, toId: GripColumnId) => {
    if (fromId === toId) return;
    setGripColumnOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(fromId);
      const toIdx = next.indexOf(toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, fromId);
      return next;
    });
  }, []);

  const gripThDropProps = (columnId: GripColumnId) => ({
    onDragOver: (e: DragEvent<HTMLTableCellElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDrop: (e: DragEvent<HTMLTableCellElement>) => {
      e.preventDefault();
      const from = e.dataTransfer.getData('text/plain') as GripColumnId;
      if (from && from !== columnId) reorderGripColumns(from, columnId);
    },
  });

  const gripDragHandle = (columnId: GripColumnId, label: string) => (
    <span
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Drag to reorder ${label}`}
      title="Drag to reorder column"
      onDragStart={(e: DragEvent<HTMLSpanElement>) => {
        e.dataTransfer.setData('text/plain', columnId);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="inline-flex cursor-grab touch-none active:cursor-grabbing"
    >
      <GripVertical className={tableHeaderGripIcon} aria-hidden />
    </span>
  );

  const visibleGripColumnOrder = gripColumnOrder.filter(
    (id) => !DRILL_GRIP_ID_SET.has(id) || productDrillDownActive
  );

  const filteredGripColumnOrder = visibleGripColumnOrder.filter((id) => {
    if (productDetailsAggregated && id === 'gripLocations') return false;
    if (DRILL_GRIP_ID_SET.has(id)) return true;
    const key = GRIP_VISIBILITY_KEY[id];
    if (!key) return true;
    return mergedColumnVisibility[key];
  });

  const renderGripColumnHeader = (columnId: GripColumnId): ReactNode => {
    const d = gripThDropProps(columnId);
    switch (columnId) {
      case 'sales':
        return (
          <th key={columnId} className={`min-w-[128px] ${gripHeaderRowDims} box-border px-4 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Revenue increase')}
                <AutoneHeaderInfoTooltip
                  label="Revenue increase"
                  content={ASSORTMENT_HEADER_RICH.revenueIncrease.body}
                  hoverWith={<span>Revenue increase</span>}
                />
                <ChevronDown size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
              </span>
            </div>
          </th>
        );
      case 'transfers':
        return (
          <th key={columnId} className={`min-w-[200px] ${gripHeaderRowDims} box-border px-4 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Transfers')}
                <AutoneHeaderInfoTooltip
                  label="Transfers"
                  content={ASSORTMENT_HEADER_RICH.transfers.body}
                  hoverWith={<span>Transfers</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'rebalTransfers':
        return (
          <th key={columnId} className={`min-w-[200px] ${gripHeaderRowDims} box-border px-4 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Rebal transfers')}
                <span>Rebal transfers</span>
              </span>
            </div>
          </th>
        );
      case 'reorderTransfers':
        return (
          <th key={columnId} className={`min-w-[200px] ${gripHeaderRowDims} box-border px-4 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Reorder transfers')}
                <span>Reorder transfers</span>
              </span>
            </div>
          </th>
        );
      case 'replenishTransfers':
        return (
          <th key={columnId} className={`min-w-[200px] ${gripHeaderRowDims} box-border px-4 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Replenish transfers')}
                <span>Replen transfers</span>
              </span>
            </div>
          </th>
        );
      case 'scheduleStart':
        return (
          <th key={columnId} className={`min-w-[240px] ${gripHeaderRowDims} box-border px-4 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Recommended transfers')}
                <AutoneHeaderInfoTooltip
                  label="Recommended transfers"
                  content={ASSORTMENT_HEADER_RICH.recommendedTransfers.body}
                  hoverWith={<span>Recommended transfers</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'targetCoverage':
        return (
          <th key={columnId} className={`min-w-[128px] ${gripHeaderRowDims} box-border px-4 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Stockouts')}
                <AutoneHeaderInfoTooltip
                  label="Stockouts"
                  content={HEADER_INFO_TOOLTIPS.stockouts}
                  hoverWith={<span>Stockouts</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripLocations':
        return (
          <th key={columnId} className={`min-w-[120px] ${gripHeaderRowDims} box-border px-4 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Locations')}
                <AutoneHeaderInfoTooltip
                  label="Locations"
                  content={HEADER_INFO_TOOLTIPS.locations}
                  hoverWith={<span>Locations</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'drillMinQty':
        return (
          <th key={columnId} className={`${gripHeaderRowDims} box-border px-3 ${gripHeaderCellPy} text-left align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col gap-2 ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex items-center gap-1.5">
                {gripDragHandle(columnId, 'Min Qty')}
                Min Qty
              </span>
            </div>
          </th>
        );
      case 'drillInventory':
        return (
          <th key={columnId} className={`${gripHeaderRowDims} box-border px-3 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end gap-2 ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Inventory (drill)')}
                Inventory
              </span>
            </div>
          </th>
        );
      case 'drillTarget':
        return (
          <th key={columnId} className={`${gripHeaderRowDims} box-border px-3 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end gap-2 ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Target coverage (drill)')}
                <span>Target coverage</span>
              </span>
            </div>
          </th>
        );
      case 'drillForecast':
        return (
          <th key={columnId} className={`${gripHeaderRowDims} box-border px-3 ${gripHeaderCellPy} text-right align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col items-end gap-2 ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Forecast sales per week')}
                <span>Forecast per week</span>
              </span>
            </div>
          </th>
        );
      case 'drillSkuLocs':
        return (
          <th key={columnId} className={`min-w-[108px] ${gripHeaderRowDims} box-border px-3 ${gripHeaderCellPy} text-left align-top ${theadCellBg}`} {...d}>
            <div className={`flex h-full min-h-0 flex-col gap-2 ${gripHeaderTitleMainJustify}`}>
              <span className="inline-flex items-center gap-1.5">
                {gripDragHandle(columnId, 'SKU locations')}
                <span># SKU locations</span>
              </span>
            </div>
          </th>
        );
      default:
        return null;
    }
  };

  /** Per-column aggregates for the totals row. From/to columns sum endpoints; depth uses average. */
  const columnTotals = useMemo(() => {
    const sum = (sel: (r: AssortmentRow) => number) => rows.reduce((s, r) => s + sel(r), 0);
    return {
      transfersL7d: sum((r) => r.transfers.l7d),
      transfersL30d: sum((r) => r.transfers.l30d),
      revenueIncreaseEur: sum((r) => r.revenueIncreaseEur),
      recommendedTransfersPrimary: sum((r) => r.recommendedTransfers.primary),
      recommendedTransfersSecondary: sum((r) => r.recommendedTransfers.secondary),
      stockoutsFrom: sum((r) => r.stockouts.from),
      stockoutsTo: sum((r) => r.stockouts.to),
      locationsFrom: sum((r) => r.locationsTransition.from),
      locationsTo: sum((r) => r.locationsTransition.to),
    };
  }, [rows]);

  /** No divider between secondary totals band and aggregation dropdown row (split header). */
  const totalsRowNoBottomBorder =
    useSplitProductHeader && showTotalsRow && productDetailsSplitHeaderSlots ? '!border-b-0' : '';
  const totalsThClassRight = `h-[40px] min-h-[40px] max-h-[40px] box-border px-4 pt-0 pb-2 text-right align-top ${theadCellBg} ${totalsRowNoBottomBorder}`;
  const totalsThClassLeft = `h-[40px] min-h-[40px] max-h-[40px] box-border px-3 pt-0 pb-2 text-left align-top ${theadCellBg} ${totalsRowNoBottomBorder}`;

  const totalsSubLinePlaceholder = (
    <span className={`${assortmentTotalsSecondaryClass} invisible select-none`} aria-hidden>
      {'\u00A0'}
    </span>
  );

  const splitTotalsPrimaryThRight = `${splitTotalsPrimaryRowDims} box-border px-4 py-0 text-right align-bottom ${theadCellBg}`;
  const splitTotalsSubThRight = `${splitTotalsSubRowDims} box-border px-4 py-0 text-right align-top ${theadCellBg} ${totalsRowNoBottomBorder}`;
  const splitTotalsPrimaryThLeft = `${splitTotalsPrimaryRowDims} box-border px-3 py-0 text-left align-bottom ${theadCellBg}`;
  const splitTotalsSubThLeft = `${splitTotalsSubRowDims} box-border px-3 py-0 text-left align-top ${theadCellBg} ${totalsRowNoBottomBorder}`;

  /** Split header row 2: primary totals only (shared baseline across grip columns). */
  const renderGripColumnTotalsPrimarySplit = (columnId: GripColumnId): ReactNode => {
    switch (columnId) {
      case 'transfers':
        return (
          <th key={`tot-p-${columnId}`} className={`min-w-[200px] ${splitTotalsPrimaryThRight}`} aria-label="Transfers totals primary">
            <div className="flex min-h-0 w-full flex-col justify-end">
              <div className={assortmentTotalsPrimaryClass}>{columnTotals.transfersL7d.toLocaleString()} units</div>
            </div>
          </th>
        );
      case 'rebalTransfers':
      case 'reorderTransfers':
      case 'replenishTransfers':
        return (
          <th key={`tot-p-${columnId}`} className={`min-w-[200px] ${splitTotalsPrimaryThRight}`} aria-label={`${columnId} totals primary`}>
            <div className="flex min-h-0 w-full flex-col justify-end">
              <div className={assortmentTotalsPrimaryClass}>0 units</div>
            </div>
          </th>
        );
      case 'sales':
        return (
          <th key={`tot-p-${columnId}`} className={`min-w-[128px] ${splitTotalsPrimaryThRight}`} aria-label="Revenue increase total primary">
            <div className="flex min-h-0 w-full flex-col justify-end">
              <div className={assortmentTotalsPrimaryClass}>{formatRevenueIncreaseEurK(columnTotals.revenueIncreaseEur)}</div>
            </div>
          </th>
        );
      case 'scheduleStart':
        return (
          <th key={`tot-p-${columnId}`} className={`min-w-[240px] ${splitTotalsPrimaryThRight}`} aria-label="Recommended transfers totals primary">
            <div className="flex min-h-0 w-full flex-col justify-end">
              <div className={assortmentTotalsPrimaryClass}>{columnTotals.recommendedTransfersPrimary.toLocaleString()}</div>
            </div>
          </th>
        );
      case 'targetCoverage':
        return (
          <th key={`tot-p-${columnId}`} className={`min-w-[128px] ${splitTotalsPrimaryThRight}`} aria-label="Stockouts total primary">
            <div className="flex min-h-0 w-full flex-col justify-end">
              <div className={assortmentTotalsPrimaryClass}>
                {columnTotals.stockoutsFrom.toLocaleString()}
                <TransitionArrowSeparator />
                {columnTotals.stockoutsTo.toLocaleString()}
              </div>
            </div>
          </th>
        );
      case 'gripLocations':
        return (
          <th key={`tot-p-${columnId}`} className={`min-w-[120px] ${splitTotalsPrimaryThRight}`} aria-label="Locations total primary">
            <div className="flex min-h-0 w-full flex-col justify-end">
              <div className={assortmentTotalsPrimaryClass}>
                {columnTotals.locationsFrom.toLocaleString()}
                <TransitionArrowSeparator />
                {columnTotals.locationsTo.toLocaleString()}
              </div>
            </div>
          </th>
        );
      case 'drillMinQty':
      case 'drillInventory':
      case 'drillTarget':
      case 'drillForecast':
      case 'drillSkuLocs':
        return (
          <th key={`tot-p-${columnId}`} className={columnId === 'drillSkuLocs' ? `min-w-[108px] ${splitTotalsPrimaryThLeft}` : splitTotalsPrimaryThLeft} aria-hidden />
        );
      default:
        return null;
    }
  };

  /** Split header row 3: secondary totals or invisible placeholder (constant band height). */
  const renderGripColumnTotalsSubSplit = (columnId: GripColumnId): ReactNode => {
    switch (columnId) {
      case 'transfers':
        return (
          <th key={`tot-s-${columnId}`} className={`min-w-[200px] ${splitTotalsSubThRight}`} aria-label="Transfers totals secondary">
            <div className="flex min-h-0 w-full flex-col justify-start">
              <div className={assortmentTotalsSecondaryClass}>{columnTotals.transfersL30d.toLocaleString()} trips</div>
            </div>
          </th>
        );
      case 'rebalTransfers':
      case 'reorderTransfers':
      case 'replenishTransfers':
        return (
          <th key={`tot-s-${columnId}`} className={`min-w-[200px] ${splitTotalsSubThRight}`} aria-label={`${columnId} totals secondary`}>
            <div className="flex min-h-0 w-full flex-col justify-start">
              <div className={assortmentTotalsSecondaryClass}>0 trips</div>
            </div>
          </th>
        );
      case 'sales':
        return (
          <th key={`tot-s-${columnId}`} className={`min-w-[128px] ${splitTotalsSubThRight}`}>
            <div className="flex min-h-0 w-full flex-col justify-start">{totalsSubLinePlaceholder}</div>
          </th>
        );
      case 'scheduleStart':
        return (
          <th key={`tot-s-${columnId}`} className={`min-w-[240px] ${splitTotalsSubThRight}`} aria-label="Recommended transfers totals secondary">
            <div className="flex min-h-0 w-full flex-col justify-start">
              <div className={assortmentTotalsSecondaryClass}>{columnTotals.recommendedTransfersSecondary.toLocaleString()}</div>
            </div>
          </th>
        );
      case 'targetCoverage':
        return (
          <th key={`tot-s-${columnId}`} className={`min-w-[128px] ${splitTotalsSubThRight}`}>
            <div className="flex min-h-0 w-full flex-col justify-start">{totalsSubLinePlaceholder}</div>
          </th>
        );
      case 'gripLocations':
        return (
          <th key={`tot-s-${columnId}`} className={`min-w-[120px] ${splitTotalsSubThRight}`}>
            <div className="flex min-h-0 w-full flex-col justify-start">{totalsSubLinePlaceholder}</div>
          </th>
        );
      case 'drillMinQty':
      case 'drillInventory':
      case 'drillTarget':
      case 'drillForecast':
      case 'drillSkuLocs':
        return (
          <th key={`tot-s-${columnId}`} className={columnId === 'drillSkuLocs' ? `min-w-[108px] ${splitTotalsSubThLeft}` : splitTotalsSubThLeft} aria-hidden />
        );
      default:
        return null;
    }
  };

  /** Renders one `<th>` of the totals row for a given grip column. Mirrors body cell layout/alignment. */
  const renderGripColumnTotalsCell = (columnId: GripColumnId): ReactNode => {
    switch (columnId) {
      case 'transfers':
        return (
          <th key={columnId} className={totalsThClassRight} aria-label="Transfers totals">
            <div className="flex min-w-0 flex-col items-end gap-1">
              <div className={assortmentTotalsPrimaryClass}>{columnTotals.transfersL7d.toLocaleString()} units</div>
              <div className={assortmentTotalsSecondaryClass}>{columnTotals.transfersL30d.toLocaleString()} trips</div>
            </div>
          </th>
        );
      case 'rebalTransfers':
      case 'reorderTransfers':
      case 'replenishTransfers':
        return (
          <th key={columnId} className={totalsThClassRight} aria-label={`${columnId} totals`}>
            <div className="flex min-w-0 flex-col items-end gap-1">
              <div className={assortmentTotalsPrimaryClass}>0 units</div>
              <div className={assortmentTotalsSecondaryClass}>0 trips</div>
            </div>
          </th>
        );
      case 'sales':
        return (
          <th key={columnId} className={totalsThClassRight} aria-label="Revenue increase total">
            <div className={assortmentTotalsPrimaryClass}>{formatRevenueIncreaseEurK(columnTotals.revenueIncreaseEur)}</div>
          </th>
        );
      case 'scheduleStart':
        return (
          <th key={columnId} className={totalsThClassRight} aria-label="Recommended transfers totals">
            <div className="flex min-w-0 flex-col items-end gap-1">
              <div className={assortmentTotalsPrimaryClass}>{columnTotals.recommendedTransfersPrimary.toLocaleString()}</div>
              <div className={assortmentTotalsSecondaryClass}>{columnTotals.recommendedTransfersSecondary.toLocaleString()}</div>
            </div>
          </th>
        );
      case 'targetCoverage':
        return (
          <th key={columnId} className={totalsThClassRight} aria-label="Stockouts total">
            <div className={assortmentTotalsPrimaryClass}>
              {columnTotals.stockoutsFrom.toLocaleString()}
              <TransitionArrowSeparator />
              {columnTotals.stockoutsTo.toLocaleString()}
            </div>
          </th>
        );
      case 'gripLocations':
        return (
          <th key={columnId} className={totalsThClassRight} aria-label="Locations total">
            <div className={assortmentTotalsPrimaryClass}>
              {columnTotals.locationsFrom.toLocaleString()}
              <TransitionArrowSeparator />
              {columnTotals.locationsTo.toLocaleString()}
            </div>
          </th>
        );
      case 'drillMinQty':
      case 'drillInventory':
      case 'drillTarget':
      case 'drillForecast':
      case 'drillSkuLocs':
        return (
          <th key={columnId} className={totalsThClassLeft} aria-hidden />
        );
      default:
        return null;
    }
  };

  const renderGripColumnBodyCell = (
    columnId: GripColumnId,
    row: AssortmentRow,
    _rowIndex: number,
    drillM: {
      skuLocations: number;
      minQty: number;
      inventory: number;
      targetCoverageWk: number;
      forecastSalesPerWk: number;
    } | null
  ): ReactNode => {
    switch (columnId) {
      case 'sales':
        return (
          <td key={columnId} className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle ${tableRowHoverTd}`}>
            <div className={`${tableCellNumeric} tabular-nums`}>{formatRevenueIncreaseEurK(row.revenueIncreaseEur)}</div>
          </td>
        );
      case 'transfers':
        return (
          <td key={columnId} className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle ${tableRowHoverTd}`}>
            <div className="flex min-w-0 flex-col items-end gap-1">
              <div className={`${tableCellNumeric} tabular-nums`}>
                {row.transfers.l7d.toLocaleString()} units
              </div>
              <div className={`${tableCellSecondary} tabular-nums`}>
                {row.transfers.l30d.toLocaleString()} trips
              </div>
            </div>
          </td>
        );
      case 'rebalTransfers':
      case 'reorderTransfers':
      case 'replenishTransfers':
        return (
          <td key={columnId} className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle ${tableRowHoverTd}`}>
            <div className="flex min-w-0 flex-col items-end gap-1">
              <div className={`${tableCellNumeric} tabular-nums`}>
                0 units
              </div>
              <div className={`${tableCellSecondary} tabular-nums`}>
                0 trips
              </div>
            </div>
          </td>
        );
      case 'scheduleStart':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle ${tableRowHoverTd}`}
          >
            <div className="flex min-w-0 flex-col items-end gap-1">
              <div className={`${tableCellNumeric} tabular-nums`}>
                {row.recommendedTransfers.primary.toLocaleString()}
              </div>
              <div className={`${tableCellSecondary} tabular-nums`}>
                {row.recommendedTransfers.secondary.toLocaleString()}
              </div>
            </div>
          </td>
        );
      case 'targetCoverage':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {row.stockouts.from.toLocaleString()}
            <TransitionArrowSeparator />
            {row.stockouts.to.toLocaleString()}
          </td>
        );
      case 'gripLocations':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {row.locationsTransition.from.toLocaleString()}
            <TransitionArrowSeparator />
            {row.locationsTransition.to.toLocaleString()}
          </td>
        );
      case 'drillMinQty':
        return (
          <td key={columnId} className={`h-[86px] min-h-[86px] px-3 py-3 align-middle ${tableCellNumeric} ${tableRowHoverTd}`}>
            {drillM?.minQty ?? '—'}
          </td>
        );
      case 'drillInventory':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] px-3 py-3 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {drillM?.inventory ?? '—'}
          </td>
        );
      case 'drillTarget':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] px-3 py-3 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {drillM != null ? formatCoverageWeeks(drillM.targetCoverageWk) : '—'}
          </td>
        );
      case 'drillForecast':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] px-3 py-3 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {drillM != null ? `${drillM.forecastSalesPerWk.toLocaleString()} per week` : '—'}
          </td>
        );
      case 'drillSkuLocs':
        return (
          <td key={columnId} className={`h-[86px] min-h-[86px] px-3 py-3 align-middle ${tableCellNumeric} ${tableRowHoverTd}`}>
            {drillM?.skuLocations ?? '—'}
          </td>
        );
      default:
        return null;
    }
  };

  /** Empty grip cells on aggregation-controls tbody row — widths match header grip columns. */
  const renderGripColumnAggregationToolbarPad = (columnId: GripColumnId): ReactNode => {
    const shell = `box-border bg-white py-2 align-middle ${tableRowHoverTd}`;
    switch (columnId) {
      case 'sales':
        return <td key={`agg-toolbar-${columnId}`} className={`min-w-[128px] px-4 ${shell}`} aria-hidden />;
      case 'transfers':
      case 'rebalTransfers':
      case 'reorderTransfers':
      case 'replenishTransfers':
        return <td key={`agg-toolbar-${columnId}`} className={`min-w-[200px] px-4 ${shell}`} aria-hidden />;
      case 'scheduleStart':
        return <td key={`agg-toolbar-${columnId}`} className={`min-w-[240px] px-4 ${shell}`} aria-hidden />;
      case 'targetCoverage':
        return <td key={`agg-toolbar-${columnId}`} className={`min-w-[128px] px-4 ${shell}`} aria-hidden />;
      case 'gripLocations':
        return <td key={`agg-toolbar-${columnId}`} className={`min-w-[120px] px-4 ${shell}`} aria-hidden />;
      case 'drillMinQty':
      case 'drillInventory':
      case 'drillTarget':
      case 'drillForecast':
        return <td key={`agg-toolbar-${columnId}`} className={`px-3 ${shell}`} aria-hidden />;
      case 'drillSkuLocs':
        return <td key={`agg-toolbar-${columnId}`} className={`min-w-[108px] px-3 ${shell}`} aria-hidden />;
      default:
        return null;
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden bg-white border-[0.5px] border-solid border-[#E3E8F0]"
      data-name="Table container"
      data-node-id="14764:268974"
    >
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse ${tableMinWidthClass}`}>
          <thead
            className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:font-['Inter',sans-serif]"
          >
            <tr
              className={`font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828] [&_th]:whitespace-nowrap${
                (useMergedProductHeaderCell || useSplitProductHeader) && showTotalsRow
                  ? ` ${useSplitProductHeader ? 'h-[48px]' : 'h-[60px]'} [&_th]:!pb-0 ${
                      useSplitProductHeader
                        ? '[&>th:not([rowspan="3"])]:!border-b-0'
                        : '[&>th:not([rowspan="2"])]:!border-b-0'
                    }`
                  : showTotalsRow
                    ? ' h-[48px] [&_th]:!h-[48px] [&_th]:!min-h-[48px] [&_th]:!max-h-[48px] [&_th]:!pb-0 [&_th]:!border-b-0'
                    : ' h-[62px]'
              }`}
            >
              <th
                rowSpan={useSplitProductHeader ? 3 : useMergedProductHeaderCell ? 2 : 1}
                className={`sticky left-0 z-30 ${
                  useSplitProductHeader
                    ? splitHeaderCheckboxSpanDims
                    : useMergedProductHeaderCell
                      ? 'h-[100px] min-h-[100px] max-h-[100px]'
                      : productDetailsHeaderSlot
                        ? 'h-[60px] min-h-[60px] max-h-[60px]'
                        : totalsOnlyTitleRow
                          ? 'h-[48px] min-h-[48px] max-h-[48px]'
                          : 'h-[62px] min-h-[62px] max-h-[62px]'
                } w-14 min-w-14 max-w-14 box-border ${theadCellBg} px-4 ${useSplitProductHeader ? 'py-0' : theadHeaderCellPy} text-left ${useSplitProductHeader ? 'align-top' : 'align-middle'} ${useSplitProductHeader ? '!border-b-0' : ''} shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                scope="col"
                aria-label="Selection"
              >
                {useSplitProductHeader || useMergedProductHeaderCell ? (
                  showTotalsRow ? (
                    <div className="flex h-full min-h-0 flex-col">
                      <div
                        className={`flex shrink-0 ${useSplitProductHeader ? 'h-[48px] items-center justify-center px-0 pt-[10px] pb-0' : 'h-[60px] items-center px-0 py-[10px]'}`}
                      >
                        <input
                          type="checkbox"
                          checked={rows.length > 0 && rows.every((r) => r.selected)}
                          onChange={(e) => _onSelectAll(e.target.checked)}
                          className="w-4 h-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                          aria-label="Select all rows"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center">
                      <input
                        type="checkbox"
                        checked={rows.length > 0 && rows.every((r) => r.selected)}
                        onChange={(e) => _onSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                        aria-label="Select all rows"
                      />
                    </div>
                  )
                ) : productDetailsHeaderSlot ? (
                  <div className="flex h-full items-center">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && rows.every((r) => r.selected)}
                      onChange={(e) => _onSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                      aria-label="Select all rows"
                    />
                  </div>
                ) : null}
              </th>
              {showProductDetails && useSplitProductHeader && productDetailsSplitHeaderSlots ? (
                <th
                  className={`sticky left-14 z-20 ${splitHeaderTitleRowDims} ${stickyProductColWidthClass} box-border ${theadCellBg} px-4 ${gripHeaderCellPy} text-left align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                  scope="col"
                >
                  <div className="flex h-full min-h-0 w-full flex-col justify-start">
                    {productDetailsSplitHeaderSlots.titlesRow}
                  </div>
                </th>
              ) : null}
              {showProductDetails && !useSplitProductHeader ? (
                <th
                  rowSpan={useMergedProductHeaderCell ? 2 : 1}
                  className={`sticky left-14 z-20 ${
                    useMergedProductHeaderCell
                      ? 'h-[100px] min-h-[100px] max-h-[100px] w-[560px] min-w-[560px] max-w-[560px]'
                      : productDetailsHeaderSlot
                        ? 'h-[60px] min-h-[60px] max-h-[60px] w-[560px] min-w-[560px] max-w-[560px]'
                        : totalsOnlyTitleRow
                          ? 'h-[48px] min-h-[48px] max-h-[48px] w-[280px] min-w-[280px] max-w-[280px]'
                          : 'h-[62px] min-h-[62px] max-h-[62px] w-[280px] min-w-[280px] max-w-[280px]'
                  } box-border ${theadCellBg} px-4 ${theadHeaderCellPy} text-left align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                  scope="col"
                >
                  {productDetailsHeaderSlot ? (
                    showTotalsRow ? (
                      <div className="flex h-full min-h-0 flex-col">{productDetailsHeaderSlot}</div>
                    ) : (
                      <div className="flex h-full min-h-0 items-center">
                        {productDetailsHeaderSlot}
                      </div>
                    )
                  ) : (
                    <div className="flex h-full min-h-0 flex-col justify-start gap-2">
                      <span>Product details</span>
                    </div>
                  )}
                </th>
              ) : null}
              {!designOnly &&
                filteredGripColumnOrder.map((columnId) => renderGripColumnHeader(columnId))}
              </tr>
            {showTotalsRow &&
              (useSplitProductHeader && productDetailsSplitHeaderSlots && showProductDetails ? (
                <>
                  <tr
                    className="font-['Inter',sans-serif] [&_th]:whitespace-nowrap [&_th]:!border-b-0"
                    aria-label="Column totals primary"
                  >
                    {showProductDetails ? (
                      <th
                        className={`sticky left-14 z-20 ${splitTotalsPrimaryRowDims} ${stickyProductColWidthClass} box-border ${theadCellBg} px-4 py-0 text-left align-bottom shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                        scope="col"
                      >
                        <div className="flex min-h-0 w-full flex-col justify-end">
                          {productDetailsSplitHeaderSlots.totalsRow}
                        </div>
                      </th>
                    ) : null}
                    {!designOnly &&
                      filteredGripColumnOrder.map((columnId) =>
                        renderGripColumnTotalsPrimarySplit(columnId)
                      )}
                  </tr>
                  <tr
                    className="font-['Inter',sans-serif] [&_th]:whitespace-nowrap [&_th]:!border-b-0"
                    aria-label="Column totals secondary"
                  >
                    {showProductDetails ? (
                      <th
                        className={`sticky left-14 z-20 ${splitTotalsSubRowDims} ${stickyProductColWidthClass} box-border ${theadCellBg} px-4 py-0 text-left align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${totalsRowNoBottomBorder}`}
                        scope="col"
                        aria-hidden
                      >
                        <div className="flex min-h-0 w-full flex-col justify-start">{totalsSubLinePlaceholder}</div>
                      </th>
                    ) : null}
                    {!designOnly &&
                      filteredGripColumnOrder.map((columnId) =>
                        renderGripColumnTotalsSubSplit(columnId)
                      )}
                  </tr>
                </>
              ) : (
                <tr
                  className="h-[40px] font-['Inter',sans-serif] [&_th]:whitespace-nowrap"
                  aria-label="Column totals"
                >
                  {!useMergedProductHeaderCell && !useSplitProductHeader && (
                    <>
                      <th
                        className={`sticky left-0 z-30 h-[40px] min-h-[40px] max-h-[40px] w-14 min-w-14 max-w-14 box-border ${theadCellBg} px-4 py-0 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                        aria-hidden
                      />
                      {showProductDetails && (
                        <th
                          className={`sticky left-14 z-20 h-[40px] min-h-[40px] max-h-[40px] w-[280px] min-w-[280px] max-w-[280px] box-border ${theadCellBg} px-4 py-0 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                          aria-hidden
                        />
                      )}
                    </>
                  )}
                  {!designOnly &&
                    filteredGripColumnOrder.map((columnId) => renderGripColumnTotalsCell(columnId))}
                </tr>
              ))}
          </thead>
          <tbody className="[&_td]:border-t-0 [&_td]:border-b-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]">
            {showTotalsRow &&
            useSplitProductHeader &&
            productDetailsSplitHeaderSlots?.controlsRow &&
            showProductDetails ? (
              <tr
                key="__aggregation_controls__"
                className="bg-white [&_td]:!border-t-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]"
                aria-label="Aggregation controls"
              >
                <td
                  className={`sticky left-0 z-30 w-14 min-w-14 max-w-14 box-border bg-white px-4 py-2 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
                  aria-hidden
                />
                <td
                  className={`sticky left-14 z-20 ${stickyProductColWidthClass} box-border bg-white px-4 py-2 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
                >
                  {productDetailsSplitHeaderSlots.controlsRow}
                </td>
                {!designOnly &&
                  filteredGripColumnOrder.map((columnId) =>
                    renderGripColumnAggregationToolbarPad(columnId)
                  )}
              </tr>
            ) : null}
            {rows.map((row, rowIndex) => {
              const drillM = productDrillDownActive
                ? row.productDrillMetrics ?? {
                    skuLocations: row.productGroup.productCount * row.locationCluster.locationCount,
                    minQty: row.mq,
                    inventory: row.storeOh,
                    targetCoverageWk: 5,
                    forecastSalesPerWk: Math.max(0, Math.round(row.forecast.value / 4)),
                  }
                : null;
              const detail = row.productCellDetail;
              return (
              <tr
                key={row.id}
                className={`bg-white ${onRowClick ? 'cursor-pointer' : ''}`}
                data-name="table-cell"
                onClick={(e) => {
                  if (!onRowClick) return;
                  const el = e.target as HTMLElement;
                  if (el.closest('button') || el.closest('input') || el.closest('label')) return;
                  onRowClick(row);
                }}
              >
                <td
                  className={`sticky left-0 z-30 h-[86px] min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white py-3 px-4 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!row.selected}
                      onChange={(e) => onSelectRow(row.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                    />
                  </div>
                </td>
                {showProductDetails && (
                  <td
                    className={`sticky left-14 z-20 min-h-[86px] ${stickyProductColWidthClass} box-border bg-white py-3 px-4 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
                  >
                    {productDetailsAggregated ? (
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className="flex min-w-0 shrink-0 gap-2"
                          style={{ width: ALL_TAB_AGG_SUB_COL_WIDTHS.product }}
                        >
                          <div
                            className="relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded bg-[#f5f5f5]"
                            data-name="Product image"
                          >
                            <img
                              src={detail.imageSrc}
                              alt={detail.title}
                              className="pointer-events-none absolute inset-0 size-full max-w-none object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`min-w-0 truncate ${tableCellPrimary}`}>{detail.title}</div>
                            <div className="mt-0.5 flex min-w-0 items-center gap-1">
                              <span className={`min-w-0 truncate ${tableCellSecondary}`}>{detail.sku}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void navigator.clipboard?.writeText(detail.sku);
                                }}
                                className="inline-flex shrink-0 rounded p-0.5 text-[#6A7282] transition-colors hover:bg-slate-100 hover:text-sky-600"
                                aria-label="Copy SKU"
                              >
                                <Copy size={14} strokeWidth={2} aria-hidden />
                              </button>
                              <ProductDetailsPopover detail={detail} />
                            </div>
                            <div className={`mt-0.5 truncate ${tableCellSecondary}`}>{detail.colorLabel}</div>
                          </div>
                        </div>
                        <div
                          className="flex min-w-0 shrink-0 flex-col"
                          style={{ width: ALL_TAB_AGG_SUB_COL_WIDTHS.locationGroup }}
                        >
                          <div className={`min-w-0 truncate ${tableCellPrimary}`}>
                            {row.locationCluster.name}
                          </div>
                          <div className={`mt-0.5 truncate ${tableCellSecondary}`}>
                            {row.locationCluster.locationCount.toLocaleString()}{' '}
                            {row.locationCluster.locationCount === 1 ? 'location' : 'locations'}
                          </div>
                        </div>
                        {(() => {
                          const toLoc =
                            AGGREGATED_DUMMY_TO_LOCATIONS[
                              rowIndex % AGGREGATED_DUMMY_TO_LOCATIONS.length
                            ];
                          return (
                            <div
                              className="flex min-w-0 shrink-0 flex-col"
                              style={{ width: ALL_TAB_AGG_SUB_COL_WIDTHS.locationsTo }}
                            >
                              <div className={`min-w-0 truncate ${tableCellPrimary}`}>
                                {toLoc.name}
                              </div>
                              <div className={`mt-0.5 truncate ${tableCellSecondary}`}>
                                {toLoc.count.toLocaleString()}{' '}
                                {toLoc.count === 1 ? 'location' : 'locations'}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="flex min-w-0 gap-3">
                        <div
                          className="relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded bg-[#f5f5f5]"
                          data-name="Product image"
                          data-node-id="12371:53131"
                        >
                          <img
                            src={detail.imageSrc}
                            alt={detail.title}
                            className="pointer-events-none absolute inset-0 size-full max-w-none object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`min-w-0 ${tableCellPrimary}`}>{detail.title}</div>
                          <div className="mt-0.5 flex min-w-0 items-center gap-1">
                            <span className={`min-w-0 truncate ${tableCellSecondary}`}>{detail.sku}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void navigator.clipboard?.writeText(detail.sku);
                              }}
                              className="inline-flex shrink-0 rounded p-0.5 text-[#6A7282] transition-colors hover:bg-slate-100 hover:text-sky-600"
                              aria-label="Copy SKU"
                            >
                              <Copy size={14} strokeWidth={2} aria-hidden />
                            </button>
                            <ProductDetailsPopover detail={detail} />
                          </div>
                          <div className={`mt-0.5 ${tableCellSecondary}`}>{detail.colorLabel}</div>
                          {row.showKpiBadge && !hideKpiBadges ? (
                            <div className="pointer-events-auto mt-1">
                              <AssortmentCellKpiTrigger align="start" {...kpiPopoverProduct(row)} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </td>
                )}
                {!designOnly &&
                  filteredGripColumnOrder.map((columnId) =>
                    renderGripColumnBodyCell(columnId, row, rowIndex, drillM)
                  )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4 bg-white px-4 py-2 text-xs text-[#00050a]">
        <span>{rows.length} rows</span>
        <div className="flex items-center gap-1">
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-40" aria-label="Previous page" disabled>
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[4rem] text-center">1 of 1</span>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-40" aria-label="Next page" disabled>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
