import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, GripVertical } from 'lucide-react';
import type { AssortmentRow } from '../types';
import { ASSORTMENT_HEADER_RICH } from '../data/assortmentHeaderTooltips';
import { AutoneReceivingLocationIcon } from './icons/AutoneReceivingLocationIcon';
import { HEADER_INFO_TOOLTIPS } from '../data/headerInfoTooltips';
import {
  MOCK_PRODUCT_TRANSFER_LOCATIONS,
  PRODUCT_TRANSFER_SUMMARY_CARDS,
  type ProductTransferLocationRow,
} from '../data/mockProductTransferLocations';
import { AutoneHeaderInfoTooltip } from './AutoneHeaderInfoTooltip';

const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";
const tableRowHoverTd = '';
const tableHeaderGripIcon = 'h-[1lh] w-[1lh] shrink-0 text-[#6A7282]';

function formatRevenueIncreaseEurK(eur: number): string {
  const k = eur / 1000;
  const frac = k >= 100 ? 1 : 2;
  return `€${k.toFixed(frac)}K`;
}

function formatArrowPair(from: number, to: number): string {
  return `${from.toLocaleString()} -> ${to.toLocaleString()}`;
}

/** Summary row: bold primary + muted secondary line (no card chrome). */
function SummaryInline({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="font-['Inter',sans-serif] text-[14px] font-semibold leading-snug text-[#101828]">
        {primary}
      </div>
      {secondary != null ? (
        <div className="font-['Inter',sans-serif] text-[12px] font-normal leading-snug text-[#6A7282]">
          {secondary}
        </div>
      ) : null}
    </div>
  );
}

function truncateSku(sku: string, max = 14): string {
  if (sku.length <= max) return sku;
  return `${sku.slice(0, Math.max(0, max - 3))}...`;
}

type ProductTransfersTableProps = {
  parentRow: AssortmentRow;
  onBack: () => void;
};

