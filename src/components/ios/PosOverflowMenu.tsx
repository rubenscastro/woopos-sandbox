import { useState } from 'react';
import { PosText } from './PosText';
import { DotsHorizontal } from './IosIcons';
import { useClickOutside } from '../../hooks/useClickOutside';

/**
 * The "..." header menu: a bare ellipsis glyph that drops a liquid-glass popover of actions
 * beneath its right edge. Order details carries one (Email receipt); the cash drawer's current
 * session carries one too (Pay in / Pay out). Same control, same place, so a merchant learns
 * it once.
 *
 * Actions are stacked in the order given; selecting one closes the menu, as does a click
 * anywhere outside it.
 */
export interface PosOverflowMenuItem {
  label: string;
  onSelect: () => void;
}

export function PosOverflowMenu({
  items,
  label = 'More actions',
}: {
  items: PosOverflowMenuItem[];
  /** What the trigger announces, when "More actions" isn't specific enough. */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div ref={ref} style={{ position: 'relative', flex: 'none' }}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          border: 'none',
          background: 'none',
          display: 'flex',
          color: 'var(--color-on-surface)',
          padding: 'var(--space-sm)',
          cursor: 'pointer',
        }}
      >
        <DotsHorizontal size="var(--icon-medium)" />
      </button>
      {open && (
        <div
          className="woopos-liquid-glass"
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-xs))',
            right: 0,
            minWidth: 200,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-normal-large)',
            padding: 'var(--space-xs) 0',
            overflow: 'hidden',
            zIndex: 30,
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: 'var(--space-sm) var(--space-lg)',
                border: 'none',
                background: 'transparent',
                color: 'var(--color-on-surface)',
                cursor: 'pointer',
              }}
            >
              <PosText variant="bodyMedium">{item.label}</PosText>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
