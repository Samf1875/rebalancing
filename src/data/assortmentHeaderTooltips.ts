import type { HeaderTooltipRich } from '../components/AutoneHeaderInfoTooltip';

/** Rich header explainer copy for AssortmentTable — matches rebalancing explainability mocks */
export const ASSORTMENT_HEADER_RICH: {
  productDetails: HeaderTooltipRich;
  transfers: HeaderTooltipRich;
  revenueIncrease: HeaderTooltipRich;
  recommendedTransfers: HeaderTooltipRich;
  salesL7dL30d: HeaderTooltipRich;
} = {
  productDetails: {
    title: 'Product details',
    icon: 'info',
    body: 'Image, product name, SKU, and attributes for each product group. Use this column to identify what you are rebalancing.',
  },
  transfers: {
    title: 'Transfers (units moved)',
    icon: 'info',
    body: 'Number of units moved between locations in the selected time period. L7D represents the last 7 days. L30D represents the last 30 days.',
  },
  revenueIncrease: {
    title: 'Estimated revenue gain',
    icon: 'chart',
    body: 'Based on historical sales and demand forecasts.',
    footer: { kind: 'impact', badge: '+€211.7K', sublabel: 'High impact' },
  },
  recommendedTransfers: {
    title: 'AI-suggested transfers',
    icon: 'lightbulb',
    body: 'Based on demand, stock levels, and sales trends. Move units here to balance stock and maximize revenue.',
    footer: { kind: 'highlight', text: 'Highlighted rows show high-impact moves' },
  },
  salesL7dL30d: {
    title: 'Sales (L7D / L30D)',
    icon: 'info',
    body: 'Units sold in the last 7 / 30 days. Helps gauge product demand in each location.',
    footer: { kind: 'salesMetrics', l7d: '4,944', l30d: '20,370' },
  },
};
