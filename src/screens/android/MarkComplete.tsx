import { useState } from 'react';
import { useNav } from '../../device/platformNav';
import { Text } from '../../components/android/Text';
import { Button } from '../../components/android/Button';
import { Toolbar } from '../../components/android/Toolbar';
import { useCart } from '../../state/CartContext';
import { formatUsd } from '../../lib/currency';

/**
 * Flow 11 — Mark order as complete (WooPosMarkOrderAsCompleteScreen). Confirms marking the
 * order paid via another method, with an optional note, then routes to payment success.
 */
export function MarkComplete() {
  const navigate = useNav();
  const { total } = useCart();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    setSubmitting(true);
    setTimeout(() => navigate('/payment-success'), 900);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar title="Mark order as paid?" onBack={() => navigate('/totals')} />
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
        <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)" style={{ maxWidth: 520 }}>
          This will mark the {formatUsd(total)} order as completed. Use this only if you've already
          collected payment another way.
        </Text>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Bank transfer from Maria, ref 4827"
          style={{
            border: 'none',
            borderBottom: '2px solid var(--color-outline-variant)',
            outline: 'none',
            background: 'transparent',
            textAlign: 'center',
            width: '100%',
            maxWidth: 520,
            padding: 'var(--space-sm) 0',
            color: 'var(--color-on-surface)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-body-lg-size)',
          }}
        />
      </div>
      <div style={{ padding: 'var(--space-md)' }}>
        <Button text="Mark as paid" fullWidth state={submitting ? 'loading' : 'enabled'} onClick={submit} />
      </div>
    </div>
  );
}
