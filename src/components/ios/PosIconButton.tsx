import type { ReactNode } from 'react';

/**
 * A bare glyph button for a header's leading or trailing slot — back, close, a date filter.
 * No fill, no border: the icon is the target, with just enough padding around it to hit.
 *
 * Separate from `PosButton`, which is a labelled action with a shape of its own. These read as
 * chrome rather than as buttons, which is why the design draws them as a plain 48pt symbol.
 */
export function PosIconButton({
  label,
  onClick,
  children,
}: {
  /** What it announces — these have no visible text. */
  label: string;
  onClick?: () => void;
  /** The glyph, sized by the caller (usually `var(--icon-medium)`). */
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        padding: 'var(--space-xs)',
        border: 'none',
        background: 'none',
        color: 'var(--color-on-surface)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
