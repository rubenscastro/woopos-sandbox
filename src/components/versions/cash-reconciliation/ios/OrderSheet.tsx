import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { OrderDetail } from '../../../../screens/ios/Orders';
import { useNav } from '../../../../device/platformNav';
import type { MockOrder } from '../../../../mocks/android/orders';
import './OrderSheet.css';

/**
 * The order behind a cash-drawer movement, as a full-height bottom sheet.
 *
 * The content is the Orders screen's own `OrderDetail` — not a copy of it. An order reached
 * from the cash log is the same order you'd open from Orders, so it carries the same header,
 * the same Issue refund button and the same overflow menu. Anything less and the two views
 * drift apart the moment either changes.
 *
 * Full height rather than a half sheet because the drawer log is a reconciliation tool: you
 * tap through to check an order line by line. `OrderDetail`'s leading control is switched to a
 * close glyph — the sheet dismisses, it doesn't go back to a pane.
 *
 * Portalled into `.device-screen` for the same reason the nav drawer is: it's app content, so
 * the screen's own overflow is what should clip it as it slides.
 */
export interface OrderSheetProps {
  /** The order to show; `null` closes the sheet. */
  order: MockOrder | null;
  onClose: () => void;
}

/** Keep in step with the animation duration in OrderSheet.css. */
const TRANSITION_MS = 300;

export function OrderSheet({ order, onClose }: OrderSheetProps) {
  const nav = useNav();
  const [mounted, setMounted] = useState(order !== null);
  const [screenEl, setScreenEl] = useState<Element | null>(null);
  const closing = mounted && order === null;

  useEffect(() => {
    setScreenEl(document.querySelector('.device-screen'));
  }, []);

  useEffect(() => {
    if (order) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [order]);

  // Holds the last order through the slide-out, so the sheet doesn't empty mid-animation.
  const [shown, setShown] = useState(order);
  useEffect(() => {
    if (order) setShown(order);
  }, [order]);

  if (!mounted || !screenEl || !shown) return null;

  return createPortal(
    <>
      <div
        aria-hidden
        className={`order-sheet__scrim${closing ? ' is-closing' : ''}`}
        onClick={onClose}
      />
      <section
        className={`order-sheet${closing ? ' is-closing' : ''}`}
        role="dialog"
        aria-label={`Order ${shown.number}`}
      >
        <OrderDetail
          order={shown}
          scenario="none"
          onBack={onClose}
          backIcon="close"
          onEmail={() => nav('/email-receipt')}
        />
      </section>
    </>,
    screenEl,
  );
}
