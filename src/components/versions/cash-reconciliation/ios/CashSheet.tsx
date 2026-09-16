import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PosText } from '../../../../components/ios/PosText';
import { PosIconButton } from '../../../../components/ios/PosIconButton';
import { Close, ChevronLeft } from '../../../../components/ios/IosIcons';
import './CashSheet.css';

/**
 * The shell both cash flows ask their questions in: Record Pay in/out and Close session. A
 * full-page sheet sliding up over the drawer, with a header, one value being typed, and the
 * action that commits it.
 *
 * Shared because the two flows are the same screen twice — only the questions differ. What
 * lives here is everything that isn't a question: the slide, the portal, the header's back and
 * close controls, the three-band layout, and the focus handling, which is subtle enough to be
 * worth having once.
 *
 * The three bands are the sheet's whole structure (2020:4724, 2020:4570): the header hugs what
 * it holds, the action hugs its own height 16pt clear of the keyboard, and everything between
 * is the step's — it takes the rest of the page and centres its content in it. The action is a
 * prop rather than part of `children` so that band belongs to the shell; a step that put its
 * own button inside the content would have it float mid-page instead.
 *
 * Portalled into `.device-screen` for the same reason OrderSheet is: it's app content, so the
 * screen's own overflow is what should clip it as it slides — and it's what the soft keyboard
 * measures itself against.
 */
export interface CashSheetProps {
  open: boolean;
  onClose: () => void;
  /** Renders the back chevron when given; omit on a flow's first step. */
  onBack?: () => void;
  title: string;
  /**
   * The second line under the title (2013:2756) — what the step needs said about itself rather
   * than asked. "Optional" lives here, not in parentheses after the question: the title is what
   * the merchant is being asked, and whether they have to answer is a different sentence.
   */
  description?: string;
  /** What the dialog announces — the flow, not the step. */
  label: string;
  /**
   * Changes when the sheet moves to a different question, so the new step's field takes focus
   * and the keyboard stays up.
   */
  step: string;
  /** The step's commit action. Hugs its own height at the bottom, clear of the keyboard. */
  action: ReactNode;
  children: ReactNode;
}

/** Keep in step with the animation duration in CashSheet.css. */
const TRANSITION_MS = 280;

export function CashSheet({ open, onClose, onBack, title, description, label, step, action, children }: CashSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [screenEl, setScreenEl] = useState<Element | null>(null);
  /*
   * The sheet only starts following the keyboard once it has finished arriving. Its bottom edge
   * is the keyboard's top, and the keyboard goes up in the same moment the sheet does — letting
   * that transition on the way in would animate the action sliding up through a sheet that is
   * itself still sliding up, two motions reading as one stutter.
   */
  const [settled, setSettled] = useState(false);
  const sheetRef = useRef<HTMLElement>(null);
  const closing = mounted && !open;

  useEffect(() => {
    setScreenEl(document.querySelector('.device-screen'));
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const timer = setTimeout(() => setSettled(true), TRANSITION_MS);
      return () => clearTimeout(timer);
    }
    setSettled(false);
    const timer = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  /*
   * Every step opens with its field focused, so the keyboard is already up. `mounted` and
   * `screenEl` are in the deps because the field only exists once both are true — on a first
   * open, `step` alone hasn't changed since the render that returned null.
   *
   * `preventScroll` matters: the sheet is still translated off the bottom when this runs, and
   * without it the browser scrolls the device screen down to reveal the focused field — which
   * shifts the whole simulated screen, taking the status bar with it and leaving the keyboard
   * stranded in the middle of the page.
   */
  useEffect(() => {
    sheetRef.current?.querySelector('input')?.focus({ preventScroll: true });
  }, [mounted, screenEl, step]);

  if (!mounted || !screenEl) return null;

  return createPortal(
    <section
      ref={sheetRef}
      className={`cash-sheet${closing ? ' is-closing' : ''}${settled ? ' is-settled' : ''}`}
      role="dialog"
      aria-label={label}
    >
      {/* A described header is taller than its controls, and they sit at its top rather than
          floating beside the pair of lines (2013:2756). */}
      <header className={`cash-sheet__header${description ? ' has-description' : ''}`}>
        {onBack && (
          <PosIconButton label="Back" onClick={onBack}>
            <ChevronLeft size="var(--icon-medium)" />
          </PosIconButton>
        )}
        <div className="cash-sheet__heading">
          <PosText variant="heading" bold>
            {title}
          </PosText>
          {description && <PosText variant="bodyMedium">{description}</PosText>}
        </div>
        <span className="cash-sheet__header-spacer" />
        <PosIconButton label="Close" onClick={onClose}>
          <Close size="var(--icon-medium)" />
        </PosIconButton>
      </header>
      <div className="cash-sheet__content">{children}</div>
      <div className="cash-sheet__action">{action}</div>
    </section>,
    screenEl,
  );
}
