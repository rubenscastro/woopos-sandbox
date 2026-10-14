import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Barcode-scanner *connection* state — separate from BarcodeSetupContext (which only tracks
 * whether the setup wizard modal is open). Mirrors CardReaderContext/PrinterContext's shape
 * so the chrome's Tools menu can drive a "Connected" quick toggle the same way it does for
 * the card reader and receipt printer.
 */
interface BarcodeScannerValue {
  connected: boolean;
  setConnected: (v: boolean) => void;
}

const BarcodeScannerContext = createContext<BarcodeScannerValue | null>(null);

export function BarcodeScannerProvider({ children }: { children: ReactNode }) {
  const [connected, setConnectedState] = useState(false);
  const setConnected = useCallback((v: boolean) => setConnectedState(v), []);
  const value = useMemo<BarcodeScannerValue>(() => ({ connected, setConnected }), [connected, setConnected]);
  return <BarcodeScannerContext.Provider value={value}>{children}</BarcodeScannerContext.Provider>;
}

export function useBarcodeScanner(): BarcodeScannerValue {
  const ctx = useContext(BarcodeScannerContext);
  if (!ctx) throw new Error('useBarcodeScanner must be used within a BarcodeScannerProvider');
  return ctx;
}
