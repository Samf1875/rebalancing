import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, Filter, Pencil } from 'lucide-react';
import type { AssortmentRow } from '../types';
import { ASSORTMENT_HEADER_RICH } from '../data/assortmentHeaderTooltips';
import { AutoneReceivingLocationIcon } from './icons/AutoneReceivingLocationIcon';
import { HEADER_INFO_TOOLTIPS } from '../data/headerInfoTooltips';
import {
  MOCK_PRODUCT_TRANSFER_LOCATIONS,
  MOCK_PRODUCT_TRANSFER_SUMMARY,
  type ProductTransferLocationRow,
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

type ProductTransfersTableProps = {
  parentRow: AssortmentRow;
  onBack: () => void;
};

export function ProductTransfersTable({ parentRow, onBack }: ProductTransfersTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectAllRef = useRef<HTMLInputElement>(null);
  const rows = MOCK_PRODUCT_TRANSFER_LOCATIONS;
  const summary = MOCK_PRODUCT_TRANSFER_SUMMARY;
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

  const headerStack = (title: ReactNode, sub: ReactNode) => (
    <div className="flex min-h-[52px] flex-col justify-center gap-1 py-[2px] text-left">
      {title}
      {sub}
    </div>
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
        className={`sticky left-14 z-20 h-[86px] min-h-[86px] min-w-min max-w-max box-border bg-white px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
      >
        <div className="min-w-0">
          <div className="flex min-w-0 flex-nowrap items-center gap-1.5 leading-none">
            <span className={`shrink-0 ${tableCellPrimary}`}>{row.name}</span>
            {row.transferHub ? (
              <span
                className="inline-flex shrink-0 items-center justify-center text-[16px] leading-none text-[#101828]"
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
      <td className={`h-[86px] min-h-[86px] min-w-[112px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellPrimary}`}>{formatArrowPair(row.stock.from, row.stock.to)}</div>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[112px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellPrimary}`}>{formatArrowPair(row.tu.from, row.tu.to)}</div>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[100px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className="flex min-w-0 flex-col gap-1">
          <div className={`tabular-nums ${tableCellPrimary}`}>{row.sales.l7d.toLocaleString()}</div>
          <div className={`tabular-nums ${tableCellSecondary}`}>{row.sales.l30d.toLocaleString()}</div>
        </div>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[112px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellPrimary}`}>{row.forecastPerWeek.toFixed(2)}</div>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[112px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className={`tabular-nums ${tableCellPrimary}`}>{formatArrowPair(row.stockouts.from, row.stockouts.to)}</div>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[140px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className="flex min-w-0 flex-col gap-1">
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
                <th className="min-w-[120px] px-4 py-[10px] text-left" scope="col">
                  {headerStack(
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
                <th className="min-w-[120px] px-4 py-[10px] text-left" scope="col">
                  {headerStack(
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
                      hoverWith={
                        <span className={`inline-flex items-center gap-1 ${headerTitleClass}`}>
                          TU
                          <Pencil size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
                        </span>
                      }
                    />,
                    <span className="invisible text-[12px] leading-snug" aria-hidden>
                      —
                    </span>
                  )}
                </th>
                <th className="min-w-[120px] px-4 py-[10px] text-left" scope="col">
                  {headerStack(
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
                <th className="min-w-[120px] px-4 py-[10px] text-left" scope="col">
                  {headerStack(
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
                <th className="min-w-[152px] px-4 py-[10px] text-left" scope="col">
                  {headerStack(
                    <AutoneHeaderInfoTooltip
                      label="Coverage"
                      richAppearance="light"
                      richBubbleMaxWidthClass="max-w-[min(32rem,calc(100vw-24px))]"
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
    </div>
  );
}
