import type { PlatformId } from './PlatformContext';
import type { VersionId } from '../versions/registry';
import { parseRoutedPath, resolvePath, type RouteMapResult } from '../versions/routing';

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
  { android: 'email-receipt', ios: 'email-receipt' },
  { android: 'settings', ios: 'settings' },
  { android: 'settings-hardware', ios: 'settings' },
  { android: 'totals', ios: 'checkout' },
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
