import { Text } from './Text';
import { useCart } from '../state/CartContext';
import { formatUsd } from '../lib/currency';

/** Order totals grid: Subtotal / Discount total / Taxes, divider, then a bold Total. */
export function OrderSummary({ compact }: { compact?: boolean }) {
  const { subtotal, discountTotal, taxTotal, total } = useCart();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', width: '100%' }}>
      <Row label="Subtotal" value={formatUsd(subtotal)} />
      {discountTotal > 0 && <Row label="Discount total" value={`-${formatUsd(discountTotal)}`} />}
      <Row label="Taxes" value={formatUsd(taxTotal)} />
      <div style={{ height: 1, background: 'var(--color-outline-variant)', margin: 'var(--space-xs) 0' }} />
      <Row label="Total" value={formatUsd(total)} bold big={!compact} />
    </div>
  );
}

function Row({ label, value, bold, big }: { label: string; value: string; bold?: boolean; big?: boolean }) {
  const variant = big ? 'bodyXLarge' : 'bodyLarge';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text variant={variant} bold={bold} color={bold ? undefined : 'var(--color-on-surface-variant-highest)'}>
        {label}
      </Text>
      <Text variant={variant} bold={bold}>
        {value}
      </Text>
    </div>
  );
}
