import { useEffect, useState, type ReactNode } from 'react';
import { PosText } from '../../../../components/ios/PosText';
import { PosButton } from '../../../../components/ios/PosButton';
import { Spinner } from '../../../../components/ios/Spinner';
import { PosNavFloatingLauncher } from '../../../../components/versions/cash-reconciliation/ios/PosNavLauncher';
import { usePublishPreviewState } from '../../../../device/PreviewStateContext';
import { useIsPhone } from '../../../../hooks/useBreakpoint';
import { centsFromInput, formatUsd } from '../../../../lib/currency';
import {
  cashRefunds,
  cashSales,
  difference,
  expectedInDrawer,
  paidInOut,
  sessionClosed,
  sessionOpened,
  type SessionStamp,
  toMockOrder,
  type CashEntry,
  type CashMovement,
  type CashSession,
} from '../../../../mocks/versions/cash-reconciliation/cashDrawer';
import { useCashDrawer } from '../../../../state/versions/cash-reconciliation/CashDrawerContext';
import type { MockOrder } from '../../../../mocks/android/orders';
import { ChevronRight, ArrowBackward, Printer, SquareAndArrowDown, Person, Clock, Calendar } from '../../../../components/ios/IosIcons';
import { PosDatePickerButton, type DateKey } from '../../../../components/ios/PosDatePicker';
import { PosShareSheet } from '../../../../components/ios/PosShareSheet';
import { PosOverflowMenu } from '../../../../components/ios/PosOverflowMenu';
import { PosIconButton } from '../../../../components/ios/PosIconButton';
import { PosGhostBar } from '../../../../components/ios/PosGhostBar';
import { OrderSheet } from '../../../../components/versions/cash-reconciliation/ios/OrderSheet';
import { RecordPayInOutSheet } from '../../../../components/versions/cash-reconciliation/ios/RecordPayInOutSheet';
import { CloseSessionSheet } from '../../../../components/versions/cash-reconciliation/ios/CloseSessionSheet';
import './CashDrawer.css';

/**
 * Cash drawer (POS Cash Reconciliation 2007:1046 idle, 2011:1366 with a session running).
 *
 * Master/detail like Settings — a `surface-bright` sidebar of sections, the selected one on
 * `surface` at the right. **The sidebar's sections change with the session**: with none
 * running it offers Start session / History; once one is open it becomes Current session /
 * Past sessions. Same two slots, renamed to what they now mean.
 *
 * Not built from the design: the 48pt `trash` icon that sits in every header. It has nothing
 * to delete on "Start a cash drawer session", and appears identically in all three headers,
 * which reads as the shared header component's default trailing slot rather than intent.
 */
type Section = 'primary' | 'secondary';

/** How long the arrival skeleton holds before the drawer's own content replaces it. */
const ARRIVAL_SKELETON_MS = 900;

type LoadingMode = 'auto' | 'none' | 'loading';

