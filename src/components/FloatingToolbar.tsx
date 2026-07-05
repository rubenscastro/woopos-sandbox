import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from './Text';
import { Card } from './Card';
import { DotsVertical, Description, SettingsFilled, ExitToApp } from './icons';
import { useCardReader } from '../tools/CardReaderContext';

/**
 * WooPosFloatingToolbar — the bottom-left floating controls on the POS home: a Menu button
 * (Orders / Settings / Exit POS) and a card-reader status pill. Reader status reflects the
 * Card reader tool: green "Reader connected" or an alert "Connect your reader" with a
 * primary border.
 */
export function FloatingToolbar() {
  const navigate = useNavigate();
  const { connected, startConnecting } = useCardReader();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ position: 'absolute', left: 'var(--space-lg)', bottom: 'var(--space-lg)', zIndex: 20 }}>
      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Dismiss menu"
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, border: 'none', background: 'transparent', zIndex: 0 }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(var(--size-small) + var(--space-sm))',
              left: 0,
              zIndex: 1,
              minWidth: 220,
              background: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-normal-large)',
              padding: 'var(--space-xs)',
            }}
          >
            <MenuRow icon={<Description size="var(--icon-small)" />} label="Orders" onClick={() => { setMenuOpen(false); navigate('/order-history'); }} />
            <MenuRow icon={<SettingsFilled size="var(--icon-small)" />} label="Settings" onClick={() => { setMenuOpen(false); navigate('/settings'); }} />
            <MenuRow icon={<ExitToApp size="var(--icon-small)" />} label="Exit POS" onClick={() => { setMenuOpen(false); navigate('/flows'); }} />
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'stretch' }}>
        <Card padding="0" shadow="normal">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 'var(--size-small)',
              height: 'var(--size-small)',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-on-surface)',
              cursor: 'pointer',
            }}
          >
            <DotsVertical size="var(--icon-medium)" />
          </button>
        </Card>

        <Card padding="0" shadow="normal">
          <button
            type="button"
            onClick={() => (connected ? navigate('/settings-hardware') : startConnecting())}
            style={{
              height: 'var(--size-small)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              padding: '0 var(--space-md)',
              border: connected ? '2px solid transparent' : '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-on-surface)',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: connected ? 'var(--color-success)' : 'var(--color-alert)',
                flex: 'none',
              }}
            />
            <Text variant="bodySmall" bold>
              {connected ? 'Reader connected' : 'Connect your reader'}
            </Text>
          </button>
        </Card>
      </div>
    </div>
  );
}

function MenuRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        width: '100%',
        padding: 'var(--space-sm) var(--space-md)',
        border: 'none',
        background: 'transparent',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-on-surface)',
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--color-on-surface-variant-highest)' }}>{icon}</span>
      <Text variant="bodyMedium">{label}</Text>
    </button>
  );
}
