import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '../components/Modal';
import { Text } from '../components/Text';
import { Button, OutlinedButton } from '../components/Button';
import { SuccessCheckmark } from '../components/SuccessCheckmark';
import { useTools, useBarcodeTarget } from './ToolsContext';

/**
 * Barcode-scanner setup, presented as a modal over the current screen (like the app's
 * WooPosScanningSetupDialog). Full flow: pick model → pair → test → success → (barcodes on
 * products). The test step is completed by actually scanning the on-screen test barcode
 * with the Barcode tool — no "Simulate" button.
 */
interface BarcodeSetupValue {
  open: boolean;
  openSetup: () => void;
  closeSetup: () => void;
}

const BarcodeSetupContext = createContext<BarcodeSetupValue | null>(null);

export function BarcodeSetupProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo<BarcodeSetupValue>(
    () => ({ open, openSetup: () => setOpen(true), closeSetup: () => setOpen(false) }),
    [open],
  );
  return <BarcodeSetupContext.Provider value={value}>{children}</BarcodeSetupContext.Provider>;
}

export function useBarcodeSetup(): BarcodeSetupValue {
  const ctx = useContext(BarcodeSetupContext);
  if (!ctx) throw new Error('useBarcodeSetup must be used within a BarcodeSetupProvider');
  return ctx;
}

/** Renders the setup modal; mount inside the device frame's overlay slot. */
export function BarcodeSetupHost() {
  const { open, closeSetup } = useBarcodeSetup();
  return (
    <Modal open={open} onDismiss={closeSetup} onClose={closeSetup} backgroundLabel="Scanner setup dialog">
      <BarcodeSetupWizard onDone={closeSetup} />
    </Modal>
  );
}

type Step = 'device' | 'pair' | 'test' | 'success' | 'info';
const DEVICES = ['Star BSH-20B', 'Tera 1200', 'Netum 1228BC', 'Other'];

function BarcodeSetupWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>('device');
  const [device, setDevice] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', minWidth: 0 }}>
      {step === 'device' && (
        <>
          <Text variant="heading" bold align="center">
            Set up a barcode scanner
          </Text>
          <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
            Select a model from the list:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {DEVICES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setDevice(d); setStep('pair'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: 'var(--space-md)',
                  border: '2px solid var(--color-inverse-surface)',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  color: 'var(--color-on-surface)',
                  cursor: 'pointer',
                }}
              >
                <Text variant="bodyLarge" bold align="center">
                  {d}
                </Text>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'pair' && (
        <Center>
          <Text variant="heading" bold align="center">
            Pair your scanner
          </Text>
          <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
            Enable Bluetooth and select your {device} scanner in the OS settings. The scanner will beep
            and show a solid LED when paired.
          </Text>
          <Buttons onBack={() => setStep('device')} onNext={() => setStep('test')} />
        </Center>
      )}

      {step === 'test' && <TestStep onDone={() => setStep('success')} onBack={() => setStep('pair')} />}

      {step === 'success' && (
        <Center>
          <SuccessCheckmark />
          <Text variant="heading" bold align="center">
            Scanner set up!
          </Text>
          <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
            You are ready to start scanning products. Next time, just turn on the scanner and it'll
            reconnect automatically.
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', maxWidth: 420 }}>
            <Button text="Done" fullWidth onClick={onDone} />
            <OutlinedButton text="How to set up barcodes on products" fullWidth onClick={() => setStep('info')} />
          </div>
        </Center>
      )}

      {step === 'info' && (
        <Center>
          <Text variant="heading" bold align="center">
            How to set up barcodes on products
          </Text>
          <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
            You can set up barcodes in the GTIN, UPC, EAN, ISBN field in the product's inventory tab.
            For more details, visit the documentation.
          </Text>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <Button text="Done" fullWidth onClick={onDone} />
          </div>
        </Center>
      )}
    </div>
  );
}

function TestStep({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const { activeTool, setActiveTool } = useTools();
  const [timedOut, setTimedOut] = useState(false);
  // Scanning the test barcode completes the step; disable the tool as we leave.
  const finish = (next: () => void) => {
    setActiveTool('none');
    next();
  };
  const barcodeRef = useBarcodeTarget<HTMLDivElement>(() => finish(onDone));

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 9000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Center>
      <Text variant="heading" bold align="center">
        {timedOut ? 'No scan data found yet' : 'Test your scanner'}
      </Text>
      <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
        {timedOut
          ? 'Hover the scanner over the barcode to test it. If the issue continues, check Bluetooth settings and try again.'
          : 'Move the scanner over this test barcode to verify it is working correctly.'}
      </Text>

      <div
        ref={barcodeRef}
        className="barcode-target"
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          boxShadow: 'var(--shadow-soft-medium)',
        }}
      >
        <BarcodeGraphic />
        <Text variant="bodySmall" color="#101517">
          1234567890128
        </Text>
      </div>

      {activeTool !== 'barcode' && (
        <Text variant="caption" align="center" color="var(--color-primary)">
          Turn on Tools ▸ Barcode, then hover the scanner over the code.
        </Text>
      )}

      <div style={{ width: '100%', maxWidth: 420 }}>
        <OutlinedButton text="Back" fullWidth onClick={() => finish(onBack)} />
      </div>
    </Center>
  );
}

/** A deterministic barcode graphic (EAN-13-ish stripes). */
function BarcodeGraphic() {
  const widths = [3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 2, 1, 1, 3, 1, 2, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 90 }}>
      {widths.map((w, i) => (
        <div key={i} style={{ width: w * 3, height: '100%', background: i % 2 === 0 ? '#101517' : 'transparent' }} />
      ))}
    </div>
  );
}

function Center({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', textAlign: 'center' }}>
      {children}
    </div>
  );
}

function Buttons({ onBack, onNext, nextLabel = 'Next' }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-md)', width: '100%', maxWidth: 420 }}>
      <div style={{ flex: 1 }}>
        <OutlinedButton text="Back" fullWidth onClick={onBack} />
      </div>
      <div style={{ flex: 1 }}>
        <Button text={nextLabel} fullWidth onClick={onNext} />
      </div>
    </div>
  );
}
