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
 * the main screen it replaces (or a new path, for a screen main doesn't have). Anything not
 * listed falls back to `main`'s screen via `mergeRouteDefs`.
 */
export const versionOverrides: Partial<Record<string, VersionOverrides>> = {
  'scaling-pos-experience': {
    // System Events (see src/components/versions/scaling-pos-experience/android/systemEvents/)
    // replaces the always-on card-reader status pill on POS Home only.
    android: [{ path: 'products', element: <ScalingItemSelection /> }],
    ios: [],
  },
};
