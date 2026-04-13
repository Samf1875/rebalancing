import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown, GripVertical } from 'lucide-react';
import type { LocationTableRow } from '../data/mockLocations';
import { MOCK_LOCATION_PRODUCT_ROWS, type LocationProductRow } from '../data/mockLocationProducts';
import { ASSORTMENT_HEADER_RICH } from '../data/assortmentHeaderTooltips';
import { HEADER_INFO_TOOLTIPS } from '../data/headerInfoTooltips';
import { AutoneHeaderInfoTooltip } from './AutoneHeaderInfoTooltip';

const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";
const tableRowHoverTd = '';
const stickyColShadow = 'shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]';
const tableHeaderGripIcon = "h-[1lh] w-[1lh] shrink-0 text-[#6A7282]";
const tableHeaderGripFont =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";
const recommendedBadgeBtn =
  "rounded border border-[#E3E8F0] bg-white px-2 py-1 font-['Inter',sans-serif] text-[11px] font-semibold leading-none text-[#0267FF] transition-colors hover:bg-slate-50";

function formatEurK(eur: number): string {
  const k = eur / 1000;
  const frac = k >= 100 ? 1 : 2;
  return `€${k.toFixed(frac)}K`;
}

function formatEurPlain(eur: number): string {
  return `€${eur.toLocaleString('en-US')}`;
}

type LocationProductsDrillViewProps = {
  location: LocationTableRow;
  onBack: () => void;
};

