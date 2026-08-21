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
| `card-payment` | `cardpayment/`, `cardreader/` | `Card Present Payments/`, `CardReaderConnection/` | Direct match |
| `cash-payment` | `cashpayment/` | `PointOfSaleCollectCashView.swift` | ✅ VERIFIED (2026-08-20 sync): **not** Android-only — iOS has it as a root-level view under `Presentation/`, surfaced from the checkout pane rather than as its own route. Earlier "Android-only" guess was a directory-scan artefact. |
| `payment-success` | `paymentsuccess/` | `CardReaderConnection/UI States/Reader Messages/PointOfSalePaymentSuccessView.swift` | ✅ VERIFIED (2026-08-20 sync): direct match, but **action rows differ** — Android offers Done + "Email receipt"; iOS offers Done + Email receipt **+ Print receipt** (`POSPrintReceiptCoordinator`, falls through to `POSPrinterSetupModal` when no printer is connected). Not in `Order Messages/`. |
| `order-complete` | `markorderascomplete/` | check `Orders/` | Verify |
| `scan-to-pay` | `scantopay/` | `PointOfSaleScanToPayView.swift` | ✅ VERIFIED (2026-08-20 sync): **not** Android-only — both platforms show a QR + order total and poll for payment. **Divergence:** Android added a `PayInPersonSelected` state (customer opts to pay at the counter → "Collect on the register" / "Show the code again", where Collect drops checkout back to the cart). iOS has no equivalent — its only escape is "Mark payment as complete". Android's state is built at `/android/scan-to-pay` (preview menu → "Pay in person"). |
| `email-receipt` | `emailreceipt/` | `Reusable Views/POSSendReceiptView.swift` | ✅ VERIFIED (2026-08-20 sync): direct match — "Email receipt" / "Type email" / Send, with inline validation + send-failure errors. A reusable view on iOS (used from payment success and refund success), a routed screen on Android. Not in `Order Messages/`. |
| `orders` | `orders/list/`, `orders/details/` | `Orders/` → `/ios/orders` | ✅ VERIFIED (iOS built). Master/detail list + details (Items / Totals) on both. Refund sub-flow not yet built on iOS. |
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

Last synced **2026-08-20** — `woocommerce-android` @ `52c4bf10709` (trunk, 2026-08-19),
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
