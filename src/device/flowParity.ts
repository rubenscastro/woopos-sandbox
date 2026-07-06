import type { PlatformId } from './PlatformContext';

/**
 * Cross-platform route equivalences (see FLOW_PARITY.md). Each entry pairs the platforms'
 * route slugs for the *same* flow. Only add a row once the equivalent is actually built and
 * confirmed against source — an unknown/missing slug falls back to the target platform's
 * home, per FLOW_PARITY.md's switcher fallback rule.
 *
 * Currently empty on the iOS side: no iOS flows are built yet, so every switch to iOS lands
 * on the iOS home. Populate as iOS flows land.
 */
const EQUIV: Partial<Record<PlatformId, string>>[] = [
  { android: 'products', ios: 'products' },
  { android: 'order-history', ios: 'orders' },
  { android: 'settings', ios: 'settings' },
  { android: 'settings-hardware', ios: 'settings' },
  { android: 'totals', ios: 'checkout' },
];

/** Parse `/android/products` → { platform: 'android', slug: 'products' } (slug '' = home). */
function parse(pathname: string): { platform: PlatformId | null; slug: string } {
  const m = pathname.match(/^\/(android|ios)(?:\/(.*))?$/);
  if (!m) return { platform: null, slug: '' };
  return { platform: m[1] as PlatformId, slug: m[2] ?? '' };
}

export interface RouteMapResult {
  /** Where the switcher should navigate on the target platform. */
  path: string;
  /** False when the current flow has no confirmed equivalent (landing on home instead). */
  available: boolean;
}

/** Map the current pathname to the equivalent route on `to`. When the current flow has no
 *  confirmed equivalent, fall back to the product catalog (the app's effective home). */
export function mapRoute(to: PlatformId, pathname: string): RouteMapResult {
  const { platform: from, slug } = parse(pathname);
  const catalog = `/${to}/products`;
  if (!from || slug === '') return { path: `/${to}`, available: true }; // launcher ↔ launcher
  const row = EQUIV.find((r) => r[from] === slug);
  const targetSlug = row?.[to];
  return targetSlug ? { path: `/${to}/${targetSlug}`, available: true } : { path: catalog, available: false };
}
