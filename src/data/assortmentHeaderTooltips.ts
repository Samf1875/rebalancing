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
    title: 'Transfers (units & trips)',
    icon: 'info',
    body: 'First line: units transferred between locations (rolling 7-day window). Second line: transfer trips (rolling 30-day window).',
  },
  revenueIncrease: {
    title: 'Estimated revenue gain',
    icon: 'chart',
    body: 'Based on historical sales and demand forecasts.',
    footer: {
      kind: 'impact',
      prefix: 'Your total revenue increase',
      badge: '+€238.0K',
      sublabel: 'Euros',
    },
  },
  recommendedTransfers: {
    title: 'AI suggested recommended transfers',
    icon: 'lightbulb',
    body: 'Based on demand, stock levels, and sales trends. Move units here to balance stock and maximize revenue.',
  },
  salesL7dL30d: {
    title: 'Sales (L7D / L30D)',
    icon: 'info',
    body: 'Units sold in the last 7 / 30 days. Helps gauge product demand in each location.',
  },
};
