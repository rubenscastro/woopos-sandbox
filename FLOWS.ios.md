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
   Android, iOS-styled. Built at `/ios/products`; uses the shared cart state. **Variations** live
   here too: a variable-product row is a `NavigationLink` pushing `ChildItemList`, which reuses
   `ItemList` under its own `POSPageHeaderView` (title = parent product name + back, system nav bar
   hidden, barcode scanning still live). No separate variations flow to build.
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
   into `/ios/products` (`AddCustomAmountForm`). Android's is the same shape — converged as of the
   2026-09-15 parity pass, though the prototype's Android side still shows a retired modal.
6. **Card Present Payments** + 7. **CardReaderConnection** — ✅ VERIFIED: one flow, split across
   two folders (view models in the first, views in the second). Nothing to build twice. Covers the
   payment-in-progress messages (validating order → preparing → tap/swipe/insert → processing →
   success, plus error and cancel states) and the reader-connection alerts (scanning, found
   reader(s), connecting, update in progress/failed, connection success, connecting failures).
   `CardReaderConnection/UI States/` also holds shared error and loading layouts other flows reuse.
   Partly built: the ready → processing → success states are inline in `/ios/checkout`; the
   connection alerts are not.
8. **Barcode Scanner Setup** — ✅ VERIFIED: a modal wizard reached from Settings → Hardware →
   Scanner Setup. Four scanner models (Star BSH-20B, Tera 1200 2D, Netum 1228BC, Other). Star goes
   HID-mode QR → pairing; Tera and Netum add a pair-mode QR in between; all three then test
   (EAN-13 `1234567890128`) → success → barcodes-on-products. "Other" skips the QR steps and starts
   at an info screen. Android's wizard has one extra step (soft keyboard) that iOS does not — don't
   build it here. The prototype's `src/tools/BarcodeSetup.tsx` covers the flow but is built from
   Android components; needs an iOS pass.
9. **Barcode Scanning** — ✅ VERIFIED: not a screen — the HID capture layer applied to views that
   accept scans. Belongs in `src/tools/`, not `src/screens/ios/`.
10. **Order Messages** — `Presentation/Order Messages/` — ✅ VERIFIED: order-**sync error** views
    (couldn't load totals / unable to apply coupon / product unavailable), not a receipt flow and
    not iOS-exclusive behaviour. Inline error UI; no standalone screen to build.
11. **Orders** — `Presentation/Orders/` — ✅ VERIFIED (built): master/detail order list + details
    (Items / Totals) with the refund sub-flow in-screen. Built at `/ios/orders`.
12. **Payments Onboarding** — `Presentation/Payments Onboarding/` — ✅ VERIFIED (built): **not**
    iOS-exclusive. A thin wrapper hosting the main app's onboarding in a POS modal (close button,
    safari sheet, full-screen when compact). Android has it too, but interrupts differently — most
    problems appear inline in the reader-connection dialog instead of as a modal, so the merchant
    never leaves POS. Built at `/ios/payments-onboarding`.
13. **Settings** — `Presentation/Settings/` — ✅ VERIFIED (built): master/detail. Sidebar is Store +
    Hardware with Help pinned at the bottom; Product catalog is gated on local-catalog eligibility
    so it isn't a default entry, and there is no Payments category. Built at `/ios/settings`.
14. **Reusable Views** — `Presentation/Reusable Views/` — this is the iOS component
    library, not a flow. Read this first, same role as Android's `common/composeui/`:
    check here before assuming a component doesn't exist yet.
15. **Loading / Catalog Sync** — `Presentation/PointOfSaleLoadingEntryPointView.swift` +
    `Presentation/CardReaderConnection/UI States/PointOfSaleLoadingView.swift` — ✅ VERIFIED
    (built): plain spinner (`POSProgressViewStyle`, a donut ring —
    same shape as Android's `WooPosCircularLoadingIndicator`) while app dependencies resolve,
    then — while the local catalog syncs — the same spinner gains a "Syncing catalog" title,
    "`n` of `total` items" progress text, an "Exit POS" link, and a hint/subtitle. Copy is
    word-for-word the same English strings as Android's `WooPosSplashScreen` (see
    `mocks/android/eligibility.ts` / `mocks/ios/loading.ts`). Built at `/ios/loading`, the
    landing target after Setup's "Load prototype" for iOS (mirrors Android's `/android/splash`).
    Error states (`initialCatalogSyncError`) render through a separate fullscreen error view,
    not this component — not built yet.
16. **Cart** — `Presentation/CartView.swift` — ✅ VERIFIED (built): a dashboard pane, not a route: `CartHeaderView` ("Cart" + item count +
    Clear cart) over a scroll body grouped **custom amounts → coupons → purchasable items** (no
    section headers), an inline "Check out", and an empty state reading "Tap on a product to / add
    it to the cart, or " + a "Scan barcode" link into #8. Item images drop out below a
    Dynamic-Type-scaled width threshold. Tablet = right column; phone = `.medium/.large` sheet.
    Built into `/ios/products` (`PosCartPane`).
17. **Ineligible** — `Presentation/POSIneligibleView.swift` (+ `Models/POSIneligibleReason.swift`)
    — ✅ VERIFIED: the eligibility gate, root-level. Error mark + "Unable to load" + a
    reason-specific message + Retry / "Exit POS", with an extra "Enable POS feature" button when
    the reason is `featureSwitchDisabled`. Seven reasons vs Android's two (see `FLOW_PARITY.md`).
    Not built — Android's equivalent is at `/android/eligibility`.
18. **Mark order as paid** — `Presentation/PointOfSaleMarkAsPaidConfirmationView.swift` — ✅
    VERIFIED: a payment *method*, not an order-completion step — pushed into the right pane from the
    other-payment-methods sheet, like cash and scan-to-pay. `checkmark.circle` + "Mark order as
    paid?" + "This will mark the %@ order as completed. Use this only if you've already collected
    payment another way." + an "Add a note (optional)" field (placeholder "e.g. Bank transfer from
    Maria, ref 4827") + "Mark as paid". Copy matches Android's `markorderascomplete/` word for
    word. Not built.

## Notes for the agent

- Sparse-checkout just the module to keep it fast:
  ```
  git clone --depth 1 --filter=blob:none --sparse https://github.com/woocommerce/woocommerce-ios.git
  cd woocommerce-ios
  git sparse-checkout set "Modules/Sources/PointOfSale"
  ```
- Every entry has now been read against source (2026-09-15). Four of them turned out not to
  be screens at all — Infinite Scroll, Barcode Scanning and Reusable Views are components,
  Order Messages is inline error UI — so don't build them as routes. If a new folder appears
  in a later sync, read it before adding it here.
- Also check `Modules/Sources/Networking/Model/POS` for any data-shape differences worth
  reflecting in `src/mocks/ios/`.
