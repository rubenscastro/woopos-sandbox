import { Modal } from '../components/android/Modal';
import { Text } from '../components/android/Text';
import { Button, OutlinedButton } from '../components/android/Button';
import { CardReaderIllustration } from '../components/android/CardReaderIllustration';
import { useCardReader } from './CardReaderContext';
import { useConnectivity } from './ConnectivityContext';
import { usePlatform } from '../device/PlatformContext';
import { PosCardReaderDialog } from '../components/ios/PosCardReaderDialog';

/**
 * The card-reader connection dialog (WooPosCardReaderConnectionDialog). Renders the
 * bluetoothOff → scanning → found → connecting → connected / failed states in a modal.
 * Hardware events (reader found, connection completes/fails) are driven from the Card reader
 * tool, so this dialog only shows real user actions (Connect / Keep searching / Retry / Cancel).
 *
 * bluetoothOff copy/actions match each real app: Android's BluetoothDisabledContent ("Bluetooth
 * is off" / "Enable Bluetooth" → the quick in-app system dialog) vs. iOS's
 * PointOfSaleCardPresentPaymentBluetoothRequiredAlertView ("Bluetooth permission required" /
 * "Open Device Settings" → leaves the app).
 */
export function CardReaderConnectionHost() {
  const cr = useCardReader();
  const connectivity = useConnectivity();
  const { platform } = usePlatform();
  const s = cr.connectionState;
  if (s === 'idle') return null;

  /* iOS has its own alerts — different illustration, different copy on nearly every state, a
     fixed frame rather than a share of the screen. This dialog is Android's, and rendering it
     on iOS showed merchants a screen neither app has. */
  if (platform === 'ios') return <PosCardReaderDialog />;

  const dismissable = s === 'bluetoothOff' || s === 'scanning' || s === 'found' || s === 'failed';

  return (
    <Modal
      open
      onDismiss={dismissable ? cr.cancelConnecting : () => {}}
      onClose={dismissable ? cr.cancelConnecting : undefined}
      backgroundLabel="Card reader connection dialog"
      /* WooPosCardReaderConnectionDialogContent passes widthFraction = 0.55f. It was capped at
         520px here, which on a tablet is far narrower than 55% — the card came out square and
         cramped where the real one is wide and short. There is no pixel cap in the app. */
      widthFraction={0.55}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', textAlign: 'center' }}>
        {s === 'bluetoothOff' && (
          <>
            <Text variant="heading" bold align="center">
              Bluetooth is off
            </Text>
            <CardReaderIllustration variant="error" size="var(--size-xlarge)" />
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface)">
              Enable Bluetooth to connect to a card reader.
            </Text>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <Button text="Enable Bluetooth" fullWidth onClick={connectivity.openQuickEnable} />
              <OutlinedButton text="Cancel" fullWidth onClick={cr.cancelConnecting} />
              <RemoteReaderHint />
            </div>
          </>
        )}

        {s === 'scanning' && (
          <>
            <Text variant="heading" bold align="center">
              Scanning for reader
            </Text>
            <CardReaderIllustration variant="scanning" size="var(--size-xlarge)" />
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface)">
              Make sure your reader is charged and turned on
            </Text>
            <RemoteReaderHint />
          </>
        )}

        {s === 'found' && (
          <>
            <Text variant="heading" bold align="center">
              {cr.readerName} found
            </Text>
            <CardReaderIllustration variant="found" size="var(--size-xlarge)" />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <Button text="Connect" fullWidth onClick={cr.connectReader} />
              <OutlinedButton text="Keep searching" fullWidth onClick={cr.keepSearching} />
            </div>
          </>
        )}

        {/* MissingLocalNetworkPermission (Android, 2026-09-04 sync): shown when tapping Connect on
            a discovered phone-as-reader without the local network permission. Same layout as the
            Bluetooth/location permission states (MissingPermissionContent): error icon, message,
            Grant permission + Cancel, then the remote-reader hint strip. Not dismissable
            (showCloseButton = false); granting auto-resumes the connect. */}
        {s === 'localNetworkPermission' && (
          <>
            <Text variant="heading" bold align="center">
              Local network permission required
            </Text>
            <CardReaderIllustration variant="error" size="var(--size-xlarge)" />
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface)">
              Local network permission is required to connect to a phone used as a card reader.
            </Text>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <Button text="Grant permission" fullWidth onClick={cr.grantLocalNetworkPermission} />
              <OutlinedButton text="Cancel" fullWidth onClick={cr.cancelLocalNetworkPermission} />
              <RemoteReaderHint />
            </div>
          </>
        )}

        {s === 'connecting' && (
          <>
            <Text variant="heading" bold align="center">
              Connecting
            </Text>
            <CardReaderIllustration variant="connecting" size="var(--size-xlarge)" />
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface)">
              Please wait while we connect to your reader
            </Text>
          </>
        )}

        {s === 'connected' && (
          <>
            <Text variant="heading" bold align="center">
              Connected
            </Text>
            <CardReaderIllustration variant="success" size="var(--size-xlarge)" />
            <Text variant="bodyMedium" align="center" color="var(--color-on-surface)">
              {cr.readerName}
            </Text>
          </>
        )}

        {s === 'failed' && (
          <>
            <Text variant="heading" bold align="center">
              Connection failed
            </Text>
            <CardReaderIllustration variant="error" size="var(--size-xlarge)" />
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface)">
              We couldn't connect to your reader. Please try again.
            </Text>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <Button text="Retry" fullWidth onClick={cr.retryConnection} />
              <OutlinedButton text="Cancel" fullWidth onClick={cr.cancelConnecting} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/**
 * WooPosRemoteReaderHintStrip — the way into using a phone as the reader. Source shows it on
 * Scanning, BluetoothDisabled and MissingPermission, and only above the phone breakpoint; the
 * destination it links to isn't mocked here.
 */
function RemoteReaderHint() {
  return (
    <button
      type="button"
      style={{
        border: 'none',
        background: 'none',
        padding: 'var(--space-sm) var(--space-lg)',
        color: 'var(--color-primary)',
        textDecoration: 'underline',
        font: 'inherit',
        fontSize: 'var(--font-body-md-size)',
        cursor: 'pointer',
      }}
    >
      Use an Android phone as a card reader
    </button>
  );
}
