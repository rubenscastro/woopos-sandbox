# POS Sandbox

A clickable React prototype of WooCommerce POS (WooPOS), recreating Android and iOS flows
side by side for fast design iteration outside of Android Studio/Xcode.

## Requirements

- Node.js 18+
- npm

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). The app loads into a device
simulator with a chrome sidebar for switching platform (Android/iOS), device size
(tablet/phone), theme (light/dark), and flow.

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Project structure

- `src/screens/android/`, `src/screens/ios/` — one screen component per flow, per platform
- `src/components/android/`, `src/components/ios/` — per-platform UI component libraries
- `src/mocks/android/`, `src/mocks/ios/` — sample data and copy per flow
- `src/state/` — shared, platform-agnostic state (e.g. cart math)
- `src/theme/tokens.css` — shared design tokens (colors, spacing, radius, typography)
- `src/device/` — the simulator shell (device frame, chrome sidebar, platform/theme switchers)

## Ground truth docs

- `DESIGN.md` — the design system (colors, typography, spacing, components)
- `FLOWS.md` / `FLOWS.ios.md` — the build checklist per platform, with source paths into the
  real `woocommerce-android` / `woocommerce-ios` repos
- `FLOW_PARITY.md` — cross-platform route mapping used by the platform switcher
- `VERSIONS.md` — the versioning system for proposal/exploration branches within the app

This is a prototyping tool for iterating on the existing WooPOS design — it has no real
backend, payment processing, or hardware integration.
