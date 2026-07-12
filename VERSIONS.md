# Versioning

This prototype supports multiple **versions** side by side: `main` (the current shipped
WooPOS flows) and any number of **proposals** — design explorations for new features, built
in their own space so they don't disturb `main`. Switch between them with the **Version**
control in the chrome sidebar.

## Registry

`src/versions/registry.ts` is the single source of truth for which versions exist:

```ts
export const VERSIONS: VersionEntry[] = [
  { id: 'main', label: 'Main', description: '...' },
  { id: 'scaling-pos-experience', label: 'Scaling POS experience', description: '...' },
];
```

Adding a new proposal is two steps:
1. Add an entry to `VERSIONS` in `registry.ts` (and to the `VersionId` union at the top of
   that file).
2. Add an entry to `versionOverrides` in `src/versions/overrides.tsx` (start with empty
   `android`/`ios` arrays — see below).

No routing code needs to change — routes for every proposal are generated from this
registry in `App.tsx`.

## Routing

- `main` is unprefixed, same as before: `/android/*`, `/ios/*`.
- Every proposal routes under `/versions/<id>/android/*` and `/versions/<id>/ios/*`, e.g.
  `/versions/scaling-pos-experience/android/products`.
- `useNav()` (`src/device/platformNav.ts`) and the chrome's `resolvePath()`
  (`src/versions/routing.ts`) are both version-aware, so screens keep calling
  `navigate('/totals')` and it resolves into whichever version+platform is currently active
  — no call site needs to know about versioning.

## Overrides — fork only what you're redesigning

A proposal doesn't need to duplicate every screen. `src/versions/overrides.tsx` maps each
proposal to a list of route overrides per platform:

```ts
export const versionOverrides = {
  'scaling-pos-experience': {
    android: [{ path: 'products', element: <ScalingItemSelection /> }],
    ios: [],
  },
};
```

Any path not listed falls back to `main`'s screen for that route (via `mergeRouteDefs` in
`src/routes/mergeRouteDefs.ts`), so a brand-new proposal with empty override arrays is
already clickable end-to-end — it's just `main` until you start forking screens.

Put forked screens under `src/screens/versions/<id>/android/` and
`src/screens/versions/<id>/ios/` (mirroring the `src/screens/android/` /
`src/screens/ios/` split), with matching mocks under `src/mocks/versions/<id>/` and any
new components under `src/components/versions/<id>/` if they don't belong in the shared
library.

## Switching versions

The **Version** dropdown in the chrome sidebar (`src/device/VersionSwitcher.tsx`) swaps the
version while staying on the same platform and, where possible, the same screen — it falls
back to the product catalog if the target version has no route for the current screen (see
`mapVersion()` in `src/versions/routing.ts`). This mirrors how the Platform switcher already
behaves for Android ↔ iOS (`FLOW_PARITY.md`).

Active version is persisted to `localStorage` and reflected as `data-version` on `<html>`
(same attribute-driven pattern as `[data-platform]` / `[data-theme]` / `[data-device]`), in
case a proposal ever needs a CSS hook — none exists yet, since versions differ by screen
content, not by design tokens.
