import type { ReactNode } from 'react';

/**
 * iOS POS button (POSButtonStyle.swift): filled / outlined / tonal variants in the DS's three
 * sizes. Label text is semibold on iOS. Larger corner radius than Material per HIG.
 */
type Variant = 'filled' | 'outlined' | 'tonal';

/**
 * `normal` is the page-level action; `extraSmall` is the one that sits in a header next to a
 * title (Issue refund, Close session); `compact` is smaller again and rounds tighter.
 * Sizes come straight from POSButtonSize — font, padding and corner radius each step down.
 */
type Size = 'normal' | 'extraSmall' | 'compact';

const SIZES: Record<Size, { font: string; minHeight: string; padding: string; radius: string }> = {
  // Matches Android's WooPosButton (80px tablet) — `.normal` uses bodyLargeBold + large
  // padding to reach the same height; --size-xsmall (56px) is the circular icon-button
  // diameter, not the standard button height.
  normal: {
    font: 'var(--font-body-lg-size)',
    minHeight: 'var(--size-small)',
    padding: '0 var(--space-lg)',
    radius: 'var(--radius-md)',
  },
  extraSmall: {
    font: 'var(--font-body-md-size)',
    minHeight: 'var(--size-xxsmall)',
    padding: 'var(--space-sm) var(--space-md)',
    radius: 'var(--radius-md)',
  },
  compact: {
    font: 'var(--font-body-sm-size)',
    minHeight: 'var(--size-xxsmall)',
    padding: 'var(--space-sm) var(--space-md)',
    radius: 'var(--radius-sm)',
  },
};

interface PosButtonProps {
  label: string | ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PosButton({
  label,
  variant = 'filled',
  size = 'normal',
  fullWidth,
  disabled,
  onClick,
}: PosButtonProps) {
  const s = SIZES[size];
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
    minHeight: s.minHeight,
    padding: s.padding,
    width: fullWidth ? '100%' : undefined,
    borderRadius: s.radius,
    font: 'inherit',
    fontWeight: 600,
    fontSize: s.font,
    whiteSpace: 'nowrap',
    cursor: disabled ? 'default' : 'pointer',
  };
  // Disabled is its own fill, not a faded enabled one: POSButtonStyle's backgroundColor /
  // foregroundColor / borderOverlay all swap to the disabled-container pair.
  const skin: React.CSSProperties = disabled
    ? {
        background: variant === 'outlined' ? 'transparent' : 'var(--color-disabled-container)',
        color: 'var(--color-on-disabled-container)',
        border: `2px solid ${variant === 'outlined' ? 'var(--color-disabled-container)' : 'transparent'}`,
      }
    : variant === 'filled'
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
