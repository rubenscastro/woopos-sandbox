import { PosText } from './PosText';
import { PosButton } from './PosButton';
import { Close } from './IosIcons';
import { PosReaderIllustration, type PosReaderIllustrationVariant } from './PosReaderIllustration';
import { useCardReader } from '../../tools/CardReaderContext';
import { useConnectivity } from '../../tools/ConnectivityContext';
import './PosCardReaderDialog.css';

/**
 * iOS card reader connection modal — the app's own alerts, not Android's rendered in an iPhone
 * (PointOfSaleCardPresentPayment*View, "Connection Alerts"). Every state is the same shape:
 * an illustration, a heading and a line under it, and whatever the merchant can do about it
 * pinned to the bottom. The ✕ is the cancel action, top-right, and each state decides whether
 * it has one — a connect in progress doesn't.
 *
 * The card is a fixed frame rather than a share of the screen (POSModalSizing: 640 × 656 at
 * default text size, shrinking only to fit), which is why it reads as the same dialog
 * throughout the flow while its contents change.
 *
 * Copy is the app's, verbatim — it differs from Android's on nearly every state, which is
 * exactly why this can't be the Android dialog with an iOS coat of paint.
 */
export function PosCardReaderDialog() {
  const cr = useCardReader();
  const connectivity = useConnectivity();
  const s = cr.connectionState;

  if (s === 'idle') return null;

  /* Cancel is the ✕, and only where the app offers one: mid-connect and on success there is
     nothing to cancel, and the list state cancels through its own button instead. */
  const onCancel =
    s === 'connecting' || s === 'connected' || s === 'foundMultiple' || s === 'localNetworkPermission'
      ? undefined
      : cr.cancelConnecting;

  /* Each alert names its own ✕ rather than sharing one label — `posModalCloseButton` takes the
     title of whatever button that state would otherwise have shown, so the Bluetooth alert's
     dismiss reads "Dismiss" and the rest read "Cancel". It's what a screen reader announces. */
  const cancelLabel = s === 'bluetoothOff' ? 'Dismiss' : 'Cancel';

  return (
    <div className="pos-reader-modal-root" role="presentation">
      <div className="pos-reader-modal-scrim" />
      <div className="pos-reader-modal" role="dialog" aria-modal="true" aria-label="Card reader connection">
        {onCancel && (
          <button type="button" className="pos-reader-modal__close" aria-label={cancelLabel} onClick={onCancel}>
            <Close size="var(--icon-large)" />
          </button>
        )}

        {s === 'bluetoothOff' && (
          <Stack
            art={'error'}
            title="Bluetooth permission required"
            body="Please enable Bluetooth in Settings to connect to a card reader."
            actions={<PosButton label="Open Device Settings" fullWidth onClick={connectivity.openSettings} />}
          />
        )}

        {s === 'scanning' && (
          <Stack
            art={'scanning'}
            title="Scanning for reader"
            body="To turn on your card reader, briefly press its power button."
          />
        )}

        {s === 'found' && (
          <Stack
            art={'scanning'}
            title={`Found ${cr.readerName}`}
            body="Do you want to connect to this reader?"
            actions={
              <>
                <PosButton label="Connect to Reader" fullWidth onClick={cr.connectReader} />
                <PosButton label="Keep Searching" variant="outlined" fullWidth onClick={cr.keepSearching} />
              </>
            }
          />
        )}

        {/* The list state is the one that isn't an illustration + a sentence: discovery is still
            running underneath it, so the spinner stays and readers accumulate in a list that
            each connect from their own row. */}
        {s === 'foundMultiple' && (
          <div className="pos-reader-modal__list-layout">
            <PosText variant="heading" bold align="center">
              Several readers found
            </PosText>
            <div className="pos-reader-modal__scanning-row">
              <span className="pos-reader-modal__spinner" aria-hidden />
              <PosText variant="bodyLarge">Scanning for readers</PosText>
            </div>
            <ul className="pos-reader-modal__readers">
              {cr.foundReaderIDs.map((id) => (
                <li key={id} className="pos-reader-modal__reader-row">
                  <PosText variant="bodyLarge">{id}</PosText>
                  <PosButton
                    label="Connect"
                    variant="outlined"
                    size="extraSmall"
                    onClick={() => cr.connectToReaderID(id)}
                  />
                </li>
              ))}
            </ul>
            <PosButton label="Cancel" variant="outlined" fullWidth onClick={cr.cancelConnecting} />
          </div>
        )}

        {/* Location services: the Terminal SDK will not connect without them, so the flow stops
            here rather than failing as a connection error the merchant can only retry. */}
        {s === 'locationRequired' && (
          <Stack
            art={'location'}
            title="Enable location services to allow payments"
            body="Location services permission is required to reduce fraud, prevent disputes, and ensure secure payments."
            actions={<PosButton label="Open Device Settings" fullWidth onClick={cr.openLocationSettings} />}
          />
        )}

        {s === 'localNetworkPermission' && (
          <Stack
            art={'error'}
            title="Local network permission required"
            body="Allow access to devices on your local network to connect to this reader."
            actions={
              <>
                <PosButton label="Grant permission" fullWidth onClick={cr.grantLocalNetworkPermission} />
                <PosButton label="Cancel" variant="outlined" fullWidth onClick={cr.cancelLocalNetworkPermission} />
              </>
            }
          />
        )}

        {s === 'connecting' && (
          <Stack art={'scanning'} title="Connecting to reader" body="Please wait..." />
        )}

        {s === 'connected' && (
          <Stack
            art={'success'}
            title="Reader connected"
            actions={<PosButton label="Done" fullWidth onClick={cr.cancelConnecting} />}
          />
        )}

        {/* The title carries the whole message here — there is no separate "Connection failed"
            heading above it — and the line under it is the SDK error's own description, which
            stands in for whatever Stripe Terminal actually returned. One action: Try again.
            Cancelling is the ✕, not a second button. */}
        {s === 'failed' && (
          <Stack
            art={'error'}
            title="We couldn't connect your reader"
            body="Reader disconnected before the connection completed."
            actions={<PosButton label="Try again" fullWidth onClick={cr.retryConnection} />}
          />
        )}
      </div>
    </div>
  );
}

/**
 * The shape nearly every alert takes: art over a heading over a line of explanation, centred in
 * what the buttons leave, with the buttons at the bottom. Content and buttons are separate
 * bands so the buttons sit in the same place whether the state has one line or three.
 */
function Stack({
  art,
  title,
  body,
  actions,
}: {
  art: PosReaderIllustrationVariant;
  title: string;
  body?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pos-reader-modal__layout">
      <div className="pos-reader-modal__content">
        <PosReaderIllustration variant={art} />
        <div className="pos-reader-modal__text">
          <PosText variant="heading" bold align="center">
            {title}
          </PosText>
          {body && (
            <PosText variant="bodyLarge" align="center">
              {body}
            </PosText>
          )}
        </div>
      </div>
      {actions && <div className="pos-reader-modal__actions">{actions}</div>}
    </div>
  );
}
