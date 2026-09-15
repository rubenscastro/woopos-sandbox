import type { RouteDef } from '../routes/androidRouteDefs';
import { ItemSelection as ScalingItemSelection } from '../screens/versions/scaling-pos-experience/android/ItemSelection';

export interface VersionOverrides {
  android?: RouteDef[];
  ios?: RouteDef[];
}

/**
 * Per-version screen overrides, keyed by VersionId (see registry.ts). Add an entry here
 * when a proposal forks a screen — put the forked component under
 * `src/screens/versions/<id>/android|ios/` and list it below with the same route path as
 * the Trunk screen it replaces (or a new path, for a screen Trunk doesn't have). Anything not
 * listed falls back to Trunk's screen via `mergeRouteDefs`.
 */
export const versionOverrides: Partial<Record<string, VersionOverrides>> = {
  'scaling-pos-experience': {
    // System Events (see src/components/versions/scaling-pos-experience/android/systemEvents/)
    // replaces the always-on card-reader status pill on POS Home only.
    android: [{ path: 'products', element: <ScalingItemSelection /> }],
    ios: [],
  },
  // Fresh copy of Trunk — nothing forked yet, so every route falls through to Trunk's
  // screen. Add entries here as cash-reconciliation screens get built.
  'cash-reconciliation': {
    android: [],
    ios: [],
  },
};
