import { usePlatform, type PlatformId } from '../device/PlatformContext';
import { useConnectivity } from './ConnectivityContext';

/**
 * Renders the two ways a hardware-setup flow can reach for Bluetooth: the Android quick in-app
 * "Allow app to turn on Bluetooth?" system dialog (doesn't leave the app), and the full "leaving
 * the app" mock of the platform's OS Settings screen (iOS always; Android's barcode-scanner
 * "Go to your device settings" link). Deliberately NOT styled like the rest of WooPOS — the whole
 * point is that it reads as a different app. Mount once inside the device shell's overlay slot.
 */
export function ConnectivityOsHost() {
  const { platform } = usePlatform();
  const connectivity = useConnectivity();
  return (
    <>
      {connectivity.quickEnableOpen && <QuickEnableDialog />}
      {connectivity.settingsOpen && <OsSettingsScreen platform={platform} />}
    </>
  );
}

/** Android's BluetoothAdapter.ACTION_REQUEST_ENABLE — a small system alert, not a navigation. */
function QuickEnableDialog() {
  const connectivity = useConnectivity();
  const allow = () => { connectivity.setBluetooth(true); connectivity.closeQuickEnable(); };
  const deny = () => connectivity.closeQuickEnable();
  return (
    <div
      role="presentation"
      onClick={deny}
      style={{ position: 'absolute', inset: 0, zIndex: 53, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 300, background: '#fff', color: '#1a1a1a', borderRadius: 14, padding: '20px 20px 8px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', fontFamily: 'Roboto, system-ui, sans-serif' }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>Allow WooCommerce to turn on Bluetooth?</div>
        <div style={{ fontSize: 13, color: '#555', marginBottom: 12, lineHeight: 1.4 }}>
          WooCommerce needs Bluetooth to connect to nearby card readers.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={deny} style={{ border: 'none', background: 'none', color: '#1A73E8', fontWeight: 600, fontSize: 13, letterSpacing: 0.3, cursor: 'pointer', padding: '10px 8px' }}>CANCEL</button>
          <button type="button" onClick={allow} style={{ border: 'none', background: 'none', color: '#1A73E8', fontWeight: 600, fontSize: 13, letterSpacing: 0.3, cursor: 'pointer', padding: '10px 8px' }}>ALLOW</button>
        </div>
      </div>
    </div>
  );
}

/** Mock OS Settings screen (Bluetooth toggle + a way back) — the "left the app" destination. */
function OsSettingsScreen({ platform }: { platform: PlatformId }) {
  const connectivity = useConnectivity();
  const isIos = platform === 'ios';
  return (
    <div
      className="woopos-app-open"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 'var(--device-safe-top, 0px)',
        background: isIos ? '#F2F2F7' : '#FFFFFF',
        color: '#1A1A1A',
        zIndex: 52,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: isIos ? '-apple-system, system-ui, sans-serif' : 'Roboto, system-ui, sans-serif',
      }}
    >
      {isIos ? (
        <>
          {/* iOS: UIApplication.openSettingsURLString always lands on Settings.app. There's no
              built-in "back to app" affordance on iOS, but the prototype needs one to be usable. */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
            <button type="button" onClick={connectivity.closeSettings} style={{ border: 'none', background: 'none', color: '#007AFF', fontSize: 17, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', padding: 0 }}>
              <span style={{ fontSize: 22, lineHeight: 1, marginRight: 2 }}>‹</span> WooPOS
            </button>
          </div>
          <div style={{ padding: '4px 16px 8px' }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>Bluetooth</div>
          </div>
          <div style={{ margin: '12px 16px', background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
              <span style={{ fontSize: 17 }}>Bluetooth</span>
              <ToggleSwitch checked={connectivity.bluetooth} onChange={connectivity.setBluetooth} color="#34C759" />
            </div>
          </div>
          <div style={{ margin: '0 32px', fontSize: 13, color: '#6D6D72' }}>
            Turn on Bluetooth to connect card readers, barcode scanners, and receipt printers.
          </div>
        </>
      ) : (
        <>
          {/* Android: Settings.ACTION_BLUETOOTH_SETTINGS — the real system Bluetooth page. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '18px 16px' }}>
            <button type="button" onClick={connectivity.closeSettings} aria-label="Back" style={{ border: 'none', background: 'none', color: '#1A1A1A', fontSize: 22, cursor: 'pointer', padding: 0, display: 'flex' }}>
              ←
            </button>
            <span style={{ fontSize: 20, fontWeight: 500 }}>Bluetooth</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
            <span style={{ fontSize: 16 }}>Use Bluetooth</span>
            <ToggleSwitch checked={connectivity.bluetooth} onChange={connectivity.setBluetooth} color="#1A73E8" />
          </div>
          <div style={{ padding: '0 24px', fontSize: 13, color: '#5f6368' }}>
            Turn on Bluetooth to connect card readers, barcode scanners, and receipt printers.
          </div>
        </>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, color }: { checked: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{ width: 51, height: 31, borderRadius: 16, border: 'none', background: checked ? color : '#E9E9EA', position: 'relative', flex: 'none', cursor: 'pointer', transition: 'background 0.15s ease' }}
    >
      <span style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 27, height: 27, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left 0.15s ease' }} />
    </button>
  );
}
