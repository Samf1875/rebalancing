/** Purple “warehouse / box” vs blue “transfer / truck” chips in the TU column (design mock). */
export type TuBreakdownItem =
  | {
      kind: 'warehouse';
      count: number;
      /** Free-form bullet reasons displayed in the recommendation popover */
      reasons?: string[];
    }
  | {
      kind: 'transfer';
      count: number;
      /**
       * Source/origin location id for this transfer chunk; the destination is the parent row.
       * Used to look up live stock / forecast / coverage values from the rows array, so the
       * popover always reflects the same numbers shown in the table itself.
       */
      fromLocationId: string;
      /** Trip classification (e.g. "Rebalancing", "Replenishment") */
      tripType: string;
      /** Revenue uplift driven by this recommendation, in EUR */
      revenueIncrease: number;
      /** Free-form bullet reasons displayed in the recommendation popover */
      reasons: string[];
    }
  /**
   * Outlined blue chip representing units leaving the parent row (outgoing transfer).
   * Inverse of `transfer` (which is incoming). Rendered as white bg + blue keyline,
   * with a right-facing truck.
   */
  | {
      kind: 'transfer-out';
      count: number;
      /** Optional destination location id (the parent row is the source). */
      toLocationId?: string;
      /** Trip classification (e.g. "Rebalancing", "Replenishment") */
      tripType?: string;
      /** Revenue uplift driven by this recommendation, in EUR */
      revenueIncrease?: number;
      /** Free-form bullet reasons displayed in the recommendation popover */
      reasons?: string[];
    }
  /** Outlined purple chip representing units already in-transit toward the destination. */
  | {
      kind: 'in-transit';
      count: number;
      /** Optional explanatory note shown beneath the count in the hover popover */
      note?: string;
      /**
       * Origin location of the stock currently in-transit (mirrors `transfer.fromLocationId`).
       * Used by the hover popover to render a source → destination header and pull the live
       * source-side stock / coverage values from the rows array.
       */
      fromLocationId?: string;
      /** Trip classification (e.g. "Replenishment") shown in the popover */
      tripType?: string;
      /** ETA copy (e.g. "Arrives in ~2 days") shown in the popover */
      eta?: string;
    };

/** Back-of-house storage state for the product transfers table. */
export type ProductTransferStorageCapacity = 'saturated' | 'spaceRemaining';

/** Location-level transfer rows for the product drill-down “Transfers” table (per design mock). */
export type ProductTransferLocationRow = {
  id: string;
  name: string;
  code: string;
  /** Show small “hub” glyph next to the location name */
  transferHub?: boolean;
  /** Funnel icon next to the name (e.g. filtered / drill-down state) */
  locationFilter?: boolean;
  stock: { from: number; to: number };
  /** Warehouse allocation units (before → after), shown in transfer drawer detail */
  warehouseUnits?: { from: number; to: number };
  tu: { from: number; to: number };
  /** Shown when the TU header pencil toggles breakdown on */
  tuBreakdown?: TuBreakdownItem[];
  sales: { l7d: number; l30d: number };
  forecastPerWeek: number;
  stockouts: { from: number; to: number };
  coverage: { fromPct: number; toPct: number; targetWeeks: number };
  storageCapacity: ProductTransferStorageCapacity;
};

export type ProductTransferSummary = {
  stock: { from: number; to: number };
  tu: { from: number; to: number };
  sales: { l7d: number; l30d: number };
  forecastPerWeek: number;
  stockouts: { from: number; to: number };
};

/** Column sub-header totals (thead), aligned with product transfers screenshot. */
export const MOCK_PRODUCT_TRANSFER_SUMMARY: ProductTransferSummary = {
  stock: { from: 222, to: 222 },
  tu: { from: 222, to: 222 },
  sales: { l7d: 3, l30d: 17 },
  forecastPerWeek: 6.72,
  stockouts: { from: 6, to: 12 },
};

