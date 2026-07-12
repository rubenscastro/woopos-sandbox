import type { RouteDef } from './androidRouteDefs';

/**
 * Merges a platform's `main` route defs with a version's overrides — overridden paths use
 * the override's element, any new paths the version introduces are added, and everything
 * else falls back to `main`'s screen. This is how a proposal can fork just the screens it's
 * actually redesigning while staying clickable end-to-end for the rest of the flow.
 */
export function mergeRouteDefs(base: RouteDef[], overrides: RouteDef[] = []): RouteDef[] {
  const merged = new Map(base.map((r) => [r.path, r]));
  for (const o of overrides) merged.set(o.path, o);
  return Array.from(merged.values());
}
