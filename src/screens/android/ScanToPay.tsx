import { useEffect, useState } from 'react';
import { useNav } from '../../device/platformNav';
import { Text } from '../../components/android/Text';
import { Button, OutlinedButton } from '../../components/android/Button';
import { Toolbar } from '../../components/android/Toolbar';
import { Spinner } from '../../components/android/Spinner';
import { ErrorX } from '../../components/android/icons';
import { usePublishPreviewState } from '../../device/PreviewStateContext';
import { useCart } from '../../state/CartContext';
import { closeCheckoutPane } from '../../state/useCheckoutPane';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { formatUsd } from '../../lib/currency';

/**
 * Flow 12 — Scan to pay (WooPosScanToPayScreen). Shows a QR code for the customer to pay
 * from their phone; loading, failed and pay-in-person states are reachable via the preview
 * menu. A "Simulate payment" affordance stands in for the customer completing payment.
 *
 * "Pay in person" (WooPosScanToPayState.PayInPersonSelected) is driven by the customer
 * choosing to pay at the counter on their own phone, so — like Failed — it has no in-screen
 * trigger and is reached through the preview menu rather than an invented button.
 */
type State = 'loading' | 'qr' | 'payInPerson' | 'failed';

export function ScanToPay() {
  const navigate = useNav();
  const { total } = useCart();
  const isPhone = useIsPhone();
  const [state, setState] = useState<State>('loading');

  /* WooPosScanToPayUIEvent.CollectOnRegisterClicked: leave Scan to pay *and* drop checkout
     back to the cart, so the associate can take the money on the register. On tablet the
     checkout is a pane inside ItemSelection, so we close it and pop; on phone the cart is
     its own route. Plain Cancel/Back, by contrast, returns to checkout untouched. */
  const collectOnRegister = () => {
    closeCheckoutPane();
    if (isPhone) navigate('/cart');
    else navigate(-1);
  };

  usePublishPreviewState({
    options: [
      { id: 'loading', label: 'Loading' },
      { id: 'qr', label: 'Showing QR' },
      { id: 'payInPerson', label: 'Pay in person' },
      { id: 'failed', label: 'Failed' },
    ],
    active: state,
    onSelect: (id) => setState(id as State),
  });

  useEffect(() => {
    if (state !== 'loading') return;
    const t = setTimeout(() => setState('qr'), 1100);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar title="Scan to pay" onBack={() => navigate(-1)} />
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
        {state === 'loading' && <Spinner size="var(--size-xlarge)" />}

        {state === 'qr' && (
          <>
            <FakeQr />
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)" style={{ maxWidth: 420 }}>
              Show this code to the customer to let them pay from their phone.
            </Text>
            <Text variant="bodyLarge" bold align="center">
              Order total: {formatUsd(total)}
            </Text>
            <div className="woopos-fullscreen-action">
              <Button text="Simulate payment" fullWidth onClick={() => navigate('/payment-success')} />
            </div>
          </>
        )}

        {state === 'payInPerson' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 0,
              width: '100%',
            }}
          >
            <Text variant="heading" bold align="center">
              Customer chose to pay in person
            </Text>
            <div style={{ height: 'var(--space-md)' }} />
            <Text variant="bodyLarge" align="center" style={{ maxWidth: 420 }}>
              No payment was taken online. Collect it on the register, or show the code again.
            </Text>
            <div style={{ height: 'var(--space-xl)' }} />
            <div
              className="woopos-fullscreen-action"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
            >
              <Button text="Collect on the register" fullWidth onClick={collectOnRegister} />
              <OutlinedButton text="Show the code again" fullWidth onClick={() => setState('loading')} />
            </div>
          </div>
        )}

        {state === 'failed' && (
          <>
            <ErrorX size="var(--size-small)" />
            <Text variant="heading" bold align="center">
              Something went wrong. Please try again.
            </Text>
            <div className="woopos-fullscreen-action" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <Button text="Try again" fullWidth onClick={() => setState('loading')} />
              <OutlinedButton text="Cancel" fullWidth onClick={() => navigate(-1)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** A decorative QR-like block (not a real scannable code). */
function FakeQr() {
  const cells = 11;
  const seed = [
    0x7f7, 0x415, 0x5d5, 0x5d5, 0x415, 0x7f7, 0x000, 0x2aa, 0x555, 0x2aa, 0x555,
  ];
  return (
    <div
      style={{
        width: 260,
        height: 260,
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: 16,
        display: 'grid',
        gridTemplateColumns: `repeat(${cells}, 1fr)`,
        gap: 3,
        boxShadow: 'var(--shadow-soft-large)',
      }}
    >
      {Array.from({ length: cells * cells }).map((_, i) => {
        const row = Math.floor(i / cells);
        const col = i % cells;
        const on = ((seed[row] ?? 0x555) >> col) & 1;
        return <div key={i} style={{ background: on ? '#101517' : 'transparent', borderRadius: 1 }} />;
      })}
    </div>
  );
}