export const MOCK_PRODUCT_TRANSFER_LOCATIONS: ProductTransferLocationRow[] = [
  {
    id: 'loc-610',
    name: 'Lulli Eshop',
    code: '610',
    stock: { from: 9, to: 9 },
    warehouseUnits: { from: 120, to: 118 },
    tu: { from: 9, to: 9 },
    tuBreakdown: [{ kind: 'warehouse', count: 9, reasons: ['Increase visibility'] }],
    sales: { l7d: 1, l30d: 3 },
    forecastPerWeek: 0.77,
    stockouts: { from: 0, to: 0 },
    coverage: { fromPct: 100, toPct: 100, targetWeeks: 1 },
    storageCapacity: 'spaceRemaining',
  },
  {
    id: 'loc-645',
    name: 'PR PP Nancy',
    code: '645',
    transferHub: true,
    locationFilter: true,
    stock: { from: 2, to: 5 },
    warehouseUnits: { from: 48, to: 52 },
    tu: { from: 2, to: 5 },
    tuBreakdown: [
      { kind: 'warehouse', count: 2 },
      {
        kind: 'transfer',
        count: 2,
        fromLocationId: 'loc-610',
        tripType: 'Rebalancing',
        revenueIncrease: 540,
        reasons: ['Increase visibility at PR PP Nancy from 2 to 4', 'Increase revenue'],
      },
      {
        kind: 'transfer',
        count: 1,
        fromLocationId: 'loc-644',
        tripType: 'Rebalancing',
        revenueIncrease: 210,
        reasons: ['Increase visibility at PR PP Nancy from 4 to 5', 'Increase revenue'],
      },
    ],
    sales: { l7d: 0, l30d: 1 },
    forecastPerWeek: 0.9,
    stockouts: { from: 1, to: 0 },
    coverage: { fromPct: 40, toPct: 80, targetWeeks: 2 },
    storageCapacity: 'saturated',
  },
  {
    id: 'loc-644',
    name: 'GL PP Biarritz',
    code: '644',
    transferHub: true,
    stock: { from: 1, to: 3 },
    warehouseUnits: { from: 22, to: 26 },
    tu: { from: 1, to: 3 },
    tuBreakdown: [
      {
        kind: 'transfer',
        count: 1,
        fromLocationId: 'loc-610',
        tripType: 'Rebalancing',
        revenueIncrease: 320,
        reasons: ['Increase visibility at GL PP Biarritz from 1 to 2', 'Increase revenue'],
      },
      {
        kind: 'transfer',
        count: 1,
        fromLocationId: 'loc-645',
        tripType: 'Rebalancing',
        revenueIncrease: 180,
        reasons: ['Increase visibility at GL PP Biarritz from 2 to 3', 'Increase revenue'],
      },
    ],
    sales: { l7d: 0, l30d: 0 },
    forecastPerWeek: 0.24,
    stockouts: { from: 2, to: 1 },
    coverage: { fromPct: 25, toPct: 60, targetWeeks: 2 },
    storageCapacity: 'saturated',
  },
  {
    id: 'loc-660',
    name: 'PR AC Toulon',
    code: '660',
    transferHub: true,
    stock: { from: 1, to: 2 },
    warehouseUnits: { from: 15, to: 18 },
    tu: { from: 1, to: 2 },
    tuBreakdown: [
      {
        kind: 'in-transit',
        count: 1,
        fromLocationId: 'loc-610',
        tripType: 'Replenishment',
        eta: 'Arrives in ~2 days',
        note: 'No transfers recommended because stock is in transit',
      },
      {
        kind: 'transfer',
        count: 1,
        fromLocationId: 'loc-610',
        tripType: 'Rebalancing',
        revenueIncrease: 140,
        reasons: ['Cover stockout risk at PR AC Toulon', 'Increase revenue'],
      },
    ],
    sales: { l7d: 0, l30d: 0 },
    forecastPerWeek: 0,
    stockouts: { from: 3, to: 1 },
    coverage: { fromPct: 0, toPct: 0, targetWeeks: 2 },
    storageCapacity: 'saturated',
  },
  {
    id: 'loc-003',
    name: 'SU PP Vieille du templ...',
    code: '003',
    stock: { from: 0, to: 0 },
    warehouseUnits: { from: 8, to: 10 },
    tu: { from: 1, to: 2 },
    tuBreakdown: [
      { kind: 'warehouse', count: 1 },
      {
        kind: 'transfer',
        count: 1,
        fromLocationId: 'loc-610',
        tripType: 'Rebalancing',
        revenueIncrease: 95,
        reasons: ['Cover stockout risk at SU PP Vieille du templ...', 'Increase revenue'],
      },
    ],
    sales: { l7d: 0, l30d: 0 },
    forecastPerWeek: 0.12,
    stockouts: { from: 4, to: 6 },
    coverage: { fromPct: 0, toPct: 0, targetWeeks: 1 },
    storageCapacity: 'spaceRemaining',
  },
  {
    id: 'loc-693',
    name: 'PR AC Lille',
    code: '693',
    transferHub: true,
    stock: { from: 4, to: 0 },
    warehouseUnits: { from: 64, to: 58 },
    tu: { from: 4, to: 0 },
    tuBreakdown: [
      {
        kind: 'transfer-out',
        count: 4,
        toLocationId: 'loc-610',
        tripType: 'Rebalancing',
        revenueIncrease: 380,
        reasons: [
          'Free saturated storage at PR AC Lille',
          'Redistribute stock to higher-velocity locations',
        ],
      },
    ],
    sales: { l7d: 0, l30d: 0 },
    forecastPerWeek: 0,
    stockouts: { from: 0, to: 1 },
    coverage: { fromPct: 0, toPct: 0, targetWeeks: 2 },
    storageCapacity: 'saturated',
  },
];
