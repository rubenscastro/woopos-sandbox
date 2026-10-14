import { useState } from 'react';
import { Text } from './Text';
import { Button } from './Button';
import { Toolbar } from './Toolbar';

/**
 * WooPosCustomAmountDialog — add a non-catalog line item: amount (large heading input),
 * a "Charge taxes" toggle, an optional name (placeholder "Custom amount"), and a submit
 * button enabled only when amount > 0.
 */
interface CustomAmountDialogProps {
  onSubmit: (name: string, amount: number, taxable: boolean) => void;
  onDismiss: () => void;
  /** Custom amounts proposal: editing an existing line prefills the form. */
  initial?: { name: string; amount: number; taxable: boolean };
  title?: string;
  submitText?: string;
  /** Custom amounts proposal: full-screen on tablet — keep the form a readable width. */
  centered?: boolean;
}

export function CustomAmountDialog({ onSubmit, onDismiss, initial, title = 'Custom amount', submitText = 'Add custom amount', centered }: CustomAmountDialogProps) {
  const [amountText, setAmountText] = useState(initial ? String(initial.amount) : '');
  const [name, setName] = useState(initial && initial.name !== 'Custom amount' ? initial.name : '');
  const [taxable, setTaxable] = useState(initial?.taxable ?? false);

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
      {/* The form takes over the items pane, and the items toolbar goes into back-navigation
          mode over it — a back arrow and the form's own title, not a bare ✕ floating in the
          corner. Same shape as iOS, which puts a chevron and "Custom amount" here too. */}
      <Toolbar title={title} onBack={onDismiss} />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-lg)', width: '100%', maxWidth: centered ? 640 + 2 * 24 : undefined, alignSelf: 'center', boxSizing: 'border-box' }}>
        {/* Rules sit *between* the three sections, one hairline each, the way the form's own
            HorizontalDividers do — not as a 2px underline beneath every field, which drew one
            line too many and drew each at twice the weight. */}
        <Section label="Amount">
          <input
            value={amountText}
            onChange={(e) => setAmountText(e.target.value.replace(/[^0-9.]/g, ''))}
            inputMode="decimal"
            placeholder="$0.00"
            autoFocus
            style={{
              border: 'none',
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
            borderTop: '1px solid var(--color-outline-variant)',
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

      <div style={{ padding: 'var(--space-md)', paddingInline: centered ? 'var(--space-lg)' : undefined, paddingBottom: 'calc(var(--space-md) + var(--device-keyboard-height, 0px))', width: '100%', maxWidth: centered ? 640 + 2 * 24 : undefined, alignSelf: 'center', boxSizing: 'border-box' }}>
        <Button
          text={submitText}
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
    // A <label>, so tapping anywhere in the section (not just on the text line) focuses its field.
    <label style={{ padding: 'var(--space-md) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', cursor: 'text' }}>
      <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
        {label}
      </Text>
      {children}
    </label>
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
