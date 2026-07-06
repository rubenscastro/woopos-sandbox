import { PosText } from '../../components/ios/PosText';
import { PosButton } from '../../components/ios/PosButton';
import { CardReaderIllustration } from '../../components/android/CardReaderIllustration';
import { Check, Close } from '../../components/android/icons';
import { useNav } from '../../device/platformNav';

/**
 * iOS Payments Onboarding (Payments Onboarding/PointOfSaleCardPresentPaymentOnboardingView) —
 * iOS-only; Android has no POS onboarding flow. Gates card payments until the store finishes
 * WooPayments setup. The real content is the host WCPay onboarding web/native flow; this is a
 * representative POS-styled intro with the setup checklist and a "Continue setup" action.
 */
export function PaymentsOnboarding() {
  const nav = useNav();
  return (
    <div style={{ height: '100%', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--space-md) var(--space-lg)' }}>
        <button type="button" aria-label="Cancel" onClick={() => nav('/products')} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
          <Close size="var(--icon-medium)" />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-lg)', padding: 'var(--space-xl)', textAlign: 'center' }}>
        <CardReaderIllustration variant="success" size="var(--size-xlarge)" />
        <PosText variant="heading" bold align="center">Set up payments</PosText>
        <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)" style={{ maxWidth: 460 }}>
          Finish setting up WooPayments to accept in-person card payments on this device.
        </PosText>
        <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' }}>
          {['Verify your business details', 'Add a bank account for payouts', 'Order or connect a card reader'].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-md)', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-lg)' }}>
              <Check size="var(--icon-small)" style={{ color: 'var(--color-primary)' }} />
              <PosText variant="bodyLarge">{s}</PosText>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          <PosButton label="Continue setup" fullWidth onClick={() => nav('/products')} />
        </div>
      </div>
    </div>
  );
}
