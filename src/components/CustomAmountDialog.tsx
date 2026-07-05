import { useState } from 'react';
import { Text } from './Text';
import { Button } from './Button';
import { Close } from './icons';

/**
 * WooPosCustomAmountDialog — add a non-catalog line item: amount (large heading input),
 * a "Charge taxes" toggle, an optional name (placeholder "Custom amount"), and a submit
 * button enabled only when amount > 0.
 */
interface CustomAmountDialogProps {
  onSubmit: (name: string, amount: number, taxable: boolean) => void;
  onDismiss: () => void;
}

export function CustomAmountDialog({ onSubmit, onDismiss }: CustomAmountDialogProps) {
  const [amountText, setAmountText] = useState('');
  const [name, setName] = useState('');
  const [taxable, setTaxable] = useState(false);

  const amount = parseFloat(amountText) || 0;
  const valid = amount > 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--color-surface)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)' }}
        >
          <Close size="var(--icon-medium)" />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-lg)' }}>
        <Section label="Amount">
          <input
            value={amountText}
            onChange={(e) => setAmountText(e.target.value.replace(/[^0-9.]/g, ''))}
            inputMode="decimal"
            placeholder="$0.00"
            autoFocus
            style={{
              border: 'none',
              borderBottom: '2px solid var(--color-outline-variant)',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              padding: 'var(--space-sm) 0',
              color: 'var(--color-on-surface)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-heading-size)',
              fontWeight: 700,
            }}
          />
        </Section>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-md) 0',
            borderBottom: '1px solid var(--color-outline-variant)',
          }}
        >
          <Text variant="bodyLarge">Charge taxes</Text>
          <Switch checked={taxable} onChange={setTaxable} />
        </div>

        <Section label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Custom amount"
            style={{
              border: 'none',
              borderBottom: '2px solid var(--color-outline-variant)',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              padding: 'var(--space-sm) 0',
              color: 'var(--color-on-surface)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-body-lg-size)',
            }}
          />
        </Section>
      </div>

      <div style={{ padding: 'var(--space-md)' }}>
        <Button
          text="Add custom amount"
          fullWidth
          state={valid ? 'enabled' : 'disabled'}
          onClick={() => onSubmit(name, amount, taxable)}
        />
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 'var(--space-md) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
        {label}
      </Text>
      {children}
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 52,
        height: 32,
        borderRadius: 16,
        border: 'none',
        background: checked ? 'var(--color-primary)' : 'var(--color-outline-variant)',
        position: 'relative',
        transition: 'background 0.15s ease',
        flex: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: checked ? 24 : 4,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s ease',
        }}
      />
    </button>
  );
}
