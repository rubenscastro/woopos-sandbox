import { useState } from 'react';
import { PosText } from './PosText';
import { PosButton } from './PosButton';
import { ChevronLeft } from './IosIcons';

/**
 * iOS Add custom amount form (Custom Amount/AddCustomAmountView.swift). A full-screen pushed
 * form: header ("Custom amount" + back chevron), a large amount display ("$" + value), a
 * "Charge taxes" toggle, a Name field (placeholder "Custom amount"), and a pinned
 * "Add custom amount" button (disabled until the amount is > 0). Real iOS copy.
 */
export function AddCustomAmountForm({
  onDismiss,
  onSubmit,
}: {
  onDismiss: () => void;
  onSubmit: (name: string, amount: number, taxable: boolean) => void;
}) {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [taxable, setTaxable] = useState(false);
  const amountNum = parseFloat(amount) || 0;
  const canAdd = amountNum > 0;

  const submit = () => {
    if (!canAdd) return;
    onSubmit(name.trim() || 'Custom amount', amountNum, taxable);
    onDismiss();
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 'var(--device-keyboard-height, 0px)', zIndex: 45, background: 'var(--color-surface-bright)', display: 'flex', flexDirection: 'column' }}>
      {/* Header (POSPageHeaderView + back chevron). Top padding clears the OS status bar. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'calc(var(--device-safe-top, 0px) + var(--space-lg)) var(--space-lg) var(--space-md)', minHeight: 'var(--size-xsmall)' }}>
        <button type="button" aria-label="Back" onClick={onDismiss} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: '4px 8px 4px 0', cursor: 'pointer' }}>
          <ChevronLeft size="30px" />
        </button>
        <PosText variant="heading" bold>
          Custom amount
        </PosText>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Amount */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <PosText variant="bodyMedium" color="var(--color-on-surface-variant-lowest)">
            Amount
          </PosText>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
            <span style={{ fontSize: 'var(--font-heading-size)', fontWeight: 700, color: 'var(--color-on-surface)' }}>$</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              inputMode="decimal"
              autoFocus
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: amount ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant-lowest)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-heading-size)', fontWeight: 700 }}
            />
          </div>
        </div>

        <Divider />

        {/* Charge taxes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-sm) 0' }}>
          <PosText variant="bodyLarge">Charge taxes</PosText>
          <PosToggle checked={taxable} onChange={setTaxable} />
        </div>

        <Divider />

        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <PosText variant="bodyMedium" color="var(--color-on-surface-variant-lowest)">
            Name
          </PosText>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Custom amount"
            style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-on-surface)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-body-lg-size)', padding: 'var(--space-sm) 0' }}
          />
        </div>
      </div>

      <div style={{ padding: 'var(--space-md) var(--space-lg)', paddingBottom: 'calc(var(--space-md) + var(--device-safe-bottom, 0px))' }}>
        <PosButton label="Add custom amount" fullWidth disabled={!canAdd} onClick={submit} />
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-outline-variant)' }} />;
}

function PosToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{ width: 52, height: 32, borderRadius: 16, border: 'none', background: checked ? 'var(--color-primary)' : 'var(--color-outline-variant)', position: 'relative', flex: 'none', cursor: 'pointer' }}
    >
      <span style={{ position: 'absolute', top: 4, left: checked ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
    </button>
  );
}
