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
import { useConnectivity } from './ConnectivityContext';

/**
 * Card-reader connection state + transaction processing, driven by the Card reader tool in
 * the top bar. The connect flow (scanning → found → connecting → connected) is progressed by
 * tool options that stand in for the hardware events, so no "simulate" buttons appear on the
 * dialog itself. Payment screens register a handler for authorized/declined transactions.
 *
 * Starting a connection with Bluetooth off lands on 'bluetoothOff' instead of 'scanning' —
 * mirrors both real apps (Android's BluetoothDisabled dialog state; iOS's "Bluetooth permission
 * required" alert). Turning Bluetooth on while there (by any means — the quick Android dialog,
 * the mocked Settings screen, or the chrome's Connectivity tool) auto-resumes scanning, matching
 * both apps re-checking requirements when the app becomes active again.
 */
export type TransactionResult = 'authorized' | 'declined';
export type ConnectionState =
  | 'idle'
  | 'bluetoothOff'
  | 'scanning'
  | 'found'
  | 'foundMultiple'
  | 'localNetworkPermission'
  | 'locationRequired'
  | 'connecting'
  | 'connected'
  | 'failed';

export const SAMPLE_READER_NAME = 'STRM261380012691';
/** Phone-as-reader name, matching the upstream @Preview (MissingLocalNetworkPermission, "Pixel 9"). */
export const SAMPLE_PHONE_READER_NAME = 'Pixel 9';
/**
 * What discovery turns up when more than one reader answers — Stripe's simulated readers, the
 * names a developer actually sees on this screen. Three of them, so the list is plainly a list
 * rather than a pair.
 */
export const SAMPLE_MULTIPLE_READER_IDS = ['CHB20SIMULATOR2', 'WPC32SIMULATOR1', 'STRM2SIMULATOR1'];

interface CardReaderValue {
  connected: boolean;
  setConnected: (v: boolean) => void;
  connectionState: ConnectionState;
  readerName: string;
  // Local network permission (Android, 2026-09-04 sync): gates connecting to a phone-as-reader.
  // Granted by default (happy path); turned off from the Card reader tool to induce the state.
  localNetworkGranted: boolean;
  setLocalNetworkGranted: (v: boolean) => void;
  grantLocalNetworkPermission: () => void;
  cancelLocalNetworkPermission: () => void;
  /*
   * Location services (iOS): the Terminal SDK refuses to connect without them, so the connect
   * flow stops at ConnectingFailedLocationRequired rather than failing silently. Granted by
   * default (happy path); revoked from the Card reader tool to induce the state.
   */
  locationGranted: boolean;
  setLocationGranted: (v: boolean) => void;
  /** Stands in for the merchant granting it in the Settings app — grants and resumes. */
  openLocationSettings: () => void;
  /** The readers discovery turned up when more than one answered. */
  foundReaderIDs: string[];
  readersFound: () => void;
  connectToReaderID: (id: string) => void;
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
  const connectivity = useConnectivity();
  // Defaults to connected — mirrors launching with a previously-paired reader, so the startup
  // sequence shows a successful reader ping rather than the connection-failed banner. Toggle it
  // off from the chrome's Card reader tool to demo the failure path.
  const [connected, setConnected] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [localNetworkGranted, setLocalNetworkGranted] = useState(true);
  const [locationGranted, setLocationGranted] = useState(true);
  const [foundReaderIDs, setFoundReaderIDs] = useState<string[]>([]);
  // Captured at discovery time so the name doesn't flip back to the Bluetooth reader when
  // the permission is granted mid-connect (the discovered device is still the phone).
  const [readerName, setReaderName] = useState(SAMPLE_READER_NAME);
  const [canProcess, setCanProcess] = useState(false);
  const handlerRef = useRef<((r: TransactionResult) => void) | null>(null);

  const registerHandler = useCallback((fn: ((r: TransactionResult) => void) | null) => {
    handlerRef.current = fn;
    setCanProcess(Boolean(fn));
  }, []);
  const process = useCallback((result: TransactionResult) => handlerRef.current?.(result), []);

