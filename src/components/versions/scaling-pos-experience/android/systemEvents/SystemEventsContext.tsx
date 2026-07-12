import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useIsPhone } from '../../../../../hooks/useBreakpoint';
import { useCardReader } from '../../../../../tools/CardReaderContext';
import { usePrinter } from '../../../../../state/PrinterContext';
import { useBarcodeScanner } from '../../../../../tools/BarcodeScannerContext';
import { useConnectivity } from '../../../../../tools/ConnectivityContext';
import { SYSTEM_EVENT_DEFS, STARTUP_SEQUENCE, type SystemEventDef, type SystemEventId } from '../../../../../mocks/versions/scaling-pos-experience/systemEvents';

/** How long a "shown" (success/result) toast stays up before auto-dismissing. */
const TRANSIENT_DURATION_MS = 2000;
/** Default loading-phase duration — overridable per event via `def.loadingDurationMs`. */
const LOADING_DURATION_MS = 2400;

/** One entry in the notification queue. Transient (auto-dismissing pings) and persistent
 *  (stay-until-resolved banners) share a single queue so that **only one is ever visible at a
 *  time** — no stacking. `phase` is only meaningful for transients: 'loading' shows a spinner
 *  + `def.loadingLabel` (startup events, see `fireStartup`), 'shown' shows the result; a
 *  persistent entry is always effectively 'shown'. */
interface QueuedNotif {
  instanceId: number;
  def: SystemEventDef;
  kind: 'transient' | 'persistent';
  phase: 'loading' | 'shown';
}

/** A single FIFO queue — `queue[0]` is the one visible notification, everything behind it
 *  waits. Lives with the id counter in one state atom so a lifecycle effect can update both in
 *  a single, pure functional setState call. */
interface QueueState {
  queue: QueuedNotif[];
  nextInstanceId: number;
}

const INITIAL_QUEUE_STATE: QueueState = { queue: [], nextInstanceId: 1 };

interface SystemEventsValue {
  /** The single notification currently visible (queue head), or null. Only ever one — the
   *  rest of the queue is hidden until this one dismisses or resolves. */
  current: QueuedNotif | null;
  /** Dismiss the visible notification (the persistent banner's "Dismiss"/close control). */
  dismissCurrent: () => void;
  /** The visible persistent banner's action link (e.g. "Retry") — resolves it using the same
   *  logic as the chrome toolbar's dedicated controls. */
  resolveCurrent: () => void;
  /** Whether a catalog-sync-failed banner is anywhere in the queue — drives the chrome's toolbar toggle. */
  syncFailed: boolean;
  markSyncFailed: () => void;
  markSyncResolved: () => void;
  /** Fires the startup sequence once per provider lifetime (called by the Home screen on mount). */
  fireStartup: () => void;
}

const SystemEventsContext = createContext<SystemEventsValue | null>(null);

