import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Toolbar } from '../components/Toolbar';

/**
 * Flow 13 — Email receipt (WooPosEmailReceiptScreen). A single email field + Send; on send
 * it returns to the success screen (mirroring GoBackWithResult(EMAIL_RECEIPT_SENT)).
 */
export function EmailReceipt() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const send = () => {
    setSending(true);
    setTimeout(() => navigate('/payment-success'), 900);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar title="Email receipt" onBack={() => navigate(-1)} />
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-xl)',
        }}
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Type email"
          autoFocus
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
        <Button
          text="Send"
          fullWidth
          state={sending ? 'loading' : valid ? 'enabled' : 'disabled'}
          onClick={send}
        />
      </div>
    </div>
  );
}
