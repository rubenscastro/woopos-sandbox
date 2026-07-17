import { useEffect, useState } from 'react';
import { PosText } from './PosText';
import { PosButton } from './PosButton';
import { ChevronRight, AddShoppingCart, Inventory } from './IosIcons';

/**
 * iOS "Create coupon" flow (Coupons/POSCouponCreationSheet.swift → the host coupon editor).
 * Presented as a sheet over the item list. Step 1: discount-type selection ("Create coupon"
 * + Percentage / Fixed Cart / Fixed Product Discount rows with icons + subtitles + Cancel).
 * Step 2: the coupon editor (Discount Type, Amount, Coupon Code + Regenerate, Add Description,
 * Coupon Expiry Date, Include Free Shipping, Apply to All Products / Select Product Categories,
 * Usage Restrictions, Create). Copy matches the shared WooCommerce coupon editor.
 */
type DiscountType = 'percent' | 'fixedCart' | 'fixedProduct';
const TYPES: { id: DiscountType; title: string; subtitle: string; amount: 'percent' | 'currency'; helper: string; icon: (s: string) => React.ReactNode }[] = [
  { id: 'percent', title: 'Percentage Discount', subtitle: 'Create a percentage discount for selected products', amount: 'percent', helper: 'Set the percentage of the discount you want to offer.', icon: () => <PercentBadge /> },
  { id: 'fixedCart', title: 'Fixed Cart Discount', subtitle: 'Create a fixed total discount for the entire cart', amount: 'currency', helper: 'Set the fixed discount for the entire cart.', icon: (s) => <AddShoppingCart size={s} /> },
  { id: 'fixedProduct', title: 'Fixed Product Discount', subtitle: 'Create a fixed total discount for selected products', amount: 'currency', helper: 'Set the fixed discount for selected products.', icon: (s) => <Inventory size={s} /> },
];

const genCode = () => Math.random().toString(36).slice(2, 10);

export function CreateCouponSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (code: string, summary: string, discount: number) => void;
}) {
  const [step, setStep] = useState<'type' | 'editor'>('type');
  const [type, setType] = useState<DiscountType>('percent');
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState(genCode);
  const [freeShipping, setFreeShipping] = useState(false);

  useEffect(() => {
    if (open) { setStep('type'); setAmount(''); setCode(genCode()); setFreeShipping(false); }
  }, [open]);

  if (!open) return null;
  const selected = TYPES.find((t) => t.id === type)!;

  const create = () => {
    const amt = amount.trim() || (selected.amount === 'percent' ? '10' : '5.00');
    const summary = selected.amount === 'percent' ? `${amt}% off` : `$${amt} off`;
    const discount = selected.amount === 'currency' ? parseFloat(amt) || 0 : 0;
    onCreated(code.trim().toUpperCase(), summary, discount);
  };

  return (
    <div className="woopos-scrim" role="presentation" onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, maxHeight: '92%', display: 'flex', flexDirection: 'column', background: 'var(--color-surface-bright)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-normal-large)' }}>
        {/* Header: Cancel (left) + Create coupon title. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
          <button type="button" onClick={onClose} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
            <PosText variant="bodyLarge" color="var(--color-primary)">Cancel</PosText>
          </button>
          <PosText variant="heading" bold>Create coupon</PosText>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-lg) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {step === 'type' ? (
            TYPES.map((t) => (
              <button key={t.id} type="button" onClick={() => { setType(t.id); setStep('editor'); }} style={rowBtn}>
                <span style={{ display: 'flex', color: 'var(--color-on-surface)', flex: 'none' }}>{t.icon('var(--icon-medium)')}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <PosText variant="bodyLarge" bold>{t.title}</PosText>
                  <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>{t.subtitle}</PosText>
                </div>
              </button>
            ))
          ) : (
            <>
              <SectionLabel>Coupon details</SectionLabel>
              <RowNav label="Discount Type" value={selected.title} onClick={() => setStep('type')} />
              <FieldRow label={`Amount (${selected.amount === 'percent' ? '%' : '$'})`}>
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" inputMode="decimal"
                  style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-on-surface)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-body-lg-size)', textAlign: 'right', width: 90 }} />
              </FieldRow>
              <Helper>{selected.helper}</Helper>
              <RowNav label="Coupon Code" value={code} onClick={() => {}} chevron={false} />
              <Helper>Customers need to enter this code to use the coupon.</Helper>
              <button type="button" onClick={() => setCode(genCode())} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
                <PosText variant="bodyMedium" color="var(--color-primary)">Regenerate Coupon Code</PosText>
              </button>
              <OutlineRow label="+  Add Description (Optional)" />
              <RowNav label="Coupon Expiry Date" value="None" onClick={() => {}} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-sm) 0' }}>
                <PosText variant="bodyLarge">Include Free Shipping?</PosText>
                <Toggle checked={freeShipping} onChange={setFreeShipping} />
              </div>
              <SectionLabel>Apply this coupon to</SectionLabel>
              <OutlineRow label="All Products" bold />
              <OutlineRow label="+  Select Product Categories" />
              <SectionLabel>Usage details</SectionLabel>
              <RowNav label="Usage Restrictions" value="" onClick={() => {}} />
            </>
          )}
        </div>

        <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
          {step === 'type'
            ? <PosButton label="Cancel" variant="outlined" fullWidth onClick={onClose} />
            : <PosButton label="Create" fullWidth disabled={!amount.trim()} onClick={create} />}
        </div>
      </div>
    </div>
  );
}

const rowBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', textAlign: 'left', padding: 'var(--space-md) 0', border: 'none', background: 'transparent', color: 'var(--color-on-surface)', cursor: 'pointer' };

function PercentBadge() {
  return (
    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-on-surface)', color: 'var(--color-surface-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>%</span>
  );
}
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', padding: 'var(--space-sm) 0' }}>
      <PosText variant="bodyLarge">{label}</PosText>
      {children}
    </div>
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <PosText variant="caption" color="var(--color-on-surface-variant-lowest)" style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 'var(--space-sm)' }}>{children}</PosText>;
}
function Helper({ children }: { children: React.ReactNode }) {
  return <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)">{children}</PosText>;
}
function RowNav({ label, value, onClick, chevron = true }: { label: string; value: string; onClick: () => void; chevron?: boolean }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', padding: 'var(--space-sm) 0', border: 'none', background: 'none', color: 'var(--color-on-surface)', cursor: 'pointer' }}>
      <PosText variant="bodyLarge" style={{ flex: 1, textAlign: 'left' }}>{label}</PosText>
      {value && <PosText variant="bodyLarge" color="var(--color-on-surface-variant-highest)">{value}</PosText>}
      {chevron && <ChevronRight size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />}
    </button>
  );
}
function OutlineRow({ label, bold }: { label: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'var(--size-xsmall)', border: '2px solid var(--color-inverse-surface)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-md)' }}>
      <PosText variant="bodyLarge" bold={bold}>{label}</PosText>
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
