import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PosText } from '../../components/ios/PosText';
import { PosButton } from '../../components/ios/PosButton';
import { PosTextField } from '../../components/ios/PosTextField';
import { Spinner } from '../../components/android/Spinner';
import { SuccessCheckmark } from '../../components/android/SuccessCheckmark';
import { CardReaderNotConnected, ReadyForPaymentCard } from '../../components/android/illustrations';
import { ErrorX, ChevronLeft } from '../../components/android/icons';
import { useNav } from '../../device/platformNav';
import { useCart } from '../../state/CartContext';
import { useCardReader, useCardTransaction } from '../../tools/CardReaderContext';
import { formatUsd } from '../../lib/currency';

/**
 * iOS Totals / Checkout (TotalsView.swift + POSCheckoutPaymentButtonsRow + POSCollectCashView +
 * POSSendReceiptView). The order totals sit centered in the pane; card payment is driven by the
 * shared Card reader tool (like Android). When no reader is connected the pane shows the same
 * "Reader not connected" illustration + message as Android (ReaderDisconnectedMessageView). The
 * bottom is the payment-method row — Card reader (when disconnected) + Cash payment, full width.
 * Cash, processing, payment success, and email receipt are full-screen takeovers.
 */
type State = 'idle' | 'processing' | 'success' | 'failed' | 'cash' | 'email';

export function Checkout({ onBack, showBack = true }: { onBack?: () => void; showBack?: boolean }) {
  const nav = useNav();
  const back = onBack ?? (() => nav('/products'));
  const { subtotal, discountTotal, taxTotal, total, clear } = useCart();
  const { connected, startConnecting } = useCardReader();
  const [state, setState] = useState<State>('idle');
  const [cash, setCash] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const changeDue = (parseFloat(cash) || 0) - total;
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  // The Card reader tool drives the transaction while checkout is active, connected and idle.
  useCardTransaction((result) => {
    setState('processing');
    window.setTimeout(() => setState(result === 'authorized' ? 'success' : 'failed'), 1600);
  }, connected && state === 'idle');

  // Losing the reader mid-flight drops back to idle (mirrors Android).
  useEffect(() => {
    if (!connected && state === 'processing') setState('idle');
  }, [connected, state]);

  const newOrder = () => { clear(); setState('idle'); back(); };
  const sendReceipt = () => { setSending(true); window.setTimeout(() => { setSending(false); setEmail(''); setState('success'); }, 900); };

  // --- Full-screen takeovers (cover the whole device screen, like Android's routes) ---
  if (state === 'processing') {
    return (
      <FullScreen bg="var(--color-primary)">
        <Spinner size="var(--size-large)" arcColor="var(--color-on-primary)" trackColor="rgba(255,255,255,0.35)" />
        <PosText variant="bodyLarge" align="center" color="var(--color-on-primary)">Processing payment</PosText>
        <PosText variant="bodyXLarge" bold align="center" color="var(--color-on-primary)">Card payment</PosText>
      </FullScreen>
    );
  }
  if (state === 'success') {
    return (
      <FullScreen bg="var(--color-surface-bright)">
        <SuccessCheckmark />
        <PosText variant="heading" bold align="center">Payment successful</PosText>
        <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
          A payment of {formatUsd(total || 0)} was successfully made.
        </PosText>
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          <PosButton label="New order" fullWidth onClick={newOrder} />
          <PosButton label="Email receipt" variant="outlined" fullWidth onClick={() => setState('email')} />
        </div>
      </FullScreen>
    );
  }
  if (state === 'email') {
    return (
      <FullScreen bg="var(--color-surface)" align="stretch">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-md) var(--space-lg)' }}>
          <button type="button" aria-label="Back" onClick={() => setState('success')} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
            <ChevronLeft size="var(--icon-medium)" />
          </button>
          <PosText variant="heading" bold>Email receipt</PosText>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
          <div style={{ width: '100%', maxWidth: 460 }}>
            <PosTextField value={email} onChange={setEmail} placeholder="Type email" autoFocus />
          </div>
        </div>
        <BottomStrip>
          <PosButton label={sending ? 'Sending…' : 'Send'} fullWidth disabled={!emailValid || sending} onClick={sendReceipt} />
        </BottomStrip>
      </FullScreen>
    );
  }
  if (state === 'cash') {
    return (
      <FullScreen bg="var(--color-surface)" align="stretch">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-md) var(--space-lg)' }}>
          <button type="button" aria-label="Back" onClick={() => { setCash(''); setState('idle'); }} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
            <ChevronLeft size="var(--icon-medium)" />
          </button>
          <div>
            <PosText variant="heading" bold>Cash payment</PosText>
            <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>Total: {formatUsd(total)}</PosText>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-lg)', padding: 'var(--space-xl)', textAlign: 'center' }}>
          <input value={cash} onChange={(e) => setCash(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="$0.00" autoFocus inputMode="decimal"
            style={{ border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', minWidth: 200, color: 'var(--color-on-surface)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-heading-size)', fontWeight: 700 }} />
          {changeDue > 0 && <PosText variant="bodySmall" color="var(--color-on-surface-variant-lowest)">Change due {formatUsd(changeDue)}</PosText>}
        </div>
        <BottomStrip>
          <PosButton label="Mark payment as complete" fullWidth disabled={(parseFloat(cash) || 0) < total || total <= 0} onClick={() => setState('success')} />
        </BottomStrip>
      </FullScreen>
    );
  }

  // --- In-pane totals + payment buttons (idle / failed) ---
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 'var(--size-xsmall)', padding: 'var(--space-md) var(--space-lg)' }}>
        {showBack && (
          <button type="button" aria-label="Back" onClick={back} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
            <ChevronLeft size="var(--icon-medium)" />
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-lg)', padding: 'var(--space-xl)', textAlign: 'center' }}>
        {state === 'failed' ? (
          <>
            <ErrorX size="var(--size-small)" />
            <PosText variant="heading" bold align="center">Payment failed</PosText>
            <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">Please try again.</PosText>
            <Totals subtotal={subtotal} discountTotal={discountTotal} taxTotal={taxTotal} total={total} />
          </>
        ) : connected ? (
          <>
            <ReadyForPaymentCard size="var(--size-xlarge)" />
            <PosText variant="heading" bold align="center">Ready for payment</PosText>
            <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">Tap, swipe or insert card</PosText>
            <Totals subtotal={subtotal} discountTotal={discountTotal} taxTotal={taxTotal} total={total} />
          </>
        ) : (
          <>
            {/* Same "Reader not connected" illustration + message as Android (ReaderDisconnectedMessageView). */}
            <CardReaderNotConnected size="var(--size-xlarge)" />
            <PosText variant="heading" bold align="center">Reader not connected</PosText>
            <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">To process this payment, please connect your reader.</PosText>
            <Totals subtotal={subtotal} discountTotal={discountTotal} taxTotal={taxTotal} total={total} />
          </>
        )}
      </div>

      {/* Bottom payment-method row (POSCheckoutPaymentButtonsRow): Card reader (primary, when
          disconnected) + Cash payment, full width. */}
      <BottomStrip>
        {state === 'failed' ? (
          <PosButton label="Try again" fullWidth onClick={() => setState('idle')} />
        ) : !connected ? (
          <PosButton label="Card reader" fullWidth onClick={startConnecting} />
        ) : null}
        <PosButton label="Cash payment" variant="outlined" fullWidth onClick={() => setState('cash')} />
      </BottomStrip>
    </div>
  );
}

