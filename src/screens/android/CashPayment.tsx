import { useState } from 'react';
import { useNav } from '../../device/platformNav';
import { Text } from '../../components/android/Text';
import { Button } from '../../components/android/Button';
import { Toolbar } from '../../components/android/Toolbar';
import { useCart } from '../../state/CartContext';
import { formatUsd } from '../../lib/currency';

/**
 * Flow 9 — Cash payment (WooPosCashPaymentScreen). Enter cash tendered, see change due,
 * then "Mark order as complete". Enabled only when tendered >= total. Prefilled with the
 * cart total so the merchant can accept exact change with no typing.
 */
export function CashPayment() {
  const navigate = useNav();
  const { total } = useCart();
  const [text, setText] = useState(total.toFixed(2));

  const tendered = parseFloat(text) || 0;
  const changeDue = tendered - total;
  const enough = tendered >= total && total > 0;
  const showError = text !== '' && !enough;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar title="Cash payment" subtitle={`Total ${formatUsd(total)}`} onBack={() => navigate(-1)} />
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
        <input
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ''))}
          inputMode="decimal"
          placeholder="$0.00"
          autoFocus
          style={{
            border: 'none',
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

        {showError ? (
          <Text variant="bodyLarge" align="center" color="var(--color-error)">
            Amount must be more or equal to total
          </Text>
        ) : (
          changeDue > 0 && (
            <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)">
              Change due {formatUsd(changeDue)}
            </Text>
          )
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
