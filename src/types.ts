export interface AssortmentRow {
  id: string;
  productGroup: { name: string; productCount: number };
  /** Product details sticky column: image, title, SKU row (+ copy / chevron), color, then location block. */
  productCellDetail: {
    imageSrc: string;
    title: string;
    sku: string;
    colorLabel: string;
  };
  locationCluster: { name: string; locationCount: number };
  whUnits: { value: number; sub: string };
  storeOh: number;
  /** Sales column: two lines; `showPeriodLabels` appends " L7D" / " L30D" on each line. */
  sales: { l7d: number; l30d: number; showPeriodLabels?: boolean };
  /** Revenue increase in whole EUR; Revenue increase column shows €XK (e.g. €211.7K). */
  revenueIncreaseEur: number;
  /** Transfer counts in Transfers column (L7D primary line, L30D secondary). */
  transfers: { l7d: number; l30d: number };
  /** Recommended transfers column: stacked counts + VIS/REV actions. */
  recommendedTransfers: { primary: number; secondary: number };
  sellThru: { percent: number };
  forecast: { value: number; sub: string };
  /** Weekly forecast (“Forecast per week” column); shown with two decimal places. */
  forecastPerWeek: number;
  /** Target coverage (weeks); used where drill / metrics need it. */
  targetCoverageWeeks: number;
  /** Stockouts column: formatted as “from → to” with locale grouping. */
  stockouts: { from: number; to: number };
  /** Locations column: “from → to”. */
  locationsTransition: { from: number; to: number };
  /** Overstocks column: “from → to”. */
  overstocksTransition: { from: number; to: number };
  /** Understocks column: “from → to”. */
  understocksTransition: { from: number; to: number };
  /** Depth column: decimal “from → to” (one decimal place in UI). */
  depthTransition: { from: number; to: number };
  /** Warehouse units column: “from → to” (locale-formatted integers). */
  warehouseUnitsTransition: { from: number; to: number };
  /** Main-table inventory total (thousands separator in UI). */
  inventoryCount: number;
  /** WH stock: primary total + PFP sub-line. */
  whStock: { value: number; pfp: number };
  /** % WH stock for IA (one decimal in UI). */
  whStockPctForIa: number;
  assortment: { assorted: string; assortedCount: number; totalCount: number };
  sumIa: number;
  avgIa: number;
  mq: number;
  committed: boolean;
  selected?: boolean;
  /** True when row has uncommitted Assort/Unassort or IA edits */
  hasPendingChanges?: boolean;
  /** Snapshot at last commit; used to revert */
  lastCommittedSnapshot?: {
    assortment: { assortedCount: number; totalCount: number };
    sumIa: number;
    avgIa: number;
  };
  /** Suggested assortment label after generating recommendations (e.g. "3/5 Assorted") */
  assortmentRecommendationLabel?: string;
  /** Recommendation value shown below Sum IA after generating recommendations */
  sumIaRecommendation?: number;
  /** Recommendation value shown below Avg IA after generating recommendations */
  avgIaRecommendation?: number;
  /** Optional schedule window (YYYY-MM-DD) for when assortment change applies. Set from EditAllocationPanel. */
  scheduledAssortmentStart?: string;
  scheduledAssortmentFinish?: string;
  /** Extra columns when product drill-down breadcrumb is active */
  productDrillMetrics?: {
    skuLocations: number;
    minQty: number;
    inventory: number;
    targetCoverageWk: number;
    forecastSalesPerWk: number;
  };
}

export type ModalKind = 'edit-allocation' | 'product-group' | 'location-cluster' | 'assort' | null;
