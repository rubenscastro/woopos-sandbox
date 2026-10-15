import { useState } from 'react';
import { PosText } from '../../../ios/PosText';
import { DotsHorizontal, SquareAndPencil } from '../../../ios/IosIcons';
import { useClickOutside } from '../../../../hooks/useClickOutside';

/**
 * Option 4 (Home tab) — iOS kebab menu next to search on the Home tab, with one entry, "Edit home
 * page". The menu is the Figma liquid-glass one (POS Playground, node 4295-39758): a pill with a
 * 60% light fill over a blur, a soft 0 8 40 shadow, and a 17pt label with its symbol leading.
 * "Edit home page" has no behavior yet — the design doesn't define one.
 */
export function HomeMenu({ onEditHomePage }: { onEditHomePage?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative', flex: 'none' }}>
      <button
        type="button"
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'var(--size-xsmall)', height: 'var(--size-xsmall)', borderRadius: '50%', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', border: 'none', cursor: 'pointer' }}
      >
        {/* The kebab: SF "ellipsis" turned upright. */}
        <DotsHorizontal size="var(--icon-small)" style={{ transform: 'rotate(90deg)' }} />
      </button>
      {open && (
        <div
          role="menu"
          className="woopos-liquid-glass"
          style={{ position: 'absolute', top: 'calc(var(--size-xsmall) + var(--space-sm))', right: 0, zIndex: 30, minWidth: 220, padding: '10px 0', borderRadius: 32, background: 'rgba(245, 245, 245, 0.6)', boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)', overflow: 'hidden' }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onEditHomePage?.(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '0 22px 0 22px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#1a1a1a' }}
          >
            <span style={{ width: 28, display: 'flex', justifyContent: 'center' }}><SquareAndPencil size="22px" /></span>
            <PosText variant="bodyLarge" color="#1a1a1a" style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', fontSize: 17, lineHeight: '20px', letterSpacing: '-0.43px', padding: '10px 0' }}>Edit home page</PosText>
          </button>
        </div>
      )}
    </div>
  );
}
