# WooPOS flow manifest

A checklist of the real POS flows in `woocommerce-android`, for recreating each as a
standalone HTML prototype. Source paths are relative to
`WooCommerce/src/main/kotlin/com/woocommerce/android/ui/woopos/`.

**How to use this file (for Claude Code):** work through flows in priority order. For each
one: read every file listed under "key source," then build the equivalent screen as a
React route/component per `CLAUDE.md`'s Output format, using `DESIGN.md` for all tokens.
Don't guess at layout, copy, or component structure — it's all in the source. If a flow
references a component from `common/composeui/`, check `DESIGN.md`'s Components section
first, and check `src/components/` for an existing React equivalent before building a new
one — only re-read the Kotlin source if something's still ambiguous.

## Priority 1 — core checkout loop (build these first)

### 1. Splash / eligibility
The app-open gate before the POS UI loads — checks feature eligibility and shows a loading
state.
- Key source: `splash/`, `eligibility/`

### 2. Item selection — products
Main product browsing screen. Single-column list (not a grid), search, category/tab
filtering.
- Key source: `home/items/products/`, `home/items/WooPosItemsScreen.kt`,
  `home/items/WooPosItemsList.kt`, `home/items/search/`

### 3. Item selection — variations
Drill-in screen when a variable product is tapped.
- Key source: `home/items/variations/`

### 4. Item selection — coupons
Coupon list and application, including expired-state handling.
- Key source: `home/items/coupons/`

### 5. Custom amount entry
Dialog for adding a non-catalog line item (e.g. a manual charge).
- Key source: `home/items/customamount/`

### 6. Cart
Running cart panel — line items, remove, coupons, custom amounts, empty state.
- Key source: `home/cart/`

### 7. Totals / checkout — payment method selection
Where the associate picks how the customer pays.
- Key source: `home/totals/`, `home/totals/WooPosAllPaymentMethodsBottomSheet.kt`,
  `home/totals/WooPosPaymentMethod.kt`

### 8. Card payment flow
Card reader connection + payment-in-progress states.
- Key source: `cardpayment/`, `cardreader/`

### 9. Cash payment flow
Cash tendered / change due flow.
- Key source: `cashpayment/`

### 10. Payment success
Confirmation screen after a successful charge.
- Key source: `paymentsuccess/`

### 11. Mark order as complete
Post-payment order completion step.
- Key source: `markorderascomplete/`

## Priority 2 — supporting flows

### 12. Scan to pay
QR/remote tap-to-pay variant of checkout.
- Key source: `scantopay/`

### 13. Email receipt
Post-sale receipt delivery.
- Key source: `emailreceipt/`

### 14. Order history
List and detail views of past POS orders, including refunds.
- Key source: `orders/list/`, `orders/details/`, `orders/details/refund/`

### 15. Scanning / barcode setup
Onboarding for the barcode scanner hardware.
- Key source: `scanningsetup/`

## Priority 3 — settings & meta screens

### 16. Settings — root
- Key source: `settings/`, `settings/details/`

### 17. Settings — categories
- Key source: `settings/categories/`

### 18. Settings — hardware (card reader / barcode scanner)
- Key source: `settings/details/hardware/`

### 19. Settings — product info / local catalog
- Key source: `settings/productinfo/`, `settings/details/localcatalog/`, `localcatalog/`

### 20. Support / help
- Key source: `settings/details/help/`, `support/`

## Navigation shell (reference, not a standalone prototype)
- `root/`, `root/navigation/`, `tab/`, `home/WooPosHomeContainer.kt`,
  `home/WooPosHomeNavigation.kt`, `home/WooPosHomePanes.kt` — how screens are actually
  wired together (tablet: cart + items side by side via `WooPosHomePanes`; phone: separate
  full-screen panes via `home/phone/`). Read this once, early, so every subsequent
  prototype gets the tablet/phone split right instead of each flow reinventing it.

## Notes for the agent

- The repo is large; don't clone it in full. Sparse-checkout just
  `WooCommerce/src/main/kotlin/com/woocommerce/android/ui/woopos` (and
  `ui/compose/theme` if a flow reaches outside woopos) to keep things fast:
  ```
  git clone --depth 1 --filter=blob:none --sparse https://github.com/woocommerce/woocommerce-android.git
  cd woocommerce-android
  git sparse-checkout set WooCommerce/src/main/kotlin/com/woocommerce/android/ui/woopos
  ```
- Every screen has `@Preview`-annotated composables near the bottom of its `Screen.kt`
  file showing sample data for every state (loading, empty, error, content) — use these
  as the ground truth for what placeholder content should look like.
- Flag anything that depends on real hardware (card reader, barcode scanner) or backend
  state — the prototype should fake these with static states, not attempt real
  integration.
