import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '../components/android/Modal';
import { Text } from '../components/android/Text';
import { Button, OutlinedButton } from '../components/android/Button';
import { SuccessCheckmark } from '../components/android/SuccessCheckmark';
import { useTools, useBarcodeTarget } from './ToolsContext';
import { useConnectivity } from './ConnectivityContext';

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

/**
 * Per-model setup flow. Each model has its own sequence of setup "codes" to scan (a QR/data-
 * matrix or a linear barcode, with model-specific instruction text), an optional OS-pairing
 * step, and the shared test step. "Other" just shows manual instructions, then the test.
 */
type CodeType = 'qr' | 'barcode';
interface ModelConfig {
  codes: { type: CodeType; action: string }[];
  instructions?: boolean;
  pair: boolean;
}
const MODELS: Record<string, ModelConfig> = {
  'Star BSH-20B': { codes: [{ type: 'qr', action: 'enable Bluetooth HID mode' }], pair: true },
  'Tera 1200': { codes: [{ type: 'qr', action: 'enter pairing mode' }], pair: true },
  'Netum 1228BC': {
    codes: [
      { type: 'barcode', action: 'enable Bluetooth HID mode' },
      { type: 'barcode', action: 'enter pairing mode' },
    ],
    pair: true,
  },
  Other: { codes: [], instructions: true, pair: false },
};
const DEVICES = Object.keys(MODELS);

type Screen =
  | { kind: 'code'; codeType: CodeType; action: string }
  | { kind: 'instructions' }
  | { kind: 'pair' }
  | { kind: 'test' };

function buildScreens(cfg: ModelConfig): Screen[] {
  const s: Screen[] = [];
  if (cfg.instructions) s.push({ kind: 'instructions' });
  cfg.codes.forEach((c) => s.push({ kind: 'code', codeType: c.type, action: c.action }));
  if (cfg.pair) s.push({ kind: 'pair' });
  s.push({ kind: 'test' });
  return s;
}

type Phase = 'device' | 'flow' | 'success' | 'info';