  const startConnecting = useCallback(() => {
    setConnectionState(connectivity.bluetooth ? 'scanning' : 'bluetoothOff');
  }, [connectivity.bluetooth]);
  // With the permission revoked, discovery finds a phone-as-reader — the only reader kind
  // the local network permission applies to.
  const readerFound = useCallback(() => {
    setReaderName(localNetworkGranted ? SAMPLE_READER_NAME : SAMPLE_PHONE_READER_NAME);
    setConnectionState('found');
  }, [localNetworkGranted]);
  // Tapping Connect on a discovered phone reader checks the local network permission first
  // (WooPosCardReaderConnectionViewModel.onPhoneConnectClicked) — Bluetooth readers are unaffected.
  const connectReader = useCallback(() => {
    if (!locationGranted) return setConnectionState('locationRequired');
    setConnectionState(localNetworkGranted ? 'connecting' : 'localNetworkPermission');
  }, [localNetworkGranted, locationGranted]);

  /** Discovery answering with more than one reader — the list state, not the single-reader one. */
  const readersFound = useCallback(() => {
    setFoundReaderIDs(SAMPLE_MULTIPLE_READER_IDS);
    setConnectionState('foundMultiple');
  }, []);

  /** Connect from a row of that list: the chosen reader becomes *the* reader from here on. */
  const connectToReaderID = useCallback((id: string) => {
    setReaderName(id);
    if (!locationGranted) return setConnectionState('locationRequired');
    setConnectionState(localNetworkGranted ? 'connecting' : 'localNetworkPermission');
  }, [localNetworkGranted, locationGranted]);

  const openLocationSettings = useCallback(() => {
    setLocationGranted(true);
    setConnectionState('connecting');
  }, []);
  const keepSearching = useCallback(() => setConnectionState('scanning'), []);
  const failConnection = useCallback(() => setConnectionState('failed'), []);
  const retryConnection = useCallback(() => setConnectionState('scanning'), []);
  const cancelConnecting = useCallback(() => setConnectionState('idle'), []);
  const completeConnection = useCallback(() => {
    setConnected(true);
    setConnectionState('connected');
  }, []);
  // "Grant permission" in the dialog grants and auto-resumes the connect for the same reader —
  // no second tap needed (mirrors recheckPermissions() resuming the pending phone connect).
  const grantLocalNetworkPermission = useCallback(() => {
    setLocalNetworkGranted(true);
    setConnectionState('connecting');
  }, []);
  // Cancel returns to the discovered reader (discovery updates were paused while showing).
  const cancelLocalNetworkPermission = useCallback(() => setConnectionState('found'), []);

  // "Connected" shows briefly, then the dialog closes (mirrors the app's 1.5s delay).
  useEffect(() => {
    if (connectionState !== 'connected') return;
    const t = window.setTimeout(() => setConnectionState('idle'), 1500);
    return () => window.clearTimeout(t);
  }, [connectionState]);

  // Turning Bluetooth back on while parked on 'bluetoothOff' resumes scanning automatically —
  // both real apps re-check requirements as soon as the app is active again.
  useEffect(() => {
    if (connectivity.bluetooth && connectionState === 'bluetoothOff') {
      setConnectionState('scanning');
    }
  }, [connectivity.bluetooth, connectionState]);

  // Granting local network permission by any means (the dialog button or the chrome toggle)
  // while parked on the permission state resumes the pending connect.
  useEffect(() => {
    if (localNetworkGranted && connectionState === 'localNetworkPermission') {
      setConnectionState('connecting');
    }
  }, [localNetworkGranted, connectionState]);

  // Same for location: the app re-checks as soon as it's active again, so granting it in the
  // Settings app — or here in the tool — picks the connect back up where it stopped.
  useEffect(() => {
    if (locationGranted && connectionState === 'locationRequired') {
      setConnectionState('connecting');
    }
  }, [locationGranted, connectionState]);

  const value = useMemo<CardReaderValue>(
    () => ({
      connected,
      setConnected,
      connectionState,
      readerName,
      localNetworkGranted,
      setLocalNetworkGranted,
      grantLocalNetworkPermission,
      cancelLocalNetworkPermission,
      locationGranted,
      setLocationGranted,
      openLocationSettings,
      foundReaderIDs,
      readersFound,
      connectToReaderID,
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
      readerName,
      localNetworkGranted,
      grantLocalNetworkPermission,
      cancelLocalNetworkPermission,
      locationGranted,
      openLocationSettings,
      foundReaderIDs,
      readersFound,
      connectToReaderID,
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
