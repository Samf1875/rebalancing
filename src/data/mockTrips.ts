export type TripBadge = 'rev' | 'vis';

export type TripTableRow = {
  id: string;
  sendingName: string;
  sendingId: string;
  sendingWarehouseRole?: 'fulfilment' | 'selling' | null;
  receivingName: string;
  receivingId: string;
  receivingWarehouseRole?: 'fulfilment' | 'selling' | null;
  transfers: number;
  transfersMax: number;
  revenueEur: number;
  revenueMinEur: number;
  recommended: number;
  recommendedMax: number;
  badges: TripBadge[];
  /** Product count for column; `null` renders as N/A. */
  productCount: number | null;
};

export const MOCK_TRIP_ROWS: TripTableRow[] = [
  {
    id: '1',
    sendingName: 'Log01 entrepot logtex',
    sendingId: 'LOG01',
    sendingWarehouseRole: 'selling',
    receivingName: 'Pr ac toulon',
    receivingId: '660',
    transfers: 9,
    transfersMax: 10_000,
    revenueEur: 1670,
    revenueMinEur: 500,
    recommended: 9,
    recommendedMax: 10_000,
    badges: ['rev', 'vis'],
    productCount: null,
  },
  {
    id: '2',
    sendingName: 'Pr ac marseille tdp',
    sendingId: '696',
    receivingName: 'Pr pp rouen',
    receivingId: '640',
    transfers: 38,
    transfersMax: 10_000,
    revenueEur: 1570,
    revenueMinEur: 500,
    recommended: 38,
    recommendedMax: 10_000,
    badges: ['vis'],
    productCount: 7,
  },
  {
    id: '3',
    sendingName: 'Pr ac nice',
    sendingId: '701',
    receivingName: 'Pr ac lyon',
    receivingId: '655',
    transfers: 12,
    transfersMax: 10_000,
    revenueEur: 890,
    revenueMinEur: 500,
    recommended: 12,
    recommendedMax: 10_000,
    badges: ['rev', 'vis'],
    productCount: 38,
  },
  {
    id: '4',
    sendingName: 'Pr pp bordeaux',
    sendingId: '612',
    receivingName: 'Log01 entrepot logtex',
    receivingId: 'LOG01',
    receivingWarehouseRole: 'selling',
    transfers: 6,
    transfersMax: 10_000,
    revenueEur: 420,
    revenueMinEur: 500,
    recommended: 6,
    recommendedMax: 10_000,
    badges: ['vis'],
    productCount: 12,
  },
  {
    id: '5',
    sendingName: 'Pr ac toulon',
    sendingId: '660',
    receivingName: 'Pr ac marseille tdp',
    receivingId: '696',
    transfers: 13,
    transfersMax: 10_000,
    revenueEur: 2100,
    revenueMinEur: 500,
    recommended: 13,
    recommendedMax: 10_000,
    badges: ['rev', 'vis'],
    productCount: 6,
  },
  {
    id: '6',
    sendingName: 'Pr pp rouen',
    sendingId: '640',
    receivingName: 'Pr pp bordeaux',
    receivingId: '612',
    transfers: 13,
    transfersMax: 10_000,
    revenueEur: 980,
    revenueMinEur: 500,
    recommended: 13,
    recommendedMax: 10_000,
    badges: ['vis'],
    productCount: 13,
  },
  {
    id: '7',
    sendingName: 'Pr ac lyon',
    sendingId: '655',
    receivingName: 'Pr ac nice',
    receivingId: '701',
    transfers: 11,
    transfersMax: 10_000,
    revenueEur: 1120,
    revenueMinEur: 500,
    recommended: 11,
    recommendedMax: 10_000,
    badges: ['vis'],
    productCount: 13,
  },
];
