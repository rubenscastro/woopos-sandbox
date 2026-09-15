# Flow parity: Android vs iOS

Two jobs:

1. **Where the two apps actually differ** — the list below. This is what a designer reads.
   It answers one question: *would an iOS merchant and an Android merchant have a different
   experience here?* Per CLAUDE.md's "What to report", nothing about folder names, class
   structure or file layout belongs in it.
2. **Route equivalences** — the table further down, which feeds the platform switcher
   (`src/device/flowParity.ts`) and points at source for whoever has to go read it.

## Where the two apps actually differ

Ranked by how much it changes what the merchant does. "Built" = present in the prototype.

### Flow — different steps or different places to land

| What the merchant experiences | Which platform | Built |
|---|---|---|
| **Checkout is one surface vs. many screens.** Android sends each payment method to its own full screen (cash, card, scan-to-pay, mark-as-paid, success), so the cart and catalog leave the screen. iOS keeps all of it in the dashboard's right pane — cart and items stay visible the whole way through. | Both, opposite shapes | Both (iOS partially) |
| **Scan to Pay has an escape hatch on Android only.** The customer can decide to pay at the counter instead: "Collect on the register" drops checkout back to the cart, or "Show the code again" returns to the QR. iOS's only exit is "Mark payment as complete". | Android only | ✅ `/android/scan-to-pay` |
| **Receipt printing.** iOS offers Done + Email receipt + **Print receipt** after a sale, falling through to a printer-setup modal when no printer is paired. Android is email-only. | iOS only | ✅ iOS |
| **Barcode setup is one step longer on Android** — an extra screen explaining that the on-screen keyboard stays hidden while an HID scanner is paired. iOS has no such step. | Android only | ⚠️ see gaps |
| **Reader connection asks for different permissions.** Android: local-network access when using a phone as the reader, plus an explainer before remote tap-to-pay. iOS: a location pre-alert ahead of the OS prompt, and some failures are dead-ends where Android still offers Retry. | Both, different sets | Partially |
| **WooPayments problems interrupt differently.** Android shows most of them inline inside the reader-connection dialog — the merchant never leaves POS. iOS always opens a full onboarding modal over the dashboard. | Both, different shapes | iOS only |

### Content — different things to read or act on

| What the merchant experiences | Which platform | Built |
|---|---|---|
| **Being told why POS won't open.** iOS names seven distinct reasons (no connection, unsupported WooCommerce version, site settings unavailable, plugin missing, POS switched off, unsupported currency — naming the country and which currencies *are* supported) and adds an "Enable POS feature" button when the switch is off. Android has two: unsupported version, or a generic "Check your internet connection and try relaunching the app." An Android merchant is told much less about what to fix. | iOS richer | Android only |
| **Search before you type.** iOS shows Recent searches chips and a Popular products list the moment search opens. Android shows nothing until the first keystroke. | iOS only | ✅ Both |
| **Cart ordering.** iOS groups the cart into custom amounts → coupons → products, always in that order. Android keeps one list in the order things were added. Add a product, then a coupon, then a custom amount and the two screens read differently. | Both, different | ✅ Both |
| **Mark-as-paid screen.** iOS: a checkmark glyph, an "Add a note (optional)" label, centred message, ordinary text field. Android: no glyph or label, left-aligned message, a large centred heading-style input, and a spinner before the form appears. Failure copy differs too ("Couldn't update the order." vs "Couldn't mark this order as paid."). | Both, different | Android only |
| **Applied-coupon indicator** on coupon cards (green tile + checkmark), phone widths only — on tablet the cart is always visible so the list needs no echo. | iOS only | ✅ iOS phone |
| **HTTPS configuration warning** at the top of the Products tab, tappable through to the SSL docs. | iOS only | ✅ `/ios/products` |
| **Cart empty state** says the same thing in a different order, with a different link label ("scan a barcode" vs "Scan barcode"). | Both, different | ✅ Both |

### Chrome — noticeable but low-stakes

| What the merchant experiences | Which platform | Built |
|---|---|---|
| **Drilling into a variable product.** Same steps and destination either way; only the way back differs. Android replaces the Products/Coupons tab strip with one tab named after the product; iOS pushes a titled screen with a back chevron. | Both, different | ✅ Both |
| **Cart thumbnails** disappear at narrow widths on iOS (threshold scales with Dynamic Type). Android always shows them. | iOS only | Not built |
| **Custom amount** is otherwise identical on both — same entry row, same full-pane form, same fields and buttons. Only the entry-row subtitle's trailing period differs. | Converged | ⚠️ see gaps |

