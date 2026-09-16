import './PosGhostBar.css';
import './PosGhostOrderRow.css';

/**
 * `POSGhostOrderRowView` — the skeleton row the order list shows while orders load.
 *
 * Matches the source's proportions, which are all relative to the row's own width so the
 * skeleton keeps its rhythm at any pane size: a header row of two 25%-wide bars pushed to the
 * edges, a 40% detail bar, then a 28% badge bar. Bar heights are fixed (16 / 16 / 20px) on
 * rows of 24 / 24 / 28px, with `xSmall` under the header and `xSmall * 3` under the details.
 *
 * Bars use `--color-on-surface-variant-lowest` (`posOnSurfaceVariantLowest`) on the item
 * card's own `surfaceContainerLowest`, so the skeleton reads as the card it is about to
 * become rather than a grey block.
 */
export function PosGhostOrderRow() {
  return (
    <div className="pos-ghost-order" aria-hidden>
      <div className="pos-ghost-order__row pos-ghost-order__row--header">
        <span className="pos-ghost-order__bar" style={{ width: '25%', height: 16 }} />
        <span className="pos-ghost-order__bar" style={{ width: '25%', height: 16 }} />
      </div>
      <div className="pos-ghost-order__row pos-ghost-order__row--details">
        <span className="pos-ghost-order__bar" style={{ width: '40%', height: 16 }} />
      </div>
      <div className="pos-ghost-order__row pos-ghost-order__row--badge">
        <span className="pos-ghost-order__bar" style={{ width: '28%', height: 20 }} />
      </div>
    </div>
  );
}

/**
 * The list's loading state. Source shows eight rows on a cold load and a single row when it's
 * appending the next page onto orders already on screen.
 */
export function PosGhostOrderList({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <PosGhostOrderRow key={i} />
      ))}
    </>
  );
}
