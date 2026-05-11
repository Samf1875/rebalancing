/**
 * Layout for the All-tab aggregated sticky column (products / from / to).
 * Dropdown trigger stays narrow while the first logical column (titles, totals, body product block) can be wider.
 */
export const ALL_TAB_PRODUCT_GROUP_DROPDOWN_PX = 200;

export const ALL_TAB_AGG_SUB_COL_WIDTHS = {
  product: 264,
  locationGroup: 155,
  locationsTo: 145,
} as const;

const SUB_COL_GAP_PX = 16; // gap-4 between sub-columns
const CELL_PAD_X_PX = 16; // px-4 on sticky cell

/** Width spanning the From location + To location sub-columns plus their gap. */
export const ALL_TAB_FROM_TO_LOCATION_DROPDOWN_PX =
  ALL_TAB_AGG_SUB_COL_WIDTHS.locationGroup +
  ALL_TAB_AGG_SUB_COL_WIDTHS.locationsTo +
  SUB_COL_GAP_PX;

/** Total width of the sticky aggregated product-details column (px). */
export const ALL_TAB_AGGREGATED_STICKY_COL_PX =
  ALL_TAB_AGG_SUB_COL_WIDTHS.product +
  ALL_TAB_AGG_SUB_COL_WIDTHS.locationGroup +
  ALL_TAB_AGG_SUB_COL_WIDTHS.locationsTo +
  SUB_COL_GAP_PX * 2 +
  CELL_PAD_X_PX * 2;
