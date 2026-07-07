import { PosText } from './PosText';
import { PosButton } from './PosButton';
import { Spinner } from '../android/Spinner';
import { SuccessCheckmark } from '../android/SuccessCheckmark';
import { ErrorX, Close } from '../android/icons';
import { usePrinter, SAMPLE_PRINTER_NAME } from '../../state/PrinterContext';
import { useConnectivity } from '../../tools/ConnectivityContext';

/**
 * iOS receipt-printer setup (POSPrinterSetupModal.swift). A pairing wizard: pair prompt → searching
 * → found one → connecting → connected (or error). Star Micronics copy. State lives in
 * PrinterContext and is progressed by the modal's buttons + the "Receipt printer" chrome tool
 * (which stands in for the Bluetooth discovery events) — no timers.
 *
 * The pairing step's message/button match the source exactly based on Bluetooth state: with
 * Bluetooth off, the message calls that out and the button becomes "Open Settings" (leaves the
 * app) instead of "Connect printer" — POSPrinterSetupContent.pairMessage / setupButtons.
 *
 * Mounted once as PrinterSetupHost in the device shell; opened via `printer.openSetup()`.
 */
export function PrinterSetupHost() {
  const printer = usePrinter();
  const connectivity = useConnectivity();
  if (!printer.setupOpen) return null;

  const body = () => {
    switch (printer.setupState) {
      case 'idle':
        return connectivity.bluetooth ? (
          <Centered
            icon={<PrinterGlyph />}
            title="Pair your printer"
            message="Turn on your Star Micronics receipt printer, then pair it in the Settings app under Bluetooth. Once it's paired, tap Connect printer to find it."
            primary={{ label: 'Connect printer', onClick: printer.startSearch }}
          />
        ) : (
          <Centered
            icon={<PrinterGlyph />}
            title="Pair your printer"
            message="Bluetooth access is turned off. Tap Open Settings to turn it on, then pair your printer under Bluetooth."
            primary={{ label: 'Open Settings', onClick: connectivity.openSettings }}
          />
        );
      case 'searching':
        return <Progress message="Searching for printers…" />;
      case 'found':
        return (
          <Centered
            icon={<PrinterGlyph />}
            title={`Found ${SAMPLE_PRINTER_NAME}`}
            message="Do you want to connect to this printer?"
            primary={{ label: 'Connect', onClick: printer.connectPrinter }}
            secondary={{ label: 'Search again', onClick: printer.startSearch }}
          />
        );
      case 'connecting':
        return <Progress message={`Connecting to ${SAMPLE_PRINTER_NAME}…`} />;
      case 'connected':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', textAlign: 'center' }}>
            <SuccessCheckmark />
            <PosText variant="heading" bold align="center">Printer connected</PosText>
            <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">{SAMPLE_PRINTER_NAME}</PosText>
            <div style={{ width: '100%', maxWidth: 360 }}><PosButton label="Done" fullWidth onClick={printer.closeSetup} /></div>
          </div>
        );
      case 'error':
        return (
          <Centered
            icon={<ErrorX size="var(--size-small)" />}
            title="Something went wrong"
            message="We couldn't connect to the printer. Make sure it's on and paired, then try again."
            primary={{ label: 'Try again', onClick: printer.startSearch }}
          />
        );
    }
  };

  return (
    <div className="woopos-scrim" role="presentation" onClick={printer.closeSetup} style={{ position: 'absolute', inset: 0, zIndex: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
      <div className="woopos-liquid-glass woopos-slide-up" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', position: 'relative', boxShadow: 'var(--shadow-normal-large)' }}>
        <button type="button" aria-label="Close" onClick={printer.closeSetup} style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)', border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
          <Close size="var(--icon-medium)" />
        </button>
        {body()}
      </div>
    </div>
  );
}

function Centered({ icon, title, message, primary, secondary }: {
  icon: React.ReactNode; title: string; message: string;
  primary: { label: string; onClick: () => void }; secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-md) 0' }}>
      <span style={{ display: 'flex', color: 'var(--color-on-surface)' }}>{icon}</span>
      <PosText variant="heading" bold align="center">{title}</PosText>
      <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">{message}</PosText>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <PosButton label={primary.label} fullWidth onClick={primary.onClick} />
        {secondary && <PosButton label={secondary.label} variant="outlined" fullWidth onClick={secondary.onClick} />}
      </div>
    </div>
  );
}

function Progress({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-xl) 0' }}>
      <Spinner size="var(--size-large)" />
      <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">{message}</PosText>
    </div>
  );
}

/** Simple receipt-printer glyph (outlined). */
function PrinterGlyph() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9V4h12v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="3" y="9" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6" y="14" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="17.5" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
