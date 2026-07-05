import type { ReactNode } from 'react';
import { Card } from './Card';
import { Text } from './Text';
import { ChevronRight } from './icons';

/** A settings/help list row: title + subtitle, optional leading icon, chevron affordance. */
export function MenuItem({
  title,
  subtitle,
  leading,
  selected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick} selected={selected} padding="var(--space-md)">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {leading && <span style={{ display: 'flex', color: 'var(--color-on-surface)', flex: 'none' }}>{leading}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyLarge" bold>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </div>
        <ChevronRight size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)', flex: 'none' }} />
      </div>
    </Card>
  );
}

/** A read-only info row (label + value) used inside settings cards. */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Text variant="bodyMedium">{label}</Text>
      <Text variant="bodyMedium" color="var(--color-on-surface-variant-lowest)">
        {value}
      </Text>
    </div>
  );
}
