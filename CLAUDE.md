# Project instructions

This project recreates WooPOS (WooCommerce's point-of-sale) flows from both the Android
and iOS apps as a clickable React prototype, for fast design iteration outside of Android
Studio/Xcode.

## Ground truth

- `DESIGN.md` at the project root is the design system — colors, typography, spacing,
  radius, elevation, and component specs. Use it for every visual decision. Don't invent
  new colors, spacing values, or component patterns not documented there.
- `FLOWS.md` is the build checklist — one entry per real POS flow, with exact source paths
  in the `woocommerce-android` repo. Work through it in priority order unless told
  otherwise.
- The actual Kotlin/Compose source (sparse-cloned locally, see FLOWS.md) is the source of
  truth for layout, copy, states, and interactions — read the real files for a flow before
  building its prototype. Don't guess or infer from the flow name alone.

## Output format

This is a single React project (Vite + React + TypeScript), not standalone HTML files.

- Scaffold once with `npm create vite@latest . -- --template react-ts`, then set up
  React Router for navigation between flows.
- One route + one top-level screen component per flow, e.g.
  `src/screens/ItemSelectionProducts.tsx` mounted at `/products`. Route names should match
  the flow slugs in `FLOWS.md`.
- Shared UI goes in `src/components/` — build it as a real component library mirroring
  `DESIGN.md`'s Components section (e.g. `Button.tsx`, `Card.tsx`, `Chip.tsx`,
  `ProductListItem.tsx`), not copy-pasted markup per screen. Later flows should reuse
  earlier flows' components rather than redefining them.
- Encode `DESIGN.md`'s tokens once as the styling foundation (e.g. a Tailwind theme config
  or a CSS variables file) — colors, spacing, radius, typography — and reference tokens
  from there, not hardcoded values scattered across components.
- Match `DESIGN.md`'s adaptive behavior with real responsive logic (CSS breakpoints or a
  `useBreakpoint` hook), matching the phone / small-tablet / tablet behavior described
  there — including the structural split (cart+items side-by-side on tablet vs. separate
  full-screen panes on phone per `home/phone/`), not just fluid resizing.
- Use real copy and realistic sample data pulled from each screen's `@Preview` composables
  — not lorem ipsum. Put sample data in a `src/mocks/` file per flow so it's easy to swap
  later.
- Each prototype should be clickable end-to-end for its own flow (e.g. tapping a product
  adds it to visible React state) even though it's static — no real backend, payment, or
  hardware integration. Cart state can be lifted to a simple context/provider if multiple
  flows need to share it (e.g. products → cart → checkout).
- Add a lightweight home/index route listing all built flows as links, so the whole
  prototype is navigable from one entry point as it grows.

## Multi-platform architecture

This project supports both Android and iOS versions of each flow, switchable via a
persistent UI control, in one React app.

**Shared vs. per-platform:**
- **Tokens** are mostly shared, implemented as **CSS custom properties**, not a TS module.
  `src/theme/tokens.css` holds the shared baseline from `DESIGN.md`; `src/theme/utilities.css`
  holds shared utility classes. Platform/theme/device variation is **attribute-driven** and
  cascades from `<html>` / the device screen — the same pattern already used for theme and
  device size:
  - `[data-theme="light" | "dark"]` (on `<html>`)
  - `[data-device="tablet" | "smallTablet" | "phone"]` (on the device screen)
  - `[data-platform="android" | "ios"]` (on `<html>`, set by `PlatformProvider`)
  `:root` is the shared/Android baseline. iOS deltas live in a small `[data-platform='ios']`
  override block (per `DESIGN-ios-deltas.md`: font family, the `bodyXLargeRegular` weight
  quirk, shape/elevation TBD) — keep it small; if that block grows large, the "shared
  tokens" assumption may be wrong for that area and is worth re-checking against source.
  There is no `tokens.ts` / `*.overrides.ts` structure — that was a pre-implementation guess;
  the real app uses the CSS-variable + `[data-platform]` approach above.
- **Components, screens, copy, and illustrations are NOT shared** — build them fully
  separately per platform:
  - `src/components/android/` and `src/components/ios/`. A shared prop-interface layer
    (`src/components/types.ts`) is deferred until something genuinely shared consumes a
    swappable component — screens are per-platform, so nothing needs it yet.
  - `src/screens/android/` and `src/screens/ios/`
  - `src/mocks/android/` and `src/mocks/ios/` (copy, sample data)
  - `src/assets/android/` and `src/assets/ios/` (illustrations, icons)
  The simulator shell (device frame, status bar, on-screen keyboard, chrome sidebar with the
  platform/device/theme switchers) lives in `src/device/` and is shared by both platforms;
  platform-specific shell polish (e.g. iOS status-bar glyphs) can be layered in later.
- **Non-visual state/logic is shared** where it's genuinely platform-agnostic (e.g. cart
  math, order totals) — put this in `src/state/`, typed against shared interfaces, even
  though the UI consuming it differs per platform.

**Routing:** separate route trees, `/android/*` and `/ios/*`, each with their own
home/index route. Use `FLOWS.md` and `FLOWS.ios.md` as the respective build checklists.

**Platform switcher:** a persistent control (e.g. segmented control in a fixed header)
that toggles platform via context, persisted to localStorage. On toggle, use
`FLOW_PARITY.md` to map the current route to its equivalent on the other platform; if no
confirmed equivalent exists, land on that platform's home route instead of a broken page.

**Building iOS flows:** treat `FLOWS.ios.md` as a first-pass directory scan, not a
verified spec — several entries are flagged "verify" because it's unclear from folder
names alone whether something is a standalone screen or a shared pattern (e.g. "Infinite
Scroll" may belong in `src/components/ios/` rather than `src/screens/ios/`). Confirm by
reading the actual source, and update `FLOWS.ios.md`/`FLOW_PARITY.md` once confirmed
rather than leaving stale guesses in place.

## Versioning

`VERSIONS.md` is the ground truth for the versioning system — `main` (current shipped
flows) plus any number of proposals (new-feature explorations), switchable via a Version
control in the chrome sidebar alongside Platform/Device/Theme. Proposals are routed under
`/versions/<id>/android|ios/*` and fork only the screens they're actually redesigning —
anything not forked falls back to `main`'s screen automatically. Register a new proposal in
`src/versions/registry.ts` + `src/versions/overrides.tsx`; no other routing changes are
needed. Forked screens live in `src/screens/versions/<id>/android|ios/`, mirroring the
platform split.

## Working style

- Build one flow at a time. After each one, stop and let the designer review before moving
  to the next — don't batch multiple flows into one uninterrupted run.
- If a flow depends on a component or pattern not yet in `DESIGN.md` (new to that specific
  screen), note it in a code comment rather than silently inventing a style.
- Prefer matching the real app's structure over "improving" it — this is a prototyping
  tool for iterating on the existing design, not a redesign exercise, unless explicitly
  asked to explore alternatives.