export function CashDrawer() {
  const isPhone = useIsPhone();
  // The session lives above the routes, so it survives leaving for the catalog and coming back
  // — and coming back is what turns a newly opened one into an end-of-day one.
  const { phase, session, start, close, record, setPhase, pastSessions } = useCashDrawer();
  const starting = phase === 'starting';
  const [section, setSection] = useState<Section>('primary');

  /*
   * The session and its log are fetched when the screen opens, so a merchant sees this every
   * single time — part of the happy path, not an edge case, which is why `auto` plays it on
   * arrival rather than waiting to be asked for. The explicit options pin it, because a
   * skeleton that clears itself after a beat is impossible to actually look at.
   */
  const [loadingMode, setLoadingMode] = useState<LoadingMode>('auto');
  const [arriving, setArriving] = useState(true);

  useEffect(() => {
    if (loadingMode !== 'auto') return;
    setArriving(true);
    const timer = setTimeout(() => setArriving(false), ARRIVAL_SKELETON_MS);
    return () => clearTimeout(timer);
  }, [loadingMode]);

  const loading = loadingMode === 'auto' ? arriving : loadingMode === 'loading';

  usePublishPreviewState({
    label: 'Cash drawer loading',
    options: [
      { id: 'auto', label: 'Auto (on open)' },
      { id: 'none', label: 'Loaded' },
      { id: 'loading', label: 'Loading' },
    ],
    active: loadingMode,
    onSelect: (id) => setLoadingMode(id as LoadingMode),
  });
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);
  // Which past session is open, if any — the Past sessions list drills into one.
  const [openPast, setOpenPast] = useState<CashSession | null>(null);
  // The order behind a tapped log row. Held here, not in the row, so the sheet outlives any
  // re-render of the list under it.
  const [openOrder, setOpenOrder] = useState<MockOrder | null>(null);
  // Which movement is being recorded, if any — it's the header menu that picks the direction,
  // so the sheet opens already knowing it.
  const [recording, setRecording] = useState<CashMovement['kind'] | null>(null);
  // Which day the Past sessions list is filtered to, if any.
  const [dateFilter, setDateFilter] = useState<DateKey | null>(null);
  const [sharing, setSharing] = useState(false);
  // Whether the close-session flow is up. It holds the session itself so the sheet keeps its
  // figures through the slide-out, after the session is already gone.
  const [closing, setClosing] = useState<CashSession | null>(null);

  // Closing ends on the session's own report rather than back at an empty drawer: the count is
  // the reason the merchant was here, and the report is where they check it landed right.
  const closeAndReview = (counted: number, note: string) => {
    const justClosed = close(counted, note);
    if (!justClosed) return;
    setSection('secondary');
    setOpenPast(justClosed);
    if (isPhone) setShowDetailOnPhone(true);
  };

  // Set any state of the drawer directly, without having to start a session and then go and
  // come back for it — including the two states an open session has.
  usePublishPreviewState({
    label: 'Cash drawer',
    options: [
      { id: 'none', label: 'No session' },
      { id: 'starting', label: 'Starting session' },
      { id: 'fresh', label: 'Session · just opened' },
      { id: 'endOfDay', label: 'Session · end of day' },
    ],
    active: phase,
    onSelect: (id) => {
      setPhase(id as typeof phase);
      setSection('primary');
      setOpenPast(null);
    },
  });

  const sections = session
    ? [
        { id: 'primary' as const, title: 'Current session', subtitle: 'Your current cash drawer session' },
        { id: 'secondary' as const, title: 'Past sessions', subtitle: 'See past cash drawer sessions' },
      ]
    : [
        { id: 'primary' as const, title: 'Start session', subtitle: 'Start a new cash drawer session' },
        { id: 'secondary' as const, title: 'Past sessions', subtitle: 'See past cash drawer sessions' },
      ];

  const pick = (s: Section) => {
    setSection(s);
    setOpenPast(null);
    if (isPhone) setShowDetailOnPhone(true);
  };

  // Reading one past session. `openPast` alone isn't enough: it survives a jump back to the
  // current session from the chrome menu, and the header would keep offering a way "back".
  const inPastSession = section === 'secondary' && openPast !== null;

  const detailSubtitle =
    section === 'primary' && session && !starting ? `#${session.number}` : undefined;

  const detailTitle =
    section === 'secondary'
      ? openPast
        ? `Session #${openPast.number}`
        : 'Past sessions'
      : session
        ? 'Current session'
        : 'Start a cash drawer session';

  const list = (
    <div className="cash-drawer__pane">
      <header className="cash-drawer__header">
        <PosText variant="heading" bold>
          Cash drawer
        </PosText>
      </header>
      <div className="cash-drawer__sections">
        {loading
          ? sections.map((s) => <GhostSectionCard key={s.id} />)
          : sections.map((s) => (
              <SectionCard
                key={s.id}
                title={s.title}
                subtitle={s.subtitle}
                selected={!isPhone && section === s.id}
                onClick={() => pick(s.id)}
              />
            ))}
      </div>
    </div>
  );

  const detail = loading ? (
    <GhostDetail />
  ) : (
    <div className="cash-drawer__pane">
      <header className="cash-drawer__header">
        {/* A past session is a place you went into, so it gets the back arrow the rest of the
            app uses to come out of one (2012:1774) — not a chip sharing the trailing slot. */}
        {inPastSession && (
          <PosIconButton label="Back to past sessions" onClick={() => setOpenPast(null)}>
            <ArrowBackward size="var(--icon-medium)" />
          </PosIconButton>
        )}
        <span className="cash-drawer__title">
          <PosText variant="heading" bold>
            {detailTitle}
          </PosText>
          {/* A running session is named by its number, under the screen's own name (2010:1233).
              When it started is in the log's bottom row, not up here. */}
          {detailSubtitle && <PosText variant="bodyLarge">{detailSubtitle}</PosText>}
        </span>
        {/* The header's trailing slot on a running session: the way out of it, and the "..."
            menu that records money moving in or out of the drawer (2013:2816). */}
        {session && !starting && section === 'primary' && (
          <>
            <span className="cash-drawer__header-spacer" />
            <PosButton label="Close session" size="extraSmall" onClick={() => setClosing(session)} />
            <PosOverflowMenu
              label="Record Pay in/out"
              items={[
                { label: 'Pay in', onSelect: () => setRecording('pay-in') },
                { label: 'Pay out', onSelect: () => setRecording('pay-out') },
              ]}
            />
          </>
        )}
        {/* Past sessions: a date filter on the list, and how the session was left once you're
            inside one. */}
        {section === 'secondary' && (
          <>
            <span className="cash-drawer__header-spacer" />
            {openPast ? (
              /* A closed session is a record to take away: print it, or save a copy
                 (2012:1774). Both are glyphs now — they sit where the date filter does on the
                 list, so the trailing slot reads the same way throughout. */
              <>
                <PosIconButton label="Print session">
                  <Printer size="var(--icon-medium)" />
                </PosIconButton>
                <PosIconButton label="Download session" onClick={() => setSharing(true)}>
                  <SquareAndArrowDown size="var(--icon-medium)" />
                </PosIconButton>
              </>
            ) : (
              <PosDatePickerButton
                label="Filter by date"
                selected={dateFilter}
                /* Only days a session actually ran on can be picked, and the picker opens on
                   the month they're in rather than on whatever month it is today. */
                enabled={pastSessions.map((s) => s.date)}
                defaultMonth={pastSessions[0]?.date}
                onSelect={setDateFilter}
                onClear={() => setDateFilter(null)}
              />
            )}
          </>
        )}
      </header>
      <div className="cash-drawer__detail">
        {section === 'secondary' ? (
          openPast ? (
            <ClosedSession session={openPast} onOpenOrder={setOpenOrder} />
          ) : (
            <PastSessions sessions={pastSessions} date={dateFilter} onOpen={setOpenPast} />
          )
        ) : starting ? (
          <StartingSession />
        ) : session ? (
          <ActiveSession session={session} onOpenOrder={setOpenOrder} />
        ) : (
          <StartSession onStart={start} />
        )}
      </div>
    </div>
  );

  if (isPhone) {
    return (
      <div className="cash-drawer cash-drawer--phone">
        {showDetailOnPhone ? detail : list}
        <PosNavFloatingLauncher />
        <OrderSheet order={openOrder ?? null} onClose={() => setOpenOrder(null)} />
        <RecordPayInOutSheet kind={recording} onClose={() => setRecording(null)} onRecord={record} />
        <SessionShareSheet session={openPast} open={sharing} onClose={() => setSharing(false)} />
        <CloseSessionSheet session={closing} onClose={() => setClosing(null)} onConfirm={closeAndReview} />
      </div>
    );
  }

  return (
    <div className="cash-drawer woopos-fills-safe-top">
      <div className="woopos-safe-pane cash-drawer__list">{list}</div>
      <div className="woopos-safe-pane cash-drawer__content">{detail}</div>
      <PosNavFloatingLauncher />
      <OrderSheet order={openOrder ?? null} onClose={() => setOpenOrder(null)} />
      <RecordPayInOutSheet kind={recording} onClose={() => setRecording(null)} onRecord={record} />
      <SessionShareSheet session={openPast} open={sharing} onClose={() => setSharing(false)} />
      <CloseSessionSheet session={closing} onClose={() => setClosing(null)} onConfirm={closeAndReview} />
    </div>
  );
}

