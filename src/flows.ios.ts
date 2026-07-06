/**
 * Registry of built iOS POS flows (from FLOWS.ios.md), shown on the iOS home index. Grows as
 * iOS flows are built one at a time. Mirrors the shape of flows.android.ts.
 */
export interface FlowEntry {
  num: number;
  title: string;
  description: string;
  path?: string;
  built: boolean;
}

export interface FlowGroup {
  priority: string;
  flows: FlowEntry[];
}

export const flowGroups: FlowGroup[] = [
  {
    priority: 'Built',
    flows: [
      {
        num: 1,
        title: 'Item Selector (catalog + cart)',
        description: 'Product list beside the cart; Products / Coupons tabs, search.',
        path: '/products',
        built: true,
      },
      {
        num: 2,
        title: 'Add coupon (Create coupon)',
        description: 'Discount-type sheet → coupon editor → added to cart.',
        path: '/add-coupon',
        built: true,
      },
      { num: 3, title: 'Checkout / payments', description: 'Totals + card / cash / other methods → success.', path: '/checkout', built: true },
      { num: 4, title: 'Orders', description: 'Order list + details (Items / Totals).', path: '/orders', built: true },
      { num: 5, title: 'Settings', description: 'Store / Hardware / Product catalog / Help.', path: '/settings', built: true },
      { num: 6, title: 'Payments Onboarding (iOS-only)', description: 'WooPayments setup gate.', path: '/payments-onboarding', built: true },
    ],
  },
];
