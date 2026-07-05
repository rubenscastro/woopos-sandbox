import type { ReactNode } from 'react';
import { Text } from './Text';
import { ChevronLeft } from './icons';

/**
 * WooPosToolbar — top bar used across POS screens: optional back button, title (+ optional
 * count/subtitle), and an optional trailing slot.
 */
interface ToolbarProps {
  title: string;
  count?: string;
  onBack?: () => void;
  trailing?: ReactNode;
}

export function Toolbar({ title, count, onBack, trailing }: ToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        minHeight: 'var(--size-xsmall)',
        padding: 'var(--space-sm) var(--space-md)',
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            border: 'none',
            background: 'none',
            display: 'flex',
            padding: 4,
            color: 'var(--color-on-surface)',
            flex: 'none',
          }}
        >
          <ChevronLeft size="var(--icon-medium)" />
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', flex: 1, minWidth: 0 }}>
        <Text variant="heading" bold style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </Text>
        {count && (
          <Text variant="bodySmall" color="var(--color-on-surface-variant-lowest)">
            {count}
          </Text>
        )}
      </div>
      {trailing}
    </div>
  );
}