/**
 * Handing a closed session to the system share sheet. What a merchant would actually be
 * sharing is the session's report, so that's what the sheet previews.
 */
function SessionShareSheet({
  session,
  open,
  onClose,
}: {
  session: CashSession | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <PosShareSheet
      open={open && session !== null}
      onClose={onClose}
      title={session ? `Session #${session.number}` : ''}
      subtitle={session ? `PDF Document · ${session.date}` : ''}
    />
  );
}

/**
 * Loading skeletons. They reuse the screen's own card and stack classes rather than redrawing
 * the layout, so the boxes are the same ones the real content lands in and nothing reflows
 * when it arrives — only the text inside them is stood in for.
 */
function GhostSectionCard() {
  return (
    <div className="cash-drawer__card" aria-hidden>
      <PosGhostBar width="45%" height={24} />
      <PosGhostBar width="80%" height={20} />
    </div>
  );
}

function GhostDetail() {
  return (
    <div className="cash-drawer__pane" aria-hidden>
      <header className="cash-drawer__header">
        <span className="cash-drawer__title">
          <PosGhostBar width={220} height={36} />
          <PosGhostBar width={120} height={24} />
        </span>
        <span className="cash-drawer__header-spacer" />
        <PosGhostBar width={140} height={40} />
      </header>
      <div className="cash-drawer__detail">
        <div className="cash-drawer__stack">
          <section className="cash-drawer__panel">
            <GhostStat />
          </section>
          <div className="cash-drawer__stats">
            {[0, 1, 2].map((i) => (
              <section key={i} className="cash-drawer__panel cash-drawer__panel--stat">
                <GhostStat />
              </section>
            ))}
          </div>
          <section className="cash-drawer__panel cash-drawer__activity">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="cash-drawer__entry">
                <div className="cash-drawer__entry-text">
                  <PosGhostBar width="40%" height={24} />
                  <PosGhostBar width="60%" height={20} style={{ marginTop: 'var(--space-xxs)' }} />
                </div>
                <PosGhostBar width={80} height={24} />
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

/** A stat's caption over its figure, at the heights the real ones occupy. */
function GhostStat() {
  return (
    <div className="cash-drawer__stat">
      <PosGhostBar width="55%" height={20} />
      <PosGhostBar width="70%" height={40} />
    </div>
  );
}

/** Sidebar card — same box as Settings' rows: title, subtitle, 2px border when selected. */
function SectionCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`cash-drawer__card${selected ? ' is-selected' : ''}`}>
      <PosText variant="bodyLarge" bold>
        {title}
      </PosText>
      <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
        {subtitle}
      </PosText>
    </button>
  );
}

