import { useEffect, useState } from 'react';
import { PosText } from '../../../../components/ios/PosText';
import { PosButton } from '../../../../components/ios/PosButton';
import { Spinner } from '../../../../components/ios/Spinner';
import { PosNavFloatingLauncher } from '../../../../components/versions/cash-reconciliation/ios/PosNavLauncher';
import { usePublishPreviewState } from '../../../../device/PreviewStateContext';
import { useIsPhone } from '../../../../hooks/useBreakpoint';
import { formatUsd } from '../../../../lib/currency';
import {
  CURRENT_SESSION,
  PAST_SESSIONS,
  cashRefunds,
  cashSales,
  difference,
  expectedInDrawer,
  paidInOut,
  toMockOrder,
  type CashEntry,
  type CashSession,
} from '../../../../mocks/versions/cash-reconciliation/cashDrawer';
import type { MockOrder } from '../../../../mocks/android/orders';
import { ChevronRight, Calendar } from '../../../../components/ios/IosIcons';
import { OrderSheet } from '../../../../components/versions/cash-reconciliation/ios/OrderSheet';
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

/** How long "Starting session" holds before the session appears. */
const START_SESSION_MS = 1600;

export function CashDrawer() {
  const isPhone = useIsPhone();
  const [session, setSession] = useState<CashSession | null>(null);
  // Opening a session is a round trip to the store, so the button hands off to a spinner
  // rather than swapping the pane instantly (2011:1496).
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!starting) return;
    const timer = setTimeout(() => {
      setSession(CURRENT_SESSION);
      setStarting(false);
    }, START_SESSION_MS);
    return () => clearTimeout(timer);
  }, [starting]);
  const [section, setSection] = useState<Section>('primary');
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);
  // Which past session is open, if any — the Past sessions list drills into one.
  const [openPast, setOpenPast] = useState<CashSession | null>(null);
  // The order behind a tapped log row. Held here, not in the row, so the sheet outlives any
  // re-render of the list under it.
  const [openOrder, setOpenOrder] = useState<MockOrder | null>(null);

  // Jump straight to a running session without having to start one — the started state is the
  // one with all the content, so it shouldn't take a detour to reach.
  usePublishPreviewState({
    label: 'Cash drawer',
    options: [
      { id: 'none', label: 'No session' },
      { id: 'starting', label: 'Starting session' },
      { id: 'active', label: 'Session started' },
    ],
    active: starting ? 'starting' : session ? 'active' : 'none',
    onSelect: (id) => {
      setStarting(id === 'starting');
      setSession(id === 'active' ? CURRENT_SESSION : null);
      setSection('primary');
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

  const detailTitle =
    section === 'secondary'
      ? openPast
        ? openPast.date
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
        {sections.map((s) => (
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

  const detail = (
    <div className="cash-drawer__pane">
      <header className="cash-drawer__header">
        <PosText variant="heading" bold>
          {detailTitle}
        </PosText>
        {/* The header's trailing slot only fills in on a running session: when it started, and
            the way out of it. */}
        {session && !starting && section === 'primary' && (
          <>
            <span className="cash-drawer__header-spacer" />
            <PosText variant="bodySmall" color="var(--color-on-surface-variant-lowest)">
              {session.startedAt}
            </PosText>
            <button type="button" className="cash-drawer__chip is-primary" onClick={() => setSession(null)}>
              Close session
            </button>
          </>
        )}
        {/* Past sessions: a date filter on the list, and how the session was left once you're
            inside one. */}
        {section === 'secondary' && (
          <>
            <span className="cash-drawer__header-spacer" />
            {openPast ? (
              <>
                <PosText variant="bodySmall" color="var(--color-on-surface-variant-lowest)">
                  {openPast.closedAt}
                </PosText>
                <button type="button" className="cash-drawer__chip" onClick={() => setOpenPast(null)}>
                  Back
                </button>
              </>
            ) : (
              <button type="button" className="cash-drawer__icon-button" aria-label="Filter by date">
                <Calendar size="var(--icon-medium)" />
              </button>
            )}
          </>
        )}
      </header>
      <div className="cash-drawer__detail">
        {section === 'secondary' ? (
          openPast ? (
            <ActiveSession session={openPast} readOnly onOpenOrder={setOpenOrder} />
          ) : (
            <PastSessions onOpen={setOpenPast} />
          )
        ) : starting ? (
          <StartingSession />
        ) : session ? (
          <ActiveSession session={session} onOpenOrder={setOpenOrder} />
        ) : (
          <StartSession onStart={() => setStarting(true)} />
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
      </div>
    );
  }

  return (
    <div className="cash-drawer woopos-fills-safe-top">
      <div className="woopos-safe-pane cash-drawer__list">{list}</div>
      <div className="woopos-safe-pane cash-drawer__content">{detail}</div>
      <PosNavFloatingLauncher />
      <OrderSheet order={openOrder ?? null} onClose={() => setOpenOrder(null)} />
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

/** Idle state: starting cash, then the button that opens the session. */
function StartSession({ onStart }: { onStart: () => void }) {
  const [amount, setAmount] = useState('');

  return (
    <section className="cash-drawer__panel">
      <div className="cash-drawer__field">
        <PosText variant="bodyMedium" bold>
          Starting cash
        </PosText>
        <div className="cash-drawer__input">
          <span className="cash-drawer__amount-prefix">$</span>
          <input
            className="cash-drawer__amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            inputMode="decimal"
            placeholder="0.00"
            aria-label="Starting cash"
          />
        </div>
      </div>
      <PosButton label="Start session" fullWidth onClick={onStart} />
    </section>
  );
}

/**
 * Running session: what the drawer should hold, the three figures that got it there, and the
 * running log of everything recorded against it.
 */
function ActiveSession({
  session,
  readOnly = false,
  onOpenOrder,
}: {
  session: CashSession;
  readOnly?: boolean;
  onOpenOrder: (order: MockOrder) => void;
}) {
  const diff = difference(session);

  return (
    <div className="cash-drawer__stack">
      {/* Expected in drawer carries the Record Pay in/out action, because that action is what
          changes this number. A closed session has nothing left to record, so it shows what was
          actually counted instead, and by how much it missed. */}
      <section className="cash-drawer__panel cash-drawer__panel--row">
        <Stat label="Expected in drawer" value={expectedInDrawer(session)} />
        {readOnly ? (
          session.countedCash !== undefined && (
            <Stat
              label="Counted"
              value={session.countedCash}
              caption={diff === null || diff === 0 ? 'Balanced' : `${formatSigned(diff)} ${diff > 0 ? 'over' : 'short'}`}
              tone={diff === 0 ? 'balanced' : 'off'}
            />
          )
        ) : (
          <button type="button" className="cash-drawer__chip">
            Record Pay in/out
          </button>
        )}
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

      <section className="cash-drawer__panel cash-drawer__activity">
        {/* Entries are authored chronologically; the log reads newest first. */}
        {session.entries
          .slice()
          .reverse()
          .map((e) => (
            <ActivityRow key={e.id} entry={e} session={session} onOpenOrder={onOpenOrder} />
          ))}
      </section>
    </div>
  );
}

/** Past sessions list (2011:1572) — one card per day, drilling into that day's log. */
function PastSessions({ onOpen }: { onOpen: (s: CashSession) => void }) {
  return (
    <div className="cash-drawer__stack">
      {PAST_SESSIONS.map((s) => (
        <button key={s.id} type="button" className="cash-drawer__session" onClick={() => onOpen(s)}>
          <span className="cash-drawer__session-text">
            <PosText variant="bodyLarge" bold>
              {s.date}
            </PosText>
            <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)">
              Session #{s.number} • {s.device}
            </PosText>
          </span>
          <ChevronRight size="40px" style={{ color: 'var(--color-on-surface-variant-highest)', flex: 'none' }} />
        </button>
      ))}
    </div>
  );
}

/** Small bold label over a heading-size figure — the design's stat treatment. */
function Stat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: number;
  /** Optional third line, used by a closed session to say how far off the count was. */
  caption?: string;
  tone?: 'balanced' | 'off';
}) {
  return (
    <div className="cash-drawer__stat">
      <PosText variant="bodySmall" bold color="var(--color-on-surface-variant-highest)">
        {label}
      </PosText>
      <span className="cash-drawer__stat-value">{formatStat(value)}</span>
      {caption && (
        <PosText
          variant="bodySmall"
          bold
          color={tone === 'balanced' ? 'var(--color-success)' : 'var(--color-error)'}
        >
          {caption}
        </PosText>
      )}
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

  return (
    <div className="cash-drawer__entry">
      <div className="cash-drawer__entry-text">
        <PosText variant="bodyMedium">{entry.title}</PosText>
        {/* The time leads the second line rather than sitting in its own column, so the row
            reads as one sentence: when it happened, then what it was against. */}
        <p className="cash-drawer__entry-meta">
          <span>{entry.time} • </span>
          {entry.orderLink ? (
            <button
              type="button"
              className="cash-drawer__entry-link"
              onClick={() => {
                const order = toMockOrder(entry, session);
                if (order) onOpenOrder(order);
              }}
            >
              {entry.orderLink}
            </button>
          ) : (
            entry.note
          )}
        </p>
      </div>
      <span className={`cash-drawer__entry-amount${positive ? ' is-positive' : ''}`}>
        {isBalance ? formatStat(entry.amount) : formatSigned(entry.amount)}
      </span>
    </div>
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
