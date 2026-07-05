# Project instructions

This project recreates WooPOS (WooCommerce's Android point-of-sale) flows as clickable
HTML prototypes, for fast design iteration outside of Android Studio.

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

## Working style

- Build one flow at a time. After each one, stop and let the designer review before moving
  to the next — don't batch multiple flows into one uninterrupted run.
- If a flow depends on a component or pattern not yet in `DESIGN.md` (new to that specific
  screen), note it inline in the HTML as a comment rather than silently inventing a style.
- Prefer matching the real app's structure over "improving" it — this is a prototyping
  tool for iterating on the existing design, not a redesign exercise, unless explicitly
  asked to explore alternatives.
