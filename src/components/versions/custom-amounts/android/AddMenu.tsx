import { useState } from 'react';
import { Text } from '../../../android/Text';
import { CartBadgePlus, Plus } from '../../../android/icons';
import { useClickOutside } from '../../../../hooks/useClickOutside';

/**
 * Custom amounts proposal, Option 3 — Android "+" button left of search on the Products tab.
 * It opens a small dropdown whose only entry is "Add custom amount", styled like the main
 * menu (FloatingToolbar's popup: surfaceContainerLow card, Medium padding top and bottom, rows
 * with a leading icon).
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
        style={{ border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'var(--size-xsmall)', height: 'var(--size-xsmall)', borderRadius: '50%', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', cursor: 'pointer' }}
      >
        <Plus size="var(--icon-small)" />
      </button>
      {open && (
        <div
          role="menu"
          style={{ position: 'absolute', top: 'calc(100% + var(--space-sm))', right: 0, zIndex: 30, minWidth: 176, background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-normal-large)', padding: 'var(--space-md) 0' }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onAddCustomAmount(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', padding: 'var(--space-sm) var(--space-md)', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)', color: 'var(--color-on-surface)', cursor: 'pointer' }}
          >
            <span style={{ display: 'flex', color: 'var(--color-on-surface-variant-highest)' }}><CartBadgePlus size="var(--icon-small)" /></span>
            <Text variant="bodyMedium" style={{ whiteSpace: 'nowrap' }}>Add custom amount</Text>
          </button>
        </div>
      )}
    </div>
  );
}
