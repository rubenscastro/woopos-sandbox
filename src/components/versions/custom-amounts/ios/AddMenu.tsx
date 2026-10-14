import { useState } from 'react';
import { PosText } from '../../../ios/PosText';
import { CartBadgePlus, Plus } from '../../../ios/IosIcons';
import { useClickOutside } from '../../../../hooks/useClickOutside';

/**
 * Custom amounts proposal, Option 3 — iOS "+" button left of search on the Products tab. It
 * opens a small menu (same liquid-glass popover as the header's ••• menu) whose only entry is
 * "Add custom amount".
 */
export function AddMenu({ onAddCustomAmount }: { onAddCustomAmount: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative', flex: 'none' }}>
      <button
        type="button"
        aria-label="Add"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'var(--size-xsmall)', height: 'var(--size-xsmall)', borderRadius: '50%', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', border: 'none', cursor: 'pointer' }}
      >
        <Plus size="var(--icon-small)" />
      </button>
      {open && (
        <div
          role="menu"
          className="woopos-liquid-glass"
          style={{ position: 'absolute', top: 'calc(var(--size-xsmall) + var(--space-sm))', right: 0, minWidth: 220, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-normal-large)', padding: 'var(--space-xs) 0', overflow: 'hidden', zIndex: 30 }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onAddCustomAmount(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', padding: 'var(--space-sm) var(--space-lg)', border: 'none', background: 'transparent', color: 'var(--color-on-surface)', cursor: 'pointer' }}
          >
            {/* Same row as the main menu: title leads, SF Symbol trails. */}
            <PosText variant="bodyMedium" style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>Add custom amount</PosText>
            <span style={{ display: 'flex' }}><CartBadgePlus size="var(--icon-small)" /></span>
          </button>
        </div>
      )}
    </div>
  );
}
