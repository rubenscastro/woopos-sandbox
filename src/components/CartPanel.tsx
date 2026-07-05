import { Text } from './Text';
import { Card } from './Card';
import { Button } from './Button';
import { Tag, Trash, ChevronLeft, AddShoppingCart, Barcode } from './icons';
import { ProductImage } from './ProductImage';
import { useCart, type CartLine } from '../state/CartContext';
import { formatUsd } from '../lib/currency';

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
}

export function CartPanel({ onCheckout, onScanBarcode, onBack, hideCheckout }: CartPanelProps) {
  const { lines, itemCount, clear } = useCart();
  const empty = lines.length === 0;

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
        {!empty && (
          <button
            type="button"
            onClick={clear}
            style={{ border: 'none', background: 'none', color: 'var(--color-error)', padding: 4 }}
          >
            <Text variant="bodySmall" color="var(--color-error)">
              Clear cart
            </Text>
          </button>
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
            padding: 'var(--space-xs) var(--space-md) var(--space-md)',
          }}
        >
          {lines.map((line) => (
            <CartLineRow key={line.key} line={line} />
          ))}
        </div>
      )}

      {!empty && !hideCheckout && (
        <div style={{ padding: 'var(--space-md)' }}>
          <Button text="Check out" fullWidth onClick={onCheckout} />
        </div>
      )}
    </div>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
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
          <RemoveButton onClick={() => removeLine(line.key)} label={line.code} />
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
          <RemoveButton onClick={() => removeLine(line.key)} label={line.name} />
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
        <RemoveButton onClick={() => removeLine(line.key)} label={line.name} />
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
        <AddShoppingCart size="var(--icon-xlarge)" />
      </div>
      <Text variant="bodyMedium" align="center" color="var(--color-on-surface-variant-highest)">
        Tap on a product to add it to the cart, or Scan barcode{' '}
        <button
          type="button"
          onClick={onScanBarcode}
          aria-label="Scan barcode"
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            color: 'var(--color-primary)',
            cursor: 'pointer',
            display: 'inline-flex',
            verticalAlign: 'middle',
          }}
        >
          <Barcode size="1.25em" style={{ color: 'var(--color-primary)' }} />
        </button>
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
