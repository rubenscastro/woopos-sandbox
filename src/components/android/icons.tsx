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

export function Tag({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M3 12l9-9 9 9-9 9-9-9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function Trash({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13"
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
    <svg viewBox="0 0 24 24" fill="none" {...base(size)} {...props}>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
