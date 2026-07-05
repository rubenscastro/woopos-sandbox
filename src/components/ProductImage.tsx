import { useState, type ReactNode } from 'react';
import { productPhotos } from '../mocks/products';

/**
 * Generated product imagery: a themed colored tile with a simple glyph per product, so the
 * catalog shows distinct "photos" instead of a generic placeholder. Keyed by product id;
 * unknown ids fall back to a hue derived from the id + a box glyph.
 */
type GlyphKey =
  | 'cup' | 'canister' | 'filter' | 'beans' | 'scissors' | 'mug'
  | 'bottle' | 'dripper' | 'giftcard' | 'tote' | 'box';

const ART: Record<number, { bg: string; glyph: GlyphKey }> = {
  1: { bg: '#C2410C', glyph: 'cup' }, // Cup
  2: { bg: '#3F3F46', glyph: 'canister' }, // Coffee Container
  3: { bg: '#0E7490', glyph: 'filter' }, // Paper Filter
  4: { bg: '#7C2D12', glyph: 'beans' }, // Espresso Beans
  5: { bg: '#9333EA', glyph: 'scissors' }, // Women's Haircut
  6: { bg: '#2563EB', glyph: 'mug' }, // Ceramic Mug
  7: { bg: '#0D9488', glyph: 'bottle' }, // Cold Brew Bottle
  8: { bg: '#DB2777', glyph: 'dripper' }, // Hario V60
  9: { bg: '#CA8A04', glyph: 'giftcard' }, // Gift Card
  10: { bg: '#65A30D', glyph: 'tote' }, // Canvas Tote
  11: { bg: '#B45309', glyph: 'cup' }, // Drip Coffee
  12: { bg: '#0891B2', glyph: 'mug' }, // Flat White
};

const S = { stroke: 'rgba(255,255,255,0.95)', strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const GLYPHS: Record<GlyphKey, ReactNode> = {
  cup: (
    <>
      <path d="M16 16h16l-2 22a3 3 0 0 1-3 2.6h-6a3 3 0 0 1-3-2.6z" {...S} />
      <path d="M15 16h18" {...S} />
      <path d="M22 10c0 2-2 2-2 4M28 10c0 2-2 2-2 4" {...S} />
    </>
  ),
  canister: (
    <>
      <rect x="15" y="17" width="18" height="22" rx="3" {...S} />
      <rect x="17" y="11" width="14" height="6" rx="2" {...S} />
      <path d="M19 24h10" {...S} />
    </>
  ),
  filter: (
    <>
      <path d="M13 15h22l-9 12v9l-4 2v-11z" {...S} />
      <path d="M18 20h12" {...S} />
    </>
  ),
  beans: (
    <>
      <ellipse cx="20" cy="24" rx="6" ry="9" transform="rotate(-25 20 24)" {...S} />
      <path d="M20 16c-2 4-2 12 0 16" {...S} />
      <ellipse cx="29" cy="30" rx="6" ry="9" transform="rotate(-25 29 30)" {...S} />
      <path d="M29 22c-2 4-2 12 0 16" {...S} />
    </>
  ),
  scissors: (
    <>
      <circle cx="16" cy="32" r="4" {...S} />
      <circle cx="16" cy="16" r="4" {...S} />
      <path d="M19 18l15 14M19 30L34 16" {...S} />
    </>
  ),
  mug: (
    <>
      <path d="M15 16h14v20a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3z" {...S} />
      <path d="M29 20h4a4 4 0 0 1 0 10h-4" {...S} />
    </>
  ),
  bottle: (
    <>
      <path d="M21 10h6v5l3 5v18a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V20l3-5z" {...S} />
      <path d="M18 27h12" {...S} />
    </>
  ),
  dripper: (
    <>
      <path d="M13 14h22l-8 14h-6z" {...S} />
      <path d="M21 28h6v6h-6z" {...S} />
      <path d="M17 39h14" {...S} />
    </>
  ),
  giftcard: (
    <>
      <rect x="12" y="16" width="24" height="16" rx="3" {...S} />
      <path d="M12 22h24" {...S} />
      <path d="M28 26h4" {...S} />
    </>
  ),
  tote: (
    <>
      <path d="M15 18h18l-2 20H17z" {...S} />
      <path d="M21 18v-2a3 3 0 0 1 6 0v2" {...S} />
    </>
  ),
  box: (
    <>
      <path d="M24 12l11 6v14l-11 6-11-6V18z" {...S} />
      <path d="M13 18l11 6 11-6M24 24v14" {...S} />
    </>
  ),
};

function hueFromId(id: number): string {
  return `hsl(${(id * 47) % 360} 45% 42%)`;
}

export function ProductImage({ id, radius = '0' }: { id: number; radius?: string }) {
  const a = ART[id] ?? { bg: hueFromId(id), glyph: 'box' as GlyphKey };
  const photo = productPhotos[id];
  const [failed, setFailed] = useState(false);

  // Real product photo, with the themed glyph tile as a graceful fallback if it can't load.
  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: radius, display: 'block' }}
      />
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: a.bg,
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 48 48" width="58%" height="58%" style={{ maxWidth: 64, maxHeight: 64 }}>
        {GLYPHS[a.glyph]}
      </svg>
    </div>
  );
}
