import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from '../components/Text';
import { Button, OutlinedButton } from '../components/Button';
import { Toolbar } from '../components/Toolbar';
import { Spinner } from '../components/Spinner';
import { ErrorX } from '../components/icons';
import { usePublishPreviewState } from '../device/PreviewStateContext';
import { useCart } from '../state/CartContext';
import { formatUsd } from '../lib/currency';

/**
 * Flow 12 — Scan to pay (WooPosScanToPayScreen). Shows a QR code for the customer to pay
 * from their phone; loading and failed states are reachable via the preview menu. A
 * "Simulate payment" affordance stands in for the customer completing payment.
 */
type State = 'loading' | 'qr' | 'failed';

export function ScanToPay() {
  const navigate = useNavigate();
  const { total } = useCart();
  const [state, setState] = useState<State>('loading');

  usePublishPreviewState({
    options: [
      { id: 'loading', label: 'Loading' },
      { id: 'qr', label: 'Showing QR' },
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
      <Toolbar title="Scan to pay" onBack={() => navigate('/totals')} />
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

        {state === 'failed' && (
          <>
            <ErrorX size="var(--size-small)" />
            <Text variant="heading" bold align="center">
              Something went wrong. Please try again.
            </Text>
            <div className="woopos-fullscreen-action" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <Button text="Try again" fullWidth onClick={() => setState('loading')} />
              <OutlinedButton text="Cancel" fullWidth onClick={() => navigate('/totals')} />
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
