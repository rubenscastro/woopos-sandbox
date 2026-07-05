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
