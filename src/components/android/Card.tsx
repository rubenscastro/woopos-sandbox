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
  const dropShadow =
    shadow === 'none'
      ? null
      : shadow === 'normal'
        ? 'var(--shadow-normal-medium)'
        : 'var(--shadow-soft-medium)';
  // Selection ring drawn as an inset shadow (not border/outline) so it never takes up
  // layout space — matches WooPosCard.kt's Modifier.border(), which draws inside the
  // existing bounds rather than growing the box.
  const selectionRing = selected ? 'inset 0 0 0 2px var(--color-on-surface)' : null;

  const base: CSSProperties = {
    backgroundColor: disabled
      ? 'var(--color-disabled-container)'
      : 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-md)',
    boxShadow: [selectionRing, dropShadow].filter(Boolean).join(', ') || 'none',
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
          border: 'none',
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
