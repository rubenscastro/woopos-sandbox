/**
 * SF Symbol–style icons for the iOS prototype. Each icon mirrors the corresponding
 * SF Symbol used by the real WooCommerce iOS app: same shape language, consistent
 * 1.5px stroke, rounded caps/joins, 24×24 viewBox.
 */
import type { CSSProperties } from 'react';

interface IconProps {
  size?: string | number;
  style?: CSSProperties;
  className?: string;
}

function base(size?: string | number): CSSProperties {
  return { width: size, height: size, verticalAlign: 'middle', flex: 'none', display: 'inline-block' };
}

/**
 * Navigation and dismiss glyphs — back chevrons and the close ✕ — are heavier than the rest,
 * and span more of the box. They stand in for SF Symbols set at semibold: controls, not
 * hairline ornaments. At the 1.5 stroke every other icon uses they read thin and undersized
 * next to the title beside them.
 */
const NAV_STROKE = 2.75;

const S: React.SVGProps<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

// calendar
export function Calendar({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} width={size} height={size} style={{ ...base(size), ...style }} {...rest}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

// magnifyingglass
export function Search({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" />
    </svg>
  );
}

// plus
export function Plus({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
      <line x1="4.5" y1="12" x2="19.5" y2="12" />
    </svg>
  );
}

// xmark
export function Close({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} strokeWidth={NAV_STROKE} style={{ ...base(size), ...style }} {...rest}>
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
      <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
    </svg>
  );
}

// clock
export function Clock({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.8V12l3.4 2.2" />
    </svg>
  );
}

