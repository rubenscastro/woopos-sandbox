import { useState } from 'react';
import { Text } from '../../../android/Text';
import { DotsVertical, EditSquare } from '../../../android/icons';
import { useClickOutside } from '../../../../hooks/useClickOutside';

/**
 * Option 4 (Home tab) — Android kebab menu next to search on the Home tab, with one entry, "Edit home
 * page". Styled like the app's main menu (Material popup: surfaceContainerLow card, medium padding,
 * leading icon). "Edit home page" has no behavior yet — the design doesn't define one.
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
        style={{ border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'var(--size-xsmall)', height: 'var(--size-xsmall)', borderRadius: '50%', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', cursor: 'pointer' }}
      >
        <DotsVertical size="var(--icon-small)" />
      </button>
      {open && (
        <div
          role="menu"
          style={{ position: 'absolute', top: 'calc(100% + var(--space-sm))', right: 0, zIndex: 30, minWidth: 176, background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-normal-large)', padding: 'var(--space-md) 0' }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onEditHomePage?.(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', padding: 'var(--space-sm) var(--space-md)', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)', color: 'var(--color-on-surface)', cursor: 'pointer' }}
          >
            <span style={{ display: 'flex', color: 'var(--color-on-surface-variant-highest)' }}><EditSquare size="var(--icon-small)" /></span>
            <Text variant="bodyMedium" style={{ whiteSpace: 'nowrap' }}>Edit home page</Text>
          </button>
        </div>
      )}
    </div>
  );
}
