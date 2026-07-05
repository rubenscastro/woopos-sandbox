import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Toolbar } from '../components/Toolbar';
import { useCart } from '../state/CartContext';
import { formatUsd } from '../lib/currency';

/**
 * Flow 9 — Cash payment (WooPosCashPaymentScreen). Enter cash tendered, see change due,
 * then "Mark order as complete". Enabled only when tendered >= total.
 */
export function CashPayment() {
  const navigate = useNavigate();
  const { total } = useCart();
  const [text, setText] = useState('');

  const tendered = parseFloat(text) || 0;
  const changeDue = tendered - total;
  const enough = tendered >= total && total > 0;
  const showError = text !== '' && !enough;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar title="Cash payment" onBack={() => navigate('/totals')} />
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
        <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)">
          Total: {formatUsd(total)}
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
            Cash received
          </Text>
          <input
            value={text}
            onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ''))}
            inputMode="decimal"
            placeholder="$0.00"
            autoFocus
            style={{
              border: 'none',
              borderBottom: '2px solid var(--color-outline-variant)',
              outline: 'none',
              background: 'transparent',
              textAlign: 'center',
              minWidth: 200,
              padding: 'var(--space-sm) 0',
              color: 'var(--color-on-surface)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-heading-size)',
              fontWeight: 700,
            }}
          />
        </div>

        {showError ? (
          <Text variant="bodyLarge" align="center" color="var(--color-error)">
            Amount must be more or equal to total
          </Text>
        ) : (
          <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)">
            Change due {formatUsd(Math.max(0, changeDue))}
          </Text>
        )}
      </div>

      <div style={{ padding: 'var(--space-md)' }}>
        <Button
          text="Mark order as complete"
          fullWidth
          state={enough ? 'enabled' : 'disabled'}
          onClick={() => navigate('/payment-success')}
        />
      </div>
    </div>
  );
}
