import type { CSSProperties } from 'react';
import './PosGhostBar.css';

/**
 * One placeholder bar in a loading skeleton. Size it to the text it stands in for, so the
 * screen doesn't reflow when the real content arrives.
 */
export function PosGhostBar({ width, height, style }: { width?: number | string; height?: number | string; style?: CSSProperties }) {
  return <span className="pos-ghost-bar" aria-hidden style={{ width, height, ...style }} />;
}
