import type { ReactNode } from 'react';
import { PosText } from '../../../ios/PosText';
import './Link.css';

/**
 * `Link` from the POS Design System (POS Design System 3319:809) — the row used to build the
 * navigation drawer.
 *
 * Props mirror the Figma component exactly: `alignment`, `leftIcon`, `rightIcon`, `state`.
 *
 * | state     | background                | when                                          |
 * |-----------|---------------------------|-----------------------------------------------|
 * | `default` | transparent               | resting                                       |
 * | `focus`   | `--color-surface-bright`  | keyboard focus                                |
 * | `active`  | `--color-surface-dim`     | pressed, or pinned as the current destination  |
 *
 * Focus and Active are interaction states, so they live in `Link.css` as `:focus-visible` and
 * `:active` rather than being driven from React. The `state` prop *pins* one on regardless of
 * interaction — that's how the drawer marks the page you're on, matching the composed design
 * where the current row carries the Active background at rest. There is no hover state; the
 * component defines three, and hover is not one of them.
 *
 * Box: 8px gap, 16px padding, 8px radius, 32px icon, body-large bold label.
 *
 * One deliberate deviation: the design binds the label to `--error-and-success/on-default`,
 * which resolves to the same #101517 as `--surface/on-surface`. That reads as a mis-bound
 * token in the library rather than intent, so the label uses `--color-on-surface` here — it's
 * the value the design renders, and it keeps working when the theme flips to dark.
 */
export type LinkAlignment = 'left' | 'center' | 'right';
export type LinkState = 'default' | 'focus' | 'active';

export interface LinkProps {
  label: string;
  /** Rendered at 32px on the leading edge. Omit to hide, matching `leftIcon = false`. */
  leftIcon?: ReactNode;
  /** Rendered at 32px on the trailing edge. Off by default, matching the Figma default. */
  rightIcon?: ReactNode;
  alignment?: LinkAlignment;
  state?: LinkState;
  onClick?: () => void;
  /** Marks the row as the current destination for assistive tech (visual = `state="active"`). */
  current?: boolean;
}

export function Link({
  label,
  leftIcon,
  rightIcon,
  alignment = 'left',
  state = 'default',
  onClick,
  current = false,
}: LinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
      className={`pos-link pos-link--${alignment}${state === 'default' ? '' : ` is-${state}`}`}
    >
      {leftIcon && <LinkIcon>{leftIcon}</LinkIcon>}
      <PosText variant="bodyLarge" bold>
        {label}
      </PosText>
      {rightIcon && <LinkIcon>{rightIcon}</LinkIcon>}
    </button>
  );
}

function LinkIcon({ children }: { children: ReactNode }) {
  return <span className="pos-link__icon">{children}</span>;
}
