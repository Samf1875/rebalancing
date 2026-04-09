import { useState, useEffect, useCallback, type DragEvent, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  GripVertical,
  Info,
} from 'lucide-react';
import type { AssortmentRow, ModalKind } from '../types';

/** Body cell primary label — Inter 14px semibold #101828 */
const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";

/** Body cell secondary / supporting text — Inter 12px regular #6A7282 */
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";

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
}: AssortmentTableProps) {
  const allSelected = rows.length > 0 && rows.every((r) => r.selected);

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
      <GripVertical className="h-4 w-4 shrink-0 text-[#6A7282]" aria-hidden />
    </span>
  );

  const visibleGripColumnOrder = gripColumnOrder.filter(
    (id) => !DRILL_GRIP_ID_SET.has(id) || productDrillDownActive
  );

  const renderGripColumnHeader = (columnId: GripColumnId): ReactNode => {
    const d = gripThDropProps(columnId);
    switch (columnId) {
      case 'sales':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[128px] px-4 py-3 text-left" {...d}>
            <span className="inline-flex items-center gap-2">
              {gripDragHandle(columnId, 'Revenue increase')}
              <span>Revenue increase</span>
              <Info size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
              <ChevronDown size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
            </span>
          </th>
        );
      case 'transfers':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[200px] px-4 py-3 text-left" {...d}>
            <span className="inline-flex items-center gap-2">
              {gripDragHandle(columnId, 'Transfers')}
              <span>Transfers</span>
            </span>
          </th>
        );
      case 'scheduleStart':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[240px] px-4 py-3 text-left" {...d}>
            <span className="inline-flex items-center gap-2">
              {gripDragHandle(columnId, 'Recommended transfers')}
              <span>Recommended transfers</span>
              <Info size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
            </span>
          </th>
        );
      case 'scheduleEnd':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[168px] px-4 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-2">
              {gripDragHandle(columnId, 'Sales')}
              <span>Sales</span>
            </span>
          </th>
        );
      case 'forecastPerWeek':
        return (
          <th
            key={columnId}
            className="h-[86px] min-h-[86px] min-w-[128px] whitespace-normal px-4 py-3 text-right"
            {...d}
          >
            <span className="inline-flex w-full items-center justify-end gap-1.5">
              {gripDragHandle(columnId, 'Forecast per wk.')}
              <span className="flex flex-col items-end leading-snug">
                <span>Forecast</span>
                <span>per wk.</span>
              </span>
              <Info size={14} className="shrink-0 self-center text-[#6A7282]" aria-hidden />
            </span>
          </th>
        );
      case 'targetCoverage':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[128px] px-4 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-2">
              {gripDragHandle(columnId, 'Stockouts')}
              <span>Stockouts</span>
            </span>
          </th>
        );
      case 'gripLocations':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[120px] px-4 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-2">
              {gripDragHandle(columnId, 'Locations')}
              <span>Locations</span>
            </span>
          </th>
        );
      case 'gripOverstocks':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[120px] px-4 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-1.5">
              {gripDragHandle(columnId, 'Overstocks')}
              <span>Overstocks</span>
              <Info size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
            </span>
          </th>
        );
      case 'gripUnderstocks':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[120px] px-4 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-1.5">
              {gripDragHandle(columnId, 'Understocks')}
              <span>Understocks</span>
              <Info size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
            </span>
          </th>
        );
      case 'gripDepth':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[100px] px-4 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-1.5">
              {gripDragHandle(columnId, 'Depth')}
              <span>Depth</span>
              <Info size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
            </span>
          </th>
        );
      case 'gripWarehouseUnits':
        return (
          <th
            key={columnId}
            className="h-[86px] min-h-[86px] min-w-[128px] whitespace-normal px-4 py-3 text-right"
            {...d}
          >
            <span className="inline-flex w-full items-center justify-end gap-1.5">
              {gripDragHandle(columnId, 'Warehouse units')}
              <span className="flex flex-col items-end leading-snug">
                <span>Warehouse</span>
                <span>units</span>
              </span>
              <Info size={14} className="shrink-0 self-center text-[#6A7282]" aria-hidden />
            </span>
          </th>
        );
      case 'drillMinQty':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] px-3 py-3 text-left" {...d}>
            <span className="inline-flex items-center gap-1.5">
              {gripDragHandle(columnId, 'Min Qty')}
              Min Qty
            </span>
          </th>
        );
      case 'drillInventory':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] px-3 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-1.5">
              {gripDragHandle(columnId, 'Inventory (drill)')}
              Inventory
            </span>
          </th>
        );
      case 'drillTarget':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] px-3 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-1.5">
              {gripDragHandle(columnId, 'Target coverage (drill)')}
              <span>Target coverage</span>
            </span>
          </th>
        );
      case 'drillForecast':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] px-3 py-3 text-right" {...d}>
            <span className="inline-flex w-full items-center justify-end gap-1.5">
              {gripDragHandle(columnId, 'Forecast sales per week')}
              <span>Forecast per week</span>
            </span>
          </th>
        );
      case 'drillSkuLocs':
        return (
          <th key={columnId} className="h-[86px] min-h-[86px] min-w-[108px] px-3 py-3 text-left" {...d}>
            <span className="inline-flex items-center gap-1.5">
              {gripDragHandle(columnId, 'SKU locations')}
              <span># SKU locations</span>
            </span>
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
                <button type="button" className={recommendedTransferActionBtn} aria-label="Visible">
                  VIS
                </button>
                <button type="button" className={recommendedTransferActionBtn} aria-label="Review">
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
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.stockouts.from.toLocaleString()} → {row.stockouts.to.toLocaleString()}
          </td>
        );
      case 'gripLocations':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.locationsTransition.from.toLocaleString()} → {row.locationsTransition.to.toLocaleString()}
          </td>
        );
      case 'gripOverstocks':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.overstocksTransition.from.toLocaleString()} → {row.overstocksTransition.to.toLocaleString()}
          </td>
        );
      case 'gripUnderstocks':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.understocksTransition.from.toLocaleString()} → {row.understocksTransition.to.toLocaleString()}
          </td>
        );
      case 'gripDepth':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
          >
            {row.depthTransition.from.toFixed(1)} → {row.depthTransition.to.toFixed(1)}
          </td>
        );
      case 'gripWarehouseUnits':
        return (
          <td
            key={columnId}
            className={`h-[86px] min-h-[86px] py-3 px-4 text-right align-middle tabular-nums ${tableCellPrimary} ${tableRowHoverTd}`}
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
            className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:bg-white [&_th]:font-['Inter',sans-serif]"
          >
            <tr className="font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828] [&_th]:whitespace-nowrap [&_th]:align-middle">
              <th
                className="sticky left-0 z-30 h-[86px] min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white px-4 py-3 text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                scope="col"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                  />
                </label>
              </th>
              <th
                className="sticky left-14 z-20 h-[86px] min-h-[86px] w-[280px] min-w-[280px] max-w-[280px] box-border bg-white px-4 py-3 text-left align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                scope="col"
              >
                <span className="inline-flex items-center gap-2">
                  <span>Product details</span>
                </span>
              </th>
              {!designOnly &&
                visibleGripColumnOrder.map((columnId) => renderGripColumnHeader(columnId))}
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
              <tr key={row.id} className="bg-white" data-name="table-cell">
                <td className={`sticky left-0 z-30 h-[86px] min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white py-3 px-4 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!row.selected}
                      onChange={(e) => onSelectRow(row.id, e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                    />
                  </div>
                </td>
                <td className={`sticky left-14 z-20 min-h-[86px] w-[280px] min-w-[280px] max-w-[280px] box-border bg-white py-3 px-4 align-top shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}>
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
                          onClick={() => {
                            void navigator.clipboard?.writeText(detail.sku);
                          }}
                          className="inline-flex shrink-0 rounded p-0.5 text-[#6A7282] transition-colors hover:bg-slate-100 hover:text-sky-600"
                          aria-label="Copy SKU"
                        >
                          <Copy size={14} strokeWidth={2} aria-hidden />
                        </button>
                        <button
                          type="button"
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
                {!designOnly &&
                  visibleGripColumnOrder.map((columnId) =>
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
