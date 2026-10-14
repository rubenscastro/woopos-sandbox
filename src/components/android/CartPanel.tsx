import { useEffect, useState } from 'react';
import { Text } from './Text';
import { Card } from './Card';
import { Button } from './Button';
import { Tag, EditSquare, Trash, ArrowBack, AddShoppingCart } from './icons';
import { ProductImage } from './ProductImage';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useCart, type CartLine } from '../../state/CartContext';
import { formatUsd } from '../../lib/currency';
import { useFlags } from '../../state/FlagsContext';
import { useNav } from '../../device/platformNav';
import { useCartSheet } from '../../device/CartSheet';

/**
 * The cart pane (WooPosCartScreen). Header (title + count + clear) and a list of line items
 * (products, custom amounts, coupons) each with a remove affordance. No quantity stepper and
 * no totals — order totals live on the checkout pane. Empty state shows the add-to-cart
 * illustration and the tap/scan prompt.
 */
interface CartPanelProps {
  onCheckout?: () => void;
  onScanBarcode?: () => void;
  onBack?: () => void;
  hideCheckout?: boolean;
  hideClear?: boolean;
  /** Read-only cart (e.g. during checkout): hides the per-item remove buttons. */
  hideRemove?: boolean;
  /** Whether the checkout pane (shown alongside this cart) has finished loading — coupons
   *  only flip to their applied (green) state once it has, so both panes resolve on the
   *  exact same timer instead of each running its own. Owned by the parent (ItemSelection)
   *  so it can be shared with CheckoutPane; defaults to false for standalone usage (the
   *  phone /cart route, which never shows checkout-mode coupon coloring). */
  checkoutReady?: boolean;
}

export function CartPanel({ onCheckout, onScanBarcode, onBack, hideCheckout, hideClear, hideRemove, checkoutReady = false }: CartPanelProps) {
  const { lines, itemCount, clear, pendingScans } = useCart();
  const empty = lines.length === 0 && pendingScans === 0;

  // WooPosCartViewModel.updateCustomAmountDiscountNotAppliedNote: coupons never discount
  // custom amounts (they're order fees), so custom-amount rows warn about it — but only at
  // checkout, and only while a coupon that actually produced a discount is still in the cart.
  // Source additionally restricts this to whole-cart coupons; every mock coupon here is a
  // cart-level discount, so a discounting coupon is the equivalent test.
  const showDiscountNotAppliedNote =
    checkoutReady && lines.some((l) => l.kind === 'coupon' && l.discount > 0);

  // Brief skeleton on mount when items are already in the cart (simulates data fetch).
  const [loading, setLoading] = useState(() => lines.length > 0);
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface-bright)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-md) var(--space-md) var(--space-md)',
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 0 }}
          >
            <ArrowBack size="var(--icon-medium)" />
          </button>
        )}
        <Text variant="heading" bold>
          Cart
        </Text>
        <div style={{ flex: 1 }} />
        {!empty && !hideClear && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            {itemCount > 0 && (
              <Text variant="bodySmall" color="var(--color-on-surface-variant-lowest)">
                {itemCount === 1 ? '1 item' : `${itemCount} items`}
              </Text>
            )}
            <ClearCartMenu onClear={clear} />
          </div>
        )}
      </div>

      {empty ? (
        <EmptyCart onScanBarcode={onScanBarcode} />
      ) : (
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md) var(--space-md)',
          }}
        >
          {Array.from({ length: pendingScans }).map((_, i) => (
            <CartLineSkeleton key={`scan-${i}`} />
          ))}
          {loading
            ? Array.from({ length: Math.min(lines.length, 5) }).map((_, i) => (
                <CartLineSkeleton key={`load-${i}`} />
              ))
            : lines.map((line) => (
                <CartLineRow
                  key={line.key}
                  line={line}
                  hideRemove={hideRemove}
                  isCheckout={checkoutReady}
                  showDiscountNotAppliedNote={showDiscountNotAppliedNote}
                />
              ))}
        </div>
      )}

      {!empty && !hideCheckout && (
        <div style={{ padding: 'var(--space-md)', paddingBottom: 'calc(var(--space-md) + var(--device-safe-bottom, 0px))' }}>
          <Button text="Check out" fullWidth onClick={onCheckout} />
        </div>
      )}
    </div>
  );
}