function BarcodeSetupWizard({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('device');
  const [device, setDevice] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  const screens = useMemo(() => (device ? buildScreens(MODELS[device]) : []), [device]);
  const current = screens[idx];

  const back = () => {
    if (idx === 0) {
      setPhase('device');
      setDevice(null);
    } else {
      setIdx((i) => i - 1);
    }
  };
  const next = () => setIdx((i) => i + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', minWidth: 0 }}>
      {phase === 'device' && (
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
                onClick={() => { setDevice(d); setIdx(0); setPhase('flow'); }}
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

      {phase === 'flow' && current?.kind === 'code' && (
        <Center>
          <Text variant="heading" bold align="center">
            Scanner setup
          </Text>
          <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
            Use your barcode scanner to scan the code below to {current.action}.
          </Text>
          {current.codeType === 'qr' ? <QrGraphic /> : <BarcodeCard />}
          <Buttons onBack={back} onNext={next} />
        </Center>
      )}

      {phase === 'flow' && current?.kind === 'instructions' && (
        <Center>
          <Text variant="heading" bold align="center">
            Scanner setup
          </Text>
          <div style={{ textAlign: 'left', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)">
              You can scan barcodes using an external scanner to quickly build a cart.
            </Text>
            <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)" style={{ whiteSpace: 'pre-line' }}>
              • Refer to your bluetooth barcode scanner in System Bluetooth settings.
              {'\n'}• Scan barcodes while on the item list to add products to the cart.
              {'\n'}• Ensure the search field is not enabled while scanning barcodes.
            </Text>
            <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)">
              Barcode scanner may hide keyboard. Tap keyboard icon or enable in OS settings under "Physical Keyboard"
            </Text>
          </div>
          <Buttons onBack={back} onNext={next} />
        </Center>
      )}

      {phase === 'flow' && current?.kind === 'pair' && <PairStep device={device} onBack={back} onNext={next} />}

      {phase === 'flow' && current?.kind === 'test' && (
        <TestStep onDone={() => setPhase('success')} onBack={back} />
      )}

      {phase === 'success' && (
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
            <OutlinedButton text="How to set up barcodes on products" fullWidth onClick={() => setPhase('info')} />
          </div>
        </Center>
      )}

      {phase === 'info' && (
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

/** Pair step (PointOfSaleBarcodeScannerPairingView / ScanningSetupStep.PairYourScanner). The
 *  "Go to your device settings" link is unconditional on both platforms (unlike the card reader
 *  or printer, this isn't gated on Bluetooth already being off) and always leaves the app to the
 *  OS Bluetooth settings. */
function PairStep({ device, onBack, onNext }: { device: string | null; onBack: () => void; onNext: () => void }) {
  const connectivity = useConnectivity();
  return (
    <Center>
      <GearsIllustration />
      <Text variant="heading" bold align="center">
        Pair your scanner
      </Text>
      <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
        Enable Bluetooth and select your {device} scanner in the OS settings. The scanner will beep
        and show a solid LED when paired.
      </Text>
      <button
        type="button"
        onClick={connectivity.openSettings}
        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
      >
        <Text variant="bodyLarge" bold color="var(--color-primary)" style={{ textDecoration: 'underline' }}>
          Go to your device settings
        </Text>
      </button>
      <Buttons onBack={onBack} onNext={onNext} />
    </Center>
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
          : 'Scan this test barcode to verify your scanner is working correctly.'}
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

/** A deterministic QR-style code: three corner finder patterns + a patterned interior. */
function QrGraphic() {
  const N = 21;
  const cell = 7;
  const black = '#101517';
  const inFinder = (x: number, y: number) => {
    const zones = [[0, 0], [N - 7, 0], [0, N - 7]];
    return zones.some(([ox, oy]) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7);
  };
  const nearFinder = (x: number, y: number) => {
    const zones = [[0, 0], [N - 8, 0], [0, N - 8]];
    return zones.some(([ox, oy]) => x >= ox && x < ox + 8 && y >= oy && y < oy + 8);
  };
  const cells: ReactNode[] = [];
  // Interior modules (skip the finder + separator zones).
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (nearFinder(x, y) || inFinder(x, y)) continue;
      if ((x * 3 + y * 7 + x * y) % 3 === 0) {
        cells.push(<rect key={`m-${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={black} />);
      }
    }
  }
  // Finder patterns: 7x7 black, 5x5 white, 3x3 black.
  const finder = (ox: number, oy: number) => (
    <g key={`f-${ox}-${oy}`}>
      <rect x={ox * cell} y={oy * cell} width={7 * cell} height={7 * cell} fill={black} />
      <rect x={(ox + 1) * cell} y={(oy + 1) * cell} width={5 * cell} height={5 * cell} fill="#fff" />
      <rect x={(ox + 2) * cell} y={(oy + 2) * cell} width={3 * cell} height={3 * cell} fill={black} />
    </g>
  );
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', boxShadow: 'var(--shadow-soft-medium)' }}>
      <svg width={N * cell} height={N * cell} viewBox={`0 0 ${N * cell} ${N * cell}`} aria-hidden>
        {cells}
        {finder(0, 0)}
        {finder(N - 7, 0)}
        {finder(0, N - 7)}
      </svg>
    </div>
  );
}

/** Two interlocking gears (settings) illustration in the primary palette. */
function GearsIllustration() {
  const gear = (cx: number, cy: number, r: number, teeth: number, fill: string) => {
    const inner = r * 0.55;
    const spokes = Array.from({ length: teeth }).map((_, i) => {
      const a = (i / teeth) * Math.PI * 2;
      const tw = (Math.PI / teeth) * 0.6;
      const p = (ang: number, rad: number) => `${cx + Math.cos(ang) * rad},${cy + Math.sin(ang) * rad}`;
      return `${p(a - tw, r)} ${p(a - tw, r * 1.28)} ${p(a + tw, r * 1.28)} ${p(a + tw, r)}`;
    });
    return (
      <g fill={fill}>
        <circle cx={cx} cy={cy} r={r} />
        {spokes.map((pts, i) => (
          <polygon key={i} points={pts} />
        ))}
        <circle cx={cx} cy={cy} r={inner} fill="#fff" />
      </g>
    );
  };
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden>
      {gear(58, 60, 15, 8, 'var(--color-secondary)')}
      {gear(36, 36, 22, 9, 'var(--color-primary)')}
    </svg>
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

/** Setup barcode shown on a white card (e.g. the Netum HID/pairing codes). */
function BarcodeCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-soft-medium)' }}>
      <BarcodeGraphic />
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