export function ProductTransfersTable({ parentRow, onBack }: ProductTransfersTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectAllRef = useRef<HTMLInputElement>(null);
  const rows = MOCK_PRODUCT_TRANSFER_LOCATIONS;
  const cards = PRODUCT_TRANSFER_SUMMARY_CARDS;
  const allSelected = rows.length > 0 && rows.every((r) => selected[r.id]);
  const someSelected = rows.some((r) => selected[r.id]);

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? Object.fromEntries(rows.map((r) => [r.id, true])) : {});
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const detail = parentRow.productCellDetail;
  const breadcrumbProduct = `${detail.title} [${truncateSku(detail.sku)}]`;

  const revenuePerLocation = Math.max(
    0,
    Math.round(parentRow.revenueIncreaseEur / Math.max(rows.length, 1))
  );

  const summaryRowPadding = 'px-4 py-3 align-middle';
  const stickySummaryBg = 'bg-slate-50/90';

  const renderSummaryRow = () => (
    <tr key="summary" className={stickySummaryBg}>
      <td
        className={`sticky left-0 z-30 w-14 min-w-14 max-w-14 ${summaryRowPadding} shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${stickySummaryBg} ${tableRowHoverTd}`}
      />
      <td
        className={`sticky left-14 z-20 min-w-[220px] max-w-[280px] ${summaryRowPadding} shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${stickySummaryBg} ${tableRowHoverTd}`}
      />
      <td className={`${summaryRowPadding} ${stickySummaryBg} ${tableRowHoverTd}`}>
        <SummaryInline
          primary={<span className="tabular-nums">{cards.transfersUnits.toLocaleString()} units</span>}
          secondary={<span className="tabular-nums">{cards.transfersTrips} trips</span>}
        />
      </td>
      <td className={`${summaryRowPadding} ${stickySummaryBg} ${tableRowHoverTd}`}>
        <SummaryInline primary={formatRevenueIncreaseEurK(cards.revenueEurK * 1000)} />
      </td>
      <td className={`${summaryRowPadding} ${stickySummaryBg} ${tableRowHoverTd}`}>
        <SummaryInline
          primary={<span className="tabular-nums">{cards.recommendedUnits.toLocaleString()} units</span>}
          secondary={<span className="tabular-nums">{cards.recommendedTrips} trips</span>}
        />
      </td>
      <td className={`${summaryRowPadding} ${stickySummaryBg} ${tableRowHoverTd}`}>
        <SummaryInline
          primary={<span className="tabular-nums">{cards.salesL7d} L7D</span>}
          secondary={<span className="tabular-nums">{cards.salesL30d} L30D</span>}
        />
      </td>
      <td className={`min-w-[128px] text-right ${summaryRowPadding} ${stickySummaryBg} ${tableRowHoverTd}`}>
        <div className="font-['Inter',sans-serif] text-[14px] font-semibold tabular-nums text-[#101828]">
          {cards.forecastPerWeek.toFixed(2)} per wk
        </div>
      </td>
    </tr>
  );

  const renderDataRow = (row: ProductTransferLocationRow) => (
    <tr key={row.id} className="bg-white">
      <td
        className={`sticky left-0 z-30 h-[86px] min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white py-3 px-4 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
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
        className={`sticky left-14 z-20 h-[86px] min-h-[86px] min-w-[220px] max-w-[280px] box-border bg-white px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
      >
        <div className="flex min-w-0 items-start gap-2">
          {row.transferHub ? (
            <span className="mt-0.5 shrink-0 text-[#0267FF]" title="Receiving location" aria-label="Receiving location">
              <AutoneReceivingLocationIcon size={16} />
            </span>
          ) : (
            <span className="mt-0.5 inline-block w-4 shrink-0" aria-hidden />
          )}
          <div className="min-w-0">
            <div className={tableCellPrimary}>{row.name}</div>
            <div className={`mt-0.5 ${tableCellSecondary}`}>({row.code})</div>
          </div>
        </div>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className={tableCellPrimary}>{formatArrowPair(row.stock.from, row.stock.to)}</div>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className={tableCellPrimary}>{formatRevenueIncreaseEurK(revenuePerLocation)}</div>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className={tableCellPrimary}>{formatArrowPair(row.tu.from, row.tu.to)}</div>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className="flex min-w-0 flex-col gap-1">
          <div className={tableCellPrimary}>{row.sales.l7d.toLocaleString()} L7D</div>
          <div className={tableCellSecondary}>{row.sales.l30d.toLocaleString()} L30D</div>
        </div>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[128px] px-4 py-3 text-right align-middle ${tableRowHoverTd}`}>
        <div className="inline-flex w-full items-center justify-end gap-1.5">
          <span className={`tabular-nums ${tableCellPrimary}`}>
            {row.forecastPerWeek.toFixed(2)} per wk
          </span>
          <AutoneHeaderInfoTooltip label="Forecast per week" content={HEADER_INFO_TOOLTIPS.forecastPerWk} />
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
          <table className="w-full min-w-[1100px] border-collapse">
            <thead
              className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:bg-white [&_th]:font-['Inter',sans-serif]"
            >
              <tr className="text-[14px] font-semibold leading-normal text-[#101828] [&_th]:whitespace-nowrap [&_th]:align-middle">
                <th
                  className="sticky left-0 z-30 w-14 min-w-14 max-w-14 bg-white px-4 py-[10px] text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                  scope="col"
                >
                  <label className="flex cursor-pointer items-center gap-2">
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
                  className="sticky left-14 z-20 min-w-[220px] bg-white px-4 py-[10px] text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                  scope="col"
                >
                  Product details
                </th>
                <th className="min-w-[200px] px-4 py-[10px] text-left" scope="col">
                  <span className="inline-flex items-center gap-2">
                    <GripVertical className={tableHeaderGripIcon} aria-hidden />
                    <AutoneHeaderInfoTooltip
                      label="Transfers"
                      rich={ASSORTMENT_HEADER_RICH.transfers}
                      hoverWith={<span>Transfers</span>}
                    />
                  </span>
                </th>
                <th className="min-w-[128px] px-4 py-[10px] text-left" scope="col">
                  <span className="inline-flex items-center gap-2">
                    <GripVertical className={tableHeaderGripIcon} aria-hidden />
                    <AutoneHeaderInfoTooltip
                      label="Revenue increase"
                      rich={ASSORTMENT_HEADER_RICH.revenueIncrease}
                      hoverWith={<span>Revenue increase</span>}
                    />
                    <ChevronDown size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
                  </span>
                </th>
                <th className="min-w-[240px] px-4 py-[10px] text-left" scope="col">
                  <span className="inline-flex items-center gap-2">
                    <GripVertical className={tableHeaderGripIcon} aria-hidden />
                    <AutoneHeaderInfoTooltip
                      label="Recommended transfers"
                      rich={ASSORTMENT_HEADER_RICH.recommendedTransfers}
                      hoverWith={<span>Recommended transfers</span>}
                    />
                  </span>
                </th>
                <th className="min-w-[168px] px-4 py-[10px] text-right" scope="col">
                  <span className="inline-flex w-full items-center justify-end gap-2">
                    <GripVertical className={tableHeaderGripIcon} aria-hidden />
                    <AutoneHeaderInfoTooltip
                      label="Sales (L7D / L30D)"
                      rich={ASSORTMENT_HEADER_RICH.salesL7dL30d}
                      hoverWith={<span>Sales</span>}
                    />
                  </span>
                </th>
                <th className="min-w-[140px] px-4 py-[10px] text-right" scope="col">
                  <span className="inline-flex w-full items-center justify-end gap-1.5">
                    <GripVertical className={tableHeaderGripIcon} aria-hidden />
                    <span>Forecast per wk.</span>
                    <AutoneHeaderInfoTooltip label="Forecast per week" content={HEADER_INFO_TOOLTIPS.forecastPerWk} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="[&_td]:border-t-0 [&_td]:border-b-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]">
              {renderSummaryRow()}
              {rows.map((r) => renderDataRow(r))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 bg-white px-4 py-2 text-xs text-[#00050a]">
          <span>{rows.length} locations</span>
        </div>
      </div>
    </div>
  );
}
