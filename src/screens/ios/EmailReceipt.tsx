import { useState } from 'react';
import { useNav } from '../../device/platformNav';
import { PosText } from '../../components/ios/PosText';
import { PosButton } from '../../components/ios/PosButton';
import { ChevronLeft } from '../../components/ios/IosIcons';

/**
 * iOS Email receipt (mirrors Android's EmailReceipt.tsx / WooPosEmailReceiptScreen): a
 * single email field + Send. Reachable from the Orders detail "..." menu (and, like
 * Android, from the payment-success screen once that flow exists on iOS).
 */
export function EmailReceipt() {
  const nav = useNav();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const send = () => {
    setSending(true);
    setTimeout(() => nav(-1), 900);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        <button type="button" aria-label="Back" onClick={() => nav(-1)} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: '4px 8px 4px 0', cursor: 'pointer' }}>
          <ChevronLeft size="30px" />
        </button>
        <PosText variant="heading" bold>Email receipt</PosText>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Type email"
          autoFocus
          style={{
            border: 'none',
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
      <div style={{ padding: 'var(--space-md) var(--space-lg)', paddingBottom: 'calc(var(--space-md) + var(--device-keyboard-height, 0px))' }}>
        <PosButton label={sending ? 'Sending…' : 'Send'} fullWidth disabled={sending || !valid} onClick={send} />
      </div>
    </div>
  );
}
