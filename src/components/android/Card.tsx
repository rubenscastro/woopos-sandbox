import type { CSSProperties, ReactNode } from 'react';

/**
 * WooPosCard — base card with the custom WooPOS soft drop shadow (not Material elevation),
 * surfaceContainerLowest background, md radius, and an optional 2px onSurface border when
 * selected. Renders as a button when onClick is provided.
 */
interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  /** 'soft' (list items/chips) or 'normal' (prominent standalone cards). */
  shadow?: 'soft' | 'normal' | 'none';
  padding?: string;
  style?: CSSProperties;
  className?: string;
  ariaLabel?: string;
}

export function Card({
  children,
  onClick,
  selected = false,
  disabled = false,
  shadow = 'soft',
  padding,
  style,
  className,
  ariaLabel,
}: CardProps) {
  const shadowVar =
    shadow === 'none'
      ? 'none'
      : shadow === 'normal'
        ? 'var(--shadow-normal-medium)'
        : 'var(--shadow-soft-medium)';

  const base: CSSProperties = {
    backgroundColor: disabled
      ? 'var(--color-disabled-container)'
      : 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-md)',
    boxShadow: shadowVar,
    border: selected ? '2px solid var(--color-on-surface)' : '2px solid transparent',
    padding,
    boxSizing: 'border-box',
    ...style,
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={className}
        style={{
          ...base,
          display: 'block',
          width: '100%',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={className} style={base} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
