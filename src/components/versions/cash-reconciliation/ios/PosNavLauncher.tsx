import { useState } from 'react';
import { PosNavDrawer } from './PosNavDrawer';
import { LineHorizontal3 } from './NavIcons';

/**
 * The hamburger that opens the navigation drawer, plus the drawer itself.
 *
 * Split out of `PosFloatingControl` so every destination in this proposal can carry it. On
 * Trunk the floating control only exists on the dashboard, and Orders / Settings get out via
 * their own close button — fine when the menu is a dashboard affordance. Here the drawer *is*
 * the navigation, so it has to be reachable from everywhere it can take you; a nav that
 * disappears on half its destinations is a dead end.
 *
 * `variant` is the button's own chrome: `floating` is the dashboard's raised control, `inline`
 * is a bare glyph for a page header. `PosNavFloatingLauncher` wraps the floating variant in the
 * corner positioning, for screens that have no floating control of their own to sit inside.
 */
/**
 * The floating control in the bottom-left corner, for screens that don't already render
 * `PosFloatingControl` — Orders and Settings. Same button, same place as on the dashboard, so
 * the menu stays where the merchant last saw it.
 */
export function PosNavFloatingLauncher() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 'var(--space-lg)',
        bottom: 'var(--space-lg)',
        zIndex: 20,
        display: 'flex',
      }}
    >
      <PosNavLauncher variant="floating" />
    </div>
  );
}

export function PosNavLauncher({ variant = 'inline' }: { variant?: 'floating' | 'inline' }) {
  const [open, setOpen] = useState(false);

  const floating = variant === 'floating';

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-on-surface)',
          ...(floating
            ? {
                width: 'var(--size-small)',
                height: 'var(--size-small)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-container-low)',
                boxShadow: 'var(--shadow-normal-medium)',
              }
            : { background: 'none', padding: 4 }),
        }}
      >
        <LineHorizontal3 size={floating ? '30px' : 'var(--icon-medium)'} />
      </button>
      <PosNavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
