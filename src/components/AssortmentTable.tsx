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

/** Body cell primary label — Inter 14px semibold #101828 */
const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";

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
  onSelectAll,
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
  const allSelected = rows.length > 0 && rows.every((r) => r.selected);

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

  const columnHeaderAggregates = useMemo(() => {
    if (rows.length === 0) return null;
    let transfersL7d = 0;
    let transfersL30d = 0;
    let revenue = 0;
    let recP = 0;
    let salesL7d = 0;
    let salesL30d = 0;
    let forecastSum = 0;
    let soFrom = 0;
    let soTo = 0;
    let locFrom = 0;
    let locTo = 0;
    let osFrom = 0;
    let osTo = 0;
    let usFrom = 0;
    let usTo = 0;
    let depthFrom = 0;
    let depthTo = 0;
    let whFrom = 0;
    let whTo = 0;
    for (const r of rows) {
      transfersL7d += r.transfers.l7d;
      transfersL30d += r.transfers.l30d;
      revenue += r.revenueIncreaseEur;
      recP += r.recommendedTransfers.primary;
      salesL7d += r.sales.l7d;
      salesL30d += r.sales.l30d;
      forecastSum += r.forecastPerWeek;
      soFrom += r.stockouts.from;
      soTo += r.stockouts.to;
      locFrom += r.locationsTransition.from;
      locTo += r.locationsTransition.to;
      osFrom += r.overstocksTransition.from;
      osTo += r.overstocksTransition.to;
      usFrom += r.understocksTransition.from;
      usTo += r.understocksTransition.to;
      depthFrom += r.depthTransition.from;
      depthTo += r.depthTransition.to;
      whFrom += r.warehouseUnitsTransition.from;
      whTo += r.warehouseUnitsTransition.to;
    }
    const n = rows.length;
    const trips = Math.max(1, Math.round(recP / 14));
    return {
      transfersL7d,
      transfersL30d,
      transfersTrips: trips,
      revenue,
      recP,
      recTrips: trips,
      salesL7d,
      salesL30d,
      forecastAvg: forecastSum / n,
      stockouts: { from: soFrom, to: soTo },
      locations: { from: locFrom, to: locTo },
      overstocks: { from: osFrom, to: osTo },
      understocks: { from: usFrom, to: usTo },
      depth: { from: depthFrom / n, to: depthTo / n },
      warehouse: { from: whFrom, to: whTo },
    };
  }, [rows]);

  const renderGripColumnHeader = (columnId: GripColumnId): ReactNode => {
    const d = gripThDropProps(columnId);
    const agg = columnHeaderAggregates;
    switch (columnId) {
      case 'sales':
        return (
          <th key={columnId} className={`min-w-[128px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col justify-center">
              <span className="inline-flex items-center gap-2">
                {gripDragHandle(columnId, 'Revenue increase')}
                <AutoneHeaderInfoTooltip
                  label="Revenue increase"
                  rich={ASSORTMENT_HEADER_RICH.revenueIncrease}
                  hoverWith={<span>Revenue increase</span>}
                />
                <ChevronDown size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
              </span>
            </div>
          </th>
        );
      case 'transfers':
        return (
          <th key={columnId} className={`min-w-[200px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col justify-center">
              <span className="inline-flex items-center gap-2">
                {gripDragHandle(columnId, 'Transfers')}
                <AutoneHeaderInfoTooltip
                  label="Transfers"
                  rich={{
                    ...ASSORTMENT_HEADER_RICH.transfers,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'transferTotals' as const,
                            unitsLine: `Total transfer units - ${agg.transfersL7d.toLocaleString()}`,
                            tripsLine: `Total trips - ${agg.transfersTrips}`,
                          },
                        }
                      : {}),
                  }}
                  hoverWith={<span>Transfers</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'scheduleStart':
        return (
          <th key={columnId} className={`min-w-[240px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col justify-center">
              <span className="inline-flex items-center gap-2">
                {gripDragHandle(columnId, 'Recommended transfers')}
                <AutoneHeaderInfoTooltip
                  label="Recommended transfers"
                  rich={{
                    ...ASSORTMENT_HEADER_RICH.recommendedTransfers,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'transferTotals' as const,
                            unitsLine: `Total transfer units - ${agg.recP.toLocaleString()}`,
                            tripsLine: `Total trips - ${agg.recTrips}`,
                          },
                        }
                      : {}),
                  }}
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
                  rich={{
                    ...ASSORTMENT_HEADER_RICH.salesL7dL30d,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'salesMetrics' as const,
                            l7d: `Sales ${agg.salesL7d.toLocaleString()}`,
                            l30d: `Sales ${agg.salesL30d.toLocaleString()}`,
                          },
                        }
                      : {}),
                  }}
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
                  rich={{
                    title: 'Forecast per wk.',
                    icon: 'info',
                    body: HEADER_INFO_TOOLTIPS.forecastPerWk,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `${agg.forecastAvg.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} per wk`,
                          },
                        }
                      : {}),
                  }}
                  hoverWith={<span>Forecast per wk.</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'targetCoverage':
        return (
          <th key={columnId} className={`min-w-[128px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-start justify-center">
              <span className="inline-flex items-center gap-2">
                {gripDragHandle(columnId, 'Stockouts')}
                <AutoneHeaderInfoTooltip
                  label="Stockouts"
                  rich={{
                    title: 'Stockouts',
                    icon: 'info',
                    body: HEADER_INFO_TOOLTIPS.stockouts,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `Stockouts ${agg.stockouts.from.toLocaleString()} → ${agg.stockouts.to.toLocaleString()}`,
                          },
                        }
                      : {}),
                  }}
                  hoverWith={<span>Stockouts</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripLocations':
        return (
          <th key={columnId} className={`min-w-[120px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-start justify-center">
              <span className="inline-flex items-center gap-2">
                {gripDragHandle(columnId, 'Locations')}
                <AutoneHeaderInfoTooltip
                  label="Locations"
                  rich={{
                    title: 'Locations',
                    icon: 'info',
                    body: HEADER_INFO_TOOLTIPS.locations,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `Locations ${agg.locations.from.toLocaleString()} → ${agg.locations.to.toLocaleString()}`,
                          },
                        }
                      : {}),
                  }}
                  hoverWith={<span>Locations</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripOverstocks':
        return (
          <th key={columnId} className={`min-w-[120px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-start justify-center">
              <span className="inline-flex items-center gap-1.5">
                {gripDragHandle(columnId, 'Overstocks')}
                <AutoneHeaderInfoTooltip
                  label="Overstocks"
                  rich={{
                    title: 'Overstocks',
                    icon: 'info',
                    body: HEADER_INFO_TOOLTIPS.overstocks,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `Overstocks ${agg.overstocks.from.toLocaleString()} → ${agg.overstocks.to.toLocaleString()}`,
                          },
                        }
                      : {}),
                  }}
                  hoverWith={<span>Overstocks</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripUnderstocks':
        return (
          <th key={columnId} className={`min-w-[120px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-start justify-center">
              <span className="inline-flex items-center gap-1.5">
                {gripDragHandle(columnId, 'Understocks')}
                <AutoneHeaderInfoTooltip
                  label="Understocks"
                  rich={{
                    title: 'Understocks',
                    icon: 'info',
                    body: HEADER_INFO_TOOLTIPS.understocks,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `Understocks ${agg.understocks.from.toLocaleString()} → ${agg.understocks.to.toLocaleString()}`,
                          },
                        }
                      : {}),
                  }}
                  hoverWith={<span>Understocks</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripDepth':
        return (
          <th key={columnId} className={`min-w-[100px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-start justify-center">
              <span className="inline-flex items-center gap-1.5">
                {gripDragHandle(columnId, 'Depth')}
                <AutoneHeaderInfoTooltip
                  label="Depth"
                  rich={{
                    title: 'Depth',
                    icon: 'info',
                    body: HEADER_INFO_TOOLTIPS.depth,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `Depth ${agg.depth.from.toFixed(1)} → ${agg.depth.to.toFixed(1)}`,
                          },
                        }
                      : {}),
                  }}
                  hoverWith={<span>Depth</span>}
                />
              </span>
            </div>
          </th>
        );
      case 'gripWarehouseUnits':
        return (
          <th key={columnId} className={`min-w-[128px] h-[62px] min-h-[62px] max-h-[62px] box-border px-4 py-0 text-left align-middle ${theadCellBg}`} {...d}>
            <div className="flex h-full min-h-0 flex-col items-start justify-center">
              <span className="inline-flex items-center gap-1.5">
                {gripDragHandle(columnId, 'Warehouse units')}
                <AutoneHeaderInfoTooltip
                  label="Warehouse units"
                  side="left"
                  rich={{
                    title: 'Warehouse units',
                    icon: 'info',
                    body: HEADER_INFO_TOOLTIPS.warehouseUnits,
                    ...(agg
                      ? {
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `Warehouse units ${agg.warehouse.from.toLocaleString()} → ${agg.warehouse.to.toLocaleString()}`,
                          },
                        }
                      : {}),
                  }}
                  hoverWith={<span>Warehouse units</span>}
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
          <td key={columnId} className={`h-[86px] min-h-[86px] py-3 px-4 align-middle ${tableRowHoverTd}`}>
            <div className={tableCellPrimary}>{formatRevenueIncreaseEurK(row.revenueIncreaseEur)}</div>
          </td>
        );
      case 'transfers':
        return (
          <td key={columnId} className={`h-[86px] min-h-[86px] py-3 px-4 align-middle ${tableRowHoverTd}`}>
            <div className="flex min-w-0 flex-col gap-1">
              <div className={tableCellPrimary}>
                {row.transfers.l7d.toLocaleString()} L7D
              </div>
              <div className={tableCellSecondary}>
                {row.transfers.l30d.toLocaleString()} L30D
              </div>
            </div>
          </td>
        );
      case 'scheduleStart':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] min-w-[240px] py-3 px-4 align-middle ${tableRowHoverTd}`}
          >
            <div className="flex min-w-0 flex-wrap items-center justify-start gap-x-3 gap-y-2 text-left">
              <div className="flex min-w-0 flex-col items-start gap-1">
                <div className={tableCellPrimary}>
                  {row.recommendedTransfers.primary.toLocaleString()}
                </div>
                <div className={tableCellSecondary}>
                  {row.recommendedTransfers.secondary.toLocaleString()}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
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
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle ${tableRowHoverTd}`}
          >
            <div className="flex min-w-0 flex-col items-end gap-1">
              <div className={`${tableCellPrimary} tabular-nums`}>
                {l7d.toLocaleString()}
                {showPeriodLabels ? ' L7D' : ''}
              </div>
              <div className={`${tableCellSecondary} tabular-nums`}>
                {l30d.toLocaleString()}
                {showPeriodLabels ? ' L30D' : ''}
              </div>
            </div>
          </td>
        );
      }
      case 'forecastPerWeek':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.forecastPerWeek.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
        );
      case 'targetCoverage':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-left align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.stockouts.from.toLocaleString()} → {row.stockouts.to.toLocaleString()}
          </td>
        );
      case 'gripLocations':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-left align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.locationsTransition.from.toLocaleString()} → {row.locationsTransition.to.toLocaleString()}
          </td>
        );
      case 'gripOverstocks':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-left align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.overstocksTransition.from.toLocaleString()} → {row.overstocksTransition.to.toLocaleString()}
          </td>
        );
      case 'gripUnderstocks':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-left align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.understocksTransition.from.toLocaleString()} → {row.understocksTransition.to.toLocaleString()}
          </td>
        );
      case 'gripDepth':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-left align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.depthTransition.from.toFixed(1)} → {row.depthTransition.to.toFixed(1)}
          </td>
        );
      case 'gripWarehouseUnits':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-left align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.warehouseUnitsTransition.from.toLocaleString()} →{' '}
            {row.warehouseUnitsTransition.to.toLocaleString()}
          </td>
        );
      case 'drillMinQty':
        return (
          <td key={columnId} className={`h-[86px] min-h-[86px] px-3 py-3 align-middle ${tableCellPrimary} ${tableRowHoverTd}`}>
            {drillM?.minQty ?? '—'}
          </td>
        );
      case 'drillInventory':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] px-3 py-3 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {drillM?.inventory ?? '—'}
          </td>
        );
      case 'drillTarget':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] px-3 py-3 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {drillM != null ? formatCoverageWeeks(drillM.targetCoverageWk) : '—'}
          </td>
        );
      case 'drillForecast':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] px-3 py-3 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {drillM != null ? `${drillM.forecastSalesPerWk.toLocaleString()} per week` : '—'}
          </td>
        );
      case 'drillSkuLocs':
        return (
          <td key={columnId} className={`h-[86px] min-h-[86px] px-3 py-3 align-middle ${tableCellPrimary} ${tableRowHoverTd}`}>
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
              >
                <div className="flex h-full min-h-0 flex-col justify-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                    />
                  </label>
                </div>
              </th>
              {showProductDetails && (
                <th
                  className={`sticky left-14 z-20 h-[62px] min-h-[62px] max-h-[62px] w-[280px] min-w-[280px] max-w-[280px] box-border ${theadCellBg} px-4 py-0 text-left align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]`}
                  scope="col"
                >
                  <div className="flex h-full min-h-0 flex-col justify-center gap-2">
                    <AutoneHeaderInfoTooltip
                      label="Product details"
                      rich={ASSORTMENT_HEADER_RICH.productDetails}
                      hoverWith={<span>Product details</span>}
                    />
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
                        <div className={tableCellPrimary}>{detail.title}</div>
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
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex shrink-0 rounded p-0.5 text-[#6A7282] transition-colors hover:bg-slate-100 hover:text-sky-600"
                            aria-label="Product options"
                          >
                            <ChevronDown size={14} strokeWidth={2} aria-hidden />
                          </button>
                        </div>
                        <div className={`mt-0.5 ${tableCellSecondary}`}>{detail.colorLabel}</div>
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
