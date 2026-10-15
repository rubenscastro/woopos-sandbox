import { PosText } from '../../../ios/PosText';
import { useIsDark } from '../../../../hooks/useIsDark';

/**
 * Custom amounts proposal — iOS "discard changes?" alert, drawn the way UIAlertController draws one:
 * a 270-wide rounded panel, centered bold title and message, then full-width buttons separated by
 * hairlines — "Keep Editing" (cancel, regular) and "Discard Changes" (destructive, red) — over a dim.
 */
export function DiscardDialog({ onKeep, onDiscard }: { onKeep: () => void; onDiscard: () => void }) {
  // An alert is the system's, so its buttons wear the system's colors — iOS blue and iOS red — not the
  // WooCommerce purple or the app's error token. (systemBlue / systemRed, light and dark.)
  const isDark = useIsDark();
  const systemBlue = isDark ? '#0A84FF' : '#007AFF';
  const systemRed = isDark ? '#FF453A' : '#FF3B30';
  return (
    <div role="presentation" style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
      <div
        role="alertdialog"
        aria-modal="true"
        className="woopos-liquid-glass"
        style={{ width: 270, maxWidth: 'calc(100% - 48px)', borderRadius: 14, overflow: 'hidden', textAlign: 'center', boxShadow: 'var(--shadow-normal-large)' }}
      >
        <div style={{ padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PosText variant="bodyLarge" bold align="center">Discard Changes?</PosText>
          <PosText variant="bodySmall" align="center">You have unsaved changes to this custom amount. If you leave now, they will be lost.</PosText>
        </div>
        <Button label="Keep Editing" bold onClick={onKeep} color={systemBlue} />
        <Button label="Discard Changes" onClick={onDiscard} color={systemRed} />
      </div>
    </div>
  );
}

function Button({ label, onClick, color, bold }: { label: string; onClick: () => void; color: string; bold?: boolean }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'block', width: '100%', border: 'none', borderTop: '1px solid color-mix(in srgb, var(--color-on-surface) 14%, transparent)', background: 'transparent', padding: '12px 16px', cursor: 'pointer', color, fontFamily: 'var(--font-family)', fontSize: 'var(--font-body-md-size)', fontWeight: bold ? 600 : 400 }}>
      {label}
    </button>
  );
}
