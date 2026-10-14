import { useCallback, useState } from 'react';
import { Text } from '../../../android/Text';
import { Button } from '../../../android/Button';
import { Toolbar } from '../../../android/Toolbar';
import { Card } from '../../../android/Card';
import { EditSquare } from '../../../android/icons';
import { formatUsd } from '../../../../lib/currency';
import '../CustomAmountFlow.css';

/**
 * Custom amounts proposal — Android "Custom amount details", the one screen every custom amount goes
 * through (Figma: POS Playground, node 4277-26096): a card each for Amount and Name (the whole card
 * opens its editor), a Charge taxes card, and the primary button at the foot. Add paths open it
 * blank with the value entry already up; existing cart lines and the keypad's Edit details open it
 * filled in. Edit amount / Edit name are covers over it.
 */
type Step = 'details' | 'editAmount' | 'editName';

export interface CustomAmountValue {
  name: string;
  amount: number;
  taxable: boolean;
}

export function CustomAmountDetails({
  initial,
  onSubmit,
  onClose,
  submitText = 'Save',
  startOnAmount = false,
}: {
  initial?: CustomAmountValue;
  onSubmit: (v: CustomAmountValue) => void;
  onClose: () => void;
  /** The details screen's primary button — "Add to cart" when it came from the keypad. */
  submitText?: string;
  /** Open with the value entry already up over the details screen (Option 3's Add custom amount). */
  startOnAmount?: boolean;
}) {
  const [step, setStep] = useState<Step>(startOnAmount ? 'editAmount' : 'details');
  const [cents, setCents] = useState(initial ? Math.round(initial.amount * 100) : 0);
  const [name, setName] = useState(initial && initial.name !== 'Custom amount' ? initial.name : '');
  const [taxable, setTaxable] = useState(initial?.taxable ?? false);
  const [draft, setDraft] = useState('');
  // Not `autoFocus`: a field that mounts off-screen (the edit screens slide in) would make the
  // browser scroll the device to reveal it, which shoves the whole screen up mid-animation.
  // Edit amount / Edit name slide in from the right and back out to the right
  // (WooPosRefundReasonNavigation: slideInHorizontally / slideOutHorizontally), so closing
  // plays the exit before the step actually changes.
  const [closing, setClosing] = useState(false);
  // When it opens already on the value entry, that screen is the modal opening — no entrance of its own.
  const [animateCover, setAnimateCover] = useState(!startOnAmount);
  const closeEdit = () => {
    setAnimateCover(true);
    setClosing(true);
    window.setTimeout(() => { setClosing(false); setStep('details'); }, 300);
  };
  const firstEntry = startOnAmount && !animateCover;
  const coverClass = !animateCover ? undefined : closing ? 'ca-push-out' : 'ca-push-in';
  const focusOnMount = useCallback((el: HTMLInputElement | null) => el?.focus({ preventScroll: true }), []);

  const amount = cents / 100;
  const shell: React.CSSProperties = { position: 'absolute', inset: 0, zIndex: 40, background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' };
  const footer: React.CSSProperties = { padding: 'var(--space-md)', paddingBottom: 'calc(var(--space-md) + var(--device-keyboard-height, 0px))', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' };

  const amountScreen = (
      <div className={coverClass} style={shell}>
        {/* The first value screen of an add is the modal's opening screen: X closes the whole modal.
            Once the details screen has been seen, it is an ordinary back. */}
        <Toolbar title="Custom amount" onBack={firstEntry ? onClose : closeEdit} backIcon={firstEntry ? 'close' : 'arrow'} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
          <input
            ref={focusOnMount}
            inputMode="numeric"
            aria-label="Amount"
            value={formatUsd(cents / 100)}
            onChange={(e) => setCents(parseInt(e.target.value.replace(/\D/g, '').slice(0, 9) || '0', 10))}
            style={{ border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', width: '100%', color: 'var(--color-on-surface)', caretColor: 'var(--color-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-heading-size)' }}
          />
        </div>
        <div style={footer}>
          <Button text="Continue" fullWidth state={cents > 0 ? 'enabled' : 'disabled'} onClick={closeEdit} />
        </div>
      </div>
  );

  const nameScreen = (
      <div className={coverClass} style={shell}>
        <Toolbar title="Custom amount name" subtitle="Optional" onBack={closeEdit} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
          <input
            ref={focusOnMount}
            aria-label="Name"
            value={draft}
            placeholder="Custom amount"
            onChange={(e) => setDraft(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', width: '100%', color: 'var(--color-on-surface)', caretColor: 'var(--color-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-heading-size)' }}
          />
        </div>
        <div style={footer}>
          <Button text="Save" fullWidth onClick={() => { setName(draft.trim()); closeEdit(); }} />
        </div>
      </div>
  );

  // Edit amount / Edit name push in over this screen, which stays in place underneath them.
  const detailsScreen = (
    <div style={shell}>
      <Toolbar title="Custom amount details" onBack={onClose} />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-sm) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <DetailCard label="Amount" value={formatUsd(amount)} onClick={() => setStep('editAmount')} />
        <DetailCard label="Name (optional)" value={name || 'Custom amount'} onClick={() => { setDraft(name); setStep('editName'); }} />
        {/* The Card itself is the button, so its padding is tappable too. */}
        <Card padding="var(--space-lg)" onClick={() => setTaxable((t) => !t)} ariaLabel="Charge taxes">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)">Charge taxes</Text>
            <Switch checked={taxable} />
          </div>
        </Card>
      </div>
      <div style={{ ...footer, background: 'var(--color-surface-bright)', paddingBottom: 'var(--space-md)' }}>
        <Button text={submitText} fullWidth state={amount > 0 ? 'enabled' : 'disabled'} onClick={() => onSubmit({ name, amount, taxable })} />
      </div>
    </div>
  );

  return (
    <>
      {detailsScreen}
      {step === 'editAmount' && amountScreen}
      {step === 'editName' && nameScreen}
    </>
  );
}

/** A details card: label left, value + edit glyph right; the whole card opens the editor. */
function DetailCard({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <Card padding="var(--space-lg)" onClick={onClick} ariaLabel={`Edit ${label}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', textAlign: 'left' }}>
        <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)" style={{ flex: 1 }}>{label}</Text>
        <Text variant="bodyXLarge" bold>{value}</Text>
        <EditSquare size="var(--icon-medium)" style={{ color: 'var(--color-on-surface-variant-lowest)', flex: 'none' }} />
      </div>
    </Card>
  );
}

function Switch({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden
      style={{ width: 52, height: 32, borderRadius: 16, border: 'none', background: checked ? 'var(--color-primary)' : 'var(--color-outline-variant)', position: 'relative', transition: 'background 0.15s ease', flex: 'none', display: 'block' }}>
      <span style={{ position: 'absolute', top: 4, left: checked ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
    </span>
  );
}
