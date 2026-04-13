/** Per-product rows for the location → Products drill view (rebalancing workspace). */
export type LocationProductRow = {
  id: string;
  name: string;
  sku: string;
  color: string;
  transfersIn: number;
  transfersOut: number;
  revenueEur: number;
  recommendedUnits: number;
  recommendedTrips: number;
  badges: readonly ('rev' | 'vis')[];
  salesL7d: number;
  salesL30d: number;
};

/** Demo rows; header totals are derived from this list. */
export const MOCK_LOCATION_PRODUCT_ROWS: LocationProductRow[] = [
  {
    id: 'lp-1',
    name: 'Othilia pm',
    sku: '4HVD55-V40907-102',
    color: 'Macadamia',
    transfersIn: 2,
    transfersOut: 0,
    revenueEur: 789,
    recommendedUnits: 2,
    recommendedTrips: 1,
    badges: ['vis', 'rev'],
    salesL7d: 1,
    salesL30d: 1,
  },
  {
    id: 'lp-2',
    name: 'Sac mathilde',
    sku: '4HVD55-V40907-103',
    color: 'Noisette',
    transfersIn: 8,
    transfersOut: 0,
    revenueEur: 504,
    recommendedUnits: 8,
    recommendedTrips: 0,
    badges: ['vis', 'rev'],
    salesL7d: 1,
    salesL30d: 2,
  },
  {
    id: 'lp-3',
    name: 'Sac mathilde',
    sku: '4HVD55-V40907-104',
    color: 'Noir',
    transfersIn: 9,
    transfersOut: 0,
    revenueEur: 309,
    recommendedUnits: 1,
    recommendedTrips: 0,
    badges: ['rev'],
    salesL7d: 1,
    salesL30d: 3,
  },
  {
    id: 'lp-4',
    name: 'Othilia pm',
    sku: '4HVD55-V40907-105',
    color: 'Cognac',
    transfersIn: 10,
    transfersOut: 0,
    revenueEur: 768,
    recommendedUnits: 18,
    recommendedTrips: 0,
    badges: ['vis', 'rev'],
    salesL7d: 0,
    salesL30d: 2,
  },
];
