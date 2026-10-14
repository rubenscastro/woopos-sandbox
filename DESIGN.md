---
version: alpha
name: WooPOS
description: >
  Design system for WooCommerce POS (Android), extracted directly from
  WooCommerce/src/main/kotlin/com/woocommerce/android/ui/woopos/common/composeui/designsystem
  in woocommerce/woocommerce-android. Values below are the light-mode / tablet baseline;
  see the Colors and Layout sections for dark-mode and adaptive (phone/small-tablet) variants.
colors:
  primary: "#873EFF"
  onPrimary: "#FFFFFF"
  secondary: "#D1C1FF"
  onSecondary: "#101517"
  primaryContainer: "#873EFF"
  onPrimaryContainer: "#FFFFFF"
  secondaryContainer: "#000000"
  onSecondaryContainer: "#FFFFFF"
  surface: "#F6F7F7"
  surfaceDim: "#F6F7F7"
  surfaceBright: "#FFFFFF"
  surfaceContainerLowest: "#FFFFFF"
  surfaceContainerLow: "#FFFFFF"
  surfaceContainerHighest: "#8C8F94"
  onSurface: "#101517"
  inverseSurface: "#101517"
  inverseOnSurface: "#FFFFFF"
  error: "#D63638"
  onError: "#FFFFFF"
  errorLowest: "#F7EBEC"
  onErrorLowest: "#691C1C"
  success: "#00A32A"
  onSuccess: "#FFFFFF"
  alert: "#F16618"
  onAlert: "#FFFFFF"
  infoLowest: "#D6DDF9"
  onInfoLowest: "#1F3286"
  default: "#DCDCDE"
  onDefault: "#101517"
  disabledContainer: "#DCDCDE"
  onDisabledContainer: "#A7AAAD"
  outline: "#787C82"
  outlineVariant: "#DCDCDE"
  onSurfaceVariantLowest: "#8C8F94"
  onSurfaceVariantHighest: "#50575E"
  tertiaryIconColor: "#3C087E"
typography:
  heading:
    fontFamily: Roboto
    fontSize: 36px
    lineHeight: 40px
    fontWeight: 700
  body-xl:
    fontFamily: Roboto
    fontSize: 30px
    lineHeight: 32px
    fontWeight: 400
  body-lg:
    fontFamily: Roboto
    fontSize: 24px
    lineHeight: 32px
    fontWeight: 400
  body-md:
    fontFamily: Roboto
    fontSize: 20px
    lineHeight: 32px
    fontWeight: 400
  body-sm:
    fontFamily: Roboto
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 400
  caption:
    fontFamily: Roboto
    fontSize: 14px
    lineHeight: 20px
    fontWeight: 400
rounded:
  none: 0px
  xs: 4px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
spacing:
  none: 0px
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 40px
  xxxl: 48px
  huge: 80px
  gigantic: 104px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.md}"
    typography: "{typography.body-lg}"
    height: 80px
  button-primary-disabled:
    backgroundColor: "{colors.disabledContainer}"
    textColor: "{colors.onDisabledContainer}"
  button-outlined:
    backgroundColor: transparent
    textColor: "{colors.onSurface}"
    rounded: "{rounded.md}"
    typography: "{typography.body-lg}"
    height: 80px
  button-small:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.md}"
    typography: "{typography.body-sm}"
    height: 40px
  chip:
    backgroundColor: "{colors.surfaceContainerLow}"
    textColor: "{colors.onSurface}"
    rounded: "{rounded.md}"
    typography: "{typography.body-lg}"
    padding: 16px
  card:
    backgroundColor: "{colors.surfaceContainerLowest}"
    rounded: "{rounded.md}"
  product-list-item:
    backgroundColor: "{colors.surfaceContainerLowest}"
    rounded: "{rounded.md}"
    typography: "{typography.body-lg}"
    height: 112px
  cart-line-item:
    backgroundColor: "{colors.surfaceContainerLowest}"
    rounded: "{rounded.md}"
    typography: "{typography.body-lg}"
  search-input:
    backgroundColor: "{colors.surfaceContainerLow}"
    textColor: "{colors.onSurface}"
    rounded: "{rounded.md}"
---

## Overview

WooPOS is the in-person checkout experience inside the WooCommerce Android app —
associates browse a product catalog, build a cart, and take payment on a handheld or
tablet. The visual language is utilitarian and high-contrast: a single Woo Purple accent
against neutral surfaces, generous tap targets, and heavy reliance on card-based rows
rather than dense tables, since the primary input method is touch in a retail environment,
often under variable lighting.

