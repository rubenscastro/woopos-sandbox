import { useState } from 'react';
import { Text } from '../../../android/Text';
import { Button, OutlinedButton } from '../../../android/Button';
import { Toolbar } from '../../../android/Toolbar';
import { formatUsd } from '../../../../lib/currency';

/**
 * Custom amounts proposal — Android custom amount flow, a full-screen modal like Issue refund:
 * Amount (keypad entry, Continue disabled until there is a value) → Review (Edit amount /
 * Edit name / Charge taxes, Add to cart) → back to Amount or Name editing. Opening on an
 * existing cart line starts on Review with its values, and saves instead of adding.
 */
type Step = 'amount' | 'review' | 'editAmount' | 'editName';

export interface CustomAmountValue {
  name: string;
  amount: number;
  taxable: boolean;
}

export function CustomAmountFlow({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: CustomAmountValue;
  onSubmit: (v: CustomAmountValue) => void;
  onClose: () => void;
}) {
  const editing = !!initial;
  const [step, setStep] = useState<Step>(editing ? 'review' : 'amount');
  const [cents, setCents] = useState(initial ? Math.round(initial.amount * 100) : 0);
  const [name, setName] = useState(initial && initial.name !== 'Custom amount' ? initial.name : '');
  const [taxable, setTaxable] = useState(initial?.taxable ?? false);
  const [draft, setDraft] = useState('');

  const amount = cents / 100;
  const shell: React.CSSProperties = { position: 'absolute', inset: 0, zIndex: 40, background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' };
  const footer: React.CSSProperties = { padding: 'var(--space-md)', paddingBottom: 'calc(var(--space-md) + var(--device-keyboard-height, 0px))', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' };

  if (step === 'amount' || step === 'editAmount') {
    return (
      <div style={shell}>
        <Toolbar title="Custom amount" onBack={step === 'amount' ? onClose : () => setStep('review')} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
          <input
            autoFocus
            inputMode="numeric"
            aria-label="Amount"
            value={formatUsd(cents / 100)}
            onChange={(e) => setCents(parseInt(e.target.value.replace(/\D/g, '').slice(0, 9) || '0', 10))}
            style={{ border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', width: '100%', color: 'var(--color-on-surface)', caretColor: 'var(--color-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-heading-size)' }}
          />
        </div>
        <div style={footer}>
          <Button text="Continue" fullWidth state={cents > 0 ? 'enabled' : 'disabled'} onClick={() => setStep('review')} />
        </div>
      </div>
    );
  }

  if (step === 'editName') {
    return (
      <div style={shell}>
        <Toolbar title="Custom amount name" subtitle="Optional" onBack={() => setStep('review')} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
          <input
            autoFocus
            aria-label="Name"
            value={draft}
            placeholder="Custom amount"
            onChange={(e) => setDraft(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', width: '100%', color: 'var(--color-on-surface)', caretColor: 'var(--color-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-heading-size)' }}
          />
        </div>
        <div style={footer}>
          <Button text="Save" fullWidth onClick={() => { setName(draft.trim()); setStep('review'); }} />
        </div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <Toolbar title="Custom amount" onBack={onClose} backIcon="close" />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-lg)' }}>
        <Row label="Amount" action="Edit amount" value={formatUsd(amount)} onAction={() => setStep('editAmount')} />
        <Hairline />
        <Row label="Name (optional)" action="Edit name" value={name || 'Custom amount'} onAction={() => { setDraft(name); setStep('editName'); }} />
        <Hairline />
        {/* The whole row is the switch, not just the thumb. */}
        <button type="button" role="switch" aria-checked={taxable} onClick={() => setTaxable((t) => !t)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 'var(--space-md) 0', border: 'none', background: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
          <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)">Charge taxes</Text>
          <Switch checked={taxable} />
        </button>
      </div>
      <div style={{ ...footer, paddingBottom: 'var(--space-md)' }}>
        <Button text={editing ? 'Save changes' : 'Add to cart'} fullWidth onClick={() => onSubmit({ name, amount, taxable })} />
        <OutlinedButton text="Cancel" fullWidth onClick={onClose} />
      </div>
    </div>
  );
}

function Row({ label, action, value, onAction }: { label: string; action: string; value: string; onAction: () => void }) {
  return (
    <div style={{ padding: 'var(--space-md) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="bodyLarge" bold>{label}</Text>
        <button type="button" onClick={onAction} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-primary)', textDecoration: 'underline', font: 'inherit', fontSize: 'var(--font-body-md-size)' }}>
          {action}
        </button>
      </div>
      <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)">{value}</Text>
    </div>
  );
}

const Hairline = () => <div style={{ height: 1, background: 'var(--color-outline-variant)' }} />;

function Switch({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden
      style={{ width: 52, height: 32, borderRadius: 16, border: 'none', background: checked ? 'var(--color-primary)' : 'var(--color-outline-variant)', position: 'relative', transition: 'background 0.15s ease', flex: 'none', display: 'block' }}>
      <span style={{ position: 'absolute', top: 4, left: checked ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
    </span>
  );
}
