import { Modal } from '../components/Modal';
import { Text } from '../components/Text';
import { Button, OutlinedButton } from '../components/Button';
import { CardReaderIllustration } from '../components/CardReaderIllustration';
import { useCardReader } from './CardReaderContext';

/**
 * The card-reader connection dialog (WooPosCardReaderConnectionDialog). Renders the
 * scanning → found → connecting → connected / failed states in a modal. Hardware events
 * (reader found, connection completes/fails) are driven from the Card reader tool, so this
 * dialog only shows real user actions (Connect / Keep searching / Retry / Cancel).
 */
export function CardReaderConnectionHost() {
  const cr = useCardReader();
  const s = cr.connectionState;
  if (s === 'idle') return null;

  const dismissable = s === 'scanning' || s === 'found' || s === 'failed';

  return (
    <Modal
      open
      onDismiss={dismissable ? cr.cancelConnecting : () => {}}
      onClose={dismissable ? cr.cancelConnecting : undefined}
      backgroundLabel="Card reader connection dialog"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', textAlign: 'center' }}>
        {s === 'scanning' && (
          <>
            <Text variant="heading" bold align="center">
              Scanning for reader
            </Text>
            <CardReaderIllustration variant="scanning" size="var(--size-xlarge)" />
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface)">
              Make sure your reader is charged and turned on
            </Text>
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
