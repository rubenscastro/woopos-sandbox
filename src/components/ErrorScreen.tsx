import type { ReactNode } from 'react';
import { Text } from './Text';
import { Button, OutlinedButton, type ButtonState } from './Button';
import { ErrorX } from './icons';

export interface ErrorScreenButton {
  text: string;
  onClick: () => void;
  state?: ButtonState;
}

interface ErrorScreenProps {
  message: string;
  reason: string;
  icon?: ReactNode;
  primaryButton?: ErrorScreenButton;
  secondaryButton?: ErrorScreenButton;
}

/**
 * Mirrors WooPosErrorScreen — centered icon (Small component size, 80px) + heading +
 * body reason, with an optional primary + secondary full-screen-width button stack.
 */
export function ErrorScreen({
  message,
  reason,
  icon,
  primaryButton,
  secondaryButton,
}: ErrorScreenProps) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl)',
      }}
    >
      <div style={{ width: 'var(--icon-size, var(--size-small))', display: 'flex' }}>
        {icon ?? <ErrorX size="var(--size-small)" />}
      </div>

      <div style={{ height: 'var(--space-xl)' }} />
      <Text variant="heading" bold align="center">
        {message}
      </Text>

      <div style={{ height: 'var(--space-md)' }} />
      <Text
        variant="bodyLarge"
        align="center"
        color="var(--color-on-surface)"
        style={{ maxWidth: 640 }}
      >
        {reason}
      </Text>

      <div style={{ height: 'var(--space-xxl)' }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-md)',
          width: '100%',
          maxWidth: 520,
        }}
      >
        {primaryButton && (
          <Button
            text={primaryButton.text}
            onClick={primaryButton.onClick}
            state={primaryButton.state}
            fullWidth
          />
        )}
        {secondaryButton && (
          <OutlinedButton
            text={secondaryButton.text}
            onClick={secondaryButton.onClick}
            state={secondaryButton.state}
            fullWidth
          />
        )}
      </div>
    </div>
  );
}
