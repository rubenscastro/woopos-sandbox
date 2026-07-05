import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

/**
 * Card-reader connection state + transaction processing, driven by the Card reader tool in
 * the top bar. The connect flow (scanning → found → connecting → connected) is progressed by
 * tool options that stand in for the hardware events, so no "simulate" buttons appear on the
 * dialog itself. Payment screens register a handler for authorized/declined transactions.
 */
export type TransactionResult = 'authorized' | 'declined';
export type ConnectionState = 'idle' | 'scanning' | 'found' | 'connecting' | 'connected' | 'failed';

export const SAMPLE_READER_NAME = 'STRM261380012691';

interface CardReaderValue {
  connected: boolean;
  setConnected: (v: boolean) => void;
  connectionState: ConnectionState;
  readerName: string;
  // Connect flow
  startConnecting: () => void;
  readerFound: () => void;
  connectReader: () => void;
  keepSearching: () => void;
  completeConnection: () => void;
  failConnection: () => void;
  retryConnection: () => void;
  cancelConnecting: () => void;
  // Transactions
  canProcess: boolean;
  process: (result: TransactionResult) => void;
  registerHandler: (fn: ((r: TransactionResult) => void) | null) => void;
}

const CardReaderContext = createContext<CardReaderValue | null>(null);

export function CardReaderProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [canProcess, setCanProcess] = useState(false);
  const handlerRef = useRef<((r: TransactionResult) => void) | null>(null);

  const registerHandler = useCallback((fn: ((r: TransactionResult) => void) | null) => {
    handlerRef.current = fn;
    setCanProcess(Boolean(fn));
  }, []);
  const process = useCallback((result: TransactionResult) => handlerRef.current?.(result), []);

  const startConnecting = useCallback(() => setConnectionState('scanning'), []);
  const readerFound = useCallback(() => setConnectionState('found'), []);
  const connectReader = useCallback(() => setConnectionState('connecting'), []);
  const keepSearching = useCallback(() => setConnectionState('scanning'), []);
  const failConnection = useCallback(() => setConnectionState('failed'), []);
  const retryConnection = useCallback(() => setConnectionState('scanning'), []);
  const cancelConnecting = useCallback(() => setConnectionState('idle'), []);
  const completeConnection = useCallback(() => {
    setConnected(true);
    setConnectionState('connected');
  }, []);

  // "Connected" shows briefly, then the dialog closes (mirrors the app's 1.5s delay).
  useEffect(() => {
    if (connectionState !== 'connected') return;
    const t = window.setTimeout(() => setConnectionState('idle'), 1500);
    return () => window.clearTimeout(t);
  }, [connectionState]);

  const value = useMemo<CardReaderValue>(
    () => ({
      connected,
      setConnected,
      connectionState,
      readerName: SAMPLE_READER_NAME,
      startConnecting,
      readerFound,
      connectReader,
      keepSearching,
      completeConnection,
      failConnection,
      retryConnection,
      cancelConnecting,
      canProcess,
      process,
      registerHandler,
    }),
    [
      connected,
      connectionState,
      canProcess,
      process,
      registerHandler,
      startConnecting,
      readerFound,
      connectReader,
      keepSearching,
      completeConnection,
      failConnection,
      retryConnection,
      cancelConnecting,
    ],
  );

  return <CardReaderContext.Provider value={value}>{children}</CardReaderContext.Provider>;
}

export function useCardReader(): CardReaderValue {
  const ctx = useContext(CardReaderContext);
  if (!ctx) throw new Error('useCardReader must be used within a CardReaderProvider');
  return ctx;
}

/** Register a handler for the Card reader tool's transaction actions while mounted. */
export function useCardTransaction(handler: (r: TransactionResult) => void, enabled = true) {
  const { registerHandler } = useCardReader();
  const cb = useRef(handler);
  cb.current = handler;
  useEffect(() => {
    if (!enabled) return;
    registerHandler((r) => cb.current(r));
    return () => registerHandler(null);
  }, [enabled, registerHandler]);
}
