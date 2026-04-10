/** Table header info tooltips — Autone / product copy */
export const HEADER_INFO_TOOLTIPS = {
  revenueIncrease: 'Revenue increase transfer units would generate.',
  recommendedTransfers: "autone's original unit\ntransfers recommendation.",
  forecastPerWk:
    'The total average demand per week during the coverage period.',
  overstocks:
    'The total overstocked units that will be removed after rebalancing. This is based on your forecast & coverage period.',
  understocks:
    'The total understocked units that will be resolved after rebalancing. This is based on the forecast & coverage period.',
  depth:
    'The average number of units per location, before & after transfers.',
  warehouseUnits:
    'The total number of units across your warehouses, before & after transfers.',
} as const;
