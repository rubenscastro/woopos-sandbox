import type { ReactNode } from 'react';
import { Text } from './Text';
import { ArrowBack, Close } from './icons';

/**
 * WooPosToolbar — top bar used across POS screens: optional back button, title (+ optional
 * count/subtitle), and an optional trailing slot. The leading button is a back arrow
 * (WooPosBackButton / ic_back_24dp) by default, or a close (X) when `backIcon="close"`.
 */
interface ToolbarProps {
  title: string;
  count?: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: 'arrow' | 'close';
  trailing?: ReactNode;
}

export function Toolbar({ title, count, subtitle, onBack, backIcon = 'arrow', trailing }: ToolbarProps) {
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
          {backIcon === 'close' ? <Close size="var(--icon-medium)" /> : <ArrowBack size="var(--icon-medium)" />}
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', minWidth: 0 }}>
          <Text variant="heading" bold style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </Text>
          {count && (
            <Text variant="bodySmall" color="var(--color-on-surface-variant-lowest)">
              {count}
            </Text>
          )}
        </div>
        {subtitle && (
          <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
            {subtitle}
          </Text>
        )}
      </div>
      {trailing}
    </div>
  );
}
