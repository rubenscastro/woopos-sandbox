import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DeviceFrame } from './DeviceFrame';
import { DeviceCursor } from './DeviceCursor';
import { useDevice, type DeviceId, type ThemeId } from './DeviceContext';
import { usePlatform, type PlatformId } from './PlatformContext';
import { PlatformSwitcher } from './PlatformSwitcher';
import { VersionSwitcher } from './VersionSwitcher';
import { useVersion } from '../versions/VersionContext';
import { pinnedPlatform } from '../versions/registry';
import { resolvePath } from '../versions/routing';
import {
  PreviewStateProvider,
  usePreviewStateConfigs,
  type PreviewStateConfig,
} from './PreviewStateContext';
import { PageBackgroundProvider } from './PageBackground';
import { DeviceKeyboard } from './DeviceKeyboard';
import { useTools } from '../tools/ToolsContext';
import { useCardReader } from '../tools/CardReaderContext';
import { usePrinter } from '../state/PrinterContext';
import { useBarcodeScanner } from '../tools/BarcodeScannerContext';
import { useConnectivity } from '../tools/ConnectivityContext';
import { useOptionalSystemEvents } from '../components/versions/scaling-pos-experience/android/systemEvents/SystemEventsContext';
import { ConnectivityOsHost } from '../tools/ConnectivityOsHost';
import { useFlags, FLAG_DEFS } from '../state/FlagsContext';
import { useCustomAmountOption, CUSTOM_AMOUNT_OPTIONS } from '../state/customAmountOption';
import { BarcodeSetupProvider, BarcodeSetupHost } from '../tools/BarcodeSetup';
import { CartSheetProvider, CartSheetHost } from './CartSheet';
import { PhonePersistentButtonHost } from '../components/android/PhonePersistentButton';
import { CardReaderConnectionHost } from '../tools/CardReaderConnectionDialog';
import { PrinterSetupHost } from '../components/ios/PosPrinterSetupModal';
import {
  Barcode,
  Card as CardIcon,
  Check,
  ChevronRight,
  TabletIcon,
  PhoneIcon,
  Sun,
  Moon,
} from '../components/android/icons';
import { useCart } from '../state/CartContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { products } from '../mocks/android/products';
import { flowGroups as androidFlowGroups } from '../flows.android';
import { flowGroups as iosFlowGroups } from '../flows.ios';
import './DeviceChrome.css';

const builtFlowsByPlatform: Record<PlatformId, { num: number; title: string; path?: string }[]> = {
  android: androidFlowGroups.flatMap((g) => g.flows).filter((f) => f.built && f.path),
  ios: iosFlowGroups.flatMap((g) => g.flows).filter((f) => f.built && f.path),
};

/**
 * Chrome around the simulated device. The flow-navigation menu, the per-screen preview-state
 * switcher, and the device / color-scheme switchers all live out here — OUTSIDE the device
 * frame — while the active flow renders inside the frame via <Outlet/>.
 */
