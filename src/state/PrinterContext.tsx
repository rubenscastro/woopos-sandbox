import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Receipt-printer connection state (mirrors iOS POSPrinterConnectionController + PrinterDiscoveryState).
 * The setup wizard (POSPrinterSetupModal) reflects `setupState`; the connect flow is progressed by
 * the "Receipt printer" tool in the chrome bar (which stands in for the Bluetooth discovery events),
 * plus the user's taps in the modal — no timers. Shared so the Hardware settings page and the
 * payment-success "Print receipt" action see the same connected printer. Prototype-only.
 */
export const SAMPLE_PRINTER_NAME = 'Star Micronics TSP654';

export type PrinterSetupState = 'idle' | 'searching' | 'found' | 'connecting' | 'connected' | 'error';

interface PrinterValue {
  connected: boolean;
  name: string | null;
  setConnected: (v: boolean) => void;
  // Setup modal
  setupOpen: boolean;
  setupState: PrinterSetupState;
  openSetup: () => void;
  closeSetup: () => void;
  // Flow transitions (modal buttons + the chrome tool's discovery events)
  startSearch: () => void;
  printerFound: () => void;
  connectPrinter: () => void;
  completeConnection: () => void;
  failConnection: () => void;
  disconnect: () => void;
}

const PrinterContext = createContext<PrinterValue | null>(null);

export function PrinterProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupState, setSetupState] = useState<PrinterSetupState>('idle');

  const openSetup = useCallback(() => { setSetupState('idle'); setSetupOpen(true); }, []);
  const closeSetup = useCallback(() => setSetupOpen(false), []);
  const startSearch = useCallback(() => { setSetupOpen(true); setSetupState('searching'); }, []);
  const printerFound = useCallback(() => setSetupState((s) => (s === 'searching' ? 'found' : s)), []);
  const connectPrinter = useCallback(() => setSetupState('connecting'), []);
  const completeConnection = useCallback(() => { setName(SAMPLE_PRINTER_NAME); setSetupState('connected'); }, []);
  const failConnection = useCallback(() => setSetupState('error'), []);
  const disconnect = useCallback(() => { setName(null); setSetupState('idle'); }, []);
  const setConnected = useCallback((v: boolean) => { setName(v ? SAMPLE_PRINTER_NAME : null); setSetupState(v ? 'connected' : 'idle'); }, []);

  const value = useMemo<PrinterValue>(
    () => ({
      connected: name !== null,
      name,
      setConnected,
      setupOpen,
      setupState,
      openSetup,
      closeSetup,
      startSearch,
      printerFound,
      connectPrinter,
      completeConnection,
      failConnection,
      disconnect,
    }),
    [name, setupOpen, setupState, setConnected, openSetup, closeSetup, startSearch, printerFound, connectPrinter, completeConnection, failConnection, disconnect],
  );
  return <PrinterContext.Provider value={value}>{children}</PrinterContext.Provider>;
}

export function usePrinter(): PrinterValue {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error('usePrinter must be used within a PrinterProvider');
  return ctx;
}
