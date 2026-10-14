import { useCallback, useState } from 'react';
import { PosText } from '../../../ios/PosText';
import { PosButton } from '../../../ios/PosButton';
import { ChevronLeft, Close, SquareAndPencil } from '../../../ios/IosIcons';
import { formatUsd } from '../../../../lib/currency';
import '../CustomAmountFlow.css';

/**
 * Custom amounts proposal — iOS "Custom amount details", the one screen every custom amount goes
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
  const focusOnMount = useCallback((el: HTMLInputElement | null) => el?.focus({ preventScroll: true }), []);
  // Edit amount / Edit name are full-screen covers in the app (`.posFullScreenCover` →
  // SwiftUI `fullScreenCover`, as for Refund reason): they rise from the bottom and, on
  // dismiss, drop back down — so closing plays the exit before the step actually changes.
  const [closing, setClosing] = useState(false);
  // When it opens already on the value entry, that screen is the modal opening — no entrance of its own.
  const [animateCover, setAnimateCover] = useState(!startOnAmount);
  const closeCover = () => {
    setAnimateCover(true);
    setClosing(true);
    window.setTimeout(() => { setClosing(false); setStep('details'); }, 300);
  };
  const firstEntry = startOnAmount && !animateCover;
  const coverClass = !animateCover ? undefined : closing ? 'ca-cover-down' : 'ca-cover-up';

  const amount = cents / 100;
  const shell: React.CSSProperties = { position: 'absolute', inset: 0, zIndex: 40, background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' };
  const header: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-md) var(--space-lg)' };
  const footer: React.CSSProperties = { padding: 'var(--space-md) var(--space-lg)', paddingBottom: 'calc(var(--space-md) + var(--device-keyboard-height, 0px))', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' };
  const bigInput: React.CSSProperties = { border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', width: '100%', color: 'var(--color-on-surface)', caretColor: 'var(--color-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-heading-size)' };

  const amountScreen = (
      <div className={coverClass} style={shell}>
        <div style={header}>
          {/* The first value screen of an add is the modal's opening screen: X closes the whole
              modal. Once the details screen has been seen, it is an ordinary back. */}
          {firstEntry ? <CloseButton onClick={onClose} /> : <BackButton onClick={closeCover} />}
          <PosText variant="heading" bold>Custom amount</PosText>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
          <input
            ref={focusOnMount}
            inputMode="numeric"
            aria-label="Amount"
            value={formatUsd(cents / 100)}
            onChange={(e) => setCents(parseInt(e.target.value.replace(/\D/g, '').slice(0, 9) || '0', 10))}
            style={bigInput}
          />
        </div>
        <div style={footer}>
          <PosButton label="Continue" fullWidth disabled={cents <= 0} onClick={closeCover} />
        </div>
      </div>
  );

  const nameScreen = (
      <div className={coverClass} style={shell}>
        <div style={header}>
          <BackButton onClick={closeCover} />
          <div>
            <PosText variant="heading" bold>Custom amount name</PosText>
            <PosText variant="bodyLarge" style={{ display: 'block' }}>Optional</PosText>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
          <input ref={focusOnMount} aria-label="Name" value={draft} placeholder="Custom amount" onChange={(e) => setDraft(e.target.value)} style={bigInput} />
        </div>
        <div style={footer}>
          <PosButton label="Save" fullWidth onClick={() => { setName(draft.trim()); closeCover(); }} />
        </div>
      </div>
  );

  // Edit amount / Edit name push in over this screen, which stays in place underneath them.
  const detailsScreen = (
    <div style={shell}>
      <div style={header}>
        <BackButton onClick={onClose} />
        <PosText variant="heading" bold>Custom amount details</PosText>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <DetailCard label="Amount" value={formatUsd(amount)} onClick={() => setStep('editAmount')} />
        <DetailCard label="Name (optional)" value={name || 'Custom amount'} onClick={() => { setDraft(name); setStep('editName'); }} />
        <button type="button" role="switch" aria-checked={taxable} onClick={() => setTaxable((t) => !t)}
          style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', border: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
          <PosText variant="bodyLarge" color="var(--color-on-surface-variant-highest)">Charge taxes</PosText>
          <Toggle checked={taxable} />
        </button>
      </div>
      <div style={{ ...footer, background: 'var(--color-surface-bright)', paddingBottom: 'calc(var(--space-md) + var(--device-safe-bottom, 0px))' }}>
        <PosButton label={submitText} fullWidth disabled={amount <= 0} onClick={() => onSubmit({ name, amount, taxable })} />
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

const cardStyle: React.CSSProperties = { background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--pos-shadow-small, var(--pos-shadow-medium))', padding: 'var(--space-lg)' };

/** A details card: label left, value + edit glyph right; the whole card opens the editor. */
function DetailCard({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    // The card itself is the button, so its padding is tappable too.
    <button type="button" onClick={onClick} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', border: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
      <PosText variant="bodyLarge" color="var(--color-on-surface-variant-highest)" style={{ flex: 1 }}>{label}</PosText>
      <PosText variant="bodyXLarge" bold>{value}</PosText>
      <SquareAndPencil size="var(--icon-medium)" style={{ color: 'var(--color-on-surface-variant-lowest)', flex: 'none' }} />
    </button>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" aria-label="Close" onClick={onClick} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: '4px 8px 4px 0', cursor: 'pointer' }}>
      <Close size="var(--icon-medium)" />
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" aria-label="Back" onClick={onClick} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: '4px 8px 4px 0', cursor: 'pointer' }}>
      <ChevronLeft size="30px" />
    </button>
  );
}

function Toggle({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden
      style={{ width: 52, height: 32, borderRadius: 16, border: 'none', background: checked ? 'var(--color-primary)' : 'var(--color-outline-variant)', position: 'relative', flex: 'none', display: 'block' }}>
      <span style={{ position: 'absolute', top: 4, left: checked ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
    </span>
  );
}