/** Idle state: starting cash, then the button that opens the session on it. */
function StartSession({ onStart }: { onStart: (startingCash: number) => void }) {
  // Same ATM-style entry as the Record Pay in/out sheet's amount — every cash figure in this
  // flow is typed the same way, so the merchant learns the field once.
  const [cents, setCents] = useState(0);

  return (
    <section className="cash-drawer__panel">
      <div className="cash-drawer__field">
        <PosText variant="bodyMedium" bold>
          Starting cash
        </PosText>
        <div className="cash-drawer__input">
          <input
            className="cash-drawer__amount"
            value={formatUsd(cents / 100)}
            onChange={(e) => setCents(centsFromInput(e.target.value))}
            inputMode="decimal"
            aria-label="Starting cash"
          />
        </div>
      </div>
      <PosButton label="Start session" fullWidth onClick={() => onStart(cents / 100)} />
    </section>
  );
}

/**
 * Running session: what the drawer should hold, the three figures that got it there, and the
 * running log of everything recorded against it.
 */
function ActiveSession({
  session,
  onOpenOrder,
}: {
  session: CashSession;
  onOpenOrder: (order: MockOrder) => void;
}) {
  return (
    <div className="cash-drawer__stack">
      {/* A running session shows only what the drawer should hold (2011:1394). */}
      <section className="cash-drawer__panel">
        <Stat label="Expected cash in drawer" value={expectedInDrawer(session)} />
      </section>

      <div className="cash-drawer__stats">
        <section className="cash-drawer__panel cash-drawer__panel--stat">
          <Stat label="Cash sales" value={cashSales(session)} />
        </section>
        <section className="cash-drawer__panel cash-drawer__panel--stat">
          <Stat label="Paid in/out" value={paidInOut(session)} />
        </section>
        <section className="cash-drawer__panel cash-drawer__panel--stat">
          <Stat label="Cash refunds" value={cashRefunds(session)} />
        </section>
      </div>

      <ActivityLog session={session} onOpenOrder={onOpenOrder} />
    </div>
  );
}

