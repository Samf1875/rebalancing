export type LocationTableRow = {
  id: string;
  name: string;
  code: string;
  transfersIn: { units: number; trips: number; max: number };
  transfersOut: { units: number; trips: number; max: number };
  revenueEur: number;
  recommendedIn: number;
  recommendedOut: number;
  salesL7d: number;
  salesL30d: number;
  forecastPerWk: number;
  stockouts: { from: number; to: number };
  overstocks: { from: number; to: number };
  understocks: { from: number; to: number };
  depth: { from: number; to: number };
};

export const MOCK_LOCATION_ROWS: LocationTableRow[] = [
  {
    id: 'loc-1',
    name: 'Pr ac toulon',
    code: '660',
    transfersIn: { units: 57, trips: 2, max: 15 },
    transfersOut: { units: 13, trips: 2, max: 2 },
    revenueEur: 2660,
    recommendedIn: 57,
    recommendedOut: 13,
    salesL7d: 4,
    salesL30d: 14,
    forecastPerWk: 4.63,
    stockouts: { from: 31, to: 11 },
    overstocks: { from: 12, to: 0 },
    understocks: { from: 45, to: 7 },
    depth: { from: 1.3, to: 1.8 },
  },
  {
    id: 'loc-2',
    name: 'Gl pp nantes',
    code: '656',
    transfersIn: { units: 27, trips: 2, max: 15 },
    transfersOut: { units: 17, trips: 2, max: 2 },
    revenueEur: 2280,
    recommendedIn: 27,
    recommendedOut: 17,
    salesL7d: 4,
    salesL30d: 7,
    forecastPerWk: 4.09,
    stockouts: { from: 18, to: 8 },
    overstocks: { from: 21, to: 6 },
    understocks: { from: 28, to: 5 },
    depth: { from: 1.7, to: 1.4 },
  },
  {
    id: 'loc-3',
    name: 'Gl pp metz',
    code: '657',
    transfersIn: { units: 13, trips: 3, max: 15 },
    transfersOut: { units: 23, trips: 2, max: 2 },
    revenueEur: 2240,
    recommendedIn: 13,
    recommendedOut: 23,
    salesL7d: 3,
    salesL30d: 10,
    forecastPerWk: 2.97,
    stockouts: { from: 6, to: 13 },
    overstocks: { from: 21, to: 1 },
    understocks: { from: 14, to: 3 },
    depth: { from: 1.7, to: 1.9 },
  },
  {
    id: 'loc-4',
    name: 'Gl pp toulouse',
    code: '655',
    transfersIn: { units: 24, trips: 2, max: 15 },
    transfersOut: { units: 25, trips: 2, max: 2 },
    revenueEur: 1680,
    recommendedIn: 24,
    recommendedOut: 25,
    salesL7d: 2,
    salesL30d: 7,
    forecastPerWk: 2.47,
    stockouts: { from: 15, to: 18 },
    overstocks: { from: 26, to: 4 },
    understocks: { from: 21, to: 3 },
    depth: { from: 1.4, to: 1.5 },
  },
  {
    id: 'loc-5',
    name: 'Su pp cannes',
    code: '027',
    transfersIn: { units: 17, trips: 2, max: 15 },
    transfersOut: { units: 7, trips: 1, max: 2 },
    revenueEur: 1660,
    recommendedIn: 17,
    recommendedOut: 7,
    salesL7d: 2,
    salesL30d: 6,
    forecastPerWk: 2.68,
    stockouts: { from: 9, to: 2 },
    overstocks: { from: 8, to: 2 },
    understocks: { from: 14, to: 0 },
    depth: { from: 1.7, to: 1.6 },
  },
  {
    id: 'loc-6',
    name: 'Pr pp rouen',
    code: '640',
    transfersIn: { units: 38, trips: 1, max: 15 },
    transfersOut: { units: 21, trips: 2, max: 2 },
    revenueEur: 1570,
    recommendedIn: 38,
    recommendedOut: 21,
    salesL7d: 1,
    salesL30d: 15,
    forecastPerWk: 2.82,
    stockouts: { from: 33, to: 13 },
    overstocks: { from: 23, to: 5 },
    understocks: { from: 43, to: 5 },
    depth: { from: 1.5, to: 1.2 },
  },
];
