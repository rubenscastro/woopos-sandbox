import type { PlatformId } from '../device/PlatformContext';
import { androidRouteDefs } from '../routes/androidRouteDefs';
import { iosRouteDefs } from '../routes/iosRouteDefs';
import { mergeRouteDefs } from '../routes/mergeRouteDefs';
import { VERSIONS, type VersionId } from './registry';
import { versionOverrides } from './overrides';

/** `main` is unprefixed (`/android/*`, `/ios/*`); every other version routes under `/versions/<id>`. */
export function versionBasePath(version: VersionId): string {
  return version === 'main' ? '' : `/versions/${version}`;
}

/**
 * Builds an app-level path (e.g. `/totals`, `/flows`, `/`) into the full routed path for the
 * given version + platform. Screens keep calling `navigate('/totals')` via `useNav()`;
 * this is what maps that into the active version's tree.
 */
export function resolvePath(version: VersionId, platform: PlatformId, to: string): string {
  const base = versionBasePath(version);
  if (to === '/flows' || to === '/') return `${base}/${platform}`;
  return `${base}/${platform}${to}`;
}

/** Parses a routed pathname (main or versioned tree) back into its parts. */
export function parseRoutedPath(pathname: string): {
  version: VersionId;
  platform: PlatformId | null;
  slug: string;
} {
  const versionedMatch = pathname.match(/^\/versions\/([^/]+)\/(android|ios)(?:\/(.*))?$/);
  if (versionedMatch) {
    const [, versionId, platform, rest] = versionedMatch;
    // Unknown/mistyped version slugs fall back to `main` rather than being persisted as-is.
    const version = VERSIONS.some((v) => v.id === versionId) ? (versionId as VersionId) : 'main';
    return { version, platform: platform as PlatformId, slug: rest ?? '' };
  }
  const mainMatch = pathname.match(/^\/(android|ios)(?:\/(.*))?$/);
  if (mainMatch) return { version: 'main', platform: mainMatch[1] as PlatformId, slug: mainMatch[2] ?? '' };
  return { version: 'main', platform: null, slug: '' };
}

function routeDefsFor(version: VersionId, platform: PlatformId) {
  const base = platform === 'android' ? androidRouteDefs : iosRouteDefs;
  if (version === 'main') return base;
  const overrides = versionOverrides[version]?.[platform];
  return mergeRouteDefs(base, overrides);
}

export interface RouteMapResult {
  /** Where the switcher should navigate on the target version. */
  path: string;
  /** False when the current slug has no route in the target version (landing on the catalog instead). */
  available: boolean;
}

/** Map the current pathname to its equivalent route on `to` (a different version, same
 *  platform). Falls back to the product catalog when the target version has no route for
 *  the current slug — a `main`-only edge case, since proposals always inherit `main`'s
 *  screens for anything they haven't forked. */
export function mapVersion(to: VersionId, platform: PlatformId, pathname: string): RouteMapResult {
  const { slug } = parseRoutedPath(pathname);
  if (!slug) return { path: resolvePath(to, platform, '/'), available: true };
  const exists = routeDefsFor(to, platform).some((r) => r.path === slug);
  return exists
    ? { path: resolvePath(to, platform, `/${slug}`), available: true }
    : { path: resolvePath(to, platform, '/products'), available: false };
}
