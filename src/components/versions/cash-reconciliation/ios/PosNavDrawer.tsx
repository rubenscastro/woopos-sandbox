import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useNav } from '../../../../device/platformNav';
import { parseRoutedPath } from '../../../../versions/routing';
import { Link } from './Link';
import './PosNavDrawer.css';
import {
  House,
  ArchiveBox,
  DollarSignCircle,
  GearShape,
  RectanglePortraitAndArrowRight,
} from './NavIcons';

/**
 * Cash reconciliation navigation drawer (Figma "Settings - Menu", POS Navigation 2011:3153).
 *
 * Replaces Trunk's `ellipsis` popover — which offers only Orders / Settings / Exit POS — with a
 * full-height left drawer that also surfaces Home and the proposal's new **Cash drawer**
 * destination. Reconciliation is a place you go, not a sheet you summon, so it needs a
 * standing nav slot rather than another entry in a floating menu.
 *
 * Per the design: 16px horizontal / 28px vertical padding, rows of a 32px SF Symbol + a
 * bodyLarge-bold label at 16px padding and an 8px radius, 8px between rows, and Exit POS
 * pinned to the bottom, split from the destinations above it.
 *
 * It slides in from the leading edge and back out again, the way a UIKit drawer does, rather
 * than appearing in place — the movement is what tells the merchant where the panel came from
 * and where dismissing it will put it back.
 */

/** Must stay in step with the animation duration in PosNavDrawer.css. */
const TRANSITION_MS = 300;
export interface PosNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

type NavSlug = 'products' | 'orders' | 'cash-drawer' | 'settings';

const DESTINATIONS: { slug: NavSlug; label: string; icon: React.ReactNode; to: string }[] = [
  { slug: 'products', label: 'Home', icon: <House />, to: '/products' },
  { slug: 'orders', label: 'Orders', icon: <ArchiveBox />, to: '/orders' },
  { slug: 'cash-drawer', label: 'Cash drawer', icon: <DollarSignCircle />, to: '/cash-drawer' },
  { slug: 'settings', label: 'Settings', icon: <GearShape />, to: '/settings' },
];

export function PosNavDrawer({ open, onClose }: PosNavDrawerProps) {
  const nav = useNav();
  // Which row reads as Active is the route you're actually on, not a fixed default — the
  // drawer is the only thing telling you where you are once it's open.
  const { slug } = parseRoutedPath(useLocation().pathname);
  const current = DESTINATIONS.find((d) => d.to === `/${slug}`)?.slug;
  const ref = useRef<HTMLElement>(null);

  // `mounted` outlives `open` for the length of the slide-out, so the exit animation has
  // something to play on. The animations themselves live in CSS (see PosNavDrawer.css) — the
  // only thing React decides is which direction is playing and when to drop the element.
  const [mounted, setMounted] = useState(open);
  const closing = mounted && !open;

  // The drawer is app content, so it belongs to the device *screen*, not to the corner the
  // floating control occupies. Portalling it into `.device-screen` puts it inside the element
  // that already clips — a panel sliding past the edge is hidden by the screen's own
  // `overflow: hidden`, exactly like it would be on a real device.
  const [screenEl, setScreenEl] = useState<Element | null>(null);
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

  // Tap-outside-to-dismiss, scoped to the device screen rather than the document: the chrome
  // sidebar and the canvas around the frame are the reviewer's tooling, not the merchant's
  // app, so reaching for a tool must not dismiss what's open inside the device. Listening on
  // the screen element instead of `document` is what draws that line — this is why the shared
  // `useClickOutside` isn't used here.
  useEffect(() => {
    if (!open || !screenEl) return;
    const onDown = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    screenEl.addEventListener('pointerdown', onDown, true);
    return () => screenEl.removeEventListener('pointerdown', onDown, true);
  }, [open, screenEl, onClose]);

  if (!mounted || !screenEl) return null;

  const go = (to: string) => {
    onClose();
    nav(to);
  };

  return createPortal(
    <>
      {/* Scrim — dims the POS behind the drawer without hiding it, so the merchant keeps their
          place in the flow they're navigating away from. */}
      <div
        aria-hidden
        className={`pos-nav-scrim${closing ? ' is-closing' : ''}`}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 30,
          background: 'color-mix(in srgb, #000 32%, transparent)',
        }}
      />
      <nav
        ref={ref}
        aria-label="POS navigation"
        className={`pos-nav-drawer${closing ? ' is-closing' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 31,
          width: 320,
          maxWidth: '80%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-xl)',
          // Surface runs full-bleed to the top of the screen, but the content clears the OS
          // status bar that draws over it — hence safe-top on top of the design's 28px.
          padding: 'calc(28px + var(--device-safe-top, 0px)) var(--space-md) 28px',
          background: 'var(--color-surface)',
          color: 'var(--color-on-surface)',
          boxShadow: 'var(--shadow-normal-large)',
        }}
      >
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {DESTINATIONS.map((d) => (
              <Link
                key={d.slug}
                label={d.label}
                leftIcon={d.icon}
                state={d.slug === current ? 'active' : 'default'}
                current={d.slug === current}
                onClick={() => go(d.to)}
              />
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <Link
            label="Exit POS"
            leftIcon={<RectanglePortraitAndArrowRight />}
            onClick={() => go('/flows')}
          />
        </div>
      </nav>
    </>,
    screenEl,
  );
}
