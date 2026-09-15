import type { PlatformId } from './PlatformContext';
import type { VersionId } from '../versions/registry';
import { parseRoutedPath, resolvePath, type RouteMapResult } from '../versions/routing';

/**
 * Cross-platform route equivalences (see FLOW_PARITY.md). Each entry pairs the platforms'
 * route slugs for the *same* flow. Only add a row once the equivalent is actually built and
 * confirmed against source — an unknown/missing slug falls back to the target platform's
 * home, per FLOW_PARITY.md's switcher fallback rule.
 *
 * Several Android routes map onto one iOS route, because iOS folds sub-flows into a host
 * screen (cash/card/success live inside `/ios/checkout`; the cart is a pane of
 * `/ios/products`). Lookup is first-match, so order matters for the reverse direction:
 * keep the *canonical* Android route for a given iOS slug above the ones that fold into it,
 * so ios `checkout` → android `totals` rather than `cash-payment`.
 *
 * Deliberately absent (verified in source but not built on one side, so they fall through
 * to home with `available: false`): `eligibility`, `mark-complete`, `scan-to-pay`,
 * `add-coupon`, `settings-payments`, `settings-catalog`.
 */
const EQUIV: Partial<Record<PlatformId, string>>[] = [
  // Canonical pairs — keep first for each iOS slug.
  { android: 'products', ios: 'products' },
  { android: 'order-history', ios: 'orders' },
  { android: 'email-receipt', ios: 'email-receipt' },
  { android: 'settings', ios: 'settings' },
  { android: 'totals', ios: 'checkout' },
  { android: 'splash', ios: 'loading' },
  // Android sub-flows that iOS folds into a host screen.
  { android: 'cart', ios: 'products' }, // iOS cart = pane/sheet of the item selector
  { android: 'card-payment', ios: 'checkout' }, // card-present states are inline in TotalsView
  { android: 'cash-payment', ios: 'checkout' }, // PointOfSaleCollectCashView opens from checkout
  { android: 'payment-success', ios: 'checkout' }, // success is a takeover inside checkout
  { android: 'settings-hardware', ios: 'settings' },
  { android: 'barcode-setup', ios: 'settings' }, // iOS: Settings → Hardware → Scanner Setup
  { android: 'support', ios: 'settings' }, // iOS: Help sits at the bottom of the settings list
];

export type { RouteMapResult };

/** Map the current pathname to the equivalent route on `to`, staying within the same
 *  version. When the current flow has no confirmed equivalent, fall back to the product
 *  catalog (the app's effective home). */
export function mapRoute(version: VersionId, to: PlatformId, pathname: string): RouteMapResult {
  const { platform: from, slug } = parseRoutedPath(pathname);
  if (!from || slug === '') return { path: resolvePath(version, to, '/'), available: true }; // launcher ↔ launcher
  const row = EQUIV.find((r) => r[from] === slug);
  const targetSlug = row?.[to];
  return targetSlug
    ? { path: resolvePath(version, to, `/${targetSlug}`), available: true }
    : { path: resolvePath(version, to, '/products'), available: false };
}
