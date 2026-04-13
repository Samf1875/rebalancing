export type RebalancingTaskRow = {
  id: string;
  name: string;
  createdLabel: string;
  creator: string;
  uniqueTrips: number;
  transferUnits: number;
  /** Euro amount in euros (not cents) for display formatting */
  transferValueEur: number;
};

/** Sample ongoing rebalancing tasks — list intro screen (matches product reference) */
export const MOCK_REBALANCING_TASKS: RebalancingTaskRow[] = [
  {
    id: 't1',
    name: 'Jess test',
    createdLabel: '31/03/26',
    creator: 'Autone',
    uniqueTrips: 52,
    transferUnits: 881,
    transferValueEur: 271_800,
  },
  {
    id: 't2',
    name: 'test t',
    createdLabel: '24/03/26',
    creator: 'Autone',
    uniqueTrips: 49,
    transferUnits: 734,
    transferValueEur: 243_800,
  },
  {
    id: 't3',
    name: 'REBAL-24/03/26',
    createdLabel: '24/03/26',
    creator: 'Autone',
    uniqueTrips: 49,
    transferUnits: 734,
    transferValueEur: 243_800,
  },
  {
    id: 't4',
    name: 'test',
    createdLabel: '24/03/26',
    creator: 'Autone',
    uniqueTrips: 61,
    transferUnits: 4_115,
    transferValueEur: 1_200_000,
  },
  {
    id: 't5',
    name: 'REBAL-03/03/26',
    createdLabel: '03/03/26',
    creator: 'Autone',
    uniqueTrips: 53,
    transferUnits: 2_775,
    transferValueEur: 826_700,
  },
  {
    id: 't6',
    name: 'Test rebal 27 feb',
    createdLabel: '27/02/26',
    creator: 'Autone',
    uniqueTrips: 6,
    transferUnits: 10,
    transferValueEur: 2_970,
  },
  {
    id: 't7',
    name: 'Jess test',
    createdLabel: '23/02/26',
    creator: 'Autone',
    uniqueTrips: 29,
    transferUnits: 180,
    transferValueEur: 70_100,
  },
];

/** Submitted rebalancing tasks — same columns as ongoing, distinct list */
export const MOCK_SUBMITTED_REBALANCING_TASKS: RebalancingTaskRow[] = [
  {
    id: 's1',
    name: 'new test for',
    createdLabel: '25/03/26',
    creator: 'Autone',
    uniqueTrips: 49,
    transferUnits: 734,
    transferValueEur: 243_800,
  },
  {
    id: 's2',
    name: 'REBAL-24/03/2026',
    createdLabel: '24/03/26',
    creator: 'Autone',
    uniqueTrips: 49,
    transferUnits: 734,
    transferValueEur: 243_800,
  },
  {
    id: 's3',
    name: 'REBAL-24/03/26',
    createdLabel: '24/03/26',
    creator: 'Autone',
    uniqueTrips: 49,
    transferUnits: 734,
    transferValueEur: 243_800,
  },
  {
    id: 's4',
    name: 'REBAL-24/03/26',
    createdLabel: '24/03/26',
    creator: 'Autone',
    uniqueTrips: 49,
    transferUnits: 734,
    transferValueEur: 243_800,
  },
];

export function formatTransferValueEur(eur: number): string {
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(1)}M`;
  if (eur >= 1_000) return `€${(eur / 1_000).toFixed(1)}K`;
  return `€${eur.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}
