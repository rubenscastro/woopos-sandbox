import { useState } from 'react';
import { PosText } from './PosText';
import { Description, SettingsFilled, ExitToApp } from '../android/icons';
import { useNav } from '../../device/platformNav';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useCardReader } from '../../tools/CardReaderContext';

/**
 * iOS floating controls (POSFloatingControlView): a bottom-left "…" (ellipsis) menu — Orders /
 * Settings / Exit POS — plus the card-reader status pill (CardReaderConnectionStatusView). The
 * pill reflects the shared Card reader tool (green "Reader connected" / alert "Connect your
 * reader"); tapping it starts the connect flow. Only the popover menu uses the iOS "liquid glass"
 * material — the trigger button and the pill keep the opaque container styling, like the app's
 * native Menu label + status view. The menu items are iOS-native: label leading, SF Symbol
 * trailing, with a hairline separator between rows.
 */
export function PosFloatingControl() {
  const nav = useNav();
  const { connected, startConnecting } = useCardReader();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div style={{ position: 'absolute', left: 'var(--space-lg)', bottom: 'var(--space-lg)', zIndex: 20, display: 'flex', gap: 'var(--space-sm)', alignItems: 'stretch' }}>
      <div ref={ref} style={{ position: 'relative' }}>
        {open && (
          <div className="woopos-liquid-glass" style={{ position: 'absolute', bottom: 'calc(var(--size-small) + var(--space-sm))', left: 0, minWidth: 220, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-normal-large)', padding: 'var(--space-xs) 0', overflow: 'hidden' }}>
            {/* Signed-in operator (POSStaffMenuRow) — "Name — Role". */}
            <OperatorRow />
            <MenuDivider />
            <MenuRow icon={<Description size="var(--icon-small)" />} label="Orders" onClick={() => { setOpen(false); nav('/orders'); }} />
            <MenuDivider />
            <MenuRow icon={<SettingsFilled size="var(--icon-small)" />} label="Settings" onClick={() => { setOpen(false); nav('/settings'); }} />
            <MenuDivider />
            <MenuRow icon={<ExitToApp size="var(--icon-small)" />} label="Exit POS" onClick={() => { setOpen(false); nav('/flows'); }} />
          </div>
        )}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          style={{ width: 'var(--size-small)', height: 'var(--size-small)', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', boxShadow: 'var(--shadow-normal-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Ellipsis />
        </button>
      </div>

      {/* CardReaderConnectionStatusView: the container is the pill; when disconnected a 2px
          primary rounded-rect is overlaid and then inset from the pill edge by POSSpacing.small,
          so the border floats inside the pill rather than sitting on its edge. */}
      <button
        type="button"
        onClick={() => (connected ? nav('/settings') : startConnecting())}
        style={{ height: 'var(--size-small)', display: 'flex', alignItems: 'stretch', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', cursor: 'pointer', boxShadow: 'var(--shadow-normal-medium)', padding: connected ? 0 : 'var(--space-sm)' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: '0 var(--space-lg)', borderRadius: 'var(--radius-sm)', border: connected ? 'none' : '2px solid var(--color-primary)' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: connected ? 'var(--color-success)' : 'var(--color-alert)', flex: 'none' }} />
          <PosText variant="bodySmall">{connected ? 'Reader connected' : 'Connect your reader'}</PosText>
        </span>
      </button>
    </div>
  );
}

/** SF Symbol "ellipsis" at .posBodyLargeBold (24pt bold) in the 80pt floating button — bold,
 *  chunky dots, ~24px wide. */
function Ellipsis() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="4" cy="12" r="2.4" />
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="20" cy="12" r="2.4" />
    </svg>
  );
}

function MenuRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', padding: 'var(--space-sm) var(--space-lg)', border: 'none', background: 'transparent', color: 'var(--color-on-surface)', cursor: 'pointer' }}>
      {/* iOS Menu: title leads, SF Symbol trails. */}
      <PosText variant="bodyMedium" style={{ flex: 1, textAlign: 'left' }}>{label}</PosText>
      <span style={{ display: 'flex', color: 'var(--color-on-surface)' }}>{icon}</span>
    </button>
  );
}

/** Hairline separator between menu items (semi-transparent, like the native menu). */
function MenuDivider() {
  return <div style={{ height: 1, background: 'color-mix(in srgb, var(--color-on-surface) 12%, transparent)' }} />;
}

/** Signed-in operator label (POSStaffMenuRow): "Name — Role" + person.circle, non-interactive. */
export const POS_OPERATOR = { name: 'Thomas', role: 'Cashier' };
export function OperatorRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', padding: 'var(--space-sm) var(--space-lg)' }}>
      <PosText variant="bodyMedium" bold style={{ flex: 1, textAlign: 'left' }}>{POS_OPERATOR.name} — {POS_OPERATOR.role}</PosText>
      <PersonCircle />
    </div>
  );
}
function PersonCircle() {
  return (
    <svg width="var(--icon-small)" height="var(--icon-small)" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--color-on-surface)' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 18.5a6 6 0 0 1 11 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
