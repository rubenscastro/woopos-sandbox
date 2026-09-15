/**
 * Sample data for Cash drawer (POS Cash Reconciliation 2011:1366 / 2011:1572).
 *
 * Sessions are written as a **chronological day** — the entries are what actually happened at
 * the register, in order — and every figure on screen is derived from them. Nothing is stored
 * twice, so a total can't drift from the log that produced it.
 *
 * The design fills its rows with bracketed slots (`[User name]`, `[Device name]`,
 * `[Pay out reason/note goes here]`). Those are placeholders, not copy, so they're filled with
 * the names the rest of the prototype uses: Thomas is the signed-in operator (`POS_OPERATOR`),
 * the store is the one in Settings.
 */
import type { MockOrder } from '../../android/orders';

export type CashEntryKind =
  | 'session-started'
  | 'session-closed'
  | 'cash-sale'
  | 'cash-refund'
  | 'pay-in'
  | 'pay-out';

/** A line on the order behind a cash sale or refund, keyed to the catalog. */
export interface CashOrderLine {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CashEntry {
  id: number;
  /** 24-hour clock, as the design shows it. */
  time: string;
  title: string;
  /** Second line after the time — a note, or the order when `orderLink` is set. */
  note?: string;
  /** Renders as a link to the order the movement was recorded against. */
  orderLink?: string;
  /** The order behind that link — what the order sheet shows. */
  order?: { number: string; lines: CashOrderLine[]; total: number };
  /** Signed, in dollars. Positive renders in the success colour with a leading `+`. */
  amount: number;
  kind: CashEntryKind;
}

export interface CashSession {
  id: string;
  /** Store-side session number, shown in the Past sessions list. */
  number: string;
  /** As the Past sessions list shows it. */
  date: string;
  /** Which register this was — the design's `[Device name]`. */
  device: string;
  startedAt: string;
  /** Absent while the session is still open. */
  closedAt?: string;
  startingCash: number;
  /** What was physically counted at close. Absent while the session is open. */
  countedCash?: number;
  /** Chronological: oldest first. The UI reverses it — newest reads at the top. */
  entries: CashEntry[];
}

const STORE = 'My WooCommerce Store';

/** Sums the entries of one kind. */
function sumOf(session: CashSession, ...kinds: CashEntryKind[]): number {
  return session.entries
    .filter((e) => kinds.includes(e.kind))
    .reduce((total, e) => total + e.amount, 0);
}

export const cashSales = (s: CashSession) => sumOf(s, 'cash-sale');
export const cashRefunds = (s: CashSession) => sumOf(s, 'cash-refund');
export const paidInOut = (s: CashSession) => sumOf(s, 'pay-in', 'pay-out');

/** What the drawer should hold: the float, plus everything recorded against it since. */
export function expectedInDrawer(session: CashSession): number {
  return session.startingCash + cashSales(session) + paidInOut(session) + cashRefunds(session);
}

/** Counted minus expected — positive is over, negative is short. `null` until it's counted. */
export function difference(session: CashSession): number | null {
  if (session.countedCash === undefined) return null;
  return Number((session.countedCash - expectedInDrawer(session)).toFixed(2));
}

let nextId = 1;
const entry = (
  time: string,
  kind: CashEntryKind,
  title: string,
  amount: number,
  extra: Partial<Pick<CashEntry, 'note' | 'orderLink' | 'order'>> = {},
): CashEntry => ({ id: nextId++, time, kind, title, amount, ...extra });

/**
 * Catalog picks, so an order sheet shows real products at real prices. `[productId, qty]`.
 * The sale's amount is whatever the lines come to — never typed twice.
 */
type CatalogPick = [productId: number, quantity: number];

const CATALOG: Record<number, { name: string; price: number }> = {
  1: { name: 'Cotton Crew T-Shirt', price: 18 },
  2: { name: 'Slim Fit Jeans', price: 54 },
  3: { name: 'Wool Blend Scarf', price: 16 },
  4: { name: 'Leather Belt', price: 24 },
  5: { name: 'Denim Jacket', price: 89 },
  6: { name: 'Baseball Cap', price: 22 },
  7: { name: 'Wool Socks (3-Pack)', price: 12 },
  8: { name: 'Running Sneakers', price: 68 },
  9: { name: 'Store Gift Card', price: 25 },
  10: { name: 'Canvas Tote Bag', price: 18 },
  11: { name: 'Striped Cotton Dress', price: 42 },
  12: { name: 'Zip-Up Hoodie', price: 58 },
};

function linesFrom(picks: CatalogPick[]): { lines: CashOrderLine[]; total: number } {
  const lines = picks.map(([productId, quantity]) => ({
    productId,
    name: CATALOG[productId].name,
    quantity,
    unitPrice: CATALOG[productId].price,
  }));
  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  return { lines, total };
}

const sale = (time: string, order: number, picks: CatalogPick[]) => {
  const { lines, total } = linesFrom(picks);
  return entry(time, 'cash-sale', 'Cash sale', total, {
    orderLink: `Order #${order}`,
    order: { number: `#${order}`, lines, total },
  });
};

const refund = (time: string, order: number, picks: CatalogPick[]) => {
  const { lines, total } = linesFrom(picks);
  return entry(time, 'cash-refund', 'Cash refund issued', -total, {
    orderLink: `Order #${order}`,
    order: { number: `#${order}`, lines, total },
  });
};

const payIn = (time: string, by: string, note: string, amount: number) =>
  entry(time, 'pay-in', `Pay in recorded by ${by}`, amount, { note });

const payOut = (time: string, by: string, note: string, amount: number) =>
  entry(time, 'pay-out', `Pay out recorded by ${by}`, -amount, { note });

const opened = (time: string, by: string, float: number) =>
  entry(time, 'session-started', 'Session started', float, { note: `By ${by} at ${STORE}` });

const closed = (time: string, by: string, counted: number) =>
  entry(time, 'session-closed', 'Session closed', counted, { note: `Counted by ${by}` });

/**
 * Today, still open. A normal Monday: steady cash sales, a float top-up when the drawer ran
 * low on change, a courier paid out of the till, and one refund.
 */
export const CURRENT_SESSION: CashSession = {
  id: 'current',
  number: '1681895',
  date: '09/15/2026',
  device: 'Register 1 · iPad Pro',
  startedAt: 'Started 09/15/26, 9:00 AM',
  startingCash: 150,
  entries: [
    opened('09:00', 'Thomas', 150),
    sale('09:24', 1489, [[1, 1]]),
    sale('10:02', 1491, [[11, 1]]),
    payIn('10:47', 'Thomas', 'Float top-up from safe', 50),
    sale('11:15', 1494, [[4, 1]]),
    refund('11:58', 1496, [[3, 1]]),
    sale('12:30', 1499, [[8, 1]]),
    payOut('13:10', 'Maria', 'Courier delivery fee', 25),
    sale('14:05', 1503, [[7, 1]]),
    sale('15:22', 1508, [[2, 1]]),
  ],
};

/** Yesterday. Busy, and came up $5 short at close — the kind of day worth reviewing. */
const SESSION_0914: CashSession = {
  id: '2026-09-14',
  number: '1681891',
  date: '09/14/2026',
  device: 'Register 1 · iPad Pro',
  startedAt: 'Started 09/14/26, 8:45 AM',
  closedAt: 'Closed 09/14/26, 6:12 PM',
  startingCash: 200,
  countedCash: 523.5,
  entries: [
    opened('08:45', 'Thomas', 200),
    sale('09:12', 1452, [[1, 2]]),
    sale('09:58', 1455, [[6, 1]]),
    sale('10:31', 1458, [[5, 1]]),
    payOut('11:05', 'Thomas', 'Window cleaner', 30),
    sale('11:44', 1461, [[4, 1], [6, 1]]),
    refund('12:20', 1458, [[5, 1]]),
    sale('13:02', 1466, [[2, 1]]),
    payIn('13:35', 'Maria', 'Change order from bank', 100),
    sale('14:18', 1470, [[1, 1]]),
    sale('15:03', 1473, [[8, 1]]),
    sale('16:27', 1478, [[11, 1]]),
    payOut('17:10', 'Maria', 'Staff lunch', 27.5),
    closed('18:12', 'Maria', 523.5),
  ],
};

/** Quiet Sunday — half day, barely any cash, balanced. */
const SESSION_0913: CashSession = {
  id: '2026-09-13',
  number: '1681884',
  date: '09/13/2026',
  device: 'Register 2 · iPad',
  startedAt: 'Started 09/13/26, 10:00 AM',
  closedAt: 'Closed 09/13/26, 3:00 PM',
  startingCash: 100,
  countedCash: 178,
  entries: [
    opened('10:00', 'Maria', 100),
    sale('11:20', 1441, [[4, 1]]),
    sale('12:55', 1444, [[11, 1]]),
    sale('14:10', 1447, [[7, 1]]),
    closed('15:00', 'Maria', 178),
  ],
};

/** Saturday. Heavy trade, two refunds, and $2 over at close. */
const SESSION_0912: CashSession = {
  id: '2026-09-12',
  number: '1681877',
  date: '09/12/2026',
  device: 'Register 1 · iPad Pro',
  startedAt: 'Started 09/12/26, 8:30 AM',
  closedAt: 'Closed 09/12/26, 7:04 PM',
  startingCash: 250,
  countedCash: 758,
  entries: [
    opened('08:30', 'Thomas', 250),
    sale('09:05', 1402, [[12, 1]]),
    sale('09:47', 1405, [[4, 1]]),
    sale('10:22', 1408, [[2, 1], [12, 1]]),
    refund('10:58', 1405, [[4, 1]]),
    sale('11:33', 1412, [[1, 2]]),
    payIn('12:00', 'Thomas', 'Float top-up from safe', 80),
    sale('12:41', 1417, [[8, 1]]),
    sale('13:29', 1420, [[11, 1]]),
    refund('14:15', 1412, [[1, 2]]),
    sale('15:08', 1426, [[5, 1]]),
    payOut('16:00', 'Thomas', 'Parking for delivery van', 15),
    sale('17:12', 1432, [[1, 1]]),
    sale('18:30', 1437, [[2, 1]]),
    closed('19:04', 'Thomas', 758),
  ],
};

/** Friday. Started late after a hardware issue, small float, balanced. */
const SESSION_0911: CashSession = {
  id: '2026-09-11',
  number: '1681869',
  date: '09/11/2026',
  device: 'Register 2 · iPad',
  startedAt: 'Started 09/11/26, 11:15 AM',
  closedAt: 'Closed 09/11/26, 6:00 PM',
  startingCash: 80,
  countedCash: 275,
  entries: [
    opened('11:15', 'Maria', 80),
    sale('11:52', 1388, [[11, 1]]),
    sale('12:38', 1391, [[3, 1], [7, 1]]),
    payOut('13:15', 'Maria', 'Petty cash for stamps', 10),
    sale('14:44', 1395, [[8, 1]]),
    sale('15:30', 1398, [[4, 1]]),
    payIn('16:10', 'Thomas', 'Change order from bank', 25),
    sale('17:05', 1400, [[1, 1]]),
    closed('18:00', 'Maria', 275),
  ],
};

/**
 * Adapts a cash-drawer order into the shape the Orders screen's detail renders, so the sheet
 * can show the *real* order detail — Issue refund, overflow menu and all — rather than a
 * lookalike. Cash-drawer orders have no customer email and were paid at the counter, so those
 * fields are filled accordingly.
 */
export function toMockOrder(entry: CashEntry, session: CashSession): MockOrder | null {
  if (!entry.order) return null;
  const { number, lines, total } = entry.order;
  return {
    id: Number(number.replace('#', '')),
    number,
    date: `${session.date} at ${entry.time}`,
    status: 'Completed',
    items: lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      lineTotal: l.unitPrice * l.quantity,
    })),
    discountTotal: 0,
    taxTotal: 0,
    total,
    paymentMethod: 'Cash',
    refunds: [],
  };
}

/** Newest first, as the Past sessions list shows them. */
export const PAST_SESSIONS: CashSession[] = [
  SESSION_0914,
  SESSION_0913,
  SESSION_0912,
  SESSION_0911,
];
