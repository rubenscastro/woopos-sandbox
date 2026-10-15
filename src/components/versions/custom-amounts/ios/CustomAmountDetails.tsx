import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PosText } from '../../../ios/PosText';
import { PosButton } from '../../../ios/PosButton';
import { ChevronLeft, Close } from '../../../ios/IosIcons';
import { formatUsd } from '../../../../lib/currency';
import '../CustomAmountFlow.css';
import { useGeneralSettings } from '../../../../state/generalSettings';
import { confirmIfDirty, setUnsavedChanges } from '../../../../state/unsavedGuard';

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
  ctaPlacement = 'footer',
  onLeaveStart,
  requireChange = false,
  resetKey,
  leaveWhen = false,
  onShown,
}: {
  initial?: CustomAmountValue;
  onSubmit: (v: CustomAmountValue) => void;
  onClose: () => void;
  /** The details screen's primary button — "Add to cart" when it came from the keypad. */
  submitText?: string;
  /** Open with the value entry already up over the details screen (Option 3's Add custom amount). */
  startOnAmount?: boolean;
  /** `footer`: a primary button at the foot. `title`: a small secondary button in the title row (Option 2B). */
  ctaPlacement?: 'footer' | 'title';
  /** Called as the exit begins, so a host can move what is underneath back in step. */
  onLeaveStart?: () => void;
  /** Editing something that already exists: the action stays disabled until something has changed. */
  requireChange?: boolean;
  /** When this changes the screen is showing a different thing: reload the fields from `initial`. */
  resetKey?: string;
  /** Close (with the usual exit) as soon as this turns true — e.g. the thing being edited was deleted. */
  leaveWhen?: boolean;
  /** Called when the details first come into view (an add leaving its value entry). */
  onShown?: () => void;
}) {
  // Settings → General (Option 4): new custom amounts start with Charge taxes on.
  const { taxableByDefault } = useGeneralSettings();
  const [step, setStep] = useState<Step>(startOnAmount ? 'editAmount' : 'details');
  const [cents, setCents] = useState(initial ? Math.round(initial.amount * 100) : 0);
  const [name, setName] = useState(initial && initial.name !== 'Custom amount' ? initial.name : '');
  const [taxable, setTaxable] = useState(initial?.taxable ?? taxableByDefault);
  const [draft, setDraft] = useState('');
  // Tapping another custom amount in the cart while this is open switches what it shows, in place
  // (no new entrance) — the fields reload from `initial`, as if freshly opened on that one.
  const lastKey = useRef(resetKey);
  useEffect(() => {
    if (lastKey.current === resetKey) return;
    lastKey.current = resetKey;
    setCents(initial ? Math.round(initial.amount * 100) : 0);
    setName(initial && initial.name !== 'Custom amount' ? initial.name : '');
    setTaxable(initial?.taxable ?? taxableByDefault);
    setStep('details');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);
  // Not `autoFocus`: a field that mounts off-screen (the edit screens slide in) would make the
  // browser scroll the device to reveal it, which shoves the whole screen up mid-animation.
  const focusOnMount = useCallback((el: HTMLInputElement | null) => el?.focus({ preventScroll: true }), []);
  // Edit amount / Edit name are full-screen covers in the app (`.posFullScreenCover` →
  // SwiftUI `fullScreenCover`, as for Refund reason): they rise from the bottom and, on
  // dismiss, drop back down — so closing plays the exit before the step actually changes.
  const [closing, setClosing] = useState(false);
  // Opening on the value entry (an add) makes that screen the modal's visible opening, so it takes
  // the entrance and the details underneath do not; `seenDetails` is what turns its X into a back.
  const [seenDetails, setSeenDetails] = useState(!startOnAmount);
  // The details screen itself comes in and goes out the same way, on every path (route or home pane).
  const [leaving, setLeaving] = useState(false);
  const leave = (fn: () => void) => {
    setLeaving(true);
    onLeaveStart?.();
    window.setTimeout(fn, 300);
  };
  useEffect(() => {
    if (leaveWhen && !leaving) leave(onClose);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveWhen]);
  const exitCover = (fn: () => void) => {
    setClosing(true);
    window.setTimeout(fn, 300);
  };
  const closeCover = () => {
    setSeenDetails(true);
    onShown?.();
    setClosing(true);
    window.setTimeout(() => { setClosing(false); setStep('details'); }, 300);
  };
  const firstEntry = startOnAmount && !seenDetails;
  // An add's first value entry skips the details: Continue puts the amount straight in the cart
  // (no name, no taxes); from the details, Continue is just the way back to them.
  const continueFromAmount = () => (firstEntry ? exitCover(() => onSubmit({ name: '', amount: cents / 100, taxable: taxableByDefault })) : closeCover());
  const coverClass = closing ? 'ca-cover-down' : 'ca-cover-up';
  // In the home pane (Option 2B) the details slide in from the right, from underneath the cart, and
  // back out the same way; as a modal they use the platform's own presentation.
  const inPane = ctaPlacement === 'title';
  const detailsClass = leaving ? (inPane ? 'ca-push-out' : 'ca-cover-down') : startOnAmount ? undefined : inPane ? 'ca-push-in' : 'ca-cover-up';

  const amount = cents / 100;
  const startName = initial && initial.name !== 'Custom amount' ? initial.name : '';
  const changed = cents !== Math.round((initial?.amount ?? 0) * 100) || name !== startName || taxable !== (initial?.taxable ?? taxableByDefault);
  // Add paths need a value; saving an existing one also needs a change.
  const canSubmit = amount > 0 && (!requireChange || changed);
  // Held changes are what `confirmIfDirty` (back, X, another custom amount, Check out, the menu…)
  // asks about before letting the merchant leave. Not once the exit has begun (it was saved/closed).
  useEffect(() => {
    setUnsavedChanges(changed && !leaving);
    return () => setUnsavedChanges(false);
  }, [changed, leaving]);
  const shell: React.CSSProperties = { position: 'absolute', inset: 0, zIndex: 40, background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' };
  const header: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-md) var(--space-lg)' };
  // Edit amount / Edit name cover the whole device screen — above the cart and everything else —
  // whichever pane the details themselves are in, so they are portaled to the screen layer (below
  // the keyboard, z 45, and the OS status bar, z 55) and clear its safe area themselves.
  const coverShell: React.CSSProperties = { ...shell, paddingTop: 'var(--device-safe-top, 0px)' };
  const toScreen = (node: React.ReactElement) => {
    const screen = typeof document !== 'undefined' ? document.querySelector('.device-screen') : null;
    return screen ? createPortal(node, screen) : node;
  };
  const footer: React.CSSProperties = { padding: 'var(--space-md) var(--space-lg)', paddingBottom: 'calc(var(--space-md) + var(--device-keyboard-height, 0px))', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' };
  const bigInput: React.CSSProperties = { border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', width: '100%', color: 'var(--color-on-surface)', caretColor: 'var(--color-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-heading-size)' };

  const amountScreen = (
      <div className={coverClass} style={coverShell}>
        <div style={header}>
          {/* The first value screen of an add is the modal's opening screen: X closes the whole
              modal. Once the details screen has been seen, it is an ordinary back. */}
          {firstEntry ? <CloseButton onClick={() => confirmIfDirty(() => exitCover(onClose))} /> : <BackButton onClick={closeCover} />}
          <PosText variant="heading" bold>Amount</PosText>
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
          <PosButton label="Continue" fullWidth disabled={cents <= 0} onClick={continueFromAmount} />
        </div>
      </div>
  );

  const nameScreen = (
      <div className={coverClass} style={coverShell}>
        <div style={header}>
          <BackButton onClick={closeCover} />
          <PosText variant="heading" bold>Name</PosText>
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
    <div className={detailsClass} style={{ ...shell, visibility: firstEntry ? 'hidden' : 'visible' }}>
      {/* Same box as the home header with the tabs (Large above, Medium below, a row as tall as its
          round buttons), so the title sits exactly where Keypad / Products / Coupons do. */}
      <div style={{ ...header, padding: 'var(--space-lg) var(--space-lg) var(--space-md)', minHeight: 'var(--size-xsmall)', boxSizing: 'content-box', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <BackButton onClick={() => confirmIfDirty(() => leave(onClose))} />
          <PosText variant="heading" bold>Custom amount details</PosText>
        </div>
        {ctaPlacement === 'title' && (
          <PosButton label={submitText} variant="outlined" size="extraSmall" disabled={!canSubmit} onClick={() => leave(() => onSubmit({ name, amount, taxable }))} />
        )}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <DetailCard label="Amount" value={formatUsd(amount)} muted={amount <= 0} onClick={() => setStep('editAmount')} />
        <DetailCard label="Name (optional)" value={name || 'Custom amount'} muted={!name} onClick={() => { setDraft(name); setStep('editName'); }} />
        <button type="button" role="switch" aria-checked={taxable} onClick={() => setTaxable((t) => !t)}
          style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', border: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
          <PosText variant="bodyLarge" color="var(--color-on-surface-variant-highest)">Charge taxes</PosText>
          <Toggle checked={taxable} />
        </button>
      </div>
      {ctaPlacement === 'footer' && (
        <div style={{ ...footer, background: 'var(--color-surface-bright)', paddingBottom: 'calc(var(--space-md) + var(--device-safe-bottom, 0px))' }}>
          <PosButton label={submitText} fullWidth disabled={!canSubmit} onClick={() => leave(() => onSubmit({ name, amount, taxable }))} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {detailsScreen}
      {step === 'editAmount' && toScreen(amountScreen)}
      {step === 'editName' && toScreen(nameScreen)}
    </>
  );
}

const cardStyle: React.CSSProperties = { background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--pos-shadow-small, var(--pos-shadow-medium))', padding: 'var(--space-lg)' };

/** A details card: label left, value right; the whole card opens the editor. */
/** `muted` lightens the value — the amount while it is $0.00, the name while it is empty (the placeholder). */
function DetailCard({ label, value, muted, onClick }: { label: string; value: string; muted?: boolean; onClick: () => void }) {
  return (
    // The card itself is the button, so its padding is tappable too.
    <button type="button" onClick={onClick} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', border: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
      <PosText variant="bodyLarge" color="var(--color-on-surface-variant-highest)" style={{ flex: 1 }}>{label}</PosText>
      <PosText variant="bodyXLarge" bold color={muted ? 'var(--color-on-surface-variant-lowest)' : undefined}>{value}</PosText>
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
      style={{ width: 52, height: 32, borderRadius: 16, border: 'none', background: checked ? 'var(--color-primary)' : 'var(--color-on-disabled-container)', position: 'relative', flex: 'none', display: 'block' }}>
      <span style={{ position: 'absolute', top: 4, left: checked ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
    </span>
  );
}
