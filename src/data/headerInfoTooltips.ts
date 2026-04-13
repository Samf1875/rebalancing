/** Table header info tooltips — Autone / product copy */
export const HEADER_INFO_TOOLTIPS = {
  revenueIncrease: 'Revenue increase transfer units would generate.',
  recommendedTransfers: "autone's original\nunit transfers\nin recommendation.",
  recommendedTransfersOut: "autone's original\nunit transfers\nout recommendation.",
  forecastPerWk:
    'The total average demand per week during the coverage period.',
  stockouts:
    'Stockout level before and after rebalancing, based on demand forecast and target coverage.',
  locations:
    'Location count impacted before and after rebalancing — how many locations are involved in the proposed moves.',
  overstocks:
    'The total overstocked units that will be removed after rebalancing. This is based on your forecast & coverage period.',
  understocks:
    'The total understocked units that will be resolved after rebalancing. This is based on the forecast & coverage period.',
  stock:
    'Stock level at each location before and after the proposed rebalancing.',
  tu:
    'Transfer units (TU) before and after rebalancing — how many units are slated to move.',
  coverage:
    'Coverage as a share of target before and after rebalancing, and the coverage target in weeks.',
  depth:
    'The average number of units per product, before & after transfers.',
  warehouseUnits:
    'The total number of units across your warehouses, before & after transfers.',
} as const;