// person
export function Person({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.5a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

// printer
export function Printer({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M7 9V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5" />
      <path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" rx="1" />
    </svg>
  );
}

// square.and.arrow.down
export function SquareAndArrowDown({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M12 3v11" />
      <polyline points="8 10 12 14 16 10" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

// arrow.backward
export function ArrowBackward({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M20 12H4" />
      <polyline points="10 6 4 12 10 18" />
    </svg>
  );
}

// chevron.left
export function ChevronLeft({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} strokeWidth={NAV_STROKE} style={{ ...base(size), ...style }} {...rest}>
      <polyline points="15 19 8 12 15 5" />
    </svg>
  );
}

// chevron.right
export function ChevronRight({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} strokeWidth={NAV_STROKE} style={{ ...base(size), ...style }} {...rest}>
      <polyline points="9 19 16 12 9 5" />
    </svg>
  );
}

// chevron.down
export function ChevronDown({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// chevron.up
export function ChevronUp({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

// tag — SF Symbol "tag": price-tag shape pointing upper-right, hole near the corner
export function Tag({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * The "Custom amount" entry tile's mark (CustomAmountEntryRow.swift). Two SF Symbols stacked,
 * not one glyph: `tag` at semibold with `plus.circle.fill` at bold hung off its bottom-trailing
 * corner, offset 8 right and 6 down so it overhangs.
 *
 * Geometry is measured off the real symbols rendered at 24pt, not guessed: the tag inks
 * 26.38 × 27.12 and the badge 24.75 across — the badge is nearly as big as the tag, which is
 * the proportion that makes this read correctly. The tag is the diagonal one, point at the
 * bottom-left and punch hole at the top-right; drawing it as a horizontal left-pointing label
 * was what kept it looking wrong.
 *
 * The badge is two-tone, and that is the trick: painting its circle in the colour of whatever
 * the mark sits on knocks a ring out of the tag's outline instead of reading as a disc. The
 * plus is onSurface, and in the real symbol it is a hole through the disc rather than a mark
 * on top of it.
 *
 * That circle takes surfaceDim — the tile's own colour — rather than the surfaceContainerLow
 * the palette nominally names. The two are the same in dark, but in light surfaceContainerLow
 * is white against a #F6F7F7 tile, which shows up as a pale disc instead of disappearing. The
 * knockout is the point, so the colour follows the surface. `--pos-icon-knockout` overrides it
 * wherever the mark is put on something else.
 *
 * SF Symbols can't ship on the web, so these are equivalent paths matched to that target.
 */
export function TagBadgePlus({ size = '27px', style, ...rest }: IconProps) {
  /*
   * The badge is about half the tag across and sits *on* its lower-right edge — that edge is a
   * diagonal, so anchoring to the corner of the tag's bounding box (which is where the symbol's
   * own bottom-trailing alignment puts it) leaves the plus floating in empty space below and to
   * the right of the tag, detached from it.
   *
   * Sizing it to the symbol's measurements — where a 24pt `plus.circle.fill` inks nearly as wide
   * as a 24pt `tag` — bites most of the tag's bottom corner away, and the mark stops reading as
   * a tag with a plus on it.
   */
  /* The lower-right boundary is the diagonal running (14.75, 22.64) → (24.2, 13.2); the badge
     straddles it, a shade to the outside so it overhangs rather than sitting in the tag. */
  const badge = { cx: 21, cy: 17.5, r: 6.2 };
  return (
    <svg
      {...S}
      viewBox="2.1 1.2 26.1 23.5"
      style={{ width: size, height: 'auto', verticalAlign: 'middle', flex: 'none', display: 'inline-block', ...style }}
      {...rest}
    >
      {/* Mirrored so the square corner and its hole sit top-right and the point falls to the
          bottom-left, the way the symbol draws it. Stroke is pre-scale, so 1.7 here lands just
          under 1.9 once the group is scaled. */}
      <g transform="translate(26.4 0) scale(-1 1) scale(1.1)" strokeWidth={1.7}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <circle cx="7" cy="7" r="1.4" fill="currentColor" stroke="none" />
      </g>
      <circle cx={badge.cx} cy={badge.cy} r={badge.r} fill="var(--pos-icon-knockout, var(--color-surface-dim))" stroke="none" />
      {/* Keeps the airier proportion within the badge — the plus spans about two thirds of the
          disc, rather than the short, fat one the symbol measures. */}
      <path
        d={`M${badge.cx} ${badge.cy - 3.1}V${badge.cy + 3.1}M${badge.cx - 3.1} ${badge.cy}H${badge.cx + 3.1}`}
        stroke="var(--color-on-surface)"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

// trash — SF Symbol "trash": can body with two vertical lines inside + handle
export function Trash({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

// barcode.viewfinder — SF Symbol "barcode.viewfinder"
export function Barcode({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      {/* Corner brackets */}
      <path d="M4 9V5.5C4 4.7 4.7 4 5.5 4H9" />
      <path d="M15 4H18.5C19.3 4 20 4.7 20 5.5V9" />
      <path d="M20 15V18.5C20 19.3 19.3 20 18.5 20H15" />
      <path d="M9 20H5.5C4.7 20 4 19.3 4 18.5V15" />
      {/* Barcode lines inside */}
      <line x1="7" y1="8" x2="7" y2="16" />
      <line x1="9" y1="8" x2="9" y2="16" />
      <line x1="11" y1="8" x2="11" y2="16" />
      <line x1="13" y1="8" x2="13" y2="16" />
      <line x1="15.5" y1="8" x2="15.5" y2="16" strokeWidth={2.5} />
      <line x1="17" y1="8" x2="17" y2="16" />
    </svg>
  );
}

// ellipsis (•••) — SF Symbol "ellipsis"
export function DotsHorizontal({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

// doc.text — SF Symbol "doc.text"
export function Description({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
}

// gearshape — SF Symbol "gearshape": 8-lobe gear with centre circle
export function SettingsFilled({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// rectangle.portrait.and.arrow.right — SF Symbol "rectangle.portrait.and.arrow.right"
export function ExitToApp({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// exclamationmark.triangle — SF Symbol "exclamationmark.triangle"
export function ErrorX({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

// checkmark — SF Symbol "checkmark"
export function Check({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <polyline points="20 6 9 17 4 12" strokeWidth={2} />
    </svg>
  );
}

// questionmark.circle — SF Symbol "questionmark.circle"
// info.circle
export function InfoCircle({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <line x1="12" y1="7.5" x2="12.01" y2="7.5" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export function HelpCircle({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

// cart — SF Symbol "cart"
export function Cart({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <circle cx="9" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="20" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

// cart.badge.plus — SF Symbol "cart.badge.plus"
export function AddShoppingCart({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <circle cx="8" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <path d="M1 1h3.5L6.5 12.5a2 2 0 0 0 2 1.5h8.5a2 2 0 0 0 2-1.5L21 5H5.5" />
      <line x1="17" y1="1" x2="17" y2="6" />
      <line x1="14.5" y1="3.5" x2="19.5" y2="3.5" />
    </svg>
  );
}

// shippingbox — SF Symbol "shippingbox"
export function Inventory({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
      <line x1="8" y1="4.5" x2="16" y2="9" />
    </svg>
  );
}

// creditcard — SF Symbol "creditcard"
export function CreditCard({ size, style, ...rest }: IconProps) {
  return (
    <svg {...S} style={{ ...base(size), ...style }} {...rest}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