export function LocationProductsDrillView({ location, onBack }: LocationProductsDrillViewProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectAllRef = useRef<HTMLInputElement>(null);
  const rows = MOCK_LOCATION_PRODUCT_ROWS;

  const summary = useMemo(() => {
    let transfersIn = 0;
    let transfersOut = 0;
    let revenueEur = 0;
    let recommendedUnits = 0;
    let recommendedTrips = 0;
    let salesL7d = 0;
    let salesL30d = 0;
    for (const r of rows) {
      transfersIn += r.transfersIn;
      transfersOut += r.transfersOut;
      revenueEur += r.revenueEur;
      recommendedUnits += r.recommendedUnits;
      recommendedTrips += r.recommendedTrips;
      salesL7d += r.salesL7d;
      salesL30d += r.salesL30d;
    }
    return {
      transfersIn,
      transfersOut,
      revenueEur,
      recommendedUnits,
      recommendedTrips,
      salesL7d,
      salesL30d,
    };
  }, [rows]);

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

  const breadcrumbLocation = `${location.name} [${location.code}]`;

  const renderRow = (row: LocationProductRow) => (
    <tr key={row.id} className={`bg-white ${tableRowHoverTd}`}>
      <td
        className={`sticky left-0 z-30 h-[86px] min-h-[86px] w-14 min-w-14 max-w-14 box-border bg-white py-3 px-4 align-middle ${stickyColShadow}`}
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
        className={`sticky left-14 z-20 h-[86px] min-h-[86px] w-[280px] min-w-[280px] max-w-[280px] box-border bg-white px-4 py-3 align-top ${stickyColShadow} ${tableRowHoverTd}`}
      >
        <div className="flex min-w-0 gap-3">
          <div
            className="h-12 w-12 shrink-0 rounded bg-[#f5f5f5]"
            aria-hidden
            data-name="Product image placeholder"
          />
          <div className="min-w-0 flex-1">
            <div className={tableCellPrimary}>{row.name}</div>
            <div className={`mt-0.5 truncate ${tableCellSecondary}`}>{row.sku}</div>
            <div className={`mt-0.5 ${tableCellSecondary}`}>{row.color}</div>
          </div>
        </div>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[100px] px-4 py-3 text-right align-middle ${tableRowHoverTd}`}>
        <span className={`tabular-nums ${tableCellPrimary}`}>{row.transfersIn}</span>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[100px] px-4 py-3 text-right align-middle ${tableRowHoverTd}`}>
        <span className={`tabular-nums ${tableCellPrimary}`}>{row.transfersOut}</span>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[120px] px-4 py-3 text-right align-middle ${tableRowHoverTd}`}>
        <span className={`tabular-nums ${tableCellPrimary}`}>{formatEurPlain(row.revenueEur)}</span>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[220px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-col tabular-nums">
            <span className={tableCellPrimary}>{row.recommendedUnits}</span>
            {row.recommendedTrips > 0 ? (
              <span className={tableCellSecondary}>{row.recommendedTrips} trips</span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {row.badges.includes('rev') ? (
              <span className={recommendedBadgeBtn} aria-hidden>
                REV
              </span>
            ) : null}
            {row.badges.includes('vis') ? (
              <span className={recommendedBadgeBtn} aria-hidden>
                VIS
              </span>
            ) : null}
          </div>
        </div>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[100px] px-4 py-3 text-right align-middle ${tableRowHoverTd}`}>
        <div className="inline-flex flex-col items-end gap-0.5 tabular-nums">
          <span className={tableCellPrimary}>{row.salesL7d}</span>
          <span className={tableCellSecondary}>{row.salesL30d}</span>
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
          {breadcrumbLocation}
        </button>
        <span className="mx-1 text-[#6A7282]" aria-hidden>
          &gt;
        </span>
        <span className="font-semibold text-[#00050a]">Products</span>
      </nav>

      <div
        className="rounded-lg overflow-hidden border-[0.5px] border-solid border-[#E3E8F0] bg-white"
        data-name="Location products table"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead
              className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:bg-white [&_th]:font-['Inter',sans-serif]"
            >
              <tr className="h-[62px] min-h-[62px] max-h-[62px] text-[14px] font-semibold leading-normal text-[#101828] [&_th]:whitespace-nowrap [&_th]:px-4 [&_th:not(:first-child)]:align-top [&_th:not(:first-child)]:py-[10px]">
                <th
                  className={`sticky left-0 z-30 h-[62px] min-h-[62px] max-h-[62px] w-14 min-w-14 max-w-14 box-border bg-white py-0 text-center align-middle ${stickyColShadow}`}
                  scope="col"
                >
                  <label className="flex h-full min-h-0 w-full cursor-pointer items-center justify-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                      aria-label="Select all products"
                    />
                  </label>
                </th>
                <th
                  className={`sticky left-14 z-20 h-[62px] min-h-[62px] max-h-[62px] w-[280px] min-w-[280px] max-w-[280px] box-border bg-white px-4 py-0 text-left align-top ${stickyColShadow}`}
                  scope="col"
                >
                  <div className="flex h-full min-h-0 flex-col justify-center gap-2">
                    <AutoneHeaderInfoTooltip
                      label="Product details"
                      rich={ASSORTMENT_HEADER_RICH.productDetails}
                      richBubbleMaxWidthClass="max-w-[min(18rem,calc(100vw-24px))]"
                      hoverWith={<span>Product details</span>}
                      side="top"
                    />
                  </div>
                </th>
                <th className="h-[62px] min-h-[62px] max-h-[62px] min-w-[100px] bg-white px-4 py-0 text-right align-top" scope="col">
                  <div className="flex h-full min-h-0 flex-col items-end justify-center">
                    <span className="inline-flex items-center justify-end gap-2">
                      <GripVertical className={tableHeaderGripIcon} aria-hidden />
                      <span className={tableHeaderGripFont}>Transfers In</span>
                      <AutoneHeaderInfoTooltip
                        label="Transfers In"
                        rich={{
                          title: 'Transfers In',
                          icon: 'info',
                          body: 'Units to receive at this location from the recommended plan, summed across the products in this table.',
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `${summary.transfersIn.toLocaleString('en-US')} units`,
                          },
                        }}
                        richBubbleMaxWidthClass="max-w-[min(20rem,calc(100vw-24px))]"
                        side="top"
                      />
                    </span>
                  </div>
                </th>
                <th className="h-[62px] min-h-[62px] max-h-[62px] min-w-[100px] bg-white px-4 py-0 text-right align-top" scope="col">
                  <div className="flex h-full min-h-0 flex-col items-end justify-center">
                    <span className="inline-flex items-center justify-end gap-2">
                      <GripVertical className={tableHeaderGripIcon} aria-hidden />
                      <span className={tableHeaderGripFont}>Transfers Out</span>
                      <AutoneHeaderInfoTooltip
                        label="Transfers Out"
                        rich={{
                          title: 'Transfers Out',
                          icon: 'info',
                          body: 'Units to send from this location in the recommended plan, summed across the products in this table.',
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `${summary.transfersOut.toLocaleString('en-US')} units`,
                          },
                        }}
                        richBubbleMaxWidthClass="max-w-[min(20rem,calc(100vw-24px))]"
                        side="top"
                      />
                    </span>
                  </div>
                </th>
                <th
                  className="h-[62px] min-h-[62px] max-h-[62px] min-w-[120px] bg-white px-4 py-0 text-right align-top"
                  scope="col"
                  data-header="revenue"
                >
                  <div className="flex h-full min-h-0 flex-col items-end justify-center">
                    <span className="inline-flex items-center justify-end gap-2">
                      <GripVertical className={tableHeaderGripIcon} aria-hidden />
                      <span className={tableHeaderGripFont}>Revenue increase</span>
                      <AutoneHeaderInfoTooltip
                        label="Revenue increase"
                        rich={{
                          title: 'Revenue increase',
                          icon: 'info',
                          body: HEADER_INFO_TOOLTIPS.revenueIncrease,
                          footer: {
                            kind: 'footerCaption' as const,
                            text: formatEurK(summary.revenueEur),
                          },
                        }}
                        richBubbleMaxWidthClass="max-w-[min(20rem,calc(100vw-24px))]"
                        side="top"
                      />
                      <ChevronDown size={14} className="shrink-0 text-[#6A7282]" aria-hidden />
                    </span>
                  </div>
                </th>
                <th
                  className="h-[62px] min-h-[62px] max-h-[62px] min-w-[220px] bg-white px-4 py-0 text-right align-top"
                  scope="col"
                  data-header="recommended"
                >
                  <div className="flex h-full min-h-0 flex-col items-end justify-center">
                    <span className="inline-flex items-center justify-end gap-2">
                      <GripVertical className={tableHeaderGripIcon} aria-hidden />
                      <span className={tableHeaderGripFont}>Recommended transfers</span>
                      <AutoneHeaderInfoTooltip
                        label="Recommended transfers"
                        rich={{
                          title: 'Recommended transfers',
                          icon: 'lightbulb',
                          body: HEADER_INFO_TOOLTIPS.tripsRecommendedTransfers,
                          footer: {
                            kind: 'footerCaption' as const,
                            text: `${summary.recommendedUnits.toLocaleString('en-US')} units · ${summary.recommendedTrips.toLocaleString('en-US')} trips`,
                          },
                        }}
                        richBubbleMaxWidthClass="max-w-[min(20rem,calc(100vw-24px))]"
                        side="top"
                      />
                    </span>
                  </div>
                </th>
                <th
                  className="h-[62px] min-h-[62px] max-h-[62px] min-w-[100px] bg-white px-4 py-0 text-right align-top"
                  scope="col"
                  data-header="sales"
                >
                  <div className="flex h-full min-h-0 flex-col items-end justify-center">
                    <span className="inline-flex items-center justify-end gap-2">
                      <GripVertical className={tableHeaderGripIcon} aria-hidden />
                      <span className={tableHeaderGripFont}>Sales</span>
                      <AutoneHeaderInfoTooltip
                        label="Sales"
                        side="left"
                        rich={{
                          title: 'Sales',
                          icon: 'info',
                          body: ASSORTMENT_HEADER_RICH.salesL7dL30d.body,
                          footer: {
                            kind: 'footerStackedCaption' as const,
                            title: 'Sales summary',
                            valueLine: `${summary.salesL7d.toLocaleString('en-US')} L7D · ${summary.salesL30d.toLocaleString('en-US')} L30D`,
                          },
                        }}
                        richBubbleMaxWidthClass="max-w-[min(32rem,calc(100vw-24px))]"
                      />
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="[&_td]:border-t-0 [&_td]:border-b-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]">
              {rows.map((r) => renderRow(r))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
