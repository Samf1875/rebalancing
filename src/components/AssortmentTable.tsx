import { useState, useEffect, useCallback, type DragEvent, type ReactNode } from 'react';
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

/** Body cell primary label (titles, names) — Inter 14px semibold #101828 */
const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";

/** Body numeric cells — Inter 14px medium #101828 */
const tableCellNumeric =
  "font-['Inter',sans-serif] text-[14px] font-medium leading-normal text-[#101828]";

/** Body cell secondary / supporting text — Inter 12px regular #6A7282 */
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";

/** Grip in thead — same box height as header label (`text-[14px]` + `leading-normal`). */
const tableHeaderGripIcon =
  "h-[1lh] w-[1lh] shrink-0 text-[#6A7282]";

/** Row cells stay white (no hover fill). */
const tableRowHoverTd = '';

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

/** KPI hover for Sales (L7D / L30D) column. */
function kpiPopoverSales(row: AssortmentRow): AssortmentCellKpiContent {
  const { l7d, l30d } = row.sales;
  const wkFrom30 = l30d / 4;
  const paceVs30 =
    wkFrom30 > 0 ? Math.round(((l7d - wkFrom30) / wkFrom30) * 100) : 0;
  return {
    column: 'sales',
    title: 'Sales',
    rangeText: `${l7d.toLocaleString()} L7D`,
    deltaText: `${l30d.toLocaleString()} L30D`,
    summary: (
      <>
        Last 7 days vs last 30 days for this line. L7D is{' '}
        <span className={`font-semibold ${paceVs30 >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {paceVs30 >= 0 ? '+' : ''}
          {paceVs30}%
        </span>{' '}
        vs a straight weekly slice of L30D.
      </>
    ),
    drivers: [
      { tone: 'positive', text: `L30D total ${l30d.toLocaleString()} units` },
      {
        tone: 'warning',
        text: `Forecast ${row.forecastPerWeek.toFixed(2)} / wk vs L7D run rate`,
      },
      {
        tone: 'negative',
        text: `Target ${row.targetCoverageWeeks} wk cover vs current OH`,
      },
    ],
    footerHighlight: formatRevenueIncreaseEurK(row.revenueIncreaseEur),
    footerRest: ' planned revenue uplift tied to this line',
  };
}

/** KPI hover for Forecast per week column. */
function kpiPopoverForecast(row: AssortmentRow): AssortmentCellKpiContent {
  const fw = row.forecastPerWeek.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return {
    column: 'forecast',
    title: 'Weekly forecast',
    rangeText: `${fw} / wk`,
    deltaText: `${row.targetCoverageWeeks} wk cover`,
    summary: (
      <>
        Modelled demand for <span className="font-semibold text-[#101828]">{row.productCellDetail.title}</span>,
        consistent with <span className="font-semibold text-[#101828]">{row.targetCoverageWeeks} week</span> target
        coverage and assortment IA.
      </>
    ),
    drivers: [
      { tone: 'warning', text: `Store OH ${row.storeOh.toLocaleString()} units` },
      { tone: 'positive', text: `L7D sales ${row.sales.l7d.toLocaleString()} units` },
      {
        tone: 'positive',
        text: `WH ${row.whStock.value.toLocaleString()} units (${row.whStockPctForIa.toFixed(1)}% for IA)`,
      },
    ],
    footerHighlight: `${row.recommendedTransfers.primary.toLocaleString()}`,
    footerRest: ' transfers suggested to align inventory with forecast',
  };
}

const theadCellBg = 'bg-white';

/** Columns with grip handles — reorderable (IA after post–Stockouts block). */
const BASE_GRIP_COLUMN_IDS = [
  'transfers',
  'sales',
  'scheduleStart',
  'scheduleEnd',
  'forecastPerWeek',
  'targetCoverage',
  'gripLocations',
  'gripOverstocks',
  'gripUnderstocks',
  'gripDepth',
  'gripWarehouseUnits',
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
  scheduleEnd: 'sales',
  forecastPerWeek: 'forecastPerWk',
  scheduleStart: 'recommendedTransfers',
  sales: 'revenueIncrease',
  targetCoverage: 'stockouts',
  gripLocations: 'locations',
  gripOverstocks: 'overstocks',
  gripUnderstocks: 'understocks',
  gripDepth: 'depth',
  gripWarehouseUnits: 'warehouseUnits',
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
}: AssortmentTableProps) {
  const mergedColumnVisibility = {
    ...defaultTableColumnVisibility(),
    ...columnVisibilityProp,
  };

  const showProductDetails = mergedColumnVisibility.productDetails;

  /** Extra columns once any row has generated recommendations (data set on generate). */
  const showRecommendationColumns = rows.some(
    (r) =>
      r.sumIaRecommendation != null || r.assortmentRecommendationLabel != null
  );

  const [gripColumnOrder, setGripColumnOrder] = useState<GripColumnId[]>(() => [
    ...BASE_GRIP_COLUMN_IDS,
  ]);

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
          <th key={columnId} className={`min-w-[128px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
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
          <th key={columnId} className={`min-w-[200px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
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
      case 'scheduleStart':
        return (
          <th key={columnId} className={`min-w-[240px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
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
      case 'scheduleEnd':
        return (
          <th key={columnId} className={`min-w-[168px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
              <span className="inline-flex w-full items-center justify-end gap-2">
                {gripDragHandle(columnId, 'Sales')}
                <AutoneHeaderInfoTooltip
                  label="Sales (L7D / L30D)"
                  content={ASSORTMENT_HEADER_RICH.salesL7dL30d.body}
                  hoverWith={<span>Sales</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'forecastPerWeek':
        return (
          <th key={columnId} className={`min-w-[128px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Forecast per wk.')}
                <AutoneHeaderInfoTooltip
                  label="Forecast per week"
                  content={HEADER_INFO_TOOLTIPS.forecastPerWk}
                  hoverWith={<span>Forecast per wk.</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'targetCoverage':
        return (
          <th key={columnId} className={`min-w-[128px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
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
          <th key={columnId} className={`min-w-[120px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
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
      case 'gripOverstocks':
        return (
          <th key={columnId} className={`min-w-[120px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Overstocks')}
                <AutoneHeaderInfoTooltip
                  label="Overstocks"
                  content={HEADER_INFO_TOOLTIPS.overstocks}
                  hoverWith={<span>Overstocks</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripUnderstocks':
        return (
          <th key={columnId} className={`min-w-[120px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Understocks')}
                <AutoneHeaderInfoTooltip
                  label="Understocks"
                  content={HEADER_INFO_TOOLTIPS.understocks}
                  hoverWith={<span>Understocks</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripDepth':
        return (
          <th key={columnId} className={`min-w-[100px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Depth')}
                <AutoneHeaderInfoTooltip
                  label="Depth"
                  content={HEADER_INFO_TOOLTIPS.depth}
                  hoverWith={<span>Depth</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripWarehouseUnits':
        return (
          <th key={columnId} className={`min-w-[128px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center">
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Warehouse units in scope')}
                <AutoneHeaderInfoTooltip
                  label="Warehouse units in scope"
                  side="left"
                  content={HEADER_INFO_TOOLTIPS.warehouseUnits}
                  hoverWith={<span>Warehouse units in scope</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'drillMinQty':
        return (
          <th key={columnId} className={`h-[62px] min-h-[62px] max-h-[62px] box-border px-3 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col justify-center gap-2">
              <span className="inline-flex items-center gap-1.5">
                {gripDragHandle(columnId, 'Min Qty')}
                Min Qty
              </span>
            </div>
          </th>
        );
      case 'drillInventory':
        return (
          <th key={columnId} className={`h-[62px] min-h-[62px] max-h-[62px] box-border px-3 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center gap-2">
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Inventory (drill)')}
                Inventory
              </span>
            </div>
          </th>
        );
      case 'drillTarget':
        return (
          <th key={columnId} className={`h-[62px] min-h-[62px] max-h-[62px] box-border px-3 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center gap-2">
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Target coverage (drill)')}
                <span>Target coverage</span>
              </span>
            </div>
          </th>
        );
      case 'drillForecast':
        return (
          <th key={columnId} className={`h-[62px] min-h-[62px] max-h-[62px] box-border px-3 py-0 text-right align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-end justify-center gap-2">
              <span className="inline-flex w-full items-center justify-end gap-1.5">
                {gripDragHandle(columnId, 'Forecast sales per week')}
                <span>Forecast per week</span>
              </span>
            </div>
          </th>
        );
      case 'drillSkuLocs':
        return (
          <th key={columnId} className={`min-w-[108px] h-[62px] min-h-[62px] max-h-[62px] box-border px-3 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col justify-center gap-2">
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

  const recommendedTransferActionBtn =
    'rounded border border-[#E3E8F0] bg-white px-2 py-1 font-[\'Inter\',sans-serif] text-[11px] font-semibold leading-none text-[#0267FF] transition-colors hover:bg-slate-50';

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
                {row.transfers.l7d.toLocaleString()} L7D
              </div>
              <div className={`${tableCellSecondary} tabular-nums`}>
                {row.transfers.l30d.toLocaleString()} L30D
              </div>
            </div>
          </td>
        );
      case 'scheduleStart':
        return (
          <td
            key={columnId}
            className={`min-h-[86px] min-w-[240px] py-3 px-4 text-right align-middle ${tableRowHoverTd}`}
          >
            <div className="flex min-w-0 flex-col items-end gap-2 text-right">
              <div className={`${tableCellNumeric} tabular-nums`}>
                {row.recommendedTransfers.primary.toLocaleString()}
              </div>
              <div className={`${tableCellSecondary} tabular-nums`}>
                {row.recommendedTransfers.secondary.toLocaleString()}
              </div>
              <div className="flex shrink-0 items-center justify-end gap-1">
                <button
                  type="button"
                  className={recommendedTransferActionBtn}
                  aria-label="Visible"
                  onClick={(e) => e.stopPropagation()}
                >
                  VIS
                </button>
                <button
                  type="button"
                  className={recommendedTransferActionBtn}
                  aria-label="Review"
                  onClick={(e) => e.stopPropagation()}
                >
                  REV
                </button>
              </div>
            </div>
          </td>
        );
      case 'scheduleEnd': {
        const { l7d, l30d, showPeriodLabels } = row.sales;
        return (
          <td
            key={columnId}
            className={`min-h-[86px] py-3 px-4 text-right align-middle ${tableRowHoverTd}`}
          >
            <div className="flex min-w-0 flex-col items-end gap-1">
              <div className={`${tableCellNumeric} tabular-nums`}>
                {l7d.toLocaleString()}
                {showPeriodLabels ? ' L7D' : ''}
              </div>
              <div className={`${tableCellSecondary} tabular-nums`}>
                {l30d.toLocaleString()}
                {showPeriodLabels ? ' L30D' : ''}
              </div>
              {row.showKpiBadge ? (
                <div className="pointer-events-auto mt-1">
                  <AssortmentCellKpiTrigger align="end" {...kpiPopoverSales(row)} />
                </div>
              ) : null}
            </div>
          </td>
        );
      }
      case 'forecastPerWeek':
        return (
          <td
            key={columnId}
            className={`min-h-[86px] py-3 px-4 text-right align-middle ${tableRowHoverTd}`}
          >
            <div className="flex min-w-0 flex-col items-end">
              <span className={`${tableCellNumeric} tabular-nums`}>
                {row.forecastPerWeek.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {row.showKpiBadge ? (
                <div className="pointer-events-auto mt-1">
                  <AssortmentCellKpiTrigger align="end" {...kpiPopoverForecast(row)} />
                </div>
              ) : null}
            </div>
          </td>
        );
      case 'targetCoverage':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {row.stockouts.from.toLocaleString()} → {row.stockouts.to.toLocaleString()}
          </td>
        );
      case 'gripLocations':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {row.locationsTransition.from.toLocaleString()} → {row.locationsTransition.to.toLocaleString()}
          </td>
        );
      case 'gripOverstocks':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {row.overstocksTransition.from.toLocaleString()} → {row.overstocksTransition.to.toLocaleString()}
          </td>
        );
      case 'gripUnderstocks':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {row.understocksTransition.from.toLocaleString()} → {row.understocksTransition.to.toLocaleString()}
          </td>
        );
      case 'gripDepth':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {row.depthTransition.from.toFixed(1)} → {row.depthTransition.to.toFixed(1)}
          </td>
        );
      case 'gripWarehouseUnits':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellNumeric} ${tableRowHoverTd}`}
          >
            {row.warehouseUnitsTransition.from.toLocaleString()} →{' '}
            {row.warehouseUnitsTransition.to.toLocaleString()}
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

  return (
    <div
      className="rounded-lg overflow-hidden bg-white border-[0.5px] border-solid border-[#E3E8F0]"
      data-name="Table container"
      data-node-id="14764:268974"
    >
      <div className="overflow-x-auto">
        <table
          className={`w-full border-collapse ${
            productDrillDownActive
              ? showRecommendationColumns
                ? 'min-w-[2470px]'
                : 'min-w-[2240px]'
              : showRecommendationColumns
                ? 'min-w-[1970px]'
                : 'min-w-[1760px]'
          }`}
        >
          <thead
            className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:font-['Inter',sans-serif]"
          >
            <tr className="h-[62px] font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828] [&_th]:whitespace-nowrap">
              <th
                className={`sticky left-0 z-30 h-[62px] min-h-[62px] max-h-[62px] w-14 min-w-14 max-w-14 box-border ${theadCellBg} px-4 py-0 text-left align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                scope="col"
                aria-label="Selection"
              />
              {showProductDetails && (
                <th
                  className={`sticky left-14 z-20 h-[62px] min-h-[62px] max-h-[62px] w-[280px] min-w-[280px] max-w-[280px] box-border ${theadCellBg} px-4 py-0 text-left align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                  scope="col"
                >
                  <div className="flex h-full min-h-0 flex-col justify-center gap-2">
                    <span>Product details</span>
                  </div>
                </th>
              )}
              {!designOnly &&
                filteredGripColumnOrder.map((columnId) => renderGripColumnHeader(columnId))}
              </tr>
          </thead>
          <tbody className="[&_td]:border-t-0 [&_td]:border-b-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]">
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
                    className={`sticky left-14 z-20 min-h-[86px] w-[280px] min-w-[280px] max-w-[280px] box-border bg-white py-3 px-4 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
                  >
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
                        {row.showKpiBadge ? (
                          <div className="pointer-events-auto mt-1">
                            <AssortmentCellKpiTrigger align="start" {...kpiPopoverProduct(row)} />
                          </div>
                        ) : null}
                      </div>
                    </div>
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