/**
 * Full-screen takeover covering the whole device screen (matches Android's full-screen routes).
 * Portaled into `.device-screen` so it escapes the checkout's transformed sliding-row ancestor
 * and anchors to the screen box — the same layer the shell's overlays use. Sits below the OS
 * status bar (safe-top) so the clock/battery stay visible.
 */
function FullScreen({ bg, align = 'center', children }: { bg: string; align?: 'center' | 'stretch'; children: React.ReactNode }) {
  const centered: React.CSSProperties = align === 'center'
    ? { alignItems: 'center', justifyContent: 'center', gap: 'var(--space-lg)', padding: 'var(--space-xl)', textAlign: 'center' }
    : {};
  const node = (
    <div style={{
      // Cover the whole screen (incl. behind the status bar) so no seam shows, but sit BELOW
      // the status bar (z-index 6) so the clock/battery stay visible; content is padded down
      // past the safe-area. The screen box clips the rounded corners.
      position: 'absolute',
      inset: 0,
      paddingTop: 'var(--device-safe-top, 0px)',
      background: bg,
      zIndex: 5,
      display: 'flex',
      flexDirection: 'column',
      ...centered,
    }}>
      {children}
    </div>
  );
  const screen = typeof document !== 'undefined' ? document.querySelector('.device-screen') : null;
  return screen ? createPortal(node, screen) : node;
}

/** Centered totals block (Subtotal / Discount / Taxes / Total), large Total. */
function Totals({ subtotal, discountTotal, taxTotal, total }: { subtotal: number; discountTotal: number; taxTotal: number; total: number }) {
  return (
    <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <Row label="Subtotal" value={formatUsd(subtotal)} />
      {discountTotal > 0 && <Row label="Discount total" value={`-${formatUsd(discountTotal)}`} />}
      <Row label="Taxes" value={formatUsd(taxTotal)} />
      <div style={{ height: 1, background: 'color-mix(in srgb, var(--color-outline-variant) 50%, transparent)', margin: 'var(--space-xs) 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <PosText variant="bodyXLarge" bold>Total</PosText>
        <PosText variant="heading" bold>{formatUsd(total)}</PosText>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <PosText variant="bodyLarge" color="var(--color-on-surface-variant-highest)">{label}</PosText>
      <PosText variant="bodyLarge">{value}</PosText>
    </div>
  );
}
/** Full-width bottom button strip (POSCheckoutPaymentButtonsRow padding). */
function BottomStrip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 'var(--space-md) var(--space-lg) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {children}
    </div>
  );
}
