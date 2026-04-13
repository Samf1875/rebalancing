import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, GripVertical, Info } from 'lucide-react';
import { MOCK_LOCATION_ROWS, type LocationTableRow } from '../data/mockLocations';

const tableCellPrimary =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal text-[#101828]";
const tableCellSecondary =
  "font-['Inter',sans-serif] text-[12px] font-normal leading-normal text-[#6A7282]";
const tableRowHoverTd = '';

const tableHeaderGripSize = "h-[1lh] w-[1lh] shrink-0";
const tableHeaderGripIcon = `${tableHeaderGripSize} text-[#6A7282]`;
const tableHeaderGripInsetFont =
  "font-['Inter',sans-serif] text-[14px] font-semibold leading-normal";

const recommendedTransferActionBtn =
  "rounded border border-[#E3E8F0] bg-white px-2 py-1 font-['Inter',sans-serif] text-[11px] font-semibold leading-none text-[#0267FF] transition-colors hover:bg-slate-50";

function formatEurK(eur: number): string {
  const k = eur / 1000;
  const frac = k >= 100 ? 1 : 2;
  return `€${k.toFixed(frac)}K`;
}

function transfersSubline(t: { trips: number; max: number }): string {
  return `${t.trips} (max ${t.max})`;
}

function GripLabel({
  label,
  info,
  sort,
  align = 'left',
}: {
  label: string;
  info?: boolean;
  sort?: boolean;
  align?: 'left' | 'right';
}) {
  const inner = (
    <>
      <GripVertical className={tableHeaderGripIcon} aria-hidden />
      <span>{label}</span>
      {info ? <Info size={14} className="shrink-0 text-[#6A7282]" aria-hidden /> : null}
      {sort ? <ChevronDown size={14} className="shrink-0 text-[#6A7282]" aria-hidden /> : null}
    </>
  );
  if (align === 'right') {
    return (
      <span className="inline-flex w-full items-center justify-end gap-2">{inner}</span>
    );
  }
  return <span className="inline-flex items-center gap-2">{inner}</span>;
}

/** Invisible grip + gap so cell content lines up with `GripLabel` / Location header. */
function TransparentGrip() {
  return (
    <GripVertical
      className={`pointer-events-none ${tableHeaderGripSize} text-transparent`}
      aria-hidden
    />
  );
}

function CellGripInset({
  children,
  align,
}: {
  children: ReactNode;
  align: 'left' | 'right';
}) {
  if (align === 'right') {
    return (
      <div
        className={`flex w-full items-center justify-end gap-2 ${tableHeaderGripInsetFont}`}
      >
        <TransparentGrip />
        <div className="min-w-0 text-right">{children}</div>
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center gap-2 ${tableHeaderGripInsetFont}`}>
      <TransparentGrip />
      <div className="min-w-0 text-left">{children}</div>
    </div>
  );
}

export function LocationsTable() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectAllRef = useRef<HTMLInputElement>(null);

  const rows = MOCK_LOCATION_ROWS;
  const allSelected = rows.length > 0 && rows.every((r) => selected[r.id]);
  const someSelected = rows.some((r) => selected[r.id]);

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const toggleAll = (checked: boolean) => {
    setSelected(
      checked ? Object.fromEntries(rows.map((r) => [r.id, true])) : {}
    );
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const summary = useMemo(
    () => ({
      transfersInUnits: 797,
      transfersInTrips: 30,
      transfersOutUnits: 797,
      transfersOutTrips: 23,
      revenueEur: 24_100,
      recommendedIn: 797,
      recommendedOut: 797,
      salesL7d: 76,
      salesL30d: 231,
      forecastPerWk: 53.24,
      stockouts: { from: 387, to: 314 },
      overstocks: { from: 1031, to: 302 },
      understocks: { from: 534, to: 34 },
      depth: { from: 2.1, to: 1.9 },
    }),
    []
  );

  const renderDataRow = (row: LocationTableRow) => (
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
        className={`sticky left-14 z-20 h-[86px] min-h-[86px] w-[180px] min-w-[180px] max-w-[180px] box-border bg-white px-4 py-3 align-middle shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableRowHoverTd}`}
      >
        <CellGripInset align="left">
          <div>
            <div className={tableCellPrimary}>{row.name}</div>
            <div className={`mt-0.5 ${tableCellSecondary}`}>{row.code}</div>
          </div>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="left">
          <div className="flex min-w-0 flex-col gap-1">
            <div className={tableCellPrimary}>{row.transfersIn.units}</div>
            <div className={tableCellSecondary}>{transfersSubline(row.transfersIn)}</div>
          </div>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="left">
          <div className="flex min-w-0 flex-col gap-1">
            <div className={tableCellPrimary}>{row.transfersOut.units}</div>
            <div className={tableCellSecondary}>{transfersSubline(row.transfersOut)}</div>
          </div>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="right">
          <span className={`tabular-nums ${tableCellPrimary}`}>{formatEurK(row.revenueEur)}</span>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] min-w-[200px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="left">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <span className={tableCellPrimary}>{row.recommendedIn}</span>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" className={recommendedTransferActionBtn} aria-label="Review">
                REV
              </button>
              <button type="button" className={recommendedTransferActionBtn} aria-label="Visible">
                VIS
              </button>
            </div>
          </div>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="right">
          <span className={`tabular-nums ${tableCellPrimary}`}>{row.recommendedOut}</span>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="right">
          <div className="flex min-w-0 flex-col items-end gap-1">
            <div className={`${tableCellPrimary} tabular-nums`}>{row.salesL7d}</div>
            <div className={`${tableCellSecondary} tabular-nums`}>{row.salesL30d}</div>
          </div>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="right">
          <span className={`tabular-nums ${tableCellPrimary}`}>
            {row.forecastPerWk.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="right">
          <span className={`tabular-nums ${tableCellPrimary}`}>
            {row.stockouts.from} → {row.stockouts.to}
          </span>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="right">
          <span className={`tabular-nums ${tableCellPrimary}`}>
            {row.overstocks.from.toLocaleString()} → {row.overstocks.to.toLocaleString()}
          </span>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="right">
          <span className={`tabular-nums ${tableCellPrimary}`}>
            {row.understocks.from} → {row.understocks.to}
          </span>
        </CellGripInset>
      </td>
      <td className={`h-[86px] min-h-[86px] px-4 py-3 align-middle ${tableRowHoverTd}`}>
        <CellGripInset align="right">
          <span className={`tabular-nums ${tableCellPrimary}`}>
            {row.depth.from.toFixed(1)} → {row.depth.to.toFixed(1)}
          </span>
        </CellGripInset>
      </td>
    </tr>
  );

  return (
    <div
      className="rounded-lg overflow-hidden border-[0.5px] border-solid border-[#E3E8F0] bg-white"
      data-name="Locations table"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[2160px] border-collapse">
          <thead
            className="[&_th]:border-t-0 [&_th]:border-b-[0.5px] [&_th]:border-solid [&_th]:border-[#E3E8F0] [&_th]:bg-white [&_th]:font-['Inter',sans-serif]"
          >
            <tr className="text-[14px] font-semibold leading-normal text-[#101828] [&_th]:whitespace-nowrap [&_th]:align-middle">
              <th
                className="sticky left-0 z-30 w-14 min-w-14 max-w-14 box-border bg-white h-[62px] px-4 py-0 text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
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
                className="sticky left-14 z-20 w-[180px] min-w-[180px] max-w-[180px] box-border bg-white h-[62px] px-4 py-0 text-left shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]"
                scope="col"
              >
                <span className="inline-flex items-center gap-2">
                  <GripVertical className={tableHeaderGripIcon} aria-hidden />
                  Location
                </span>
              </th>
              <th className="min-w-[120px] h-[62px] px-4 py-0 text-left" scope="col">
                <GripLabel label="Transfers in" />
              </th>
              <th className="min-w-[120px] h-[62px] px-4 py-0 text-left" scope="col">
                <GripLabel label="Transfers out" />
              </th>
              <th className="min-w-[140px] h-[62px] px-4 py-0 text-right" scope="col">
                <GripLabel label="Revenue increase" info sort align="right" />
              </th>
              <th className="min-w-[220px] h-[62px] px-4 py-0 text-left" scope="col">
                <GripLabel label="Recommended transfers in" info />
              </th>
              <th className="min-w-[120px] h-[62px] px-4 py-0 text-right" scope="col">
                <GripLabel label="Recommended transfers out" align="right" />
              </th>
              <th className="min-w-[100px] h-[62px] px-4 py-0 text-right" scope="col">
                <GripLabel label="Sales" align="right" />
              </th>
              <th className="min-w-[120px] h-[62px] px-4 py-0 text-right" scope="col">
                <GripLabel label="Forecast per wk." info align="right" />
              </th>
              <th className="min-w-[120px] h-[62px] px-4 py-0 text-right" scope="col">
                <GripLabel label="Stockouts" align="right" />
              </th>
              <th className="min-w-[120px] h-[62px] px-4 py-0 text-right" scope="col">
                <GripLabel label="Overstocks" info align="right" />
              </th>
              <th className="min-w-[120px] h-[62px] px-4 py-0 text-right" scope="col">
                <GripLabel label="Understocks" info align="right" />
              </th>
              <th className="min-w-[100px] h-[62px] px-4 py-0 text-right" scope="col">
                <GripLabel label="Depth" info align="right" />
              </th>
            </tr>
          </thead>
          <tbody className="[&_td]:border-t-0 [&_td]:border-b-[0.5px] [&_td]:border-solid [&_td]:border-[#E3E8F0]">
            <tr className="bg-white font-semibold">
              <td className="sticky left-0 z-30 bg-white py-3 px-4 shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)]" />
              <td
                className={`sticky left-14 z-20 w-[180px] min-w-[180px] max-w-[180px] bg-white px-4 py-3 shadow-[4px_0_12px_-6px_rgba(15,23,42,0.12)] ${tableCellPrimary}`}
              />
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="left">
                  <div className="flex flex-col gap-1">
                    <div className={tableCellPrimary}>{summary.transfersInUnits} units</div>
                    <div className={tableCellSecondary}>{summary.transfersInTrips} trips</div>
                  </div>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="left">
                  <div className="flex flex-col gap-1">
                    <div className={tableCellPrimary}>{summary.transfersOutUnits} units</div>
                    <div className={tableCellSecondary}>{summary.transfersOutTrips} trips</div>
                  </div>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="right">
                  <span className={`tabular-nums ${tableCellPrimary}`}>
                    {formatEurK(summary.revenueEur)}
                  </span>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="left">
                  <span className={tableCellPrimary}>{summary.recommendedIn} units</span>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="right">
                  <span className={tableCellPrimary}>
                    <span className="tabular-nums">{summary.recommendedOut}</span> units
                  </span>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="right">
                  <div className="flex min-w-0 flex-col items-end gap-1">
                    <div className={`${tableCellPrimary} tabular-nums`}>{summary.salesL7d} L7D</div>
                    <div className={`${tableCellSecondary} tabular-nums`}>{summary.salesL30d} L30D</div>
                  </div>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="right">
                  <span className={`tabular-nums ${tableCellPrimary}`}>
                    {summary.forecastPerWk.toFixed(2)} per week
                  </span>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="right">
                  <span className={`tabular-nums ${tableCellPrimary}`}>
                    {summary.stockouts.from} → {summary.stockouts.to}
                  </span>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="right">
                  <span className={`tabular-nums ${tableCellPrimary}`}>
                    {summary.overstocks.from.toLocaleString()} → {summary.overstocks.to.toLocaleString()}
                  </span>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="right">
                  <span className={`tabular-nums ${tableCellPrimary}`}>
                    {summary.understocks.from} → {summary.understocks.to}
                  </span>
                </CellGripInset>
              </td>
              <td className="px-4 py-3 align-middle">
                <CellGripInset align="right">
                  <span className={`tabular-nums ${tableCellPrimary}`}>
                    {summary.depth.from.toFixed(1)} → {summary.depth.to.toFixed(1)}
                  </span>
                </CellGripInset>
              </td>
            </tr>
            {rows.map((row) => renderDataRow(row))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4 bg-white px-4 py-2 text-xs text-[#00050a]">
        <span>{rows.length} rows</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-40"
            aria-label="Previous page"
            disabled
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[4rem] text-center">1 of 1</span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-40"
            aria-label="Next page"
            disabled
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
