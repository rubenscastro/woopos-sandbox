import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DeviceFrame } from './DeviceFrame';
import { useDevice, type DeviceId, type ThemeId } from './DeviceContext';
import { usePlatform } from './PlatformContext';
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
import { BarcodeSetupProvider, BarcodeSetupHost } from '../tools/BarcodeSetup';
import { CartSheetProvider, CartSheetHost } from './CartSheet';
import { CardReaderConnectionHost } from '../tools/CardReaderConnectionDialog';
import { Barcode, Card as CardIcon, Check, TabletIcon, PhoneIcon, Sun, Moon } from '../components/android/icons';
import { useCart } from '../state/CartContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { products } from '../mocks/android/products';
import { flowGroups } from '../flows.android';
import './DeviceChrome.css';

const builtFlows = flowGroups.flatMap((g) => g.flows).filter((f) => f.built && f.path);

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
            {platform === 'android' && <FlowsMenu />}
            <ToolsMenu />
            <CardReaderMenu />
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
