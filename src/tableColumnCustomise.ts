/** Labels and keys for the “Customise columns” drawer — order matches design. */
export const TABLE_COLUMN_CUSTOMISE_OPTIONS = [
  { id: 'productDetails', label: 'Product details' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'recommendedTransfers', label: 'Recommended transfers' },
  { id: 'revenueIncrease', label: 'Revenue increase' },
  { id: 'stockouts', label: 'Stockouts' },
  { id: 'locations', label: 'Locations' },
] as const;

export type TableColumnVisibilityKey = (typeof TABLE_COLUMN_CUSTOMISE_OPTIONS)[number]['id'];

export function defaultTableColumnVisibility(): Record<TableColumnVisibilityKey, boolean> {
  return Object.fromEntries(TABLE_COLUMN_CUSTOMISE_OPTIONS.map((o) => [o.id, true])) as Record<
    TableColumnVisibilityKey,
    boolean
  >;
}
