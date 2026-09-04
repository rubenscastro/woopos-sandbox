# Flow parity: Android vs iOS

Maps route slugs between platforms so the platform switcher knows where to land when a
designer toggles platform mid-flow. This is a first pass from comparing directory
structures (`FLOWS.md` vs `FLOWS.ios.md`) — confirm/adjust once both platforms are
actually built, since real feature parity may differ from what folder names suggest.

| Route slug | Android source | iOS source | Notes |
|---|---|---|---|
| `splash` | `splash/`, `eligibility/` | — | Android-only in this list; check if iOS has an equivalent launch gate elsewhere in the app shell (outside `PointOfSale/`) |
| `products` | `home/items/products/` | `Item Selector/` → `/ios/products` | ✅ VERIFIED (iOS built). Core screen on both; both are a single-column card list + cart (tablet side-by-side, phone bottom-button + sheet). iOS = 112pt square-image cards on surfaceContainerLowest w/ iOS border + SF Pro; Android = Material list rows. Same route slug, platform-specific UI. |
| `item-search` | `home/items/search/` (sub-mode) | `Item Search/` (own flow) | ✅ VERIFIED. iOS = its own flow: search field + pre-search (Recent searches chips + Popular products). Android = inline filter sub-mode, no popular-products pre-search. Both live inside the item selector; no separate route (`/ios/products` hosts it). |
| `variations` | `home/items/variations/` | check `Item Selector/` internals | Verify iOS handles this inline vs. separate |
| `coupons` (browse) | `home/items/coupons/` | `Item Selector/` Coupons tab | ✅ Coupon *browsing* is a tab inside item selection on **both** — not a standalone flow. iOS's `Coupons/` folder is NOT this. |
| `add-coupon` (create) | inline dialog on products/coupons tab (`WooPosItemsViewModel.createAndAddCoupon`) — no standalone route | `Coupons/POSCouponCreationSheet.swift` → `/ios/add-coupon` | ✅ VERIFIED (built). Both: "Create coupon" from the Coupons tab → adds to cart. **iOS** shows a discount-type selection sheet first, then the editor; **Android** goes straight to the editor (no type sheet). No 1:1 route: Android's is an in-place dialog, iOS's is its own route — switcher falls back to home. |
| `custom-amount` | `home/items/customamount/` | `Custom Amount/` | Direct match |
| `cart` | `home/cart/` | check `Item Selector/` or `Reusable Views/` | iOS may not separate cart as distinct as Android does — verify |
| `checkout` | `home/totals/` | `TotalsView` + `POSPaymentContentView` + `POSOtherPaymentMethodsSheet` → `/ios/checkout` | ✅ VERIFIED (iOS built). Order summary + Connect card reader / Cash payment / Other payment methods (Tap to Pay, Card reader, Scan to pay, Mark order as paid). iOS folds card-present / cash / scan-to-pay / mark-as-paid / success into this one surface (dashboard "finalizing" stage). |
| `card-payment` | `cardpayment/`, `cardreader/` | `Card Present Payments/`, `CardReaderConnection/` | Direct match. (2026-09-04 sync) Android added a fifth connection permission state — local network, for phone-as-reader — on top of the four Bluetooth/location states from 2026-08-20. |
| `cash-payment` | `cashpayment/` | `PointOfSaleCollectCashView.swift` | ✅ VERIFIED (2026-08-20 sync): **not** Android-only — iOS has it as a root-level view under `Presentation/`, surfaced from the checkout pane rather than as its own route. Earlier "Android-only" guess was a directory-scan artefact. (2026-09-04 sync) iOS rewrote cash entry as ATM-style minor-unit input with live grouping (`POSCashAmountInputFormatter`); Android cash entry unchanged. |
| `payment-success` | `paymentsuccess/` | `CardReaderConnection/UI States/Reader Messages/PointOfSalePaymentSuccessView.swift` | ✅ VERIFIED (2026-08-20 sync): direct match, but **action rows differ** — Android offers Done + "Email receipt"; iOS offers Done + Email receipt **+ Print receipt** (`POSPrintReceiptCoordinator`, falls through to `POSPrinterSetupModal` when no printer is connected). Not in `Order Messages/`. |
| `order-complete` | `markorderascomplete/` | check `Orders/` | Verify |
| `scan-to-pay` | `scantopay/` | `PointOfSaleScanToPayView.swift` | ✅ VERIFIED (2026-08-20 sync): **not** Android-only — both platforms show a QR + order total and poll for payment. **Divergence:** Android added a `PayInPersonSelected` state (customer opts to pay at the counter → "Collect on the register" / "Show the code again", where Collect drops checkout back to the cart). iOS has no equivalent — its only escape is "Mark payment as complete". Android's state is built at `/android/scan-to-pay` (preview menu → "Pay in person"). |
| `email-receipt` | `emailreceipt/` | `Reusable Views/POSSendReceiptView.swift` | ✅ VERIFIED (2026-08-20 sync): direct match — "Email receipt" / "Type email" / Send, with inline validation + send-failure errors. A reusable view on iOS (used from payment success and refund success), a routed screen on Android. Not in `Order Messages/`. |
| `orders` | `orders/list/`, `orders/details/` | `Orders/` → `/ios/orders` | ✅ VERIFIED (iOS built). Master/detail list + details (Items / Totals) on both. Refund sub-flow built in-screen on both (`Orders.tsx` / `OrderHistory.tsx`). (2026-09-04 sync) source replaced the refund error's blind Retry with per-error recovery ("Review remaining items" / terminal states) — built on both, induced via the State menu ("Refund error"). |
| `payment-methods` covered under `checkout` | (in totals sheet) | `POSPaymentContentView` card states | ✅ Card-present ready→processing→success folded into `/ios/checkout` (not a separate dialog yet — full `CardReaderConnection/` dialog still TODO on iOS). |
| `barcode-setup` | `scanningsetup/` | `Barcode Scanner Setup/`, `Barcode Scanning/` | Direct match |
| `settings` | `settings/` | `Settings/` → `/ios/settings` | ✅ VERIFIED (iOS built). Master/detail: Store / Hardware / Product catalog + Help. |
| `payments-onboarding` | — | `Payments Onboarding/` → `/ios/payments-onboarding` | ✅ VERIFIED. iOS-only (WooPayments setup gate); no Android equivalent. |
| `order-messages` | — | `Order Messages/` | ✅ Confirmed: order-**sync error** views (couldn't load totals / unable to apply coupon / product unavailable), not a receipt flow. Inline error UI — not built as a standalone screen. |

## Android phone: the persistent bottom button

`home/phone/` is the shell for Android phone, and it owns **one** bottom button rather than
letting each screen carry its own. `WooPosPhoneCartScreen` passes
`WooPosCartCheckoutButtonSlot.External`, so the cart renders no checkout button at all
(`WooPosCartScreen.kt`: `External -> Unit`); `WooPosHomePhoneScreen` instead overlays
`WooPosHomePhonePersistentButton` on the bottom of the home `Box`, and
`WooPosPhonePersistentButtonStateResolver` maps screen position → label/action:

| Screen position | Button |
|---|---|
| Products, cart has items | "Cart (N)" → open cart |
| Products, cart empty | Hidden |
| Cart, `CheckoutButtonState.Enabled` | "Check out" → checkout |
| Cart, `CheckoutButtonState.Disabled` | "Check out", disabled (cart still resolving items) |
| Cart, `CheckoutButtonState.Invisible` | Hidden |
| Checkout | Hidden |

The prototype mirrors this in `src/components/android/PhonePersistentButton.tsx`, mounted once
in the device overlay (`DeviceLayout`) and gated to Android + phone. Because the prototype
presents the phone cart as a bottom sheet rather than a pager page, an open cart sheet *is*
the Cart screen position. Tablet is unaffected — it has no persistent button, and the cart
pane keeps its own inline checkout, matching `WooPosHomePanes`' `Inline` slot. iOS is
unaffected too: it keeps its own in-screen "Cart (N)" and an inline "Check out" in the cart
sheet.


## Switcher fallback rule

If the current route has no confirmed entry on the target platform (blank cell or
"verify"), the switcher should land on that platform's home/index route rather than a
broken/empty screen, and the platform switcher UI can show a subtle "not available on
iOS/Android" indicator instead of silently redirecting.

## Source sync log

Newest first. Each section pins the exact source SHAs that sync analyzed; the local
clones' worktrees (see `SYNC.md`) are kept checked out at the newest pins.

### 2026-09-04

Synced — `woocommerce-android` @ `5821650ac4f` (trunk, 2026-09-04), `woocommerce-ios` @
`2c63022344` (trunk, 2026-09-04). Window since 2026-08-20: 34 Android / 42 iOS POS
commits — the majority plumbing (analytics/Tracks, R8/Gson crash fixes, removals of
feature flags that were already default-on, comment churn), checked and excluded.

| Delta | Platforms | Status |
|---|---|---|
| **Sunset banner removed** — the "Update WooCommerce Soon" banner is gone from the product list on both platforms (the August 1 requirement was never enforced). Android's items screen keeps only the "Refresh catalog" sync-overdue banner; the reusable banner shells remain. | Converged | N/A — never built |
| **Refund error recovery** — deterministic server rejections no longer offer a blind Retry. Both platforms map each refund API error to a recovery: Retry (transient), **"Review remaining items"** (reloads refundable items), or terminal. `order_not_refundable` now routes to the existing "Nothing to refund" / "No items available for refund" screen instead of an error. The item-selection error state now shows a secondary outlined recovery button above a disabled Continue (both). Android adds card-refunded-but-store-not-updated copy ("The card was refunded, but your store wasn't updated. Record this refund in your store admin.", single "Back to order" action) and polished six error strings (trailing periods; "One of the selected items has already been fully refunded."). **Divergent detail:** after "Review remaining items", iOS re-applies the surviving selection; Android clears the selection (but keeps the typed reason). | Converged (mostly) | ✅ Built on both (`/android/order-history`, `/ios/orders`) — scenarios induced via the chrome State menu ("Refund error"); happy path by default. The selection divergence is reproduced. |
| **HTTPS configuration warning** — new banner at the top of the Products tab list (not Coupons): "Secure your store with HTTPS" + "Your store supports HTTPS, but its address is configured to use HTTP. Update it to HTTPS to protect your store and prevent connection problems." + bold "Learn more"; the whole card is tappable → SSL doc webview; dismiss also dismisses the main app's banner. Introduces `POSNoticeView` style `.alertLowest` with two new tokens: `posAlertLowest` (#F5ECE6 light / #FFB68A dark), `posOnAlertLowest` (#543100 universal) — recorded in `DESIGN-ios-deltas.md`. | iOS only | ✅ Built at `/ios/products` (`PosNotice` component) — induced via the State menu ("Products" → HTTPS warning); dismiss resets to happy path |
| **Cash amount input rewrite** — ATM-style minor-unit entry (`POSCashAmountInputFormatter`): digits fill from the right (`1`→`0.01`, `123`→`1.23`), live thousands grouping while typing, store-specific separators, zero-decimal currencies drop the decimal part and switch to the number pad, and the pre-filled order total is wiped by the first keystroke (first backspace clears it to 0.00). | iOS only | ✅ Built at `/ios/checkout` cash entry (USD behavior; zero-decimal keyboard switch N/A) |
| **Edge-swipe back on phone** — 44pt leading-edge gesture across POS compact layouts (item/order search, variations, custom amount, checkout, collect cash, scan to pay, mark-as-paid, email receipt, all refund screens, settings hardware pages), plus a finger-tracking split-view back transition on Settings/Orders (30% parallax, 12% dim on the outgoing pane, 12pt edge shadow, `.snappy` 0.3s). Shipped-with polish: settings card selection border now hidden on phone; item-search back now clears the search term (orders search keeps it — asymmetry in source). | iOS only | Gesture N/A (click prototype); both polish items already match (`Settings.tsx` gates selection to `!isPhone`; `ItemSelector.tsx` back clears the query) |
| **Payment-method copy** — mark-as-paid method title "Other" → **"Order marked as paid"**; scan-to-pay order note "Customer paid via Scan to Pay" → **"Paid via Scan to Pay"**; new method title **"Scan to Pay"**. Surfaces in order-details totals and the refund confirmation (`via <method>`). | iOS only | N/A today — order mocks include no mark-as-paid/scan-to-pay orders; use the new copy if one is added |
| **Card reader: local-network permission** — fifth connection-dialog permission state ("Local network permission required" / "Local network permission is required to connect to a phone used as a card reader." / "Grant permission" + "Cancel"), shown when connecting to a phone-as-reader; auto-resumes the connect on grant. Companion phone-side Card Reader Mode screens: explainer ("Android requires local network access so your tablet can find this phone. Nothing is sent outside your network." / "Continue") and denied ("Local network permission is blocked. Open Settings and grant local network access to use tap-to-pay on this phone." / "Open Settings"). | Android only | ✅ Built (POS-side dialog state) — Card reader tool → "Local network permission" off makes discovery find "Pixel 9"; Connect then gates on the permission, grant auto-resumes. Phone-side Card Reader Mode screens not built (no such surface in the prototype). Bluetooth/location gating (2026-08-20) remains backlog. |
| **Reader onboarding orientation** — no longer forces landscape on phones (portrait on phone, landscape on tablet). | Android only | N/A for the web prototype |
| **Server-computed refunds default ON** — feature-flag fallback flipped to on-everywhere (WooCommerce ≥ 11.1.0 stores), which is what makes the new refund-recovery states reachable in production. | Android | Context only — no UI of its own |

Also checked, no impact: illustrations unchanged on both platforms (iOS `Resources/` has
zero diff; Android's two drawable changes are non-POS — `ic_history_24dp` belongs to the
main app's Filter History, and `ic_search_24dp`'s tint change is overridden by every POS
usage). iOS `Networking/Model/POS` unchanged. Minor iOS visual nits not worth prototyping:
the offline banner gained small top padding, the floating control re-anchored to stable
dashboard bounds, a totals-shimmer animation fix, and RTL-only back-chevron mirroring.

### 2026-08-20

Synced — `woocommerce-android` @ `52c4bf10709` (trunk, 2026-08-19),
`woocommerce-ios` @ `b3cf2160f9` (trunk, 2026-08-20).

Deltas found in that window, and what was done about them:

| Delta | Platforms | Status |
|---|---|---|
| **Refund flow** — select items → review → reason → confirm → success, word-for-word identical copy on both. The churn this cycle was plumbing (server-computed refunds behind a WooCommerce ≥ 11.1.0 gate, with local calculation as fallback), not UX. | Converged | Already built both sides |
| **Scan to Pay "Pay in person"** — `WooPosScanToPayState.PayInPersonSelected`. | Android only | ✅ Built at `/android/scan-to-pay` |
| **"Discount not applied"** on custom-amount rows at checkout — coupons never discount order fees. Android had it; iOS added `CustomAmountRowView.showsDiscountNotAppliedNote` this cycle. | Converged | ✅ Built both sides |
| **Applied-coupon indicator** on coupon-list cards — `POSCouponImageState.applied` (green tile + checkmark). Gated to **compact width only** (`ItemListViewHelper.shouldShowAppliedCouponIndicator`): on tablet the cart is always on screen, so the list needs no echo. | iOS only | ✅ Built at `/ios/products` (phone) |
| **Receipt printing** — `POSPrintReceiptCoordinator` + `POSPrinterSetupModal`. Android POS is email-only. | iOS only | Already built iOS |
| **Phone persistent bottom button** — `WooPosCartCheckoutButtonSlot.External` + `WooPosHomePhonePersistentButton`: one shell-owned button that morphs "Cart (N)" → "Check out" → hidden, instead of a button per screen. | Android only | ✅ Built (see above) |
| **Exit POS modal redesign** — new `POSFlowButtonsView` pattern (compact stacks primary-over-secondary; regular goes side-by-side, secondary left). Expect this pattern to spread to other iOS flows. | iOS only | Not built |
| **Card reader Bluetooth/location gating** — four new permission/hardware states ("Allow Bluetooth to see card readers", "Turn on location to see card readers", …). | Android only | Not built |
| **Tap to Pay failure reasons** — phone not eligible / NFC disabled / token invalid. | Android only | Not built |

Illustrations were checked and are **unchanged** on both platforms in this window: the iOS
catalog (`Modules/Sources/PointOfSale/Resources/Images.xcassets`, 17 imagesets, 16 with
light/dark PDF pairs) last moved 2026-07-24, and no POS drawable or `res/raw` asset changed
on Android. Note Android's sparse checkout excludes `res/drawable` and `res/raw`, so asset
changes there are detectable via `git diff --name-status` but the files are not on disk —
widen the sparse checkout before trying to read one.
