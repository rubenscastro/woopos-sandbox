import { useState } from 'react';
import { Text } from './Text';
import { Card } from './Card';
import { Button } from './Button';
import { Tag, Trash, ChevronLeft, AddShoppingCart } from './icons';
import { ProductImage } from './ProductImage';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useCart, type CartLine } from '../../state/CartContext';
import { formatUsd } from '../../lib/currency';

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
}

export function CartPanel({ onCheckout, onScanBarcode, onBack, hideCheckout, hideClear, hideRemove }: CartPanelProps) {
  const { lines, itemCount, clear, pendingScans } = useCart();
  const empty = lines.length === 0 && pendingScans === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface-bright)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 'var(--space-sm)',
          padding: 'var(--space-md) var(--space-md) var(--space-sm)',
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 0 }}
          >
            <ChevronLeft size="var(--icon-medium)" />
          </button>
        )}
        <Text variant="heading" bold>
          Cart
        </Text>
        {itemCount > 0 && (
          <Text variant="bodySmall" color="var(--color-on-surface-variant-lowest)">
            {itemCount === 1 ? '1 item' : `${itemCount} items`}
          </Text>
        )}
        <div style={{ flex: 1 }} />
        {!empty && !hideClear && <ClearCartMenu onClear={clear} />}
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
            padding: 'var(--space-xs) var(--space-md) var(--space-md)',
          }}
        >
          {Array.from({ length: pendingScans }).map((_, i) => (
            <CartLineSkeleton key={`scan-${i}`} />
          ))}
          {lines.map((line) => (
            <CartLineRow key={line.key} line={line} hideRemove={hideRemove} />
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
    <Card padding="0">
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

function CartLineRow({ line, hideRemove }: { line: CartLine; hideRemove?: boolean }) {
  const { removeLine } = useCart();

  if (line.kind === 'coupon') {
    return (
      <Card padding="0">
        <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-sm)', gap: 'var(--space-sm)' }}>
          <IconTile color="var(--color-success)">
            <Tag size="var(--icon-small)" style={{ color: 'var(--color-on-success)' }} />
          </IconTile>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodySmall" bold style={ELLIPSIS}>
              {line.code}
            </Text>
            <Text variant="bodySmall" color="var(--color-success)">
              -{formatUsd(line.discount)}
            </Text>
          </div>
          {!hideRemove && <RemoveButton onClick={() => removeLine(line.key)} label={line.code} />}
        </div>
      </Card>
    );
  }

  if (line.kind === 'custom') {
    return (
      <Card padding="0">
        <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-sm)', gap: 'var(--space-sm)' }}>
          <IconTile color="var(--color-secondary)">
            <Text variant="bodySmall" bold color="var(--color-on-secondary)">
              {initials(line.name)}
            </Text>
          </IconTile>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodySmall" bold style={ELLIPSIS}>
              {line.name}
            </Text>
            <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
              {formatUsd(line.amount)}
              {line.taxable ? ' · Tax included' : ''}
            </Text>
          </div>
          {!hideRemove && <RemoveButton onClick={() => removeLine(line.key)} label={line.name} />}
        </div>
      </Card>
    );
  }

  // product
  return (
    <Card padding="0">
      <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-sm)', gap: 'var(--space-sm)' }}>
        <div
          style={{
            width: 'var(--size-medium)',
            height: 'var(--size-medium)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            flex: 'none',
          }}
        >
          <ProductImage id={line.productId} radius="var(--radius-md)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodySmall" bold style={ELLIPSIS}>
            {line.name}
          </Text>
          <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
            {line.quantity > 1 ? `${line.quantity} × ${formatUsd(line.price)}` : formatUsd(line.price)}
          </Text>
        </div>
        {!hideRemove && <RemoveButton onClick={() => removeLine(line.key)} label={line.name} />}
      </div>
    </Card>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Remove ${label} from cart`}
      style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface-variant-highest)', padding: 6, flex: 'none' }}
    >
      <Trash size="var(--icon-small)" />
    </button>
  );
}

function IconTile({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 'var(--size-medium)',
        height: 'var(--size-medium)',
        background: color,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      {children}
    </div>
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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
