import type { SVGProps } from 'react';

/**
 * Icon set mirroring WooPosIcons. Icons inherit `currentColor` unless a color is set,
 * and default to icon-size Small (24px) via the `size` prop token.
 */
interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: string;
}

function base(size: string | undefined) {
  return { width: size ?? 'var(--icon-small)', height: size ?? 'var(--icon-small)' };
}

/** Circle-with-X error mark used on eligibility & error screens. */
export function ErrorX({ size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...base(size)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="var(--color-error)" />
      <path
        d="M8.5 8.5l7 7M15.5 8.5l-7 7"
        stroke="var(--color-on-error)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Search({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRight({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDown({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronLeft({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Matches the real app's R.drawable.ic_back_24dp (WooPosBackButton) — a full horizontal
 *  back arrow (shaft + arrowhead), not just a chevron corner. */
export function ArrowBack({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M19 12H5M11 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Close({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Plus({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Minus({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Box / inventory placeholder for product images with no photo. */
export function Inventory({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M3 7l9-4 9 4v10l-9 4-9-4V7z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M3 7l9 4 9-4M12 11v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Matches the real app's R.drawable.ic_sell_24dp (Material "Sell") — a price tag pointing
 *  to the bottom-right with a hole near the blunt top-left corner. */
export function Tag({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="7" cy="7" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Matches the real app's R.drawable.ic_delete_24dp (Material "Delete") — a straight-sided
 *  bin with only the bottom corners rounded, and two internal vertical lines. */
export function Trash({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7v12a2 2 0 002 2h8a2 2 0 002-2V7M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Card({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 9h20" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Cash({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function QrCode({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14h3v3M21 14v7h-7v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Check({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 72 78" fill="currentColor" {...base(size)} {...props}>
      <path d="M26.5 77.1 L0.81 38.21 L8.32 33.25 L26.3 60.47 L64.08 0.19 L71.71 4.97 Z" />
    </svg>
  );
}

export function Email({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Receipt({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 8h8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Gear({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** ic_barcode — corner brackets + bars (from the repo). */
export function Barcode({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path d="M22,7H20V4H17V2H22V7ZM22,22V17H20V20H17V22H22ZM2,22H7V20H4V17H2V22ZM2,2V7H4V4H7V2H2Z" fill="currentColor" />
      <path d="M6,16V8H8V16H6Z" fill="currentColor" />
      <path d="M9.5,16V8H11.5V16H9.5Z" fill="currentColor" />
      <path d="M13,16V8H15V16H13Z" fill="currentColor" />
      <path d="M16.5,16V8H18.5V16H16.5Z" fill="currentColor" />
    </svg>
  );
}

/** ic_add_shopping_cart_24dp — Material add-to-cart cart (from the repo). */
export function AddShoppingCart({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 960 960" fill="none" {...base(size)} {...props}>
      <path
        fill="currentColor"
        d="M440,360L440,240L320,240L320,160L440,160L440,40L520,40L520,160L640,160L640,240L520,240L520,360L440,360ZM280,880Q247,880 223.5,856.5Q200,833 200,800Q200,767 223.5,743.5Q247,720 280,720Q313,720 336.5,743.5Q360,767 360,800Q360,833 336.5,856.5Q313,880 280,880ZM680,880Q647,880 623.5,856.5Q600,833 600,800Q600,767 623.5,743.5Q647,720 680,720Q713,720 736.5,743.5Q760,767 760,800Q760,833 736.5,856.5Q713,880 680,880ZM40,160L40,80L171,80L341,440L621,440Q621,440 621,440Q621,440 621,440L777,160L868,160L692,478Q681,498 662.5,509Q644,520 622,520L324,520L280,600Q280,600 280,600Q280,600 280,600L760,600L760,680L280,680Q235,680 211.5,641Q188,602 210,562L264,464L120,160L40,160Z"
      />
    </svg>
  );
}

/** ic_description_filled_24dp — Orders menu item. */
export function Description({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 960 960" fill="none" {...base(size)} {...props}>
      <path
        fill="currentColor"
        d="M320,720L640,720L640,640L320,640L320,720ZM320,560L640,560L640,480L320,480L320,560ZM240,880Q207,880 183.5,856.5Q160,833 160,800L160,160Q160,127 183.5,103.5Q207,80 240,80L560,80L800,320L800,800Q800,833 776.5,856.5Q753,880 720,880L240,880ZM520,360L720,360L520,160L520,360Z"
      />
    </svg>
  );
}

/** ic_settings_filled_24dp — Settings menu item. */
export function SettingsFilled({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 960 960" fill="none" {...base(size)} {...props}>
      <path
        fill="currentColor"
        d="M370,880L354,752Q341,747 329.5,740Q318,733 307,725L188,775L78,585L181,507Q180,500 180,493.5Q180,487 180,480Q180,473 180,466.5Q180,460 181,453L78,375L188,185L307,235Q318,227 330,220Q342,213 354,208L370,80L590,80L606,208Q619,213 630.5,220Q642,227 653,235L772,185L882,375L779,453Q780,460 780,466.5Q780,473 780,480Q780,487 780,493.5Q780,500 778,507L881,585L771,775L653,725Q642,733 630,740Q618,747 606,752L590,880L370,880ZM482,620Q540,620 581,579Q622,538 622,480Q622,422 581,381Q540,340 482,340Q423,340 382.5,381Q342,422 342,480Q342,538 382.5,579Q423,620 482,620Z"
      />
    </svg>
  );
}

/** ic_exit_to_app_24dp — Exit POS menu item. */
export function ExitToApp({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 960 960" fill="none" {...base(size)} {...props}>
      <path
        fill="currentColor"
        d="M200,840Q167,840 143.5,816.5Q120,793 120,760L120,600L200,600L200,760Q200,760 200,760Q200,760 200,760L760,760Q760,760 760,760Q760,760 760,760L760,200Q760,200 760,200Q760,200 760,200L200,200Q200,200 200,200Q200,200 200,200L200,360L120,360L120,200Q120,167 143.5,143.5Q167,120 200,120L760,120Q793,120 816.5,143.5Q840,167 840,200L840,760Q840,793 816.5,816.5Q793,840 760,840L200,840ZM420,680L364,622L466,520L120,520L120,440L466,440L364,338L420,280L620,480L420,680Z"
      />
    </svg>
  );
}

export function TabletIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function PhoneIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function Sun({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Moon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Material "edit_square" (supplied asset) — a square with a pencil; the custom amount glyph. */
export function EditSquare({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H11.525C11.8583 3 12.1083 3.10417 12.275 3.3125C12.4417 3.52083 12.525 3.75 12.525 4C12.525 4.25 12.4375 4.47917 12.2625 4.6875C12.0875 4.89583 11.8333 5 11.5 5H5V19H19V12.475C19 12.1417 19.1042 11.8917 19.3125 11.725C19.5208 11.5583 19.75 11.475 20 11.475C20.25 11.475 20.4792 11.5583 20.6875 11.725C20.8958 11.8917 21 12.1417 21 12.475V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM9 14V11.575C9 11.3083 9.05 11.0542 9.15 10.8125C9.25 10.5708 9.39167 10.3583 9.575 10.175L18.175 1.575C18.375 1.375 18.6 1.225 18.85 1.125C19.1 1.025 19.35 0.974998 19.6 0.974998C19.8667 0.974998 20.1208 1.025 20.3625 1.125C20.6042 1.225 20.825 1.375 21.025 1.575L22.425 3C22.6083 3.2 22.75 3.42083 22.85 3.6625C22.95 3.90417 23 4.15 23 4.4C23 4.65 22.9542 4.89583 22.8625 5.1375C22.7708 5.37917 22.625 5.6 22.425 5.8L13.825 14.4C13.6417 14.5833 13.4292 14.7292 13.1875 14.8375C12.9458 14.9458 12.6917 15 12.425 15H10C9.71667 15 9.47917 14.9042 9.2875 14.7125C9.09583 14.5208 9 14.2833 9 14ZM11 13H12.4L18.2 7.2L17.5 6.5L16.775 5.8L11 11.575V13Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Material "add_shopping_cart" (supplied asset, path verbatim) — the custom amount glyph in the cart. */
export function CartBadgePlus({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M11 9V6H8V4H11V1H13V4H16V6H13V9H11ZM5.5875 21.4125C5.19583 21.0208 5 20.55 5 20C5 19.45 5.19583 18.9792 5.5875 18.5875C5.97917 18.1958 6.45 18 7 18C7.55 18 8.02083 18.1958 8.4125 18.5875C8.80417 18.9792 9 19.45 9 20C9 20.55 8.80417 21.0208 8.4125 21.4125C8.02083 21.8042 7.55 22 7 22C6.45 22 5.97917 21.8042 5.5875 21.4125ZM15.5875 21.4125C15.1958 21.0208 15 20.55 15 20C15 19.45 15.1958 18.9792 15.5875 18.5875C15.9792 18.1958 16.45 18 17 18C17.55 18 18.0208 18.1958 18.4125 18.5875C18.8042 18.9792 19 19.45 19 20C19 20.55 18.8042 21.0208 18.4125 21.4125C18.0208 21.8042 17.55 22 17 22C16.45 22 15.9792 21.8042 15.5875 21.4125ZM1 4V2H4.275L8.525 11H15.525L19.425 4H21.7L17.3 11.95C17.1167 12.2833 16.8708 12.5417 16.5625 12.725C16.2542 12.9083 15.9167 13 15.55 13H8.1L7 15H19V17H7C6.25 17 5.67917 16.675 5.2875 16.025C4.89583 15.375 4.88333 14.7167 5.25 14.05L6.6 11.6L3 4H1Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Three vertical dots — the floating menu button glyph. */
export function DotsVertical({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <circle cx="12" cy="5" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="19" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** Circled question mark — the Get help and support entry. */
export function HelpCircle({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.6 9.3a2.5 2.5 0 0 1 4.9.7c0 1.7-2.5 2-2.5 3.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function DotsHorizontal({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <circle cx="5" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="19" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** Three horizontal lines — the floating toolbar's Menu button. */
export function Hamburger({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Receipt printer glyph — used by the Receipt printer tool and printer system events. */
export function Printer({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path d="M6 9V4h12v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="3" y="9" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6" y="14" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Globe — general connectivity (online/offline) system events. */
export function Globe({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M4.5 7.5h15M4.5 16.5h15" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** Circular refresh arrows — update / sync system events. */
export function Refresh({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5M19.5 12a7.5 7.5 0 0 1-12.6 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M17.5 3.5v3.5H14M6.5 20.5V17H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 2x2 grid — catalog/store system events. */
export function Grid({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
