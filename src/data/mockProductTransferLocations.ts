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
  tu: { from: number; to: number };
  sales: { l7d: number; l30d: number };
  forecastPerWeek: number;
  stockouts: { from: number; to: number };
  coverage: { fromPct: number; toPct: number; targetWeeks: number };
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
    tu: { from: 0, to: 0 },
    sales: { l7d: 1, l30d: 3 },
    forecastPerWeek: 0.77,
    stockouts: { from: 0, to: 0 },
    coverage: { fromPct: 100, toPct: 100, targetWeeks: 1 },
  },
  {
    id: 'loc-645',
    name: 'PR PP Nancy',
    code: '645',
    transferHub: true,
    locationFilter: true,
    stock: { from: 2, to: 5 },
    tu: { from: 1, to: 3 },
    sales: { l7d: 0, l30d: 1 },
    forecastPerWeek: 0.9,
    stockouts: { from: 1, to: 0 },
    coverage: { fromPct: 40, toPct: 80, targetWeeks: 2 },
  },
  {
    id: 'loc-644',
    name: 'GL PP Biarritz',
    code: '644',
    transferHub: true,
    stock: { from: 1, to: 3 },
    tu: { from: 0, to: 2 },
    sales: { l7d: 0, l30d: 0 },
    forecastPerWeek: 0.24,
    stockouts: { from: 2, to: 1 },
    coverage: { fromPct: 25, toPct: 60, targetWeeks: 2 },
  },
  {
    id: 'loc-003',
    name: 'SU PP Vieille du templ...',
    code: '003',
    stock: { from: 0, to: 0 },
    tu: { from: 0, to: 0 },
    sales: { l7d: 0, l30d: 0 },
    forecastPerWeek: 0.12,
    stockouts: { from: 4, to: 6 },
    coverage: { fromPct: 0, toPct: 0, targetWeeks: 1 },
  },
];
