# iOS token deltas from DESIGN.md

The Android and iOS POS design systems share the same underlying language — confirmed by
comparing `WooPosTheme.kt`/`WooPosTypography.kt` (Android) against
`Color+POSColorPalette.swift`/`POSFontStyle.swift` (iOS, `Modules/Sources/PointOfSale/`).
Use `DESIGN.md` as the baseline for iOS too; only these differences apply.

## Colors
Spot-checked `posPrimary` → `#873EFF`, identical to Android. Token *names* also match
almost 1:1 (`posAlert`, `posDefault`, `posErrorLowest`, `posOnSurface`, etc.) — treat
`DESIGN.md`'s color table as valid for iOS unless a specific screen's source shows
otherwise. Values are defined per xcasset (`Modules/Sources/PointOfSale/Colors/
POSColorPalette.xcassets/`) with explicit light/dark variants, same as Android.

## Typography
Font **sizes** are identical to Android: heading 36 / bodyXLarge 30 / bodyLarge 24 /
bodyMedium 20 / bodySmall 16 / caption 14, with the same tablet/phone adaptive split
(phone sizes: 24/22/18/16/14/12 — close to but not exactly Android's 0.85× multiplier,
treat as its own fixed phone scale rather than a percentage).

Differences from `DESIGN.md`:
- **Font family:** SF Pro (`Font.system`, the OS default), not Roboto. This is the biggest
  real visual difference between platforms.
- **Weight quirk:** `bodyXLargeRegular` renders as **semibold**, not regular (Android's
  `body-xl` is regular 400). Button/icon symbol text also defaults to semibold on iOS.
- iOS respects **Dynamic Type** (the user's OS-level text-size setting) with a floor per
  style (11–16px depending on style) and an accessibility-size ceiling — a prototype
  doesn't need to implement this, but don't hardcode font sizes so small that a "large
  text" toggle would be meaningless if you ever demo that.

## Shape / elevation
Not yet confirmed from source — verify while building rather than assuming Android's
values transfer. iOS/HIG conventions generally use larger corner radii and lighter,
softer shadows than Material; check `Modules/Sources/PointOfSale/` for actual shape
constants before finalizing `src/theme/ios.overrides.ts`.

## What this means for implementation

Don't build a second full token file. Tokens are **CSS custom properties**, and platform
variation is attribute-driven (`[data-platform='ios']` on `<html>`, alongside the existing
`[data-theme]` / `[data-device]` attributes), not a TS module. So:
- `src/theme/tokens.css` — the shared baseline (from `DESIGN.md`); `:root` is the
  shared/Android values.
- A small `[data-platform='ios']` block in `src/theme/tokens.css` — just the font-family
  swap (`--font-family` → SF Pro), the `bodyXLargeRegular` weight quirk, and whatever
  shape/elevation deltas turn up. Keep it minimal.
- No Android override is needed — `:root` already reflects Android natively.

(An earlier draft of this file proposed `src/theme/tokens.ts` + `ios.overrides.ts` /
`android.overrides.ts`. That was written before seeing the real app, which already uses a
mature attribute-driven CSS-variable system; we extended that instead of rewriting it.)
