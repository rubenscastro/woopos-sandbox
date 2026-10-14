# Versioning

This prototype supports multiple **versions** side by side: **Trunk** (id `main`) and any
number of **proposals** — design explorations for new features, built in their own space so
they don't disturb Trunk. Switch between them with the **Version** select at the top of the
chrome sidebar.

**Trunk** tracks the flows currently on the iOS and Android trunks. It is the version all
flow-parity work is measured against (`FLOW_PARITY.md`, `SYNC.md`) — keep it matching source.
Proposals fork off it and are *not* expected to match source; don't file their divergences as
parity findings.

Its id stays `main` so existing routes, bookmarks and stored preferences keep working — only
the label reads "Trunk".

## Registry

`src/versions/registry.ts` is the single source of truth for which versions exist:

```ts
export const VERSIONS: VersionEntry[] = [
  { id: 'main', label: 'Trunk', description: '...' },
  { id: 'scaling-pos-experience', label: 'Scaling POS experience', description: '...' },
  { id: 'cash-reconciliation', label: 'Cash reconciliation', description: '...' },
  { id: 'multi-payment-methods', label: 'Multi Payment Methods', description: '...' },
  { id: 'custom-amounts', label: 'Custom amounts', description: '...' },
];
```

Adding a new proposal is two steps:
1. Add an entry to `VERSIONS` in `registry.ts` (and to the `VersionId` union at the top of
   that file).
2. Add an entry to `versionOverrides` in `src/versions/overrides.tsx` (start with empty
   `android`/`ios` arrays — see below).

No routing code needs to change — routes for every proposal are generated from this
registry in `App.tsx`.

### One-platform proposals

A proposal exploring a single platform says so with `platforms`:

```ts
{ id: 'cash-reconciliation', label: 'Cash reconciliation', platforms: ['ios'], … }
```

The other platform then stops existing for that version: its routes aren't generated, the
Platform switcher disappears from the chrome's Settings menu, and `resolvePath()` clamps to
the declared platform — so switching into the proposal from the other side, or opening an old
URL for it, lands on the built platform instead of a dead route. Omit `platforms` for both.

Without this the unbuilt side still routes, and shows Trunk's screens back — which reads as
"this proposal looks identical over here" rather than "this proposal isn't about that
platform".

## Routing

- Trunk (`main`) is unprefixed: `/android/*`, `/ios/*`.
- Every proposal routes under `/versions/<id>/android/*` and `/versions/<id>/ios/*`, e.g.
  `/versions/scaling-pos-experience/android/products` — except where `platforms` narrows it
  to one (see above).
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

Any path not listed falls back to Trunk's screen for that route (via `mergeRouteDefs` in
`src/routes/mergeRouteDefs.ts`), so a brand-new proposal with empty override arrays is
already clickable end-to-end — it's just Trunk until you start forking screens. That is what
"copy of Trunk" means here: no files are duplicated, the proposal simply inherits every
screen until one is deliberately forked. `cash-reconciliation` is in exactly that state.

Put forked screens under `src/screens/versions/<id>/android/` and
`src/screens/versions/<id>/ios/` (mirroring the `src/screens/android/` /
`src/screens/ios/` split), with matching mocks under `src/mocks/versions/<id>/` and any
new components under `src/components/versions/<id>/` if they don't belong in the shared
library.

## Switching versions

The **Version** select at the top of the chrome sidebar (`src/device/VersionSwitcher.tsx`,
mounted in `DeviceLayout`) swaps the version while staying on the same platform and, where
possible, the same screen — it falls back to the product catalog if the target version has
no route for the current screen (see
`mapVersion()` in `src/versions/routing.ts`). This mirrors how the Platform switcher already
behaves for Android ↔ iOS (`FLOW_PARITY.md`).

Active version is persisted to `localStorage` and reflected as `data-version` on `<html>`
(same attribute-driven pattern as `[data-platform]` / `[data-theme]` / `[data-device]`), in
case a proposal ever needs a CSS hook — none exists yet, since versions differ by screen
content, not by design tokens.

## Flag-driven proposals

A proposal that tweaks small details across screens that are used in many places (the cart row,
the item list) doesn't have to fork them: it can ride a feature flag that its `flagDefaults`
turns on (flags are held per version, so Trunk is untouched). `custom-amounts` does this with
the `customAmounts` flag — see `src/state/flags.ts`. It changes, on both platforms and both form factors:

- **Flow:** tapping "Custom amount" opens a full-screen modal route (`custom-amount`, forked in
  `overrides.tsx`), like Issue refund: Amount (Continue disabled until a value) → Review (Edit
  amount / Edit name / Charge taxes / Add to cart) → Edit amount or Edit name → back to Review.
  Figma: POS Playground, nodes 4262-25893 (amount), 4262-25699 (review), 4262-25837 (name).
- **Icon:** SF Symbol `square.and.pencil` (iOS) / Material `edit_square` (Android) for the
  Custom amount row and its cart tile.
- **Cart row:** taxable custom amounts show "Plus taxes" under the amount. Tapping the card opens
  Review for that line (Save changes / Cancel); the trash still deletes without opening it.
