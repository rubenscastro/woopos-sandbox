import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './PosShareSheet.css';

/**
 * The system share sheet (`UIActivityViewController`), simulated.
 *
 * It can't be imported: the real sheet is drawn by the OS, and its targets are whatever the
 * merchant happens to have installed — an app hands it an item and gets back nothing but
 * "done". What's below matches its anatomy — the item preview with its Options control, the
 * row of app targets, the grouped actions under it — so the flow can be reviewed end to end.
 * The targets shown are stand-ins for a plausible device, not a claim about what a merchant
 * will see.
 *
 * The glyphs are drawn rather than imported for the same reason: Apple's app icons aren't
 * ours to ship. They're filled shapes in gradient tiles because that's what reads as an app
 * icon — a stroked outline on a flat colour is the thing that gives a fake away.
 *
 * Portalled into `.device-screen`, like the other sheets, so the screen's own overflow clips
 * it as it slides.
 */
export interface PosShareSheetProps {
  open: boolean;
  onClose: () => void;
  /** The item being shared — its name, and what it is. */
  title: string;
  subtitle: string;
}

/** Keep in step with the animation duration in PosShareSheet.css. */
const TRANSITION_MS = 280;

/* ---- App tiles ---- */

function AirDropTile() {
  return (
    <span className="pos-share__tile" style={{ background: 'linear-gradient(#4aa8ff, #0a74e8)' }} aria-hidden>
      <svg viewBox="0 0 44 44" width={38} height={38}>
        <g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
          <path d="M13 17.5a12 12 0 0 1 18 0" />
          <path d="M17.5 22.6a6.2 6.2 0 0 1 9 0" />
        </g>
        <path fill="#fff" d="M22 36.5 15.6 26.5h12.8z" />
      </svg>
    </span>
  );
}

function MessagesTile() {
  return (
    <span className="pos-share__tile" style={{ background: 'linear-gradient(#5bf07a, #1fc02f)' }} aria-hidden>
      <svg viewBox="0 0 44 44" width={40} height={40}>
        <path
          fill="#fff"
          d="M22 8.5c-8.3 0-15 5.5-15 12.3 0 3.8 2.1 7.2 5.4 9.4-.3 2.3-1.5 4.4-3.3 5.9 2.9-.3 5.7-1.4 7.9-3 1.6.4 3.3.6 5 .6 8.3 0 15-5.5 15-12.9S30.3 8.5 22 8.5Z"
        />
      </svg>
    </span>
  );
}