/** Trash icon in the cart header; tapping it opens a small menu with the Clear cart action. */
function ClearCartMenu({ onClear }: { onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative', alignSelf: 'center', flex: 'none' }}>
      <button
        type="button"
        aria-label="Clear cart"
        onClick={() => setOpen((o) => !o)}
        style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface-variant-highest)', padding: 4, cursor: 'pointer' }}
      >
        <Trash size="var(--icon-small)" />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-xs))',
            right: 0,
            zIndex: 30,
            minWidth: 160,
            background: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-normal-large)',
            padding: 'var(--space-xs)',
          }}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); onClear(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              border: 'none',
              background: 'transparent',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-error)',
              cursor: 'pointer',
            }}
          >
            <Trash size="var(--icon-small)" />
            <Text variant="bodyMedium" color="var(--color-error)">
              Clear cart
            </Text>
          </button>
        </div>
      )}
    </div>
  );
}

/** Shimmering placeholder for a product being scanned into the cart. */
function CartLineSkeleton() {
  return (
    <Card padding="0" className="woopos-cart-item">
      <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-sm)', gap: 'var(--space-sm)' }}>
        <div
          className="woopos-skeleton"
          style={{ width: 'var(--size-medium)', height: 'var(--size-medium)', borderRadius: 'var(--radius-md)', flex: 'none' }}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <div className="woopos-skeleton" style={{ height: '1em', width: '60%', borderRadius: 'var(--radius-sm)' }} />
          <div className="woopos-skeleton" style={{ height: '1em', width: '35%', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>
    </Card>
  );
}

function CartLineRow({
  line,
  hideRemove,
  isCheckout = false,
  showDiscountNotAppliedNote = false,
}: {
  line: CartLine;
  hideRemove?: boolean;
  isCheckout?: boolean;
  showDiscountNotAppliedNote?: boolean;
}) {
  const { removeLine } = useCart();
  // Custom amounts proposal (src/versions/registry.ts): Plus taxes line; tapping the card
  // opens Review (the trash stays, and doesn't open it).
  const { flags } = useFlags();
  const navigate = useNav();
  const { closeCartSheet } = useCartSheet();

  if (line.kind === 'coupon') {
    // Matches POSCouponImageView.swift: a solid-fill tile, muted gray in the cart, solid
    // success green once applied at checkout — not just a tinted icon.
    const tileColor = isCheckout ? 'var(--color-success)' : 'var(--color-surface-dim)';
    const iconColor = isCheckout ? 'var(--color-on-success)' : 'var(--color-on-surface-variant-lowest)';
    // Flush to the card's edges like the product row — no padding/radius of its own; the
    // card's own overflow:hidden clips it into the rounded corners.
    return (
      <Card padding="0" className="woopos-cart-item" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--space-sm)' }}>
          <div style={{ width: 'var(--size-medium)', minHeight: 'var(--size-medium)', flex: 'none', background: tileColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size="var(--icon-small)" style={{ color: iconColor }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-sm) 0' }}>
            <Text variant="bodySmall" bold style={ELLIPSIS}>
              {line.code}
            </Text>
            <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
              {line.summary}
            </Text>
            {isCheckout && line.discount > 0 && (
              <Text variant="bodySmall" color="var(--color-success)" style={{ display: 'block' }}>
                {`-${formatUsd(line.discount)}`}
              </Text>
            )}
          </div>
          {!hideRemove && (
            <div style={{ display: 'flex', alignItems: 'center', paddingRight: 'var(--space-sm)' }}>
              <RemoveButton onClick={() => removeLine(line.key)} label={line.code} />
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (line.kind === 'custom') {
    // The same row a product and a coupon get: a tile flush to the card's edges, the text
    // beside it. It was a rounded tile of initials floating inside a padded card — a third
    // taller than the lines above and below it, and the only thing in the cart that didn't
    // look like the rest of the cart. The glyph is the one iOS uses, where a custom amount
    // and a coupon share a tile.
    const v2 = flags.customAmounts;
    const openReview = () => { closeCartSheet(); navigate('/custom-amount', { state: { editKey: line.key } }); };
    const card = (
      <Card padding="0" className="woopos-cart-item" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--space-sm)' }}>
          <div style={{ width: 'var(--size-medium)', minHeight: 'var(--size-medium)', flex: 'none', background: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {v2
              ? <EditSquare size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
              : <Tag size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-sm) 0' }}>
            <Text variant="bodySmall" bold style={ELLIPSIS}>
              {line.name}
            </Text>
            <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
              {formatUsd(line.amount)}
              {!v2 && line.taxable ? ' · Tax included' : ''}
            </Text>
            {v2 && line.taxable && (
              <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
                Plus taxes
              </Text>
            )}
            {/* WooPosCartScreen.CustomAmountItem: its own BodySmall line below the amount,
                in the alert color — not a badge or an icon. */}
            {showDiscountNotAppliedNote && (
              <Text variant="bodySmall" color="var(--color-alert)" style={{ display: 'block' }}>
                Discount not applied
              </Text>
            )}
          </div>
          {!hideRemove && (
            <div style={{ display: 'flex', alignItems: 'center', paddingRight: 'var(--space-sm)' }}>
              <RemoveButton onClick={() => removeLine(line.key)} label={line.name} />
            </div>
          )}
        </div>
      </Card>
    );
    if (!v2 || hideRemove) return card;
    // A div rather than the Card's own onClick, which would render a button around the trash button.
    return <div onClick={openReview} style={{ cursor: 'pointer' }}>{card}</div>;
  }

  // product — image flush to the card's edges, no padding/radius of its own; the card's
  // own overflow:hidden clips it into the rounded corners (matches iOS's ItemRowView).
  return (
    <Card padding="0" className="woopos-cart-item" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--space-sm)' }}>
        <div
          style={{
            width: 'var(--size-medium)',
            minHeight: 'var(--size-medium)',
            flex: 'none',
          }}
        >
          <ProductImage id={line.productId} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-sm) 0' }}>
          <Text variant="bodySmall" bold style={ELLIPSIS}>
            {line.name}
          </Text>
          <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
            {line.quantity > 1 ? `${line.quantity} × ${formatUsd(line.price)}` : formatUsd(line.price)}
          </Text>
        </div>
        {!hideRemove && (
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 'var(--space-sm)' }}>
            <RemoveButton onClick={() => removeLine(line.key)} label={line.name} />
          </div>
        )}
      </div>
    </Card>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={`Remove ${label} from cart`}
      style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface-variant-highest)', padding: 6, flex: 'none' }}
    >
      <Trash size="var(--icon-small)" />
    </button>
  );
}

function EmptyCart({ onScanBarcode }: { onScanBarcode?: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-xl)',
        gap: 'var(--space-md)',
      }}
    >
      <div style={{ opacity: 0.5, color: 'var(--color-on-surface-variant-lowest)' }}>
        <AddShoppingCart size="var(--size-large)" />
      </div>
      <Text variant="bodyMedium" align="center" color="var(--color-on-surface-variant-lowest)">
        Tap on a product or{' '}
        <button
          type="button"
          onClick={onScanBarcode}
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            font: 'inherit',
            color: 'var(--color-primary)',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          scan a barcode
        </button>{' '}
        to add it to the cart
      </Text>
    </div>
  );
}

const ELLIPSIS = {
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  display: 'block' as const,
};

