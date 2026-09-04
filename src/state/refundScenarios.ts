/**
 * Refund error scenarios (2026-09-04 sync), induced from the chrome's State menu — the
 * prototype rule is happy path by default, edge/error states via toolbar. Shared ids for
 * both platforms; each screen renders its own platform's copy and recovery behavior
 * (WooPosRefundState.Recovery on Android, POSRefundRecovery on iOS).
 *
 * - loadItemsChanged  → inline preview error on the selection step; "Review remaining items"
 *                       reloads the refundable items (recovery: RefreshItems).
 * - loadNothing       → order_not_refundable at load; the flow lands on the terminal
 *                       "Nothing to refund" screen.
 * - createNetwork     → transient failure after Confirm; full-screen error with Retry.
 * - createItemsChanged→ deterministic rejection after Confirm; full-screen error with
 *                       "Review remaining items" + "Back to order".
 * - createTerminal    → dismiss-only create failure (Android: card refunded but store not
 *                       updated; iOS: couldn't confirm the card-present refund).
 *
 * A recovery action resolves the scenario for the rest of the open flow (the reload/retry
 * "succeeds"), so the designer isn't trapped in an error loop; re-entering the refund flow
 * arms it again.
 */
export type RefundScenario =
  | 'none'
  | 'loadItemsChanged'
  | 'loadNothing'
  | 'createNetwork'
  | 'createItemsChanged'
  | 'createTerminal';

export function refundScenarioOptions(createTerminalLabel: string) {
  return [
    { id: 'none', label: 'Happy path' },
    { id: 'loadItemsChanged', label: 'Load: items changed' },
    { id: 'loadNothing', label: 'Load: nothing to refund' },
    { id: 'createNetwork', label: 'Create: network error' },
    { id: 'createItemsChanged', label: 'Create: items changed' },
    { id: 'createTerminal', label: createTerminalLabel },
  ];
}
