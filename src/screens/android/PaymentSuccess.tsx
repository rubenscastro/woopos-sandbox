import { useNav } from '../../device/platformNav';
import { Text } from '../../components/android/Text';
import { Button, OutlinedButton } from '../../components/android/Button';
import { SuccessCheckmark } from '../../components/android/SuccessCheckmark';
import { FloatingToolbar } from '../../components/android/FloatingToolbar';
import { usePageBackground } from '../../device/PageBackground';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useCart } from '../../state/CartContext';
import { formatUsd } from '../../lib/currency';

/**
 * Flow 10 — Payment success (WooPosPaymentSuccessScreen). Animated checkmark + confirmation
 * of the amount paid, then "New order" (clears the cart and returns to items) or
 * "Email receipt".
 */
export function PaymentSuccess() {
  const navigate = useNav();
  const isPhone = useIsPhone();
  const { total, clear } = useCart();
  usePageBackground('var(--color-surface-bright)');

  const newOrder = () => {
    clear();
    navigate('/products');
  };

  return (
    <div
      style={{
        height: '100%',
        background: 'var(--color-surface-bright)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        padding: 'var(--space-xl)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <SuccessCheckmark />
      <Text variant="heading" bold align="center">
        Payment successful
      </Text>
      <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
        A payment of {formatUsd(total || 0)} was successfully made.
      </Text>
      <div
        className="woopos-fullscreen-action"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}
      >
        <Button text="New order" fullWidth onClick={newOrder} />
        <OutlinedButton text="Email receipt" fullWidth onClick={() => navigate('/email-receipt')} />
      </div>

      {!isPhone && <FloatingToolbar />}
    </div>
  );
}