function MailTile() {
  return (
    <span className="pos-share__tile" style={{ background: 'linear-gradient(#2eb5ff, #0a68e8)' }} aria-hidden>
      <svg viewBox="0 0 44 44" width={40} height={40}>
        <rect x="7" y="12" width="30" height="20" rx="4.5" fill="#fff" />
        <path d="M9.5 15.5 20.6 24a2.3 2.3 0 0 0 2.8 0l11.1-8.5" fill="none" stroke="#1a86ef" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* Notes is its own tile rather than a glyph on a colour: the icon *is* a sheet of ruled paper
   under a yellow band. */
function NotesTile() {
  return (
    <span
      className="pos-share__tile"
      style={{ background: 'linear-gradient(#ffd426 0 24%, #fdfdf6 24%)' }}
      aria-hidden
    >
      <svg viewBox="0 0 60 60" width={60} height={60}>
        <g stroke="#d8d8cf" strokeWidth="2" strokeLinecap="round">
          <path d="M14 27h32M14 34h32M14 41h22" />
        </g>
      </svg>
    </span>
  );
}

const TARGETS = [
  { name: 'AirDrop', tile: <AirDropTile /> },
  { name: 'Messages', tile: <MessagesTile /> },
  { name: 'Mail', tile: <MailTile /> },
  { name: 'Notes', tile: <NotesTile /> },
];

/* ---- Action symbols, at SF Symbols' weight rather than the POS icon set's ---- */

const SYM = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  width: 23,
  height: 23,
  'aria-hidden': true,
} as const;

const ACTIONS = [
  {
    name: 'Copy',
    // doc.on.doc
    glyph: (
      <svg {...SYM}>
        <rect x="9" y="2.8" width="11.5" height="14" rx="2.4" />
        <path d="M15.4 19.6a2.4 2.4 0 0 1-2.4 2.4H5.9a2.4 2.4 0 0 1-2.4-2.4V8.3a2.4 2.4 0 0 1 2.4-2.4" />
      </svg>
    ),
  },
  {
    name: 'Save to Files',
    // folder
    glyph: (
      <svg {...SYM}>
        <path d="M2.8 8.6V6.9a2.4 2.4 0 0 1 2.4-2.4h3.5a2 2 0 0 1 1.5.7l1.2 1.4h7.2a2.4 2.4 0 0 1 2.4 2.4v9.3a2.4 2.4 0 0 1-2.4 2.4H5.2a2.4 2.4 0 0 1-2.4-2.4Z" />
        <path d="M2.8 9.4h18.4" />
      </svg>
    ),
  },
  {
    name: 'Print',
    // printer
    glyph: (
      <svg {...SYM}>
        <path d="M7 9V4.3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1V9" />
        <path d="M7 17.2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
        <rect x="7" y="14" width="10" height="6.7" rx="1" />
      </svg>
    ),
  },
  {
    name: 'Markup',
    // pencil.tip.crop.circle — the tip reads at this size only if it's filled.
    glyph: (
      <svg {...SYM}>
        <circle cx="12" cy="12" r="9.2" />
        <path d="M12 5.6l2.3 4v3.1H9.7V9.6Z" fill="currentColor" stroke="none" />
        <path d="M9.7 14.4h4.6" />
      </svg>
    ),
  },
];

/* The sheet's own last row: tinted, and about the list above it rather than about the item. */
const EDIT_ACTIONS = 'Edit Actions…';

/** A page thumbnail with the folded corner and the red PDF tag the system draws. */
function DocumentThumb() {
  return (
    <svg className="pos-share__thumb" viewBox="0 0 42 54" aria-hidden>
      <path d="M0 3a3 3 0 0 1 3-3h24l15 15v36a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z" fill="#fff" />
      <path d="M27 0l15 15H30a3 3 0 0 1-3-3Z" fill="#e3e3e6" />
      <g fill="#c7c7cc">
        <rect x="7" y="22" width="28" height="2" rx="1" />
        <rect x="7" y="27" width="28" height="2" rx="1" />
        <rect x="7" y="32" width="18" height="2" rx="1" />
      </g>
      <rect x="4" y="40" width="20" height="10" rx="2" fill="#ff3b30" />
      <text x="14" y="47.6" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="system-ui, sans-serif">
        PDF
      </text>
    </svg>
  );
}

export function PosShareSheet({ open, onClose, title, subtitle }: PosShareSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [screenEl, setScreenEl] = useState<Element | null>(null);
  const closing = mounted && !open;

  useEffect(() => {
    setScreenEl(document.querySelector('.device-screen'));
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted || !screenEl) return null;

  return createPortal(
    <>
      <div aria-hidden className={`pos-share__scrim${closing ? ' is-closing' : ''}`} onClick={onClose} />
      <section className={`pos-share${closing ? ' is-closing' : ''}`} role="dialog" aria-label="Share">
        <span className="pos-share__grabber" aria-hidden />

        <div className="pos-share__preview">
          <DocumentThumb />
          <span className="pos-share__preview-text">
            <span className="pos-share__title">{title}</span>
            <span className="pos-share__subtitle">{subtitle}</span>
            <button type="button" className="pos-share__options">
              Options
              <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9 5 16 12 9 19" />
              </svg>
            </button>
          </span>
          <button type="button" className="pos-share__close" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
        </div>

        <div className="pos-share__targets">
          {TARGETS.map((t) => (
            <button key={t.name} type="button" className="pos-share__target">
              {t.tile}
              {t.name}
            </button>
          ))}
        </div>

        <div className="pos-share__actions">
          {ACTIONS.map((a) => (
            <button key={a.name} type="button" className="pos-share__action">
              {a.name}
              <span className="pos-share__action-icon" aria-hidden>
                {a.glyph}
              </span>
            </button>
          ))}
          <button type="button" className="pos-share__action is-tinted">
            {EDIT_ACTIONS}
          </button>
        </div>
      </section>
    </>,
    screenEl,
  );
}