/**
 * A closed session, read only (2018:3754). It isn't the running session with a few extra
 * figures — it's a report: who had the drawer at each end of the day, one card reconciling the
 * four amounts, the three totals with how many entries each is made of, and the log under a
 * heading of its own.
 */
function ClosedSession({
  session,
  onOpenOrder,
}: {
  session: CashSession;
  onOpenOrder: (order: MockOrder) => void;
}) {
  const opened = sessionOpened(session);
  const closed = sessionClosed(session);
  const diff = difference(session);

  return (
    <div className="cash-drawer__stack">
      {/* Who was on the register, at each end of the day. */}
      <div className="cash-drawer__ends">
        {opened && <SessionEnd label="Opened" stamp={opened} />}
        {closed && <SessionEnd label="Closed" stamp={closed} />}
      </div>

      {/* The whole reconciliation in one card: the four amounts it comes down to, and under
          them the three movements that got the drawer there (2019:4220). The totals used to be
          three cards of their own — folded in here, they read as the arithmetic behind the
          figures above rather than as separate facts. */}
      <section className="cash-drawer__panel cash-drawer__panel--report cash-drawer__panel--summary">
        <div className="cash-drawer__summary-head">
          <CardTitle>Drawer summary</CardTitle>
          <div className="cash-drawer__summary">
            <Figure value={session.startingCash} caption="Starting cash" />
            <Figure value={expectedInDrawer(session)} caption="Expected in drawer" />
            {session.countedCash !== undefined && (
              <>
                <Figure value={session.countedCash} caption="Cash on drawer" />
                <Figure value={diff ?? 0} caption="Difference" variance />
              </>
            )}
          </div>
        </div>
        <div className="cash-drawer__breakdown">
          <BreakdownRow label="Cash sales" value={cashSales(session)} />
          <BreakdownRow label="Paid in/out" value={paidInOut(session)} />
          <BreakdownRow label="Cash refunds" value={cashRefunds(session)} />
        </div>
      </section>

      <ActivityLog session={session} title="Activity summary" onOpenOrder={onOpenOrder} />
    </div>
  );
}

/**
 * One end of a closed session (2019:4202): the day, the time, and who had the drawer — three
 * equal lines, each named by its own glyph rather than by weight or position.
 */
