import type { ReactNode } from 'react';
import { Text } from './Text';
import { ChevronLeft, Close } from './icons';

/**
 * WooPosToolbar — top bar used across POS screens: optional back button, title (+ optional
 * count/subtitle), and an optional trailing slot. The leading button is a back chevron by
 * default, or a close (X) when `backIcon="close"`.
 */
interface ToolbarProps {
  title: string;
  count?: string;
  onBack?: () => void;
  backIcon?: 'chevron' | 'close';
  trailing?: ReactNode;
}

export function Toolbar({ title, count, onBack, backIcon = 'chevron', trailing }: ToolbarProps) {
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
          aria-label={backIcon === 'close' ? 'Close' : 'Back'}
          style={{
            border: 'none',
            background: 'none',
            display: 'flex',
            padding: 4,
            color: 'var(--color-on-surface)',
            flex: 'none',
          }}
        >
          {backIcon === 'close' ? <Close size="var(--icon-medium)" /> : <ChevronLeft size="var(--icon-medium)" />}
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
