import type { ReactNode } from 'react';

/**
 * iOS POS button (POSButtonStyle.swift): filled / outlined / tonal variants. Label text is
 * semibold on iOS. Larger corner radius than Material per HIG.
 */
type Variant = 'filled' | 'outlined' | 'tonal';

interface PosButtonProps {
  label: string | ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PosButton({ label, variant = 'filled', fullWidth, disabled, onClick }: PosButtonProps) {
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'var(--size-xsmall)',
    padding: '0 var(--space-lg)',
    width: fullWidth ? '100%' : undefined,
    borderRadius: 'var(--radius-md)',
    font: 'inherit',
    fontWeight: 600,
    fontSize: 'var(--font-body-md-size)',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
  };
  const skin: React.CSSProperties =
    variant === 'filled'
      ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: '2px solid transparent' }
      : variant === 'outlined'
        ? { background: 'transparent', color: 'var(--color-on-surface)', border: '2px solid var(--color-inverse-surface)' }
        : { background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', border: '2px solid transparent' };
  return (
    <button type="button" disabled={disabled} onClick={onClick} style={{ ...base, ...skin }}>
      {label}
    </button>
  );
}
