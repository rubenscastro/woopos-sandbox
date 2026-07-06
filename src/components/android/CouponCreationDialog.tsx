import { useState } from 'react';
import { Text } from './Text';
import { Button } from './Button';
import { Close, AddShoppingCart, Inventory, ChevronRight } from './icons';

/**
 * Android Create Coupon flow (WooPosItemsViewModel.createAndAddCoupon → the coupon type picker
 * bottom sheet → the WooCommerce coupon editor). Step 1: a bottom sheet ("Create Coupon") with
 * Percentage / Fixed Cart / Fixed Product Discount rows (icon + title + subtitle). Step 2: a
 * full-screen editor (title = discount type, X close): Coupon Code + Regenerate, Add Description,
 * Coupon Expiry Date, Include Free Shipping?, Apply this coupon to (All Products / Select Product
 * Categories), Usage Restrictions, Create. Copy from the shared WooCommerce coupon editor.
 */
type DiscountType = 'percent' | 'fixedCart' | 'fixedProduct';
const TYPES: { id: DiscountType; title: string; subtitle: string; amount: 'percent' | 'currency'; helper: string; icon: (s: string) => React.ReactNode }[] = [
  { id: 'percent', title: 'Percentage Discount', subtitle: 'Create a percentage discount for selected products', amount: 'percent', helper: 'Set the percentage of the discount you want to offer.', icon: () => <PercentBadge /> },
  { id: 'fixedCart', title: 'Fixed Cart Discount', subtitle: 'Create a fixed total discount for the entire cart', amount: 'currency', helper: 'Set the fixed discount for the entire cart.', icon: (s) => <AddShoppingCart size={s} /> },
  { id: 'fixedProduct', title: 'Fixed Product Discount', subtitle: 'Create a fixed total discount for selected products', amount: 'currency', helper: 'Set the fixed discount for selected products.', icon: (s) => <Inventory size={s} /> },
];
const genCode = () => Math.random().toString(36).slice(2, 10);

export function CouponCreationDialog({
  onDismiss,
  onCreate,
}: {
  onDismiss: () => void;
  onCreate: (code: string, summary: string, discount: number) => void;
}) {
  const [type, setType] = useState<DiscountType | null>(null);
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState(genCode);
  const [freeShipping, setFreeShipping] = useState(false);
  const selected = TYPES.find((t) => t.id === type);

  const create = () => {
    if (!selected) return;
    const amt = amount.trim() || (selected.amount === 'percent' ? '10' : '5.00');
    const summary = selected.amount === 'percent' ? `${amt}% off` : `$${amt} off`;
    const discount = selected.amount === 'currency' ? parseFloat(amt) || 0 : 0;
    onCreate(code.trim().toUpperCase(), summary, discount);
  };

  // Step 2 — full-screen coupon editor.
  if (selected) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-md)', minHeight: 'var(--size-xsmall)' }}>
          <button type="button" aria-label="Close" onClick={() => setType(null)} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
            <Close size="var(--icon-medium)" />
          </button>
          <Text variant="heading" bold>{selected.title}</Text>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-md) var(--space-lg) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', ...boxInput }}>
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={selected.amount === 'percent' ? 'Amount (%)' : 'Amount ($)'} inputMode="decimal" style={bareInput} />
              <span style={{ color: 'var(--color-on-surface-variant-highest)' }}>{selected.amount === 'percent' ? '%' : '$'}</span>
            </div>
            <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">{selected.helper}</Text>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <div style={boxInput}><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon Code" style={bareInput} /></div>
            <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">Customers need to enter this code to use the coupon.</Text>
          </div>
          <button type="button" onClick={() => setCode(genCode())} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
            <Text variant="bodyMedium" bold color="var(--color-primary)" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>Regenerate Coupon Code</Text>
          </button>

          <OutlinedRow label="+  Add Description (Optional)" />
          <FieldBox label="Coupon Expiry Date" value="None" dropdown />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-sm) 0' }}>
            <Text variant="bodyLarge">Include Free Shipping?</Text>
            <Toggle checked={freeShipping} onChange={setFreeShipping} />
          </div>

          <Text variant="bodySmall" bold color="var(--color-on-surface-variant-highest)" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Apply this coupon to</Text>
          <OutlinedRow label="All Products" center />
          <OutlinedRow label="+  Select Product Categories" center />

          <Text variant="bodySmall" bold color="var(--color-on-surface-variant-highest)" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Usage details</Text>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-sm) 0' }}>
            <Text variant="bodyLarge">Usage Restrictions</Text>
            <ChevronRight size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
          </div>
        </div>

        <div style={{ padding: 'var(--space-md)' }}>
          <Button text="Create" fullWidth state={amount.trim() ? 'enabled' : 'disabled'} onClick={create} />
        </div>
      </div>
    );
  }

  // Step 1 — discount-type selection bottom sheet.
  return (
    <div className="woopos-scrim" role="presentation" onClick={onDismiss} style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: 'var(--color-surface-bright)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', padding: 'var(--space-lg) var(--space-lg) var(--space-xl)', boxShadow: 'var(--shadow-normal-large)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-outline-variant)', margin: '0 auto var(--space-lg)' }} />
        <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginBottom: 'var(--space-md)' }}>Create Coupon</Text>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TYPES.map((t) => (
            <button key={t.id} type="button" onClick={() => setType(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', width: '100%', textAlign: 'left', padding: 'var(--space-md) 0', border: 'none', background: 'transparent', color: 'var(--color-on-surface)', cursor: 'pointer' }}>
              <span style={{ display: 'flex', color: 'var(--color-on-surface)', flex: 'none' }}>{t.icon('var(--icon-medium)')}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text variant="bodyLarge" bold>{t.title}</Text>
                <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>{t.subtitle}</Text>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const boxInput: React.CSSProperties = { border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-low)', padding: '0 var(--space-md)', minHeight: 'var(--size-xsmall)', boxSizing: 'border-box' };
const bareInput: React.CSSProperties = { flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-on-surface)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-body-md-size)' };

function PercentBadge() {
  return <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-on-surface)', color: 'var(--color-surface-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>%</span>;
}
function OutlinedRow({ label, center }: { label: string; center?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', minHeight: 'var(--size-xsmall)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-md)' }}>
      <Text variant="bodyLarge" bold>{label}</Text>
    </div>
  );
}
function FieldBox({ label, value, dropdown }: { label: string; value: string; dropdown?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-md)', minHeight: 'var(--size-xsmall)' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Text variant="caption" color="var(--color-on-surface-variant-highest)">{label}</Text>
        <Text variant="bodyLarge">{value}</Text>
      </div>
      {dropdown && <span style={{ color: 'var(--color-on-surface-variant-lowest)' }}>▾</span>}
    </div>
  );
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} style={{ width: 52, height: 32, borderRadius: 16, border: 'none', background: checked ? 'var(--color-primary)' : 'var(--color-outline-variant)', position: 'relative', flex: 'none', cursor: 'pointer' }}>
      <span style={{ position: 'absolute', top: 4, left: checked ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
    </button>
  );
}
