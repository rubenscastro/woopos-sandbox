import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DeviceFrame } from './DeviceFrame';
import { useDevice, type DeviceId, type ThemeId } from './DeviceContext';
import { usePlatform, type PlatformId } from './PlatformContext';
import { platformPath } from './platformNav';
import { PlatformSwitcher } from './PlatformSwitcher';
import {
  PreviewStateProvider,
  usePreviewStateConfig,
} from './PreviewStateContext';
import { PageBackgroundProvider } from './PageBackground';
import { DeviceKeyboard } from './DeviceKeyboard';
import { useTools } from '../tools/ToolsContext';
import { useCardReader } from '../tools/CardReaderContext';
import { usePrinter } from '../state/PrinterContext';
import { useConnectivity } from '../tools/ConnectivityContext';
import { ConnectivityOsHost } from '../tools/ConnectivityOsHost';
import { useFlags, FLAG_DEFS } from '../state/FlagsContext';
import { BarcodeSetupProvider, BarcodeSetupHost } from '../tools/BarcodeSetup';
import { CartSheetProvider, CartSheetHost } from './CartSheet';
import { CardReaderConnectionHost } from '../tools/CardReaderConnectionDialog';
import { PrinterSetupHost } from '../components/ios/PosPrinterSetupModal';
import { Barcode, Card as CardIcon, Check, TabletIcon, PhoneIcon, Sun, Moon } from '../components/android/icons';
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

  return (
    <PreviewStateProvider>
      <PageBackgroundProvider>
      <BarcodeSetupProvider>
      <CartSheetProvider>
      <div className="chrome">
        <aside className="chrome-bar">
          <div className="chrome-left">
            <Link to={`/${platform}`} className="chrome-brand">
              WooPOS
            </Link>
            {/* The Barcode + Card reader tools drive shared state (cart scans, reader connection
                and transactions), so both platforms get them — iOS flows respond to the same tool
                input as Android. The Flows list and preview-state menu are Android-only for now. */}
            <FlowsMenu />
            <FlagsMenu />
            <ToolsMenu />
            <ConnectivityMenu />
            <CardReaderMenu />
            {/* Receipt printers are iOS-only in the prototype. */}
            {platform === 'ios' && <PrinterMenu />}
            {platform === 'android' && <PreviewStateMenu />}
          </div>
          <div className="chrome-right">
            <div className="chrome-segmented-group">
              <span className="chrome-segmented-label">Platform</span>
              <PlatformSwitcher />
            </div>
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
        </aside>

        <DeviceFrame
          overlay={
            <>
              <BarcodeSetupHost />
              <CardReaderConnectionHost />
              <PrinterSetupHost />
              <ConnectivityOsHost />
              <CartSheetHost />
              <DeviceKeyboard />
            </>
          }
        >
          <Outlet />
        </DeviceFrame>
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
        <span className="chrome-menu__caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 240 }}>
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
 * Card reader tool — drives the connect flow (start / reader found / connect completes or
 * fails) and processes authorized / declined transactions at checkout. No simulate buttons
 * appear on the dialog; these tool options stand in for the hardware events.
 */
function CardReaderMenu() {
  const cr = useCardReader();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const s = cr.connectionState;

  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">Card reader</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        <CardIcon size="18px" />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: cr.connected ? 'var(--color-success)' : 'var(--color-alert)',
            }}
          />
          {cr.connected ? 'Connected' : 'Not connected'}
        </span>
        <span className="chrome-menu__caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 280 }}>
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

          <div className="chrome-reader__divider" />

          {/* ---- Connection ---- */}
          {!cr.connected && s === 'idle' && (
            <ReaderItem label="Connect card reader" onClick={() => { setOpen(false); cr.startConnecting(); }} />
          )}
          {cr.connected && s === 'idle' && (
            <ReaderItem label="Disconnect reader" onClick={() => { setOpen(false); cr.setConnected(false); }} />
          )}
          {s === 'scanning' && <ReaderItem label="Reader found" onClick={cr.readerFound} />}
          {s === 'connecting' && (
            <>
              <ReaderItem label="Complete connection" onClick={cr.completeConnection} />
              <ReaderItem label="Fail connection" onClick={cr.failConnection} />
            </>
          )}
          {(s === 'found' || s === 'connected' || s === 'failed') && (
            <div className="chrome-reader__hint">Follow the on-screen dialog…</div>
          )}

          <div className="chrome-reader__divider" />

          {/* ---- Transactions ---- */}
          <ReaderItem
            label="Process authorized transaction"
            disabled={!cr.canProcess}
            onClick={() => { setOpen(false); cr.process('authorized'); }}
          />
          <ReaderItem
            label="Process declined transaction"
            disabled={!cr.canProcess}
            onClick={() => { setOpen(false); cr.process('declined'); }}
          />
          {!cr.canProcess && (
            <div className="chrome-reader__hint">Open checkout with a connected reader to process.</div>
          )}
        </div>
      )}
    </div>
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
 * Receipt printer tool (iOS) — drives the whole POSPrinterSetupModal flow: open setup, stand in for
 * the Bluetooth discovery events (printer found / connect completes or fails), and connect/disconnect
 * directly. Mirrors the Card reader tool; no simulate buttons appear in the modal itself.
 */
function PrinterMenu() {
  const p = usePrinter();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const s = p.setupState;

  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">Receipt printer</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        <PrinterChromeIcon />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.connected ? 'var(--color-success)' : 'var(--color-alert)' }} />
          {p.connected ? 'Connected' : 'Not connected'}
        </span>
        <span className="chrome-menu__caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 280 }}>
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
            <ReaderItem label="Open printer setup" onClick={() => { setOpen(false); p.openSetup(); }} />
          )}
          {s === 'searching' && <ReaderItem label="Printer found" onClick={p.printerFound} />}
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
            <ReaderItem label="Disconnect printer" onClick={() => { setOpen(false); p.disconnect(); }} />
          )}
        </div>
      )}
    </div>
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
        <span className="chrome-menu__caret">{open ? '▴' : '▾'}</span>
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
        <span className="chrome-menu__caret">{open ? '▴' : '▾'}</span>
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
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const builtFlows = builtFlowsByPlatform[platform];
  const current = builtFlows.find((f) => platformPath(platform, f.path!) === location.pathname);

  return (
    <div className="chrome-menu" ref={menuRef}>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        {current ? `${current.num}. ${current.title}` : 'Flows'}
        <span className="chrome-menu__caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="chrome-menu__dropdown">
          <button
            type="button"
            className="chrome-menu__item chrome-menu__item--all"
            onClick={() => {
              setOpen(false);
              navigate(platformPath(platform, '/flows'));
            }}
          >
            All flows
          </button>
          {builtFlows.map((f) => (
            <button
              key={f.num}
              type="button"
              className={`chrome-menu__item ${platformPath(platform, f.path!) === location.pathname ? 'is-active' : ''}`}
              onClick={() => {
                setOpen(false);
                navigate(platformPath(platform, f.path!));
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

function PreviewStateMenu() {
  const config = usePreviewStateConfig();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  if (!config || config.options.length === 0) return null;

  const active = config.options.find((o) => o.id === config.active);

  return (
    <div className="chrome-menu chrome-menu--state" ref={menuRef}>
      <span className="chrome-menu__label">{config.label}</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        {active?.label ?? 'Select'}
        <span className="chrome-menu__caret">{open ? '▴' : '▾'}</span>
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