Everything in this file is sourced directly from the app's own design-system package
(`ui/woopos/common/composeui/designsystem`) and the real screens that consume it
(`ui/woopos/home/items`, `ui/woopos/home/cart`) — not from a separate design tool. Treat
this as the source of truth over any visual mockup; if the two disagree, match the code.

**Adaptive sizing is a first-class concern.** WooPOS runs across phones, small tablets,
and full tablets, and nearly every spacing, radius, and font-size token scales down at
smaller breakpoints rather than staying fixed (see Layout section). A coding agent
prototyping a WooPOS screen should build the layout responsively, not pixel-lock it to one
device size.

## Colors

The palette is one accent (Woo Purple) over a neutral gray scale, with dedicated
semantic colors for success, error, and alert states. All tokens above are **light mode /
default theme** values. Dark mode swaps most surface and "on-" colors; the ones that
differ meaningfully are:

| Token | Light | Dark |
|---|---|---|
| surface | `#F6F7F7` | `#101517` |
| surfaceBright | `#FFFFFF` | `#1D2327` |
| surfaceContainerLowest | `#FFFFFF` | `#3C434A` |
| onSurface | `#101517` | `#FFFFFF` |
| error | `#D63638` | `#F86368` |
| onError | `#FFFFFF` | `#101517` |
| errorLowest | `#F7EBEC` | `#FFABAF` |
| success | `#00A32A` | `#1ED15A` |
| onSuccess | `#FFFFFF` | `#101517` |
| outline | `#787C82` | `#8C8F94` |
| disabledContainer | `#DCDCDE` | `#50575E` |
| tertiaryIconColor | `#3C087E` | `#720EEC` |

- **Primary (`#873EFF`):** The sole accent. Drives primary buttons, selected states, and
  focus indicators. Used sparingly — most of the UI is neutral gray.
- **Surface family:** `surface` is the app background; `surfaceContainerLowest` /
  `surfaceBright` are what cards and rows sit on top of, one step lighter (in light mode)
  than the background so cards read as "raised" without needing a visible border.
- **Error / Success / Alert:** Reserved for status — payment failures, stock warnings,
  confirmations. Each has a paired "Lowest" background variant (e.g. `errorLowest`) meant
  for subtle banners/badges rather than solid fills.
- **Default:** A neutral gray used for unselected chips/toggles and inert badges — not a
  "disabled" state, just the unselected sibling of `primary`.

## Typography

Values are given in px for spec compliance; in the original Android source these are `sp`
(scalable pixels) — treat the numbers as equivalent. Single font family (Roboto on Android), six sizes, no distinct weight scale beyond bold vs
regular — most emphasis is done with `fontWeight: Bold` on `body-lg`/`body-sm`, not a
separate typographic style. There is no dedicated "small text"/overline style; `caption`
(14sp) is the smallest.

**Adaptive scaling:** every size above is the **tablet** value. On a phone the multiplier
is **0.85×**, on a small tablet **0.9×** (full tablet is 1×, i.e. the values shown), with a
hard floor of 14sp so nothing becomes illegible. A coding agent should implement this as a
breakpoint-based scale, not fixed pixel values.

## Layout

