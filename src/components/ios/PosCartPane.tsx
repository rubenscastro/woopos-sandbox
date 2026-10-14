import { PosText } from './PosText';
import { PosButton } from './PosButton';
import { ProductImage } from '../android/ProductImage';
import { DragScroll } from '../android/DragScroll';
import { Trash, Barcode, Tag, SquareAndPencil, ChevronLeft } from './IosIcons';
import { useCart, type CartLine } from '../../state/CartContext';
import { useIsDark } from '../../hooks/useIsDark';
import { formatUsd } from '../../lib/currency';
import { useFlags } from '../../state/FlagsContext';
import { useNav } from '../../device/platformNav';
import lightBagsImg from '../../assets/ios/shopping-bags-light.png';
import darkBagsImg from '../../assets/ios/shopping-bags-dark.png';

/**
 * iOS cart pane (CartView.swift). Header "Cart" + item count with a trailing "Clear cart"
 * trash button; a list of line items; empty state "Tap on a product to add it to the cart,
 * or Scan barcode"; a pinned "Check out" button. Uses the shared cart state (cart math is
 * platform-agnostic — src/state/CartContext).
 */
export function PosCartPane({
  onCheckout,
  onScanBarcode,
  onBack,
  hideCheckout = false,
  showItemCount = true,
  checkoutReady = false,
}: {
  onCheckout?: () => void;
  onScanBarcode?: () => void;
  /** When checking out, the cart becomes a sidebar with a back chevron (slide animation). */
  onBack?: () => void;
  hideCheckout?: boolean;
  /** Phone drawer hides the "N items" count next to the title. */
  showItemCount?: boolean;
  /** Whether the checkout pane (shown alongside this cart) has finished loading — coupons
   *  only flip to their applied (green) state once it has, so both panes resolve on the
   *  exact same timer instead of each running its own. Owned by the parent (ItemSelector). */
  checkoutReady?: boolean;
}) {
  const { lines, itemCount, clear, removeLine, pendingScans } = useCart();
  const empty = lines.length === 0 && pendingScans === 0;

  // CartViewHelper.shouldShowCustomAmountDiscountNotAppliedNote: coupons never discount
  // custom amounts (they're order fees), so the custom-amount rows warn about it once the
  // order is finalizing and a coupon has actually produced a discount. Source additionally
  // restricts this to whole-cart coupons; every mock coupon here is a cart-level discount,
  // so a discounting coupon is the equivalent test.
  const showDiscountNotAppliedNote =
    checkoutReady && hideCheckout && lines.some((l) => l.kind === 'coupon' && l.discount > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface-bright)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-md) var(--space-md)' }}>
        {onBack && (
          <button type="button" aria-label="Back" onClick={onBack} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
            <ChevronLeft size="var(--icon-medium)" />
          </button>
        )}
        <PosText variant="heading" bold>
          Cart
        </PosText>
        <div style={{ flex: 1 }} />
        {/* Item count sits next to the clear (delete) button. */}
        {showItemCount && itemCount > 0 && (
          <PosText variant="bodySmall" color="var(--color-on-surface-variant-lowest)">
            {itemCount === 1 ? '1 item' : `${itemCount} items`}
          </PosText>
        )}
        {!empty && !hideCheckout && (
          <button
            type="button"
            aria-label="Clear cart"
            onClick={clear}
            style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface-variant-highest)', padding: 4, cursor: 'pointer' }}
          >
            <Trash size="var(--icon-small)" />
          </button>
        )}
      </div>

      {empty ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--space-xl) var(--space-xxl)', gap: 'var(--space-lg)' }}>
          <ShoppingBags />
          {/* CartView.swift empty state: hint text, then "Scan barcode" + the barcode.viewfinder icon
              AFTER it. The icon is the tappable affordance — tinted primary (SwiftUI button default
              tint) — and opens the barcode scanner setup; the words are muted. Each line is its own
              row so the spacing is uniform. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <PosText variant="bodyMedium" align="center" color="var(--color-on-surface-variant-lowest)" style={{ lineHeight: 1.15 }}>Tap on a product</PosText>
            <PosText variant="bodyMedium" align="center" color="var(--color-on-surface-variant-lowest)" style={{ lineHeight: 1.15 }}>to add it to the cart, or</PosText>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, lineHeight: 1.15 }}>
              <PosText variant="bodyMedium" color="var(--color-on-surface-variant-lowest)" style={{ lineHeight: 1.15 }}>Scan barcode</PosText>
              <button
                type="button"
                aria-label="Scan barcode"
                onClick={onScanBarcode}
                style={{ border: 'none', background: 'none', padding: 0, display: 'inline-flex', color: 'var(--color-primary)', cursor: 'pointer' }}
              >
                <Barcode size="1.2em" />
              </button>
            </span>
          </div>
        </div>
      ) : (
        <DragScroll style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md) var(--space-md)' }}>
          {Array.from({ length: pendingScans }).map((_, i) => (
            <PosCartRowSkeleton key={`scan-${i}`} />
          ))}
          {lines.map((line) => (
            <PosCartRow
              key={line.key}
              line={line}
              onRemove={() => removeLine(line.key)}
              isCheckout={checkoutReady && hideCheckout}
              hideRemove={hideCheckout}
              showDiscountNotAppliedNote={showDiscountNotAppliedNote}
            />
          ))}
        </DragScroll>
      )}

      {!empty && !hideCheckout && (
        <div style={{ padding: 'var(--space-md)', paddingBottom: 'calc(var(--space-md) + var(--device-safe-bottom, 0px))' }}>
          <PosButton label="Check out" fullWidth onClick={onCheckout} />
        </div>
      )}
    </div>
  );
}


/** iOS empty-cart illustration — `pos-shopping-bags` from the app's own asset catalogue, which
 *  ships a drawn-for-purpose variant per appearance (the dark one is not the light one
 *  inverted: its fills lighten while its outlines darken). Taking both means no blend-mode
 *  trickery to hide a background, which is what the single light asset used to need. */
function ShoppingBags() {
  const isDark = useIsDark();
  return (
    <img
      src={isDark ? darkBagsImg : lightBagsImg}
      alt=""
      aria-hidden
      style={{ width: 112, height: 104, objectFit: 'contain' }}
    />
  );
}

/** Loading placeholder shown while a barcode-scanned product resolves. */
function PosCartRowSkeleton() {
  return (
    <div className="woopos-cart-item" style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--space-sm)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div className="woopos-skeleton" style={{ width: 'var(--size-medium)', minHeight: 'var(--size-medium)', flex: 'none' }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6, padding: 'var(--space-sm) var(--space-sm) var(--space-sm) 0' }}>
        <div className="woopos-skeleton" style={{ width: '70%', height: 10, borderRadius: 'var(--radius-sm)' }} />
        <div className="woopos-skeleton" style={{ width: '40%', height: 10, borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
}

function PosCartRow({
  line,
  onRemove,
  isCheckout = false,
  hideRemove = false,
  showDiscountNotAppliedNote = false,
}: {
  line: CartLine;
  onRemove: () => void;
  isCheckout?: boolean;
  hideRemove?: boolean;
  showDiscountNotAppliedNote?: boolean;
}) {
  // Custom amounts proposal (src/versions/registry.ts): Plus taxes line; tapping the card
  // opens Review (the trash stays, and doesn't open it).
  const { flags } = useFlags();
  const navigate = useNav();
  const v2 = flags.customAmounts && line.kind === 'custom';
  const title = line.kind === 'coupon' ? line.code : line.name;
  const priceDetail =
    line.kind === 'custom'
      ? formatUsd(line.amount)
      : line.kind === 'product'
        ? line.quantity > 1
          ? `${line.quantity} × ${formatUsd(line.price)}`
          : formatUsd(line.price)
        : null;

  // Coupon icon tile — matches POSCouponImageView.swift exactly: a solid-fill rectangle,
  // muted gray normally, solid success green once applied at checkout, with the tag glyph
  // switching to onSuccess (white) rather than the tile just gaining a tint.
  const couponIconBg = isCheckout ? 'var(--color-success)' : 'var(--color-surface-dim)';
  const couponIconColor = isCheckout ? 'var(--color-on-success)' : 'var(--color-on-surface-variant-lowest)';

  const card = (
    <div className="woopos-cart-item" onClick={v2 && !hideRemove ? () => navigate('/custom-amount', { state: { editKey: line.key } }) : undefined} style={{ cursor: v2 && !hideRemove ? 'pointer' : undefined, display: 'flex', alignItems: 'stretch', gap: 'var(--space-sm)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-soft-medium)' }}>
      {/* Flush to the card's edges — no padding, no radius of its own; the outer card's
          overflow:hidden clips it into the rounded left corners (ItemRowView.swift: the
          image sits directly in the row with no inset, only the row itself is clipped). */}
      <div style={{ width: 'var(--size-medium)', minHeight: 'var(--size-medium)', flex: 'none', background: line.kind === 'coupon' ? couponIconBg : 'var(--color-surface-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {line.kind === 'product' ? (
          <ProductImage id={line.productId} />
        ) : v2 ? (
          <SquareAndPencil size="var(--icon-medium)" style={{ color: couponIconColor }} />
        ) : (
          <Tag size="var(--icon-medium)" style={{ color: couponIconColor }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-sm) 0' }}>
        <PosText variant="bodySmall" bold style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
          {title}
        </PosText>
        {line.kind === 'coupon' ? (
          <>
            {line.summary && (
              <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
                {line.summary}
              </PosText>
            )}
            {isCheckout && line.discount > 0 && (
              <PosText variant="bodySmall" color="var(--color-success)" style={{ display: 'block' }}>
                {`-${formatUsd(line.discount)}`}
              </PosText>
            )}
          </>
        ) : (
          <>
            <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)">{priceDetail}</PosText>
            {v2 && line.kind === 'custom' && line.taxable && (
              <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
                Plus taxes
              </PosText>
            )}
            {/* CustomAmountRowView: a third line under the amount, in posAlert. */}
            {line.kind === 'custom' && showDiscountNotAppliedNote && (
              <PosText variant="bodySmall" color="var(--color-alert)" style={{ display: 'block' }}>
                Discount not applied
              </PosText>
            )}
          </>
        )}
      </div>
      {!hideRemove && (
        <button type="button" aria-label={`Remove ${title}`} onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface-variant-highest)', padding: '0 var(--space-sm) 0 0', cursor: 'pointer', flex: 'none' }}>
          <Trash size="var(--icon-small)" />
        </button>
      )}
    </div>
  );
  return card;
}