function SessionEnd({ label, stamp }: { label: string; stamp: SessionStamp }) {
  return (
    <section className="cash-drawer__panel cash-drawer__panel--report cash-drawer__end">
      {/* Same weight as "Drawer summary" and "Activity summary" — every card on this screen
          is titled the same way. */}
      <CardTitle>{label}</CardTitle>
      <div className="cash-drawer__end-body">
        <EndRow icon={<Calendar size="var(--icon-xsmall)" />}>{stamp.date}</EndRow>
        <EndRow icon={<Clock size="var(--icon-xsmall)" />}>{stamp.time}</EndRow>
        <EndRow icon={<Person size="var(--icon-xsmall)" />}>{stamp.by}</EndRow>
      </div>
    </section>
  );
}

/** Glyph, then the fact it labels. */
function EndRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="cash-drawer__end-row">
      <span className="cash-drawer__end-icon">{icon}</span>
      <PosText variant="bodySmall">{children}</PosText>
    </div>
  );
}

/** A card's own heading — "Drawer summary", "Cash sales", "Activity summary". One weight for
    every card on the drawer, running session and closed alike. */
function CardTitle({ children }: { children: ReactNode }) {
  return (
    <PosText variant="bodySmall" bold color="var(--color-on-surface-variant-highest)">
      {children}
    </PosText>
  );
}

/**
 * A figure over its name — the closed session inverts the running one's order, because here
 * the amounts are what you scan and the labels are what you check against.
 */
function Figure({
  value,
  caption,
  variance = false,
}: {
  value: number;
  caption: string;
  /**
   * This figure is a difference, not a balance. It's signed, because the direction is the
   * point, and any non-zero value reads in the alert colour — over and short are the same
   * thing to a merchant closing up: cash that needs accounting for. Green would congratulate a
   * drawer that's wrong, and red would call it a failure; a drawer that balanced reads plain.
   */
  variance?: boolean;
}) {
  const tone = !variance || value === 0 ? 'var(--color-on-surface)' : 'var(--color-alert)';

  return (
    <div className="cash-drawer__figure">
      <span className="cash-drawer__figure-value" style={{ color: tone }}>
        {variance ? formatSigned(value) : formatStat(value)}
      </span>
      <PosText variant="caption" color="var(--color-on-surface-variant-highest)">
        {caption}
      </PosText>
    </div>
  );
}

/** One of the three movements under the summary's figures: what it was, and how much. */
function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="cash-drawer__breakdown-row">
      <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)">
        {label}
      </PosText>
      <PosText variant="bodySmall">{formatStat(value)}</PosText>
    </div>
  );
}

/** The log, newest first. A closed session gives it a heading; a running one doesn't. */
function ActivityLog({
  session,
  title,
  onOpenOrder,
}: {
  session: CashSession;
  title?: string;
  onOpenOrder: (order: MockOrder) => void;
}) {
  return (
    <section
      className={`cash-drawer__panel cash-drawer__activity${title ? ' cash-drawer__panel--report' : ''}`}
    >
      {title && <CardTitle>{title}</CardTitle>}
      {/* Entries are authored chronologically; the log reads newest first. */}
      {session.entries
        .slice()
        .reverse()
        .map((e) => (
          <ActivityRow key={e.id} entry={e} session={session} onOpenOrder={onOpenOrder} />
        ))}
    </section>
  );
}

/**
 * Past sessions list (2012:1673) — one row per session: the day it ran, and under it the
 * session number, written the way the Current session header writes it. Drills into that
 * session's log.
 */
function PastSessions({
  sessions: all,
  date,
  onOpen,
}: {
  sessions: CashSession[];
  date: DateKey | null;
  onOpen: (s: CashSession) => void;
}) {
  const sessions = date ? all.filter((s) => s.date === date) : all;
  return (
    <div className="cash-drawer__stack cash-drawer__stack--list">
      {sessions.map((s) => (
        <button key={s.id} type="button" className="cash-drawer__session" onClick={() => onOpen(s)}>
          <span className="cash-drawer__session-text">
            <PosText variant="bodyLarge" bold>
              {s.date}
            </PosText>
            <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)">
              #{s.number}
            </PosText>
          </span>
          <ChevronRight size="var(--icon-large)" style={{ color: 'var(--color-on-surface-variant-highest)', flex: 'none' }} />
        </button>
      ))}
    </div>
  );
}

