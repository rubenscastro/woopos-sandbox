import type { CSSProperties } from 'react';
import './Shimmer.css';

/** WooPosShimmerBox — an animated skeleton placeholder. */
export function ShimmerBox({ style }: { style?: CSSProperties }) {
  return <div className="woopos-shimmer" style={style} />;
}

/** A single shimmer text line. */
export function ShimmerText({ width = '60%', height = 16 }: { width?: string | number; height?: number }) {
  return <div className="woopos-shimmer" style={{ width, height, borderRadius: 4 }} />;
}
