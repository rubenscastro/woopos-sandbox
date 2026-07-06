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
| `cash-payment` | `cashpayment/` | — | Android-only unless it's nested in Card Present Payments on iOS |
| `payment-success` | `paymentsuccess/` | check `Order Messages/` | Possible match, verify |
| `order-complete` | `markorderascomplete/` | check `Orders/` | Verify |
| `scan-to-pay` | `scantopay/` | — | Android-only, verify |
| `email-receipt` | `emailreceipt/` | check `Order Messages/` | Possible match, verify |
| `orders` | `orders/list/`, `orders/details/` | `Orders/` → `/ios/orders` | ✅ VERIFIED (iOS built). Master/detail list + details (Items / Totals) on both. Refund sub-flow not yet built on iOS. |
| `payment-methods` covered under `checkout` | (in totals sheet) | `POSPaymentContentView` card states | ✅ Card-present ready→processing→success folded into `/ios/checkout` (not a separate dialog yet — full `CardReaderConnection/` dialog still TODO on iOS). |
| `barcode-setup` | `scanningsetup/` | `Barcode Scanner Setup/`, `Barcode Scanning/` | Direct match |
| `settings` | `settings/` | `Settings/` → `/ios/settings` | ✅ VERIFIED (iOS built). Master/detail: Store / Hardware / Product catalog + Help. |
| `payments-onboarding` | — | `Payments Onboarding/` → `/ios/payments-onboarding` | ✅ VERIFIED. iOS-only (WooPayments setup gate); no Android equivalent. |
| `order-messages` | — | `Order Messages/` | ✅ Confirmed: order-**sync error** views (couldn't load totals / unable to apply coupon / product unavailable), not a receipt flow. Inline error UI — not built as a standalone screen. |

## Switcher fallback rule

If the current route has no confirmed entry on the target platform (blank cell or
"verify"), the switcher should land on that platform's home/index route rather than a
broken/empty screen, and the platform switcher UI can show a subtle "not available on
iOS/Android" indicator instead of silently redirecting.
