import type { ReactNode } from 'react';
import { Text } from './Text';

/**
 * WooPosChip — a WooPosCard wrapper with an optional leading icon + text row, md padding,
 * soft shadow. Used for search/filter chips and recent-search chips. Not a pill (rounded.md).
 */
interface ChipProps {
  label: string;
  leadingIcon?: ReactNode;
  onClick?: () => void;
}

export function Chip({ label, leadingIcon, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        backgroundColor: 'var(--color-surface-container-low)',
        color: 'var(--color-on-surface)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-soft-medium)',
        padding: 'var(--space-sm) var(--space-md)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {leadingIcon}
      <Text variant="bodySmall">{label}</Text>
    </button>
  );
}
