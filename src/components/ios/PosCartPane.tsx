import { PosText } from './PosText';
import { PosButton } from './PosButton';
import { ProductImage } from '../android/ProductImage';
import { Trash, Barcode, Tag, ChevronLeft } from '../android/icons';
import { useCart, type CartLine } from '../../state/CartContext';
import { formatUsd } from '../../lib/currency';

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
}: {
  onCheckout?: () => void;
  onScanBarcode?: () => void;
  /** When checking out, the cart becomes a sidebar with a back chevron (slide animation). */
  onBack?: () => void;
  hideCheckout?: boolean;
  /** Phone drawer hides the "N items" count next to the title. */
  showItemCount?: boolean;
}) {
  const { lines, itemCount, clear, removeLine, pendingScans } = useCart();
  const empty = lines.length === 0 && pendingScans === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface-bright)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-md) var(--space-sm)' }}>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--space-xl) var(--space-xxl)', gap: 'var(--space-sm)' }}>
          <ShoppingBags />
          {/* CartView.swift empty state: hint text (wraps across lines), then "Scan barcode" + the
              barcode.viewfinder icon AFTER it. The icon is the tappable affordance — tinted primary
              (SwiftUI button default tint) — and opens the barcode scanner setup; the words are muted. */}
          <PosText variant="bodyMedium" align="center" color="var(--color-on-surface-variant-lowest)" style={{ whiteSpace: 'pre-line' }}>
            {'Tap on a product\nto add it to the cart,\nor'}
          </PosText>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PosText variant="bodyMedium" color="var(--color-on-surface-variant-lowest)">Scan barcode</PosText>
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
      ) : (
        <div className="woopos-no-scrollbar" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: 'var(--space-xs) var(--space-md) var(--space-md)' }}>
          {/* Barcode-scanned products resolve after a brief loading row (shared Barcode tool). */}
          {Array.from({ length: pendingScans }).map((_, i) => (
            <PosCartRowSkeleton key={`scan-${i}`} />
          ))}
          {lines.map((line) => (
            <PosCartRow key={line.key} line={line} onRemove={() => removeLine(line.key)} />
          ))}
        </div>
      )}

      {!empty && !hideCheckout && (
        <div style={{ padding: 'var(--space-md)', paddingBottom: 'calc(var(--space-md) + var(--device-safe-bottom, 0px))' }}>
          <PosButton label="Check out" fullWidth onClick={onCheckout} />
        </div>
      )}
    </div>
  );
}

/** iOS empty-cart illustration (WooFoundation shopping-bags asset): two flat, filled bags —
 *  a lighter back bag with a solid handle loop and a darker front bag with a cut-out handle arc. */
function ShoppingBags() {
  const light = 'var(--color-on-surface-variant-lowest)';
  const dark = 'var(--color-on-surface-variant-highest)';
  const bg = 'var(--color-surface-bright)';
  return (
    <svg width="112" height="104" viewBox="0 0 112 104" fill="none" aria-hidden style={{ opacity: 0.55 }}>
      {/* Back-left bag: filled body with a solid inverted-U handle. */}
      <path d="M14 34h46l5 54a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4l5-54z" fill={light} />
      <path d="M25 36v-6a12 12 0 0 1 24 0v6" fill="none" stroke={dark} strokeWidth="6" strokeLinecap="round" />
      {/* Front-right bag: darker trapezoid (wider at bottom) with a cut-out handle arc. */}
      <path d="M63 46h34l6 48a4 4 0 0 1-4 4H61a4 4 0 0 1-4-4l6-48z" fill={dark} />
      <path d="M71 47v-4a9 9 0 0 1 18 0v4" fill="none" stroke={bg} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Loading placeholder shown while a barcode-scanned product resolves. */
function PosCartRowSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-sm)' }}>
      <div className="woopos-skeleton" style={{ width: 'var(--size-medium)', height: 'var(--size-medium)', borderRadius: 'var(--radius-md)', flex: 'none' }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="woopos-skeleton" style={{ width: '70%', height: 10, borderRadius: 'var(--radius-sm)' }} />
        <div className="woopos-skeleton" style={{ width: '40%', height: 10, borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
}

function PosCartRow({ line, onRemove }: { line: CartLine; onRemove: () => void }) {
  const title = line.kind === 'coupon' ? line.code : line.name;
  const detail =
    line.kind === 'coupon'
      ? `-${formatUsd(line.discount)}`
      : line.kind === 'custom'
        ? formatUsd(line.amount)
        : line.quantity > 1
          ? `${line.quantity} × ${formatUsd(line.price)}`
          : formatUsd(line.price);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-sm)' }}>
      <div style={{ width: 'var(--size-medium)', height: 'var(--size-medium)', borderRadius: 'var(--radius-md)', overflow: 'hidden', flex: 'none', background: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {line.kind === 'product' ? (
          <ProductImage id={line.productId} radius="var(--radius-md)" />
        ) : (
          <Tag size="var(--icon-medium)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <PosText variant="bodySmall" bold style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
          {title}
        </PosText>
        <PosText variant="bodySmall" color={line.kind === 'coupon' ? 'var(--color-success)' : 'var(--color-on-surface-variant-highest)'}>
          {detail}
        </PosText>
      </div>
      <button type="button" aria-label={`Remove ${title}`} onClick={onRemove} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface-variant-highest)', padding: 6, cursor: 'pointer', flex: 'none' }}>
        <Trash size="var(--icon-small)" />
      </button>
    </div>
  );
}
