import { useState, type ReactNode } from 'react';
import { productPhotos } from '../../mocks/android/products';

/**
 * Generated product imagery: a themed colored tile with a simple glyph per product, so the
 * catalog shows distinct "photos" instead of a generic placeholder. Keyed by product id;
 * unknown ids fall back to a hue derived from the id + a box glyph.
 */
type GlyphKey =
  | 'shirt' | 'pants' | 'scarf' | 'belt' | 'jacket' | 'cap'
  | 'socks' | 'shoe' | 'giftcard' | 'tote' | 'dress' | 'hoodie' | 'box';

const ART: Record<number, { bg: string; glyph: GlyphKey }> = {
  1: { bg: '#C2410C', glyph: 'shirt' }, // Cotton Crew T-Shirt
  2: { bg: '#3F3F46', glyph: 'pants' }, // Slim Fit Jeans
  3: { bg: '#0E7490', glyph: 'scarf' }, // Wool Blend Scarf
  4: { bg: '#7C2D12', glyph: 'belt' }, // Leather Belt
  5: { bg: '#1D4ED8', glyph: 'jacket' }, // Denim Jacket
  6: { bg: '#2563EB', glyph: 'cap' }, // Baseball Cap
  7: { bg: '#0D9488', glyph: 'socks' }, // Wool Socks
  8: { bg: '#DB2777', glyph: 'shoe' }, // Running Sneakers
  9: { bg: '#CA8A04', glyph: 'giftcard' }, // Store Gift Card
  10: { bg: '#65A30D', glyph: 'tote' }, // Canvas Tote Bag
  11: { bg: '#B45309', glyph: 'dress' }, // Striped Cotton Dress
  12: { bg: '#0891B2', glyph: 'hoodie' }, // Zip-Up Hoodie
};

const S = { stroke: 'rgba(255,255,255,0.95)', strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const GLYPHS: Record<GlyphKey, ReactNode> = {
  shirt: (
    <>
      <path d="M17 11l7-3 4 4 4-4 7 3 4 8-6 3v16a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2V22l-6-3z" {...S} />
    </>
  ),
  pants: (
    <>
      <path d="M16 9h16l1 8-1 21a2 2 0 0 1-2 2h-2.5l-1.5-17-1.5 17H22a2 2 0 0 1-2-2l-1-21z" {...S} />
      <path d="M17 17h14" {...S} />
    </>
  ),
  scarf: (
    <>
      <path d="M11 16c6 4 20-6 26 0" {...S} />
      <path d="M11 24c6 4 20-6 26 0" {...S} />
      <path d="M11 16v8M12 16l-1 6M14 17l-1 6" {...S} />
      <path d="M37 16v8M36 16l1 6M34 17l1 6" {...S} />
    </>
  ),
  belt: (
    <>
      <path d="M8 22h13" {...S} />
      <path d="M27 22h13" {...S} />
      <rect x="16" y="14" width="16" height="16" rx="3" {...S} />
      <circle cx="24" cy="22" r="2.4" fill="rgba(255,255,255,0.95)" />
    </>
  ),
  jacket: (
    <>
      <path d="M16 10l8-3 8 3 8 7-5 5-3-3v18a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V19l-3 3-5-5z" {...S} />
      <path d="M24 9v29" {...S} />
    </>
  ),
  cap: (
    <>
      <path d="M10 26a14 8 0 0 1 28 0z" {...S} />
      <path d="M8 26h9l3-3h8l3 3h5" {...S} />
    </>
  ),
  socks: (
    <>
      <path d="M19 8h10v17l8 10a3 3 0 0 1-2 5H21a3 3 0 0 1-3-3V8z" {...S} />
      <path d="M19 25h10" {...S} />
    </>
  ),
  shoe: (
    <>
      <path d="M8 33c0-4 3-6 7-8l10-6 3 3 8-1 6 6c1 3-1 6-4 6H10a2 2 0 0 1-2-2z" {...S} />
      <path d="M25 19l1 6M30 20l0 6" {...S} />
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
  dress: (
    <>
      <path d="M20 9h8l2 8-3 2 3 3-3 17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2l-3-17 3-3-3-2z" {...S} />
    </>
  ),
  hoodie: (
    <>
      <path d="M16 20a8 8 0 0 1 16 0l4 3-3 4-2-1v13a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2V26l-2 1-3-4z" {...S} />
      <path d="M22 21a2 2 0 0 0 4 0" {...S} />
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