/**
 * A running session's figure under its name (2011:1394). The name is a card title, the same
 * one a closed session's cards carry — a merchant moving between the two screens is reading
 * the same drawer, and "Cash sales" shouldn't change weight depending on whether the session
 * has ended. The amount is bodyXLarge on both. Only the order differs: here the name leads,
 * there it follows.
 */
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="cash-drawer__stat">
      <CardTitle>{label}</CardTitle>
      <span className="cash-drawer__figure-value">{formatStat(value)}</span>
    </div>
  );
}

function ActivityRow({
  entry,
  session,
  onOpenOrder,
}: {
  entry: CashEntry;
  session: CashSession;
  onOpenOrder: (order: MockOrder) => void;
}) {
  // The session's own open and close rows carry a *balance* — the float it began with, the
  // total that was counted — not a movement. They read plain, like the design's
  // "Session started $0.00": no sign, no colour. Only money actually coming in is signed green.
  const isBalance = entry.kind === 'session-started' || entry.kind === 'session-closed';
  const positive = !isBalance && entry.amount > 0;

  // A movement recorded against an order opens it. The whole row is the target — the order
  // number in the second line is no longer a link of its own (2012:1802), so the chevron at
  // the end is what says the row goes somewhere.
  const order = entry.orderLink ? toMockOrder(entry, session) : null;

  const body = (
    <>
      <div className="cash-drawer__entry-text">
        <PosText variant="bodyMedium">{entry.title}</PosText>
        {/* The time leads the second line rather than sitting in its own column, so the row
            reads as one sentence: when it happened, then what it was against. */}
        <PosText as="p" variant="bodySmall" color="var(--color-on-surface-variant-highest)">
          {entry.time}
          {entry.orderLink || entry.note ? ` • ${entry.orderLink ?? entry.note}` : ''}
        </PosText>
      </div>
      <div className="cash-drawer__entry-trailing">
        <PosText
          variant="bodyMedium"
          color={positive ? 'var(--color-success)' : 'var(--color-on-surface)'}
        >
          {isBalance ? formatStat(entry.amount) : formatSigned(entry.amount)}
        </PosText>
        {/* Rows with nowhere to go still reserve the chevron's width, so every amount in the
            log stays on one right edge. */}
        <span className="cash-drawer__entry-chevron">
          {order && <ChevronRight size="var(--icon-small)" />}
        </span>
      </div>
    </>
  );

  if (!order) return <div className="cash-drawer__entry">{body}</div>;

  return (
    <button type="button" className="cash-drawer__entry is-tappable" onClick={() => onOpenOrder(order)}>
      {body}
    </button>
  );
}

/**
 * Activity rows: `+$25.00` / `-$20.00` / `$0.00`. A `+` marks money going *in*, which is what
 * pairs with the success colour to make an inbound entry readable at a glance.
 */
function formatSigned(value: number): string {
  if (value > 0) return `+${formatUsd(value)}`;
  if (value < 0) return `-${formatUsd(Math.abs(value))}`;
  return formatUsd(0);
}

/**
 * Stat figures: `$20.00`, not `+$20.00`. The totals read as balances rather than movements —
 * the design only signs them when they're negative.
 */
function formatStat(value: number): string {
  return value < 0 ? `-${formatUsd(Math.abs(value))}` : formatUsd(value);
}

/**
 * The wait between pressing Start session and having one (2011:1496): a 102pt donut spinner
 * over "Starting session", in a 248pt card where the form was. The header and sidebar don't
 * change — nothing has happened yet.
 */
function StartingSession() {
  return (
    <section className="cash-drawer__panel cash-drawer__panel--loading">
      <Spinner size="102px" />
      <PosText variant="bodyMedium" bold>
        Starting session
      </PosText>
    </section>
  );
}
