# WooPOS iOS flow manifest

Mirrors `FLOWS.md` (Android), sourced from `Modules/Sources/PointOfSale/Presentation/` in
`woocommerce-ios`. Folder names are the iOS team's own flow boundaries — they don't map
1:1 to the Android list, see `FLOW_PARITY.md` for how the two line up.

**How to use this file (for Claude Code):** same process as `FLOWS.md` — read the real
source for a flow before building it, apply `DESIGN.md` + `DESIGN-ios-deltas.md` for
tokens, and check `src/components/ios/` for an existing component before building a new
one.

## Flows (from Presentation/)

1. **Item Selector** — `Presentation/Item Selector/` — ✅ VERIFIED (built): the catalog/home.
   `ItemList` is a **single-column `LazyVStack` of full-width cards** (not a grid): 112pt
   square image on the left + name (bodyLarge bold, 2 lines) + detail (price / "Options
   available") on `posSurfaceContainerLowest` with the iOS card border. `PointOfSaleDashboardView`
   lays it out beside the cart — tablet HStack items (~65%, left) + `CartView` (~35%, right)
   with the totals pane sliding in at checkout; phone shows items + a bottom cart button that
   opens `CartView` as a `.medium/.large` sheet. Header (`POSPageHeaderView`) = Products /
   Coupons tabs + trailing search + (Coupons tab) "+" create-coupon. Structurally close to
   Android, iOS-styled. Built at `/ios/products`; uses the shared cart state.
2. **Item Search** — `Presentation/Item Search/` — ✅ VERIFIED (built): it IS its own flow on
   iOS. Tapping search swaps the header for a `POSSearchField` (back button + autofocused field,
   primary focus ring). Empty field → `POSPreSearchView`: products show "Recent searches" chips
   + a "Popular products" list; coupons show recent-search chips or "Search your store". Typing
   → filtered results. Built into `/ios/products` (`PosPreSearch` + the header search field).
   Android treats search as an inline filter sub-mode with no popular-products pre-search.
3. **Infinite Scroll** — `Presentation/Infinite Scroll/` — ✅ VERIFIED: it's a reusable
   `InfiniteScrollView` **component** (used by `ItemList` and `Orders/POSOrderListView`), NOT a
   screen. No standalone flow to build; native scrolling covers it in the prototype.
4. **Coupons** — `Presentation/Coupons/` — ✅ VERIFIED (built): this folder is **not** a coupon
   list. It's `POSCouponCreationSheet.swift` — the **"Create coupon"** flow: from the Coupons
   tab's overflow, tap "Create coupon" → a discount-type selection sheet (Percentage / Fixed
   cart / Fixed product + Cancel) → the coupon editor for that type (host-app external view) →
   the created coupon is added to the cart. Coupon *browsing* is the Coupons tab inside
   `Item Selector/` (`ItemListView` `.coupons` tab + `CouponCardView`), not a separate flow.
   Presented as a **sheet over the item list** (`ItemListView` → `.posCouponCreationSheet`), not
   a separate screen — so in the prototype the Coupons-tab "+" opens the sheet in place
   (`CreateCouponSheet`), and `/ios/add-coupon` just opens the item selector's Coupons tab with
   that sheet auto-presented. Android has the same "Create coupon" action (Coupons-tab "+"),
   but goes straight to the editor with no discount-type sheet.
5. **Custom Amount** — `Presentation/Custom Amount/` — ✅ VERIFIED (built): a **pushed full-screen
   form** (`AddCustomAmountView`, not a modal), reached from a `CustomAmountEntryRow` at the top of
   the products list (tag + plus avatar, "Custom amount" / "Add a one-off charge."). Form: big
   amount display ("$" + value), a "Charge taxes" toggle, a Name field (placeholder "Custom
   amount"), and "Add custom amount" (disabled until amount > 0). Adds to the shared cart. Built
   into `/ios/products` (`AddCustomAmountForm`). Android's is a modal dialog instead.
6. **Card Present Payments** — `Presentation/Card Present Payments/`
7. **CardReaderConnection** — `Presentation/CardReaderConnection/`
8. **Barcode Scanner Setup** — `Presentation/Barcode Scanner Setup/`
9. **Barcode Scanning** — `Presentation/Barcode Scanning/`
10. **Order Messages** — `Presentation/Order Messages/` — no obvious Android equivalent;
    flag as iOS-exclusive unless source review says otherwise
11. **Orders** — `Presentation/Orders/`
12. **Payments Onboarding** — `Presentation/Payments Onboarding/` — no obvious Android
    equivalent; flag as iOS-exclusive
13. **Settings** — `Presentation/Settings/`
14. **Reusable Views** — `Presentation/Reusable Views/` — this is the iOS component
    library, not a flow. Read this first, same role as Android's `common/composeui/`:
    check here before assuming a component doesn't exist yet.
15. **Loading / Catalog Sync** — `Presentation/PointOfSaleLoadingEntryPointView.swift` +
    `Presentation/CardReaderConnection/UI States/PointOfSaleLoadingView.swift` — ✅ VERIFIED
    (built): root-level file, missed by the original directory scan (it lives directly under
    `Presentation/`, not a subfolder). Plain spinner (`POSProgressViewStyle`, a donut ring —
    same shape as Android's `WooPosCircularLoadingIndicator`) while app dependencies resolve,
    then — while the local catalog syncs — the same spinner gains a "Syncing catalog" title,
    "`n` of `total` items" progress text, an "Exit POS" link, and a hint/subtitle. Copy is
    word-for-word the same English strings as Android's `WooPosSplashScreen` (see
    `mocks/android/eligibility.ts` / `mocks/ios/loading.ts`). Built at `/ios/loading`, the
    landing target after Setup's "Load prototype" for iOS (mirrors Android's `/android/splash`).
    Error states (`initialCatalogSyncError`) render through a separate fullscreen error view,
    not this component — not built yet.

## Notes for the agent

- Sparse-checkout just the module to keep it fast:
  ```
  git clone --depth 1 --filter=blob:none --sparse https://github.com/woocommerce/woocommerce-ios.git
  cd woocommerce-ios
  git sparse-checkout set "Modules/Sources/PointOfSale"
  ```
- This list is a directory scan, not a verified feature audit — some entries (Infinite
  Scroll, Order Messages) need a quick read to confirm whether they're standalone screens
  or shared behavior/components. Update this file once confirmed.
- Also check `Modules/Sources/Networking/Model/POS` for any data-shape differences worth
  reflecting in `src/mocks/ios/`.
