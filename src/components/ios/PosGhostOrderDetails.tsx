import { PosText } from './PosText';
import './PosGhostOrderRow.css';

/**
 * `POSOrderDetailsLoadingView` — the skeleton for the order *detail* pane, the other half of
 * the orders loading state (the list's half is `PosGhostOrderRow`).
 *
 * Note the section titles are **real text**, not bars: source renders "Items" and "Totals"
 * normally and only shimmers the values under them, because those headings are known before
 * the order is. Bar widths are fixed pixels here (120 / 100 / 80), unlike the list's
 * percentages — the detail pane has a stable width, so the source doesn't scale them.
 */
export function PosGhostOrderDetails() {
  return (
    <div className="pos-ghost-details" aria-hidden>
      {/* Header: order number, then two stacked meta lines (date, customer). */}
      <div className="pos-ghost-details__header">
        <div className="pos-ghost-details__header-top">
          <span className="pos-ghost-order__bar" style={{ width: 120, height: 32 }} />
          <span className="pos-ghost-order__bar" style={{ width: 80, height: 24 }} />
        </div>
        <span className="pos-ghost-order__bar" style={{ width: 120, height: 16 }} />
        <span className="pos-ghost-order__bar" style={{ width: 80, height: 16 }} />
      </div>

      <section className="pos-ghost-details__card">
        <PosText variant="bodyXLarge" bold>
          Items
        </PosText>
        <div className="pos-ghost-details__rows">
          <GhostProductRow />
          <div className="pos-ghost-details__divider" />
          <GhostProductRow />
        </div>
      </section>

      <section className="pos-ghost-details__card">
        <PosText variant="bodyXLarge" bold>
          Totals
        </PosText>
        <div className="pos-ghost-details__rows pos-ghost-details__rows--totals">
          <GhostTotalsRow />
          <GhostTotalsRow />
          <div className="pos-ghost-details__divider" />
          <GhostTotalsRow />
          <div className="pos-ghost-details__divider" />
          <GhostTotalsRow />
        </div>
      </section>
    </div>
  );
}

/** Product thumbnail + two stacked text lines + a trailing price. */
function GhostProductRow() {
  return (
    <div className="pos-ghost-details__product">
      <span className="pos-ghost-order__bar" style={{ width: 40, height: 40, flex: 'none' }} />
      <div className="pos-ghost-details__product-text">
        <span className="pos-ghost-order__bar" style={{ width: 120, height: 16 }} />
        <span className="pos-ghost-order__bar" style={{ width: 80, height: 16 }} />
      </div>
      <span className="pos-ghost-order__bar" style={{ width: 80, height: 16 }} />
    </div>
  );
}

/** Label on the left, amount on the right. */
function GhostTotalsRow() {
  return (
    <div className="pos-ghost-details__totals-row">
      <span className="pos-ghost-order__bar" style={{ width: 100, height: 24 }} />
      <span className="pos-ghost-order__bar" style={{ width: 80, height: 24 }} />
    </div>
  );
}
