import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Prototype "world" connectivity state — Bluetooth / Wifi / Cellular data — plus the shared
 * "leaving the app" flow that hardware setup screens use whenever they need the OS Bluetooth
 * settings. Mirrors the real apps:
 *  - iOS always leaves the app to Settings.app (UIApplication.openSettingsURLString) — used by
 *    the card reader's "Bluetooth permission required" alert, the receipt-printer setup's
 *    "Open Settings" button, and the barcode-scanner setup's "Go to your device settings" link.
 *  - Android either shows a quick in-app system dialog (BluetoothAdapter.ACTION_REQUEST_ENABLE,
 *    used by the card reader's "Enable Bluetooth" button — doesn't leave the app) or leaves the
 *    app to Settings.ACTION_BLUETOOTH_SETTINGS (the barcode scanner's "Go to your device
 *    settings" link).
 * Persisted to localStorage.
 */
interface ConnectivityState {
  bluetooth: boolean;
  wifi: boolean;
  cellular: boolean;
}

const DEFAULTS: ConnectivityState = { bluetooth: true, wifi: true, cellular: true };
const KEY = 'woopos-connectivity';

function readStored(): ConnectivityState {
  if (typeof localStorage === 'undefined') return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

interface ConnectivityValue extends ConnectivityState {
  setBluetooth: (v: boolean) => void;
  setWifi: (v: boolean) => void;
  setCellular: (v: boolean) => void;
  // "Leaving the app" to a mocked OS Settings screen (Bluetooth toggle + a way back).
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  // Android-only quick in-app system dialog — resolves without leaving the app.
  quickEnableOpen: boolean;
  openQuickEnable: () => void;
  closeQuickEnable: () => void;
}

const ConnectivityContext = createContext<ConnectivityValue | null>(null);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectivityState>(readStored);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickEnableOpen, setQuickEnableOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const setBluetooth = useCallback((v: boolean) => setState((s) => ({ ...s, bluetooth: v })), []);
  const setWifi = useCallback((v: boolean) => setState((s) => ({ ...s, wifi: v })), []);
  const setCellular = useCallback((v: boolean) => setState((s) => ({ ...s, cellular: v })), []);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const openQuickEnable = useCallback(() => setQuickEnableOpen(true), []);
  const closeQuickEnable = useCallback(() => setQuickEnableOpen(false), []);

  const value = useMemo<ConnectivityValue>(
    () => ({
      ...state,
      setBluetooth,
      setWifi,
      setCellular,
      settingsOpen,
      openSettings,
      closeSettings,
      quickEnableOpen,
      openQuickEnable,
      closeQuickEnable,
    }),
    [state, setBluetooth, setWifi, setCellular, settingsOpen, openSettings, closeSettings, quickEnableOpen, openQuickEnable, closeQuickEnable],
  );
  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity(): ConnectivityValue {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) throw new Error('useConnectivity must be used within a ConnectivityProvider');
  return ctx;
}