export function DeviceLayout() {
  const { device, setDevice, theme, setTheme } = useDevice();
  const { platform } = usePlatform();
  const { version } = useVersion();

  return (
    <PreviewStateProvider>
      <PageBackgroundProvider>
      <BarcodeSetupProvider>
      <CartSheetProvider>
      <div className="chrome">
        <aside className="chrome-bar">
          <div className="chrome-left">
            <Link to={resolvePath(version, platform, '/')} className="chrome-brand">
              <img src="/favicon.png" alt="" aria-hidden className="chrome-brand-logo" />
              POS Sandbox
            </Link>
            {/* Version sits above the flow picker: which prototype you're in scopes which
                flows the picker is even listing. Trunk is the source-parity baseline; the
                rest are proposals (see VERSIONS.md). */}
            <VersionSwitcher />
            {/* Flow picker temporarily hidden — re-enable by restoring <FlowsMenu /> here. */}
            {false && <FlowsMenu />}
            {/* The Barcode + Card reader tools drive shared state (cart scans, reader connection
                and transactions), so both platforms get them — iOS flows respond to the same tool
                input as Android. The preview-state menu renders whenever the current screen
                publishes states (both platforms) — it is the standard control for inducing
                edge cases / error states; screens default to the happy path. */}
            <ToolsMenu />
            <ConnectivityMenu />
            <HardwareMenu />
            {/* Catalog sync only exists for the scaling-pos-experience proposal's System
                Events surface — hidden everywhere else since there's nothing to trigger. */}
            <CatalogSyncMenu />
            <PreviewStateMenu />
            <CustomAmountOptionMenu />
            <FlagsMenu />
          </div>
          <div className="chrome-right">
            {/* Platform / Device / Theme are how you're *viewing* the prototype rather than
                what you're driving inside it, so they live behind one Settings menu instead of
                three always-open rails. */}
            <SettingsMenu
              device={device}
              setDevice={setDevice}
              theme={theme}
              setTheme={setTheme}
            />
          </div>
        </aside>

        <DeviceFrame
          overlay={
            <>
              <BarcodeSetupHost />
              <CardReaderConnectionHost />
              <PrinterSetupHost />
              <ConnectivityOsHost />
              <CartSheetHost />
              <PhonePersistentButtonHost />
              <DeviceKeyboard />
            </>
          }
        >
          <Outlet />
        </DeviceFrame>
        <DeviceCursor />
      </div>
      </CartSheetProvider>
      </BarcodeSetupProvider>
      </PageBackgroundProvider>
    </PreviewStateProvider>
  );
}

/**
 * "Tools" section — prototype meta-interactions. Barcode splits into "Use barcode" (the
 * scanner-cursor tool) and "Add scanned product" (simulates scanning a real product).
 */