### Prototype gaps — where we show merchants something that isn't real

| Gap | Impact |
|---|---|
| **Android custom amount is still a modal dialog** in the prototype. Production moved it to a full-pane form reached from an entry row, matching iOS. Iterating on the modal is iterating on a screen no merchant sees. | Tracked |
| **Barcode scanner setup renders Android UI inside the iOS frame** — the setup wizard is shared and built from Android components, so reviewing it on iOS shows the wrong app. | Tracked |

## Route equivalences

Feeds the platform switcher. A pair only goes into `src/device/flowParity.ts` once the flow
is **built** on both sides; source-verified but unbuilt stays out, so the switcher falls back
to home per the rule below. Source paths here are reference material for whoever has to open
the code — not findings.

| Route slug | Android source | iOS source | Notes |
|---|---|---|---|
| `splash` | `splash/` | `PointOfSaleLoadingEntryPointView.swift` + `CardReaderConnection/UI States/PointOfSaleLoadingView.swift` | Converged launch gate, identical copy (spinner → "Syncing catalog" + "`n` of `total` items" + "Exit POS"). Built `/android/splash` ↔ `/ios/loading`. |
| `eligibility` | `eligibility/` | `POSIneligibleView.swift`, `Models/POSIneligibleReason.swift` | Same shell (error mark + "Unable to load" + reason + Retry / "Exit POS"); reason coverage differs — see above. Android built, iOS not. |
| `products` | `home/items/products/` | `Item Selector/` | Single-column card list + cart on both (tablet side-by-side, phone bottom-button + sheet). iOS = 112pt square-image cards, SF Pro; Android = Material rows. Built both. |
| `item-search` | `home/items/search/` | `Item Search/` | Lives inside the item selector on both, no separate route. iOS adds the pre-search state. Built both. |
| `variations` | `home/items/variations/` | `Item Selector/ChildItemList.swift` | In-pane drill-in on both; header idiom differs. Built both. |
| `coupons` (browse) | `home/items/coupons/` | `Item Selector/` Coupons tab | A tab inside item selection on both, not a standalone flow. iOS's `Coupons/` folder is the *creation* sheet, not this. |
| `add-coupon` (create) | inline dialog on the Coupons tab | `Coupons/POSCouponCreationSheet.swift` | Both: "Create coupon" from the Coupons tab → adds to cart. **iOS picks a discount type first**; Android goes straight to the editor. Built both (`/ios/add-coupon`). |
| `custom-amount` | `home/items/customamount/` | `Custom Amount/` | Converged — entry row → full-pane form, same fields and copy. Prototype's Android side is stale (see gaps). |
| `cart` | `home/cart/` | `CartView.swift` | A dashboard pane on both, not a route. Grouping and empty-state copy differ — see above. Built both. |
| `checkout` | `home/totals/` | `TotalsView`, `POSPaymentContentView`, `POSOtherPaymentMethodsSheet` | iOS folds every payment method into this one surface. Built at `/ios/checkout`: card reader connect → ready → processing → success, and cash. The other-methods sheet (Tap to Pay / Scan to pay / Mark order as paid) is not built. |
| `card-payment` | `cardpayment/`, `cardreader/connection/` | `Card Present Payments/`, `CardReaderConnection/` | Connection states map closely; permission states differ per platform — see above. |
| `cash-payment` | `cashpayment/` | `PointOfSaleCollectCashView.swift` | Both have it; iOS reaches it from the checkout pane rather than a route. iOS uses ATM-style minor-unit entry (digits fill from the right, live grouping); Android does not. |
| `payment-success` | `paymentsuccess/` | `CardReaderConnection/UI States/Reader Messages/PointOfSalePaymentSuccessView.swift` | Action rows differ (Print receipt) — see above. Android swaps the copy when the sale was marked as paid rather than charged. |
| `mark-complete` | `markorderascomplete/` | `PointOfSaleMarkAsPaidConfirmationView.swift` | The "Mark order as paid" **payment method**, offered alongside Card reader / Tap to Pay / Scan to pay — not a post-payment step. Copy is word-for-word identical; layout differs (see above). Android built, iOS not. |
| `scan-to-pay` | `scantopay/` | `PointOfSaleScanToPayView.swift` | QR + order total, polling for payment, on both. Android's "Pay in person" state is its own — see above. |
| `email-receipt` | `emailreceipt/` | `Reusable Views/POSSendReceiptView.swift` | Identical: "Email receipt" / "Type email" / Send, with inline validation and send-failure errors. A routed screen on Android, a reusable view on iOS (payment success + refund success). Built both. |
| `orders` | `orders/list/`, `orders/details/` | `Orders/` | Master/detail + details (Items / Totals) on both, refund sub-flow in-screen on both. Refund errors map to per-error recovery ("Review remaining items" / terminal) rather than a blind Retry. **Divergence:** after "Review remaining items" iOS re-applies the surviving selection, Android clears it but keeps the typed reason. Built both. |
| `payment-methods` (under `checkout`) | `home/totals/WooPosPaymentMethod.kt` | `POSOtherPaymentMethodsSheet`, `POSPaymentContentView` | Same four methods, gated the same way (card reader ↔ Tap to Pay swap on connection state; scan-to-pay and mark-as-paid behind their own switches). |
| `barcode-setup` | `scanningsetup/` | `Barcode Scanner Setup/` (`Barcode Scanning/` is the HID capture layer, not a screen) | Modal wizard on both, same four scanner models, same EAN-13 test barcode. Android has one extra step — see above. Prototype renders Android UI on iOS (see gaps). |
| `settings` | `settings/` | `Settings/` | Master/detail on both. iOS sidebar = Store + Hardware, Help pinned at the bottom; Product catalog only appears when the store is local-catalog eligible, and there is no Payments category (so `/android/settings-payments` has no iOS counterpart). Built both. |
| `payments-onboarding` | `cardreader/WooPosCardReaderOnboardingActivity`, `cardreader/connection/WooPosOnboardingErrorMapper` | `Payments Onboarding/` | Present on both — both wrap the main app's card-payments onboarding in POS chrome. The interruption shape differs (see above). Built on iOS. |
| `order-messages` | — | `Order Messages/` | Order-**sync error** views (couldn't load totals / unable to apply coupon / product unavailable), not a receipt flow. Inline error UI; no standalone screen. |

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

If the current route has no confirmed *and built* counterpart on the target platform, the
switcher lands on that platform's home/index route rather than a broken/empty screen, and
the platform switcher UI can show a subtle "not available on iOS/Android" indicator instead
of silently redirecting. `mapRoute` in `src/device/flowParity.ts` returns
`available: false` for exactly that case.

Note the two-step gate: a row in the table above can be fully source-verified and still not
belong in `flowParity.ts`, because the flow isn't built on one side yet (today:
`eligibility`, `mark-complete`, `scan-to-pay`, `add-coupon`, `settings-payments`). Those
deliberately fall through to home.

## Verification passes

A sync asks "what changed since the last pin"; a verification pass asks "is what this file
claims actually true". Passes don't move the pinned SHAs.

### 2026-09-15 — cleared the remaining "verify" rows

Read every unverified row against `woocommerce-android` @ `5821650ac4f` / `woocommerce-ios`
@ `2c63022344` (the 2026-09-04 pins, unchanged). What it changed for the merchant-facing
picture above:

- **"Mark order as complete" is a payment method, not a post-payment step.** It's offered
  alongside Card reader / Tap to Pay / Scan to pay for sales collected some other way, and
  it's on both platforms with different layouts. It had been filed as an Android-only
  order-completion screen.
- **WooPayments onboarding is on both platforms,** and the interruption shape differs
  (Android inline in the reader dialog, iOS a full modal). It had been filed as iOS-only.
- **Eligibility is its own gate, separate from the loading screen,** and the reason
  coverage differs sharply between platforms.
- **Cart grouping differs** (iOS sectioned, Android insertion-ordered) — previously
  unchecked.
- **Custom amount has converged** on both platforms, which is what exposed the prototype
  still showing Android's retired modal.

Variations was also checked and turned out to be a chrome-only difference — filed under
low-stakes rather than treated as a flow divergence.

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
