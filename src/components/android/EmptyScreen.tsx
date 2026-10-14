import type { ReactNode } from 'react';
import { Text } from './Text';
import { Button } from './Button';

/**
 * WooPosEmptyScreen — centered icon (Small component size, 50% opacity) + title + message,
 * with an optional action button. Used for empty product/coupon/order lists.
 */
interface EmptyScreenProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyScreen({ icon, title, message, action }: EmptyScreenProps) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-xl)',
        gap: 'var(--space-md)',
      }}
    >
      <div style={{ opacity: 0.5, color: 'var(--color-on-surface-variant-lowest)', display: 'flex' }}>
        {icon}
      </div>
      <Text variant="bodyLarge" bold align="center">
        {title}
      </Text>
      <Text
        variant="bodyMedium"
        align="center"
        color="var(--color-on-surface-variant-highest)"
        style={{ maxWidth: 420, whiteSpace: 'pre-line' }}
      >
        {message}
      </Text>
      {action && (
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <Button text={action.label} size="small" onClick={action.onClick} />
        </div>
      )}
    </div>
  );
}
