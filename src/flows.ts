/**
 * Registry of WooPOS flows from FLOWS.md, all built as routes. Shown on the home index.
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
    priority: 'Priority 1 — core checkout loop',
    flows: [
      { num: 1, title: 'Splash / eligibility', description: 'App-open gate: loading, catalog sync, eligibility.', path: '/splash', built: true },
      { num: 2, title: 'Item selection — products', description: 'Product list, search, category tabs, cart pane.', path: '/products', built: true },
      { num: 3, title: 'Item selection — variations', description: 'Drill-in for a variable product.', path: '/products', built: true },
      { num: 4, title: 'Item selection — coupons', description: 'Coupon list, search, expired states.', path: '/products', built: true },
      { num: 5, title: 'Custom amount entry', description: 'Add a non-catalog line item.', path: '/products', built: true },
      { num: 6, title: 'Cart', description: 'Line items, remove, coupons, empty state.', path: '/cart', built: true },
      { num: 7, title: 'Totals / checkout — payment method', description: 'Order summary + payment method sheet.', path: '/totals', built: true },
      { num: 8, title: 'Card payment flow', description: 'Reader ready / processing / failed.', path: '/card-payment', built: true },
      { num: 9, title: 'Cash payment flow', description: 'Cash tendered / change due.', path: '/cash-payment', built: true },
      { num: 10, title: 'Payment success', description: 'Confirmation after a charge.', path: '/payment-success', built: true },
      { num: 11, title: 'Mark order as complete', description: 'Post-payment completion.', path: '/mark-complete', built: true },
    ],
  },
  {
    priority: 'Priority 2 — supporting flows',
    flows: [
      { num: 12, title: 'Scan to pay', description: 'QR / remote tap-to-pay checkout.', path: '/scan-to-pay', built: true },
      { num: 13, title: 'Email receipt', description: 'Post-sale receipt delivery.', path: '/email-receipt', built: true },
      { num: 14, title: 'Order history', description: 'Past POS orders, details, refunds.', path: '/order-history', built: true },
      { num: 15, title: 'Scanning / barcode setup', description: 'Barcode scanner onboarding wizard.', path: '/barcode-setup', built: true },
    ],
  },
  {
    priority: 'Priority 3 — settings & meta',
    flows: [
      { num: 16, title: 'Settings — root', description: 'Settings master/detail shell.', path: '/settings', built: true },
      { num: 17, title: 'Settings — categories', description: 'Category list pane.', path: '/settings', built: true },
      { num: 18, title: 'Settings — hardware', description: 'Card reader / barcode scanner.', path: '/settings-hardware', built: true },
      { num: 19, title: 'Settings — product info / catalog', description: 'Local catalog + product info.', path: '/settings-catalog', built: true },
      { num: 20, title: 'Support / help', description: 'Help & support.', path: '/support', built: true },
    ],
  },
];