function ToolsMenu() {
  const { activeTool, toggleTool, setActiveTool } = useTools();
  const scanner = useBarcodeScanner();
  const systemEvents = useOptionalSystemEvents();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = activeTool === 'barcode';

  const addScanned = () => {
    const p = products[Math.floor((Date.now() / 1000) % products.length)];
    // Scanning shows a brief loading row in the cart before the product resolves.
    cart.scanProduct({ id: p.id, name: p.name, price: p.price });
    // Adding a scanned product exits the barcode cursor tool.
    setActiveTool('none');
  };

  // Clicking outside the Tools menu closes it and deselects "Use barcode" if it was on.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setActiveTool('none');
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open, setActiveTool]);

  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">Tools</span>
      <button
        type="button"
        className={`chrome-tool-btn${active ? ' is-active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-pressed={active}
      >
        <Barcode size="18px" />
        Barcode
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 240 }}>
          {/* Scanner "Connected" only matters for the scaling-pos-experience proposal's
              System Events surface — hidden elsewhere since nothing reacts to it. */}
          {systemEvents && (
            <>
              <button
                type="button"
                className="chrome-reader__toggle"
                role="switch"
                aria-checked={scanner.connected}
                onClick={() => scanner.setConnected(!scanner.connected)}
              >
                <span>Connected</span>
                <span className={`chrome-switch${scanner.connected ? ' is-on' : ''}`} aria-hidden>
                  <span className="chrome-switch__knob" />
                </span>
              </button>
              <div className="chrome-reader__divider" />
            </>
          )}
          <button
            type="button"
            className={`chrome-menu__item${active ? ' is-active' : ''}`}
            onClick={() => { setOpen(false); toggleTool('barcode'); }}
          >
            {active && <Check size="16px" />}
            Use barcode
          </button>
          <button
            type="button"
            className="chrome-menu__item"
            onClick={() => { setOpen(false); addScanned(); }}
          >
            Add scanned product
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Settings menu — Platform, Device and Theme. These describe how the prototype is being
 * *viewed* rather than what is being driven inside it, so they sit behind one trigger at the
 * bottom of the sidebar instead of three permanently open segmented rails. The segmented
 * controls themselves are unchanged; they just live in a dropdown now.
 */
function SettingsMenu({
  device,
  setDevice,
  theme,
  setTheme,
}: {
  device: DeviceId;
  setDevice: (d: DeviceId) => void;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const { version } = useVersion();

  return (
    <div className="chrome-menu" ref={menuRef}>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        Settings
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown chrome-menu__dropdown--settings" style={{ minWidth: 240 }}>
          {/* A version built for one platform has nothing to switch between, so the control
              goes rather than sitting there disabled. */}
          {!pinnedPlatform(version) && (
            <div className="chrome-segmented-group">
              <span className="chrome-segmented-label">Platform</span>
              <PlatformSwitcher />
            </div>
          )}
          <div className="chrome-segmented-group">
            <span className="chrome-segmented-label">Device</span>
            <Segmented<DeviceId>
              ariaLabel="Device"
              value={device}
              onChange={setDevice}
              options={[
                { id: 'tablet', label: 'Tablet', icon: <TabletIcon size="18px" /> },
                { id: 'phone', label: 'Phone', icon: <PhoneIcon size="18px" /> },
              ]}
            />
          </div>
          <div className="chrome-segmented-group">
            <span className="chrome-segmented-label">Theme</span>
            <Segmented<ThemeId>
              ariaLabel="Color scheme"
              value={theme}
              onChange={setTheme}
              options={[
                { id: 'light', label: 'Light', icon: <Sun size="18px" /> },
                { id: 'dark', label: 'Dark', icon: <Moon size="18px" /> },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hardware tool — one menu covering every simulated peripheral: the card reader (all
 * platforms) and the receipt printer (iOS only, which is the only platform whose POS prints).
 * Both used to be separate sidebar items; they are siblings of the same kind, so they share
 * one trigger and the dropdown sections them apart. The trigger summarises how many are
 * connected, the way Connectivity summarises its three radios.
 */
function HardwareMenu() {
  const { platform } = usePlatform();
  const cr = useCardReader();
  const p = usePrinter();
  const [open, setOpen] = useState(false);

  // While a peripheral is mid-connect, the flow is driven from *inside* this menu (reader
  // found → connect completes/fails, and the printer's discovery equivalents). Dismissing it
  // on an outside click would pull the controls out from under whoever is stepping through
  // the on-screen dialog, so the menu is pinned for the duration: no outside-click listener,
  // and it opens itself if the flow was started from the screen rather than from here. The
  // trigger still toggles it, which keeps a way out.
  const flowActive =
    cr.connectionState !== 'idle' || p.setupOpen || p.setupState !== 'idle';
  const menuRef = useClickOutside<HTMLDivElement>(open && !flowActive, () => setOpen(false));
  useEffect(() => {
    if (flowActive) setOpen(true);
  }, [flowActive]);

  const close = () => {
    if (!flowActive) setOpen(false);
  };

  const hasPrinter = platform === 'ios';
  const total = hasPrinter ? 2 : 1;
  const connected = (cr.connected ? 1 : 0) + (hasPrinter && p.connected ? 1 : 0);

  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">Hardware</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        <CardIcon size="18px" />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: connected > 0 ? 'var(--color-success)' : 'var(--color-alert)',
            }}
          />
          {connected}/{total} connected
        </span>
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 280 }}>
          <div className="chrome-menu__section">
            <CardIcon size="14px" />
            Card reader
          </div>
          <CardReaderSection close={close} />
          {hasPrinter && (
            <>
              <div className="chrome-reader__divider" />
              <div className="chrome-menu__section">
                <PrinterChromeIcon />
                Receipt printer
              </div>
              <PrinterSection close={close} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Card reader controls — drives the connect flow (start / reader found / connect completes or
 * fails) and processes authorized / declined transactions at checkout. No simulate buttons
 * appear on the dialog; these tool options stand in for the hardware events.
 */
function CardReaderSection({ close }: { close: () => void }) {
  const cr = useCardReader();
  const { platform } = usePlatform();
  const s = cr.connectionState;

  return (
    <>

          {/* ---- Quick toggle — set connected directly, skipping the connect flow ---- */}
          <button
            type="button"
            className="chrome-reader__toggle"
            role="switch"
            aria-checked={cr.connected}
            onClick={() => cr.setConnected(!cr.connected)}
          >
            <span>Connected</span>
            <span className={`chrome-switch${cr.connected ? ' is-on' : ''}`} aria-hidden>
              <span className="chrome-switch__knob" />
            </span>
          </button>

          {/* Local network permission (Android only, 2026-09-04 sync): turning it OFF makes the
              next connect find a phone-as-reader ("Pixel 9") and gates Connect behind the
              MissingLocalNetworkPermission dialog state. Granting (in-dialog or here) auto-resumes. */}
          {platform === 'android' && (
            <button
              type="button"
              className="chrome-reader__toggle"
              role="switch"
              aria-checked={cr.localNetworkGranted}
              onClick={() => cr.setLocalNetworkGranted(!cr.localNetworkGranted)}
            >
              <span>Local network permission</span>
              <span className={`chrome-switch${cr.localNetworkGranted ? ' is-on' : ''}`} aria-hidden>
                <span className="chrome-switch__knob" />
              </span>
            </button>
          )}

          {/* Location services (iOS): the Terminal SDK refuses to connect without them. Turning
              this OFF stops the next connect on the location alert instead of proceeding;
              granting it — here or by the alert's "Open Device Settings" — resumes the connect
              that was waiting on it, the way the app re-checks when it becomes active again. */}
          {platform === 'ios' && (
            <button
              type="button"
              className="chrome-reader__toggle"
              role="switch"
              aria-checked={cr.locationGranted}
              onClick={() => cr.setLocationGranted(!cr.locationGranted)}
            >
              <span>Location services</span>
              <span className={`chrome-switch${cr.locationGranted ? ' is-on' : ''}`} aria-hidden>
                <span className="chrome-switch__knob" />
              </span>
            </button>
          )}

          <div className="chrome-reader__divider" />

          {/* ---- Connection ---- */}
          {!cr.connected && s === 'idle' && (
            <ReaderItem label="Connect card reader" onClick={() => cr.startConnecting()} />
          )}
          {cr.connected && s === 'idle' && (
            <ReaderItem label="Disconnect reader" onClick={() => { close(); cr.setConnected(false); }} />
          )}
          {s === 'scanning' && (
            <>
              <ReaderItem label="Reader found" onClick={cr.readerFound} />
              {/* Discovery answering with more than one reader — the merchant picks from a list
                  rather than being offered a single one to accept. */}
              <ReaderItem label="Several readers found" onClick={cr.readersFound} />
            </>
          )}
          {s === 'connecting' && (
            <>
              <ReaderItem label="Complete connection" onClick={cr.completeConnection} />
              <ReaderItem label="Fail connection" onClick={cr.failConnection} />
            </>
          )}
          {(s === 'found' || s === 'foundMultiple' || s === 'connected' || s === 'failed' || s === 'locationRequired') && (
            <div className="chrome-reader__hint">Follow the on-screen dialog…</div>
          )}

          <div className="chrome-reader__divider" />

          {/* ---- Transactions ---- */}
          <ReaderItem
            label="Process authorized transaction"
            disabled={!cr.canProcess}
            onClick={() => { close(); cr.process('authorized'); }}
          />
          <ReaderItem
            label="Process declined transaction"
            disabled={!cr.canProcess}
            onClick={() => { close(); cr.process('declined'); }}
          />
          {!cr.canProcess && (
            <div className="chrome-reader__hint">Open checkout with a connected reader to process.</div>
          )}
    </>
  );
}

function ReaderItem({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="chrome-menu__item"
      disabled={disabled}
      style={{ opacity: disabled ? 0.4 : 1 }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/**
 * Receipt printer controls (iOS) — drives the whole POSPrinterSetupModal flow: open setup,
 * stand in for the Bluetooth discovery events (printer found / connect completes or fails),
 * and connect/disconnect directly. No simulate buttons appear in the modal itself.
 */
function PrinterSection({ close }: { close: () => void }) {
  const p = usePrinter();
  const s = p.setupState;

  return (
    <>

          {/* ---- Quick toggle — set connected directly, skipping the setup flow ---- */}
          <button type="button" className="chrome-reader__toggle" role="switch" aria-checked={p.connected} onClick={() => p.setConnected(!p.connected)}>
            <span>Connected</span>
            <span className={`chrome-switch${p.connected ? ' is-on' : ''}`} aria-hidden>
              <span className="chrome-switch__knob" />
            </span>
          </button>

          <div className="chrome-reader__divider" />

          {/* ---- Setup / discovery flow ---- */}
          {!p.connected && (s === 'idle' || s === 'error') && (
            <ReaderItem label="Open printer setup" onClick={() => p.openSetup()} />
          )}
          {s === 'searching' && (
            <>
              <ReaderItem label="Printer found" onClick={p.printerFound} />
              <ReaderItem label="No printers found" onClick={p.noPrintersFound} />
            </>
          )}
          {s === 'connecting' && (
            <>
              <ReaderItem label="Complete connection" onClick={p.completeConnection} />
              <ReaderItem label="Fail connection" onClick={p.failConnection} />
            </>
          )}
          {(s === 'found' || s === 'connected') && (
            <div className="chrome-reader__hint">Follow the on-screen setup…</div>
          )}
          {p.connected && s !== 'connecting' && (
            <ReaderItem label="Disconnect printer" onClick={() => { close(); p.disconnect(); }} />
          )}
    </>
  );
}

/**
 * Connectivity tool — Bluetooth / Wifi / Cellular data world-state toggles. Bluetooth gates the
 * card reader, receipt printer, and barcode scanner connection flows (turning it off here has the
 * same effect as it being off on the device); Wifi/Cellular are state only for now.
 */
function ConnectivityMenu() {
  const c = useConnectivity();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const onCount = [c.bluetooth, c.wifi, c.cellular].filter(Boolean).length;

  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">Connectivity</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        <ConnectivityChromeIcon />
        <span>{onCount}/3 on</span>
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 220 }}>
          <button type="button" className="chrome-reader__toggle" role="switch" aria-checked={c.bluetooth} onClick={() => c.setBluetooth(!c.bluetooth)}>
            <span>Bluetooth</span>
            <span className={`chrome-switch${c.bluetooth ? ' is-on' : ''}`} aria-hidden>
              <span className="chrome-switch__knob" />
            </span>
          </button>
          <button type="button" className="chrome-reader__toggle" role="switch" aria-checked={c.wifi} onClick={() => c.setWifi(!c.wifi)}>
            <span>Wifi</span>
            <span className={`chrome-switch${c.wifi ? ' is-on' : ''}`} aria-hidden>
              <span className="chrome-switch__knob" />
            </span>
          </button>
          <button type="button" className="chrome-reader__toggle" role="switch" aria-checked={c.cellular} onClick={() => c.setCellular(!c.cellular)}>
            <span>Cellular data</span>
            <span className={`chrome-switch${c.cellular ? ' is-on' : ''}`} aria-hidden>
              <span className="chrome-switch__knob" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function ConnectivityChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 7.5 16 15l-4 3.5v-13L16 9 8 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PrinterChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9V4h12v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="3" y="9" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="6" y="14" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Custom amounts proposal only — switches between its two designs. Option 1 is the Custom
 * amount row → Amount / Review flow; Option 2 adds a Keypad tab. Hidden in every other version.
 */
function CustomAmountOptionMenu() {
  const { version } = useVersion();
  const { option, setOption } = useCustomAmountOption();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  if (version !== 'custom-amounts') return null;
  const active = CUSTOM_AMOUNT_OPTIONS.find((o) => o.id === option);
  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">Custom amount</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        {active?.label}
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown">
          {CUSTOM_AMOUNT_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`chrome-menu__item ${o.id === option ? 'is-active' : ''}`}
              onClick={() => { setOpen(false); setOption(o.id); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Feature flags tool — toggle prototype flags that mirror the iOS POS FeatureFlag gates. */
function FlagsMenu() {
  const { flags, setFlag } = useFlags();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const onCount = FLAG_DEFS.filter((f) => flags[f.id]).length;

  return (
    <div className="chrome-menu" ref={menuRef}>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        {onCount > 0 ? `Flags · ${onCount} on` : 'Flags'}
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 260 }}>
          {FLAG_DEFS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="chrome-reader__toggle"
              role="switch"
              aria-checked={flags[f.id]}
              onClick={() => setFlag(f.id, !flags[f.id])}
              style={{ alignItems: 'flex-start' }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                <span>{f.label}</span>
                <span style={{ fontSize: 11, color: 'var(--menu-muted)' }}>{f.description}</span>
              </span>
              <span className={`chrome-switch${flags[f.id] ? ' is-on' : ''}`} aria-hidden>
                <span className="chrome-switch__knob" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Manual trigger for the "Catalog sync failed" / "Catalog synced" System Events — decoupled
 * from the Connectivity tool by design (kept independently toggleable rather than tied to
 * wifi/cellular). Only rendered inside the scaling-pos-experience proposal's route tree,
 * where SystemEventsProvider actually exists.
 */
function CatalogSyncMenu() {
  const systemEvents = useOptionalSystemEvents();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  if (!systemEvents) return null;
  const { syncFailed, markSyncFailed, markSyncResolved } = systemEvents;

  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">Catalog sync</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: syncFailed ? 'var(--color-alert)' : 'var(--color-success)',
            }}
          />
          {syncFailed ? 'Sync failed' : 'Synced'}
        </span>
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 240 }}>
          <button
            type="button"
            className="chrome-reader__toggle"
            role="switch"
            aria-checked={syncFailed}
            onClick={() => (syncFailed ? markSyncResolved() : markSyncFailed())}
          >
            <span>Sync failed</span>
            <span className={`chrome-switch${syncFailed ? ' is-on' : ''}`} aria-hidden>
              <span className="chrome-switch__knob" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function Segmented<T extends string>({
  ariaLabel,
  value,
  onChange,
  options,
}: {
  ariaLabel: string;
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={o.id === value ? 'is-active' : ''}
          aria-pressed={o.id === value}
          aria-label={o.label}
          title={o.label}
          onClick={() => onChange(o.id)}
        >
          {o.icon && <span className="segmented__icon">{o.icon}</span>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function FlowsMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { platform } = usePlatform();
  const { version } = useVersion();
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const builtFlows = builtFlowsByPlatform[platform];
  const current = builtFlows.find((f) => resolvePath(version, platform, f.path!) === location.pathname);

  return (
    <div className="chrome-menu" ref={menuRef}>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        {current ? `${current.num}. ${current.title}` : 'Flows'}
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown">
          <button
            type="button"
            className="chrome-menu__item chrome-menu__item--all"
            onClick={() => {
              setOpen(false);
              navigate(resolvePath(version, platform, '/flows'));
            }}
          >
            All flows
          </button>
          {builtFlows.map((f) => (
            <button
              key={f.num}
              type="button"
              className={`chrome-menu__item ${resolvePath(version, platform, f.path!) === location.pathname ? 'is-active' : ''}`}
              onClick={() => {
                setOpen(false);
                navigate(resolvePath(version, platform, f.path!));
              }}
            >
              <span className="chrome-menu__num">{f.num}</span>
              {f.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** One menu per set of states the current screen published. */
function PreviewStateMenu() {
  const configs = usePreviewStateConfigs();
  return (
    <>
      {configs.map((c) => (
        <PreviewStateMenuItem key={c.label} config={c} />
      ))}
    </>
  );
}

function PreviewStateMenuItem({ config }: { config: PreviewStateConfig }) {
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  if (config.options.length === 0) return null;

  const active = config.options.find((o) => o.id === config.active);

  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">{config.label}</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        {active?.label ?? 'Select'}
        <ChevronRight size="14px" className="chrome-menu__caret" />
      </button>
      {open && (
        <div className="chrome-menu__dropdown">
          {config.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`chrome-menu__item ${o.id === config.active ? 'is-active' : ''}`}
              onClick={() => {
                setOpen(false);
                config.onSelect(o.id);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
