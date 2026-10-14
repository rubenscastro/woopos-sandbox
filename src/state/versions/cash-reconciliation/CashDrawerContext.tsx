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
import { useLocation } from 'react-router-dom';
import {
  PAST_SESSIONS,
  endOfDaySession,
  freshSession,
  withClose,
  withMovement,
  type CashMovement,
  type CashSession,
} from '../../../mocks/versions/cash-reconciliation/cashDrawer';

/**
 * The open cash drawer session, held above the routes so it survives leaving the screen.
 *
 * A real session outlives the screen that shows it — it's open until someone closes it, and a
 * merchant serving customers is in and out of the drawer all day. Keeping it in the screen's
 * own state meant every trip to the catalog silently threw the session away, which made the
 * flow untestable past a single visit.
 *
 * **Leaving the drawer advances a new session to end-of-day.** A freshly opened session has
 * nothing in it, which is the right first impression but a dead end to review; coming back to
 * the drawer after working elsewhere is exactly when a real one would have filled up. So the
 * trip away stands in for the day passing. The Cash drawer menu in the chrome sidebar sets
 * either state directly, for going back and forth without navigating.
 */
export type CashDrawerPhase =
  /** No session open — the Start session form. */
  | 'none'
  /** Opening one: the spinner (2011:1496). */
  | 'starting'
  /** Open, nothing recorded yet. */
  | 'fresh'
  /** Open, after a day's trade. */
  | 'endOfDay';

/** What Start session pre-fills with, and what the sidebar menu opens a session on. */
const DEFAULT_STARTING_CASH = 150;

/** How long "Starting session" holds before the session appears. */
const START_SESSION_MS = 1600;

interface CashDrawerValue {
  phase: CashDrawerPhase;
  /** The open session, or `null` in `none` / `starting`. */
  session: CashSession | null;
  /** Opens one on the given float, via the spinner. */
  start: (startingCash: number) => void;
  /**
   * Closes the open one on what was counted, and why it differs. Returns the closed session so
   * the caller can go straight to it — closing ends with a report worth reading, not with an
   * empty drawer.
   */
  close: (counted: number, note: string) => CashSession | null;
  /** Past sessions, newest first — a session closed in this visit is at the top. */
  pastSessions: CashSession[];
  /** Adds a recorded pay in/out to the open session. */
  record: (movement: CashMovement) => void;
  /** The sidebar menu, jumping straight to any phase. */
  setPhase: (phase: CashDrawerPhase) => void;
}

const CashDrawerContext = createContext<CashDrawerValue | null>(null);

/** The route the session belongs to — leaving it is what ages a new session. */
const DRAWER_PATH = '/cash-drawer';

export function CashDrawerProvider({ children }: { children: ReactNode }) {
  const [phase, setPhaseState] = useState<CashDrawerPhase>('none');
  const [session, setSession] = useState<CashSession | null>(null);
  // The float the open session was opened on, so the sidebar menu can rebuild either state of
  // it without asking again.
  const [startingCash, setStartingCash] = useState(DEFAULT_STARTING_CASH);

  const setPhase = useCallback(
    (next: CashDrawerPhase) => {
      setPhaseState(next);
      setSession(
        next === 'fresh'
          ? freshSession(startingCash)
          : next === 'endOfDay'
            ? endOfDaySession(startingCash)
            : null,
      );
    },
    [startingCash],
  );

  const start = useCallback((float: number) => {
    setStartingCash(float);
    setPhaseState('starting');
    setSession(null);
  }, []);

  // Opening a session is a round trip to the store, so Start session hands off to a spinner
  // rather than swapping the pane instantly (2011:1496).
  useEffect(() => {
    if (phase !== 'starting') return;
    const timer = setTimeout(() => {
      setPhaseState('fresh');
      setSession(freshSession(startingCash));
    }, START_SESSION_MS);
    return () => clearTimeout(timer);
  }, [phase, startingCash]);

  // Leaving the drawer with a new session open brings it back as an end-of-day one. Driven by
  // the location rather than the screen's unmount, so a remount (StrictMode, a re-render of
  // the route tree) can't age a session the merchant never actually left.
  //
  // Only an *untouched* session ages — one whose log is still just the row that opened it.
  // Once something has been recorded against it, that's the reviewer's own work, and swapping
  // in a canned day would throw it away behind their back. The Cash drawer menu still gets
  // them to the end-of-day state on demand.
  const onDrawer = useLocation().pathname.endsWith(DRAWER_PATH);
  const wasOnDrawer = useRef(onDrawer);
  useEffect(() => {
    const left = wasOnDrawer.current && !onDrawer;
    wasOnDrawer.current = onDrawer;
    if (!left || phase !== 'fresh' || !session || session.entries.length > 1) return;
    setPhaseState('endOfDay');
    setSession(endOfDaySession(session.startingCash));
  }, [onDrawer, phase, session]);

  // Sessions closed during this visit, newest first. They join the authored ones so the flow
  // finishes somewhere real: close a session and it's there in Past sessions to read back.
  const [justClosed, setJustClosed] = useState<CashSession[]>([]);

  const close = useCallback(
    (counted: number, note: string) => {
      if (!session) return null;
      const done = withClose(session, counted, note);
      setJustClosed((list) => [done, ...list]);
      setPhaseState('none');
      setSession(null);
      return done;
    },
    [session],
  );

  const pastSessions = useMemo(() => [...justClosed, ...PAST_SESSIONS], [justClosed]);

  const record = useCallback((movement: CashMovement) => {
    setSession((s) => (s ? withMovement(s, movement) : s));
  }, []);

  const value = useMemo(
    () => ({ phase, session, start, close, record, setPhase, pastSessions }),
    [phase, session, start, close, record, setPhase, pastSessions],
  );
  return <CashDrawerContext.Provider value={value}>{children}</CashDrawerContext.Provider>;
}

export function useCashDrawer(): CashDrawerValue {
  const ctx = useContext(CashDrawerContext);
  if (!ctx) throw new Error('useCashDrawer must be used within a CashDrawerProvider');
  return ctx;
}