export function SystemEventsProvider({ children }: { children: ReactNode }) {
  const isPhone = useIsPhone();
  const cardReader = useCardReader();
  const printer = usePrinter();
  const scanner = useBarcodeScanner();
  const connectivity = useConnectivity();
  const online = connectivity.wifi || connectivity.cellular;

  const [queueState, setQueueState] = useState<QueueState>(INITIAL_QUEUE_STATE);
  const startedRef = useRef(false);
  // The one visible notification — the queue head. Everything else waits behind it.
  const current = queueState.queue[0] ?? null;

  // Always holds the *current* toolbar connected state, read at loading-timeout fire time
  // (not the value closed over when the timeout was scheduled) — see the loading → shown
  // effect below.
  const cardReaderConnectedRef = useRef(cardReader.connected);
  useEffect(() => {
    cardReaderConnectedRef.current = cardReader.connected;
  });

  const enqueueTransient = useCallback(
    (id: SystemEventId, opts?: { withLoading?: boolean }) => {
      // Phone never shows transient pings (only persistent banners) — see product decision
      // in VERSIONS.md's System Events note. Skip entirely rather than building up a backlog
      // no one will see.
      if (isPhone) return;
      const def = SYSTEM_EVENT_DEFS[id];
      const withLoading = Boolean(opts?.withLoading) && Boolean(def.loadingLabel);
      // Append to the back of the queue — it shows once everything ahead of it has cleared.
      setQueueState((s) => ({
        queue: [...s.queue, { instanceId: s.nextInstanceId, def, kind: 'transient', phase: withLoading ? 'loading' : 'shown' }],
        nextInstanceId: s.nextInstanceId + 1,
      }));
    },
    [isPhone],
  );

  // Add a persistent banner to the queue (idempotent by event id — re-firing the same issue
  // never double-queues it). Shown on phone too, unlike transients.
  const upsertPersistent = useCallback((def: SystemEventDef) => {
    setQueueState((s) =>
      s.queue.some((n) => n.def.id === def.id)
        ? s
        : { queue: [...s.queue, { instanceId: s.nextInstanceId, def, kind: 'persistent', phase: 'shown' }], nextInstanceId: s.nextInstanceId + 1 },
    );
  }, []);
  // Remove any queued notification with this event id (from the head or further back).
  const dismissById = useCallback((id: SystemEventId) => {
    setQueueState((s) => ({ ...s, queue: s.queue.filter((n) => n.def.id !== id) }));
  }, []);

  // Loading → shown for the *visible* transient, once its connecting/syncing beat has played
  // out. Only the head runs a lifecycle — everything behind it waits its turn. The card reader
  // is special-cased: its outcome isn't scripted to always succeed — it resolves based on
  // whatever the toolbar's "Connected" state actually is at that moment, so toggling the reader
  // off before/during startup demonstrates the persistent failure banner instead.
  useEffect(() => {
    if (!current || current.kind !== 'transient' || current.phase !== 'loading') return;
    const id = current.instanceId;
    const isReaderConnect = current.def.id === 'reader-connected';
    const t = window.setTimeout(() => {
      if (isReaderConnect && !cardReaderConnectedRef.current) {
        setQueueState((s) => ({ ...s, queue: s.queue.filter((n) => n.instanceId !== id) }));
        upsertPersistent(SYSTEM_EVENT_DEFS['reader-connect-failed']);
        return;
      }
      setQueueState((s) => ({ ...s, queue: s.queue.map((n) => (n.instanceId === id ? { ...n, phase: 'shown' } : n)) }));
    }, current.def.loadingDurationMs ?? LOADING_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [current, upsertPersistent]);

  // Auto-dismiss the visible transient once it's showing its result (not while still loading),
  // popping it off the head so the next queued notification takes over.
  useEffect(() => {
    if (!current || current.kind !== 'transient' || current.phase !== 'shown') return;
    const id = current.instanceId;
    const t = window.setTimeout(() => {
      setQueueState((s) => ({ ...s, queue: s.queue.filter((n) => n.instanceId !== id) }));
    }, TRANSIENT_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [current]);

  const markSyncFailed = useCallback(() => {
    upsertPersistent(SYSTEM_EVENT_DEFS['catalog-sync-failed']);
  }, [upsertPersistent]);
  const markSyncResolved = useCallback(() => {
    dismissById('catalog-sync-failed');
    enqueueTransient('catalog-synced');
  }, [dismissById, enqueueTransient]);

  // Resolve action for the visible persistent banner — the notification's own action link, as
  // opposed to the chrome toolbar's dedicated controls (markSyncFailed/markSyncResolved) which
  // drive the same underlying state.
  const resolveCurrent = useCallback(() => {
    if (!current) return;
    const id = current.def.id;
    if (id === 'catalog-sync-failed') {
      markSyncResolved();
    } else if (id === 'reader-connect-failed') {
      // Retrying just re-checks the toolbar — if the designer has since flipped "Connected"
      // on, it resolves; otherwise it's still down and the banner stays.
      if (cardReaderConnectedRef.current) {
        dismissById('reader-connect-failed');
        enqueueTransient('reader-connected');
      }
    }
  }, [current, markSyncResolved, dismissById, enqueueTransient]);

  // Dismiss the visible notification (the persistent banner's Dismiss/close control).
  const dismissCurrent = useCallback(() => {
    if (!current) return;
    const id = current.instanceId;
    setQueueState((s) => ({ ...s, queue: s.queue.filter((n) => n.instanceId !== id) }));
  }, [current]);

  const fireStartup = useCallback(() => {
    if (startedRef.current || isPhone) return;
    startedRef.current = true;
    STARTUP_SEQUENCE.forEach((id) => enqueueTransient(id, { withLoading: true }));
  }, [isPhone, enqueueTransient]);

  // ---- Hardware/connectivity watchers — react to each transition, skipping the initial
  // mount (so opening the app doesn't immediately fire alongside the startup sequence for
  // whatever the toolbar's default state happens to be). Reader/printer/scanner are simple
  // transient pings either way; connectivity is asymmetric — going offline is a persistent
  // banner (it doesn't resolve itself after a few seconds, the connection is actually down),
  // while coming back online both clears that banner and pings a transient confirmation. ----
  useTransitionEvent(
    cardReader.connected,
    () => enqueueTransient('reader-connected'),
    () => enqueueTransient('reader-disconnected'),
  );
  useTransitionEvent(
    printer.connected,
    () => enqueueTransient('printer-connected'),
    () => enqueueTransient('printer-disconnected'),
  );
  useTransitionEvent(
    scanner.connected,
    () => enqueueTransient('scanner-connected'),
    () => enqueueTransient('scanner-disconnected'),
  );
  useTransitionEvent(
    online,
    () => {
      dismissById('offline');
      enqueueTransient('online');
    },
    () => upsertPersistent(SYSTEM_EVENT_DEFS.offline),
  );

  const syncFailed = queueState.queue.some((n) => n.def.id === 'catalog-sync-failed');
  const value = useMemo<SystemEventsValue>(
    () => ({
      current,
      dismissCurrent,
      resolveCurrent,
      syncFailed,
      markSyncFailed,
      markSyncResolved,
      fireStartup,
    }),
    [current, dismissCurrent, resolveCurrent, syncFailed, markSyncFailed, markSyncResolved, fireStartup],
  );

  return <SystemEventsContext.Provider value={value}>{children}</SystemEventsContext.Provider>;
}

/** Calls `onTrue`/`onFalse` on each change of `value` after the first render (mounting never
 *  fires — only actual transitions do). */
function useTransitionEvent(value: boolean, onTrue: () => void, onFalse: () => void) {
  const prevRef = useRef(value);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevRef.current = value;
      return;
    }
    if (value !== prevRef.current) {
      prevRef.current = value;
      if (value) onTrue();
      else onFalse();
    }
  });
}

export function useSystemEvents(): SystemEventsValue {
  const ctx = useContext(SystemEventsContext);
  if (!ctx) throw new Error('useSystemEvents must be used within a SystemEventsProvider');
  return ctx;
}

/** Non-throwing variant — lets shared chrome (DeviceLayout) show version-specific controls
 *  only when it's actually mounted inside this proposal's route tree. */
export function useOptionalSystemEvents(): SystemEventsValue | null {
  return useContext(SystemEventsContext);
}
