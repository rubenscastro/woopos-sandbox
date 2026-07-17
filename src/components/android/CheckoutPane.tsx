import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNav } from '../../device/platformNav';
import { Text } from './Text';
import { Button, OutlinedButton } from './Button';
import { Toolbar } from './Toolbar';
import { OrderSummary } from './OrderSummary';
import { BottomSheet } from './BottomSheet';
import { Spinner } from './Spinner';
import { ErrorX } from './icons';
import { CardReaderNotConnected } from './illustrations';
import { ReadyForPaymentCard } from './ReadyForPaymentCard';
import { useCardReader, useCardTransaction } from '../../tools/CardReaderContext';
import { usePaymentSettings } from '../../state/PaymentSettingsContext';
import { usePageBackground } from '../../device/PageBackground';

/**
 * Checkout / totals surface (WooPosTotalsScreen). Shows the card-reader status — "Ready for
 * payment" when connected, or the "Reader not connected" illustration + "Connect to reader"
 * otherwise — plus the order summary and payment actions. Card payment is driven by the
 * Card reader tool (Process authorized / declined), not a button on screen.
 */
type PayState = 'idle' | 'processing' | 'failed';

export function CheckoutPane({
  onBack,
  active = true,
  showBackButton = true,
  loading: loadingProp,
}: {
  onBack?: () => void;
  active?: boolean;
  /** On tablet the back affordance lives on the cart pane, so the totals pane hides it. */
  showBackButton?: boolean;
  /** Controlled from the parent (ItemSelection) so it can share one timer with CartPanel's
   *  coupon-green state. When omitted (the standalone phone /totals route), falls back to
   *  an internal 3s timer. */
  loading?: boolean;
}) {
  const navigate = useNav();
  const { connected, startConnecting } = useCardReader();
  const { methods } = usePaymentSettings();
  const [state, setState] = useState<PayState>('idle');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);
  useEffect(() => {
    if (loadingProp !== undefined) return;
    const t = window.setTimeout(() => setInternalLoading(false), 3000);
    return () => window.clearTimeout(t);
  }, [loadingProp]);
  const loading = loadingProp ?? internalLoading;

  // Which methods Settings → Payments has enabled — the checkout only surfaces these.
  const otherMethods = methods.scanToPay || methods.markAsPaid;
  const anyMethod = methods.cardReader || methods.cash || otherMethods;

  usePageBackground(active && state === 'processing' ? 'var(--color-primary)' : 'var(--color-surface)');

  // The Card reader tool drives the transaction while this checkout is active, connected, idle
  // — and only when card reader is an accepted method. Both outcomes show the processing screen
  // first, then resolve to success or failure.
  useCardTransaction((result) => {
    setState('processing');
    window.setTimeout(() => {
      if (result === 'authorized') navigate('/payment-success');
      else setState('failed');
    }, 1600);
  }, active && methods.cardReader && connected && state === 'idle');

  useEffect(() => {
    if (!connected && state === 'processing') setState('idle');
  }, [connected, state]);

  if (state === 'processing') {
    // Full screen rather than confined to the checkout pane's 65% column. On tablet,
    // ItemSelection's sliding row has a `transform` (even translateX(0)), which per spec makes
    // it the containing block for any position:absolute descendant — so an absolute overlay
    // here would center itself against that oversized, translated 165%-wide row instead of the
    // visible device. Portaling into .device-screen escapes that ancestor entirely (mirrors
    // iOS Checkout.tsx's FullScreen helper).
    return <ProcessingOverlay />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* WooPosTotalsScreen shows only a back button (no title), and only on phone; on tablet
          the back affordance is on the cart pane instead. */}
      {onBack && showBackButton && <Toolbar title="" onBack={onBack} />}

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
        {loading ? (
          <CheckoutSkeleton />
        ) : state === 'failed' ? (
          <>
            <ErrorX size="var(--size-small)" />
            <Text variant="heading" bold align="center">
              Payment failed
            </Text>
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
              Please try again.
            </Text>
            <div style={{ ...btnStack, width: '100%' }}>
              <Button text="Try again" fullWidth onClick={() => setState('idle')} />
              {methods.cash && (
                <OutlinedButton text="Cash payment" fullWidth onClick={() => navigate('/cash-payment')} />
              )}
            </div>
          </>
        ) : !anyMethod ? (
          // No accepted methods — nothing to charge with until one is re-enabled in Settings.
          <>
            <Text variant="heading" bold align="center">
              No payment methods enabled
            </Text>
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
              Enable a payment method in Settings → Payments to take this payment.
            </Text>
            <div style={{ width: '100%', maxWidth: 460 }}>
              <OrderSummary />
            </div>
          </>
        ) : !methods.cardReader ? (
          // Card reader isn't an accepted method — skip the reader flow and let the customer
          // pick from the enabled methods in the actions below.
          <>
            <Text variant="heading" bold align="center">
              Choose a payment method
            </Text>
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
              Select how the customer would like to pay.
            </Text>
            <div style={{ width: '100%', maxWidth: 460 }}>
              <OrderSummary />
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
            <div style={{ width: '100%', maxWidth: 460 }}>
              <Button text="Connect to reader" fullWidth onClick={startConnecting} />
            </div>
            <div style={{ width: '100%', maxWidth: 460 }}>
              <OrderSummary />
            </div>
          </>
        )}
      </div>

      {!loading && (methods.cash || otherMethods) && (
        <div
          style={{
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            alignItems: 'center',
          }}
        >
          {methods.cash && (
            <div style={{ width: '100%' }}>
              <OutlinedButton text="Cash payment" fullWidth onClick={() => navigate('/cash-payment')} />
            </div>
          )}
          {otherMethods && (
            <div style={{ width: '100%' }}>
              <OutlinedButton text="Other payment methods" fullWidth onClick={() => setSheetOpen(true)} />
            </div>
          )}
        </div>
      )}

      <BottomSheet title="Choose payment method" open={sheetOpen} onDismiss={() => setSheetOpen(false)}>
        {methods.scanToPay && <Method label="Scan to pay" onClick={() => navigate('/scan-to-pay')} />}
        {methods.markAsPaid && <Method label="Mark order as paid" onClick={() => navigate('/mark-complete')} />}
      </BottomSheet>
    </div>
  );
}

/** Full-screen "Processing payment" takeover, portaled into `.device-screen` so it escapes
 *  the tablet sliding row's transformed containing block and covers the whole device. */
function ProcessingOverlay() {
  const node = (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'var(--color-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        paddingTop: 'var(--device-safe-top, 0px)',
      }}
    >
      <Spinner size="var(--size-large)" arcColor="var(--color-on-primary)" trackColor="rgba(255,255,255,0.35)" />
      <Text variant="bodyLarge" align="center" color="var(--color-on-primary)">
        Processing payment
      </Text>
      <Text variant="bodyXLarge" bold align="center" color="var(--color-on-primary)">
        Card payment
      </Text>
    </div>
  );
  const screen = typeof document !== 'undefined' ? document.querySelector('.device-screen') : null;
  return screen ? createPortal(node, screen) : node;
}

const btnStack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
};

/** Hides the card reader status + order summary + payment CTAs behind three plain
 *  skeleton lines while the checkout pane loads — not a detailed mock of the real layout. */
function CheckoutSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', width: '100%', maxWidth: 460 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="woopos-skeleton" style={{ width: '85%', height: 24, borderRadius: 'var(--radius-sm)' }} />
      ))}
    </div>
  );
}

function Method({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
      <Text variant="bodyLarge" bold>
        {label}
      </Text>
    </button>
  );
}