**Spacing** above is the tablet baseline. On phones it's roughly halved and rounded up to
the nearest 4px; small tablets use ~0.75×. In practice this means: don't hardcode `md:
16px` everywhere — treat it as "the medium spacing token for the current breakpoint."

**Component sizing** (touch targets and image/icon slots) uses a parallel adaptive scale,
independent from spacing:

| Token | Tablet | Use |
|---|---|---|
| XXSmall | 40px | small button height |
| XSmall | 56px | circular icon button diameter |
| Small | 80px | standard button height |
| Medium | 96px | — |
| Large | 112px | product list item height, product image slot |
| XLarge | 160px | — |
| XXLarge | 256px | — |

**Icon sizes** are separate again: XSmall 16px, Small 24px, Medium 32px, Large 40px,
XLarge 48px.

**Breakpoints:** Phone (not tablet-sized), Small Tablet (short side < 800dp), Tablet (short
side ≥ 800dp). On phone, the cart and product list stack into separate full-screen panes
(`WooPosPhoneCartScreen`, `WooPosPhoneProductsScreen`) rather than sharing the screen side
by side — this is a structural layout change, not just a resize.

**Product list is a single-column list, not a grid.** Each row is full-width: a square
image/icon on the left (Large component size), name + price stacked in the middle, and (for
variable products) a chevron on the right indicating drill-in. Don't default to a 2–3
column card grid unless you're deliberately deviating from the real app.

## Elevation & Depth

WooPOS uses a custom card shadow (not Material's default elevation, which the codebase
explicitly avoids because Material's shadow direction didn't match the design). Two
elevation levels exist, each with breakpoint-adaptive values:

| Level | Tablet | Small Tablet | Phone |
|---|---|---|---|
| Medium | 8px | 8px | 4px |
| Large | 24px | 20px | 16px |

Two shadow "types" control softness rather than distance: **Soft** (10% opacity, wider
blur — used on product/cart cards and chips) and **Normal** (24% opacity, tighter blur).
Default to Soft for list items; reserve Normal for more prominent standalone cards.

## Shapes

Corner radius is adaptive per breakpoint — tablet values shown in the token table above,
but Medium drops to 4px and Large drops to 8px on phone. `rounded.md` (8px tablet) is the
default for cards, buttons, chips, and product rows; `rounded.xl` (24px) is reserved for
larger surfaces. There is no pill/full-round token in the code (unlike the Figma library,
which has a "Full" 200px token) — toggle/chip components use `rounded.md`, not a pill
shape.

## Components

Real composables from `ui/woopos/common/composeui/component/`, callable as-is by name if
your prototype is Kotlin/Compose, or to be mirrored structurally if it's HTML:

**Buttons**
- `WooPosButton` — primary filled button, 80px height, `body-lg` bold text, states:
  `ENABLED` / `DISABLED` / `LOADING` (shows a spinner in place of text, same width)
- `WooPosButtonSmall` — same but 40px height, `body-sm` text
- `WooPosOutlinedButton` / `WooPosOutlinedButtonSmall` — transparent fill, 2px border in
  `inverseSurface` (or `disabledContainer` when disabled)
- `WooPosToggleButton` — renders as `WooPosButtonSmall` when selected,
  `WooPosOutlinedButtonSmall` when not — this is how filter/category toggles work, not a
  dedicated chip-selected state
- `WooPosCircularIconButton` — circular, XSmall component size (56px), icon-only
- `WooPosIconButton` — square icon button variant

**Surfaces**
- `WooPosCard` — the base card: custom-drawn drop shadow (not Material elevation),
  optional 2px `onSurface` border when `isSelected`, background defaults to
  `surfaceContainerLowest`
- `WooPosChip` — a `WooPosCard` wrapper with optional leading icon + text row, `md`
  padding, Soft shadow — used for search/filter chips

**Product & cart**
- `WooPosProductCard` (in the items list) — the real product row: image (Large size) +
  name (`body-lg` bold, 1 line, ellipsis) + price/detail line below it + optional chevron
  for variable products. Backed by `WooPosCard` with Soft shadow.
- Cart line item (`ProductItem` in `WooPosCartScreen.kt`) — similar row pattern inside the
  cart list, with a remove affordance (`RemoveItemFromCartButton`)
- `WooPosCouponCard` — same row pattern, tag icon instead of product image, dims to
  `disabledContainer` background when expired
- Empty cart state (`CartBodyEmpty`) — centered icon (Small component size, 50% opacity
  `onSurfaceVariantLowest`) + body text with an inline clickable "scan a barcode" link in
  `primary` with underline

**Input & navigation**
- `WooPosSearchInput` — search field, expands/collapses between an icon-only and full
  state
- `WooPosToolbar` — top bar used consistently across POS screens
- `WooPosOverflowMenu` — kebab-menu dropdown for secondary actions (e.g. custom amount row)

## Do's and Don'ts

- **Do** treat spacing, radius, and font sizes as breakpoint-dependent, not fixed pixels —
  the real app scales all three down on phones.
- **Do** use the single-column list row pattern for products and cart items; don't invent
  a card-grid layout unless explicitly asked to deviate from the real app.
- **Do** use `WooPosToggleButton`'s selected/unselected button pair for filters rather than
  a separate "selected chip" style — that's not how the real component works.
- **Don't** apply Material Design's default elevation/shadow — WooPOS draws its own
  shadow because Material's default light-source direction didn't match the intended look.
- **Don't** use a pill/fully-rounded shape for chips or toggles — the real components use
  `rounded.md` (8px), not a capsule.
- **Don't** invent a fourth color accent — the entire system is one purple accent over
  neutral grays plus semantic success/error/alert; resist adding new hues for one-off
  states.
