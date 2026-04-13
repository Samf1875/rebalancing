import { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { HEADER_INFO_TOOLTIPS } from '../data/headerInfoTooltips';
import { MOCK_TRIP_ROWS, type TripBadge, type TripTableRow } from '../data/mockTrips';
import { AutoneArrowDownIcon } from './AutoneArrowDownIcon';
import { AutoneHeaderInfoTooltip } from './AutoneHeaderInfoTooltip';

const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";
/** Location title line — regular weight per trips design. */
const tableCellLocationName =
  "font-['Inter',sans-serif] text-[14px] font-normal leading-normal text-[#101828]";
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";
/** Products column body — centered, medium weight per design. */
const tableCellProducts =
  "font-['Inter',sans-serif] text-[14px] font-medium leading-normal tabular-nums text-[#101828]";
const tableCellProductsNa =
  "font-['Inter',sans-serif] text-[14px] font-medium leading-normal text-[#6A7282]";
const tableRowHoverTd = '';

const theadBg = 'bg-white';
const stickyColShadow = 'shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]';
/** Match Locations / Assortment header band. */
const tripThRowH = 'h-[62px] min-h-[62px] max-h-[62px]';
const tripThCell = `${tripThRowH} box-border align-middle`;
/** After checkbox (`left-14` = 3.5rem). */
const tripLocCol =
  'w-[200px] min-w-[200px] max-w-[200px] box-border';
const stickySendingTh = `sticky left-14 z-20 ${tripLocCol} ${theadBg} text-left ${tripThCell} ${stickyColShadow}`;
const stickySendingTd = `sticky left-14 z-20 ${tripLocCol} bg-white ${stickyColShadow}`;
const stickyReceivingTh = `sticky left-[calc(3.5rem+200px)] z-[15] ${tripLocCol} ${theadBg} text-left ${tripThCell} ${stickyColShadow}`;
const stickyReceivingTd = `sticky left-[calc(3.5rem+200px)] z-[15] ${tripLocCol} bg-white ${stickyColShadow}`;
/** Label row typography — grip wrapper uses the same so `1lh` matches the text span. */
const tripThLabelRowEnd =
  "inline-flex items-center justify-end gap-2 font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";
const tripThLabelRowCenter =
  "inline-flex items-center justify-center gap-2 font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";
/** Match cap / font-size of 14px label (`1em`), not full line box (`1lh`). */
const tripThGripWrap =
  "inline-flex h-[1em] w-[1em] shrink-0 items-center justify-center self-center font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#6A7282]";

function TripColumnGrip() {
  return (
    <span className={tripThGripWrap} aria-hidden>
      <GripVertical className="h-full w-full" strokeWidth={2} />
    </span>
  );
}

const tripActionBtn =
  "rounded border border-[#E3E8F0] bg-white px-2 py-1 font-['Inter',sans-serif] text-[11px] font-semibold leading-none text-[#0267FF] transition-colors hover:bg-slate-50";

/** Header totals — design reference (product screenshot). */
const TRIPS_HEADER_SUMMARY = {
  transfersUnits: 797,
  revenueEur: 24_100,
  recommendedUnits: 797,
} as const;

function formatEurK(eur: number): string {
  const k = eur / 1000;
  const frac = k >= 100 ? 1 : 2;
  return `€${k.toFixed(frac)}K`;
}

function formatEurMin(eur: number): string {
  return `€${eur.toLocaleString('en-US')}`;
}

export function TripsTable() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectAllRef = useRef<HTMLInputElement>(null);

  const rows = MOCK_TRIP_ROWS;
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

  const renderBadges = (badges: TripBadge[]) => (
    <div className="flex shrink-0 items-center gap-1">
      {badges.includes('rev') ? (
        <button type="button" className={tripActionBtn} aria-label="Review">
          REV
        </button>
      ) : null}
      {badges.includes('vis') ? (
        <button type="button" className={tripActionBtn} aria-label="Visible">
          VIS
        </button>
      ) : null}
    </div>
  );

  const renderDataRow = (row: TripTableRow) => (
    <tr key={row.id} className={`bg-white ${tableRowHoverTd}`}>
      <td
        className={`sticky left-0 z-30 w-14 min-w-14 max-w-14 box-border bg-white px-4 py-3 align-middle ${stickyColShadow} ${tableRowHoverTd}`}
      >
        <input
          type="checkbox"
          checked={!!selected[row.id]}
          onChange={(e) => toggleRow(row.id, e.target.checked)}
          className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
          aria-label={`Select trip ${row.sendingName} → ${row.receivingName}`}
        />
      </td>
      <td className={`px-4 py-3 align-middle ${stickySendingTd} ${tableRowHoverTd}`}>
        <div className="flex flex-col gap-0.5">
          <div className={tableCellLocationName}>{row.sendingName}</div>
          <div className={tableCellSecondary}>{row.sendingId}</div>
        </div>
      </td>
      <td className={`px-4 py-3 align-middle ${stickyReceivingTd} ${tableRowHoverTd}`}>
        <div className="flex flex-col gap-0.5">
          <div className={tableCellLocationName}>{row.receivingName}</div>
          <div className={tableCellSecondary}>{row.receivingId}</div>
        </div>
      </td>
      <td className="min-w-[140px] px-4 py-3 align-middle text-right">
        <div className="inline-flex flex-col items-end gap-0.5 tabular-nums">
          <span className={tableCellPrimary}>{row.transfers}</span>
          <span className={tableCellSecondary}>(max {row.transfersMax.toLocaleString('en-US')})</span>
        </div>
      </td>
      <td className="min-w-[160px] px-4 py-3 align-middle text-right">
        <div className="inline-flex flex-col items-end gap-0.5 tabular-nums">
          <span className={tableCellPrimary}>{formatEurK(row.revenueEur)}</span>
          <span className={tableCellSecondary}>(min {formatEurMin(row.revenueMinEur)})</span>
        </div>
      </td>
      <td className="min-w-[260px] px-4 py-3 align-middle text-right">
        <div className="flex w-full items-center justify-end gap-3">
          <div className="inline-flex flex-col items-end gap-0.5 tabular-nums">
            <span className={tableCellPrimary}>{row.recommended}</span>
            <span className={tableCellSecondary}>(max {row.recommendedMax.toLocaleString('en-US')})</span>
          </div>
          {renderBadges(row.badges)}
        </div>
      </td>
      <td className="min-w-[120px] px-4 py-3 align-middle text-center">
        {row.productCount == null ? (
          <span className={tableCellProductsNa}>N/A</span>
        ) : (
          <span className={tableCellProducts}>{row.productCount}</span>
        )}
      </td>
    </tr>
  );

  return (
    <div
      className="rounded-lg overflow-hidden border-[0.5px] border-solid border-[#E3E8F0] bg-white"
      data-name="Table container"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1220px] border-collapse">
          <thead
            className={`[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:font-['Inter',sans-serif] ${theadBg}`}
          >
            <tr
              className={`${tripThRowH} text-[14px] font-semibold leading-normal text-[#101828] [&_th]:whitespace-nowrap [&_th]:align-middle [&_th]:py-0 [&_th]:px-4`}
            >
              <th
                className={`sticky left-0 z-30 w-14 min-w-14 max-w-14 ${tripThCell} ${theadBg} text-left ${stickyColShadow}`}
                scope="col"
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-[#e9eaeb] bg-white text-sky-600 focus:ring-sky-500"
                    aria-label="Select all trips"
                  />
                </label>
              </th>
              <th className={stickySendingTh} scope="col">
                Sending location
              </th>
              <th className={stickyReceivingTh} scope="col">
                Receiving location
              </th>
              <th className={`min-w-[140px] text-right ${tripThCell} ${theadBg}`} scope="col">
                <span className={tripThLabelRowEnd}>
                  <TripColumnGrip />
                  <AutoneHeaderInfoTooltip
                    label="Transfers"
                    rich={{
                      title: 'Transfers',
                      icon: 'info',
                      body: HEADER_INFO_TOOLTIPS.tripsTransfers,
                      footer: {
                        kind: 'footerCaption' as const,
                        text: `${TRIPS_HEADER_SUMMARY.transfersUnits.toLocaleString('en-US')} units`,
                      },
                    }}
                    richBubbleMaxWidthClass="max-w-[min(20rem,calc(100vw-24px))]"
                    hoverWith={<span>Transfers</span>}
                    side="top"
                  />
                </span>
              </th>
              <th className={`min-w-[160px] text-right ${tripThCell} ${theadBg}`} scope="col">
                <span className={tripThLabelRowEnd}>
                  <TripColumnGrip />
                  <AutoneHeaderInfoTooltip
                    label="Revenue increase"
                    rich={{
                      title: 'Revenue increase',
                      icon: 'info',
                      body: HEADER_INFO_TOOLTIPS.revenueIncrease,
                      footer: {
                        kind: 'footerCaption' as const,
                        text: formatEurK(TRIPS_HEADER_SUMMARY.revenueEur),
                      },
                    }}
                    hoverWith={<span>Revenue increase</span>}
                    side="top"
                  />
                  <AutoneArrowDownIcon size={14} className="text-[#6A7282]" />
                </span>
              </th>
              <th className={`min-w-[260px] text-right ${tripThCell} ${theadBg}`} scope="col">
                <span className={tripThLabelRowEnd}>
                  <TripColumnGrip />
                  <AutoneHeaderInfoTooltip
                    label="Recommended transfers"
                    rich={{
                      title: 'Recommended transfers',
                      icon: 'info',
                      body: HEADER_INFO_TOOLTIPS.tripsRecommendedTransfers,
                      footer: {
                        kind: 'footerCaption' as const,
                        text: `${TRIPS_HEADER_SUMMARY.recommendedUnits.toLocaleString('en-US')} units`,
                      },
                    }}
                    hoverWith={<span>Recommended transfers</span>}
                    side="top"
                  />
                  <AutoneArrowDownIcon size={14} className="text-[#6A7282]" />
                </span>
              </th>
              <th className={`min-w-[120px] text-center ${tripThCell} ${theadBg}`} scope="col">
                <span className={tripThLabelRowCenter}>
                  <TripColumnGrip />
                  <span>Products</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="[&_td]:border-t-0 [&_td]:border-b-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]">
            {rows.map((row) => renderDataRow(row))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
