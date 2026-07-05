import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from './Text';
import { Button, OutlinedButton } from './Button';
import { Toolbar } from './Toolbar';
import { OrderSummary } from './OrderSummary';
import { BottomSheet } from './BottomSheet';
import { Spinner } from './Spinner';
import { ErrorX } from './icons';
import { Card as CardIcon, Cash, QrCode, Check, Receipt } from './icons';
import { CardReaderNotConnected, ReadyForPaymentCard } from './illustrations';
import { useCardReader, useCardTransaction } from '../tools/CardReaderContext';
import { usePageBackground } from '../device/PageBackground';

/**
 * Checkout / totals surface (WooPosTotalsScreen). Shows the card-reader status — "Ready for
 * payment" when connected, or the "Reader not connected" illustration + "Connect to reader"
 * otherwise — plus the order summary and payment actions. Card payment is driven by the
 * Card reader tool (Process authorized / declined), not a button on screen.
 */
type PayState = 'idle' | 'processing' | 'failed';

export function CheckoutPane({ onBack, active = true }: { onBack?: () => void; active?: boolean }) {
  const navigate = useNavigate();
  const { connected, startConnecting } = useCardReader();
  const [state, setState] = useState<PayState>('idle');
  const [sheetOpen, setSheetOpen] = useState(false);

  usePageBackground(active && state === 'processing' ? 'var(--color-primary)' : 'var(--color-surface)');

  // The Card reader tool drives the transaction while this checkout is active, connected, idle.
  // Both outcomes show the processing screen first, then resolve to success or failure.
  useCardTransaction((result) => {
    setState('processing');
    window.setTimeout(() => {
      if (result === 'authorized') navigate('/payment-success');
      else setState('failed');
    }, 1600);
  }, active && connected && state === 'idle');

  useEffect(() => {
    if (!connected && state === 'processing') setState('idle');
  }, [connected, state]);

  if (state === 'processing') {
    return (
      <div style={{ ...fill, background: 'var(--color-primary)', justifyContent: 'center' }}>
        <Spinner size="var(--size-large)" arcColor="var(--color-on-primary)" trackColor="rgba(255,255,255,0.35)" />
        <Text variant="bodyLarge" align="center" color="var(--color-on-primary)">
          Processing payment
        </Text>
        <Text variant="bodyXLarge" bold align="center" color="var(--color-on-primary)">
          Card payment
        </Text>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {onBack && <Toolbar title="Checkout" onBack={onBack} />}

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-lg)',
          padding: 'var(--space-xl)',
          textAlign: 'center',
        }}
      >
        {state === 'failed' ? (
          <>
            <ErrorX size="var(--size-small)" />
            <Text variant="heading" bold align="center">
              Payment failed
            </Text>
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
              Please try again.
            </Text>
            <div className="woopos-fullscreen-action" style={btnStack}>
              <Button text="Try again" fullWidth onClick={() => setState('idle')} />
              <OutlinedButton text="Cash payment" fullWidth onClick={() => navigate('/cash-payment')} />
            </div>
          </>
        ) : connected ? (
          <>
            <ReadyForPaymentCard size="var(--size-xlarge)" />
            <Text variant="heading" bold align="center">
              Ready for payment
            </Text>
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
              Tap, swipe or insert card
            </Text>
            <div style={{ width: '100%', maxWidth: 460 }}>
              <OrderSummary />
            </div>
          </>
        ) : (
          <>
            <CardReaderNotConnected size="var(--size-xlarge)" />
            <Text variant="heading" bold align="center">
              Reader not connected
            </Text>
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
              To process this payment, please connect your reader.
            </Text>
            <div className="woopos-fullscreen-action">
              <Button text="Connect to reader" fullWidth onClick={startConnecting} />
            </div>
            <div style={{ width: '100%', maxWidth: 460 }}>
              <OrderSummary />
            </div>
          </>
        )}
      </div>

      <div
        style={{
          padding: 'var(--space-md)',
          borderTop: '1px solid var(--color-outline-variant)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <div className="woopos-fullscreen-action">
          <OutlinedButton text="Cash payment" fullWidth onClick={() => navigate('/cash-payment')} />
        </div>
        <div className="woopos-fullscreen-action">
          <OutlinedButton text="Other payment methods" fullWidth onClick={() => setSheetOpen(true)} />
        </div>
      </div>

      <BottomSheet title="Choose payment method" open={sheetOpen} onDismiss={() => setSheetOpen(false)}>
        <Method icon={<CardIcon size="var(--icon-medium)" />} label="Card reader" onClick={() => { setSheetOpen(false); startConnecting(); }} />
        <Method icon={<QrCode size="var(--icon-medium)" />} label="Scan to pay" onClick={() => navigate('/scan-to-pay')} />
        <Method icon={<Cash size="var(--icon-medium)" />} label="Cash payment" onClick={() => navigate('/cash-payment')} />
        <Method icon={<Check size="var(--icon-medium)" />} label="Mark order as paid" onClick={() => navigate('/mark-complete')} />
        <Method icon={<Receipt size="var(--icon-medium)" />} label="Email receipt" onClick={() => navigate('/email-receipt')} />
      </BottomSheet>
    </div>
  );
}

const fill: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-lg)',
};

const btnStack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
};

function Method({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        width: '100%',
        minHeight: 'var(--size-small)',
        padding: '0 var(--space-lg)',
        border: '2px solid var(--color-inverse-surface)',
        borderRadius: 'var(--radius-md)',
        background: 'transparent',
        color: 'var(--color-on-surface)',
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex' }}>{icon}</span>
      <Text variant="bodyLarge" bold>
        {label}
      </Text>
    </button>
  );
}
