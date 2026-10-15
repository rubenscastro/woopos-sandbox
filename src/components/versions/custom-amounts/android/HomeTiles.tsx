import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Text } from '../../../android/Text';
import { Trash } from '../../../android/icons';
import { ProductListItem } from '../../../android/ProductListItem';
import { CouponCard } from '../../../android/CouponCard';
import { useHomeEdit, removeHomeTile, removeProductTile, setHomeOrder, type HomeTileId } from '../../../../state/homeEdit';
import { formatUsd } from '../../../../lib/currency';
import { products, type MockProduct } from '../../../../mocks/android/products';
import { coupons, type MockCoupon } from '../../../../mocks/android/coupons';
import '../CustomAmountFlow.css';
import { AddTilePage } from './AddTilePage';
import { useIsPhone } from '../../../../hooks/useBreakpoint';
import customAmountArt from '../../../../assets/shared/home-tab/custom-amount.svg';
import applyCouponArt from '../../../../assets/shared/home-tab/apply-coupon.svg';
import addStaffArt from '../../../../assets/shared/home-tab/add-staff.svg';
import addTileArt from '../../../../assets/shared/home-tab/add-tile.svg';
import customAmountArtDark from '../../../../assets/shared/home-tab/custom-amount-dark.svg';
import applyCouponArtDark from '../../../../assets/shared/home-tab/apply-coupon-dark.svg';
import addStaffArtDark from '../../../../assets/shared/home-tab/add-staff-dark.svg';
import moneyDisabledArt from '../../../../assets/shared/home-tab/custom-amount-disabled.svg';
import moneyDisabledArtDark from '../../../../assets/shared/home-tab/custom-amount-disabled-dark.svg';
import couponDisabledArt from '../../../../assets/shared/home-tab/coupon-disabled.svg';
import couponDisabledArtDark from '../../../../assets/shared/home-tab/coupon-disabled-dark.svg';
import staffDisabledArt from '../../../../assets/shared/home-tab/add-staff-disabled.svg';
import staffDisabledArtDark from '../../../../assets/shared/home-tab/add-staff-disabled-dark.svg';
import addTileArtDark from '../../../../assets/shared/home-tab/add-tile-dark.svg';
import { useIsDark } from '../../../../hooks/useIsDark';

/**
 * Home tab proposal — Android Home tab: a grid of action tiles (Figma: POS Playground, node
 * 4305-40836). Custom amount (the custom amount details) and Apply coupon (the Coupons tab) are wired; "Add staff to sale" and "Add tile" are
 * shown but not interactive — the design gives them no behavior. The tile square colors are
 * `surface-dim` (illustration square), `surface-container-lowest` (label area), `on-surface` (label)
 * and `outline-variant` (the dashed Add tile's border) — the same tokens as the coupon card in the
 * list, so both themes follow. The Add
 * tile's label is Gray 20 (#a7aaad), which is not in DESIGN.md's tokens, so it is written out here.
 */
export function HomeTiles({
  onCustomAmount,
  onApplyCoupon,
  onProduct,
  onCoupon,
  clearBottom,
}: {
  onCustomAmount: () => void;
  onApplyCoupon: () => void;
  /** A product tile was tapped — the Products tab's own behavior (a variable product opens its variations). */
  onProduct: (p: MockProduct) => void;
  /** A coupon tile was tapped — the Coupons tab's own behavior (apply it). */
  onCoupon: (c: MockCoupon) => void;
  /** Tablet: keep the grid clear of the floating menu / reader pill. */
  clearBottom?: boolean;
}) {
  const isPhone = useIsPhone();
  const { editing, hidden, productTiles, order } = useHomeEdit();
  const [addOpen, setAddOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; startX: number; startY: number; px: number; py: number; startLeft: number; startTop: number; moved: boolean } | null>(null);
  const slots = useRef<Record<string, { left: number; top: number }>>({});
  const wasEditing = useRef(editing);
  const slotEl = (id: string) => gridRef.current?.querySelector<HTMLElement>(`[data-tile-id="${id}"]`) ?? null;

  // Every tile on the page as a unit with a stable id, in the saved order (new ones follow).
  const units: { id: string; render: (index: number) => ReactNode }[] = [];
  if (!hidden.includes('custom-amount')) units.push({ id: 'custom-amount', render: (i) => <Tile key="custom-amount" id="custom-amount" index={i} editing={editing} hidden={hidden} label="Custom amount" bg="var(--color-surface-dim)" art={<TileArt id="custom-amount" />} onClick={onCustomAmount} /> });
  if (!hidden.includes('apply-coupon')) units.push({ id: 'apply-coupon', render: (i) => <Tile key="apply-coupon" id="apply-coupon" index={i} editing={editing} hidden={hidden} label="Apply coupon" bg="var(--color-surface-dim)" art={<TileArt id="apply-coupon" />} onClick={onApplyCoupon} /> });
  if (!hidden.includes('add-staff')) units.push({ id: 'add-staff', render: (i) => <Tile key="add-staff" id="add-staff" index={i} editing={editing} hidden={hidden} label="Add staff to sale" bg="var(--color-surface-dim)" art={<TileArt id="add-staff" />} /> });
  // A product's variations are grouped into one tile: the same card as the Products tab, tapped the same way.
  groupProducts(productTiles.filter((k) => !k.startsWith('c:'))).forEach(({ product, keys }) =>
    units.push({ id: `g:${product.id}`, render: (i) => <Tile key={`g:${product.id}`} id="custom-amount" index={i} editing={editing} hidden={[]} label={product.name} bg="" art={null} onRemove={() => keys.forEach(removeProductTile)} card={CARD(product, () => onProduct(product))} /> }),
  );
  productTiles.filter((k) => k.startsWith('c:')).forEach((key) => {
    const c = coupons.find((x) => x.id === Number(key.slice(2)));
    if (c) units.push({ id: key, render: (i) => <Tile key={key} id="custom-amount" index={i} editing={editing} hidden={[]} label={c.code} bg="" art={null} onRemove={() => removeProductTile(key)} card={COUPON_CARD(c, () => onCoupon(c))} /> });
  });
  const rank = (id: string) => { const n = order.indexOf(id); return n < 0 ? Infinity : n; };
  const ordered = [...units].sort((a, b) => rank(a.id) - rank(b.id));
  const ids = ordered.map((u) => u.id);
  // Dragging over another tile moves the dragged one into its place; the grid reflows as it goes.
  const moveOverId = (dragged: string, over: string) => {
    const next = ids.filter((x) => x !== dragged);
    next.splice(next.indexOf(over) + (ids.indexOf(dragged) < ids.indexOf(over) ? 1 : 0), 0, dragged);
    setHomeOrder(next);
  };
  // The dragged tile sits where the pointer has carried it from where the drag began, whatever slot it is in now.
  const placeDragged = () => {
    const d = drag.current;
    const slot = d && slotEl(d.id);
    const mover = slot?.firstElementChild as HTMLElement | null;
    if (!d || !slot || !mover) return;
    mover.style.transition = 'none';
    mover.style.transform = `translate(${d.px - d.startX + d.startLeft - slot.offsetLeft}px, ${d.py - d.startY + d.startTop - slot.offsetTop}px) scale(1.02)`;
  };
  const beginDrag = (e: React.PointerEvent, id: string) => {
    if (!editing || e.button !== 0 || (e.target as HTMLElement).closest('button[aria-label^="Remove"]')) return;
    const slot = slotEl(id);
    if (!slot) return;
    drag.current = { id, startX: e.clientX, startY: e.clientY, px: e.clientX, py: e.clientY, startLeft: slot.offsetLeft, startTop: slot.offsetTop, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: React.PointerEvent, id: string) => {
    const d = drag.current;
    if (!d || d.id !== id) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return;
      d.moved = true;
      setDragging(id);
    }
    d.px = e.clientX;
    d.py = e.clientY;
    placeDragged();
    // Whichever other tile the pointer is over takes the dragged one's slot.
    const grid = gridRef.current;
    if (!grid) return;
    const r = grid.getBoundingClientRect();
    const gx = e.clientX - r.left + grid.scrollLeft;
    const gy = e.clientY - r.top + grid.scrollTop;
    const over = [...grid.querySelectorAll<HTMLElement>('[data-tile-id]')].find((el) => el.dataset.tileId !== id && gx >= el.offsetLeft + el.offsetWidth * HIT_INSET && gx <= el.offsetLeft + el.offsetWidth * (1 - HIT_INSET) && gy >= el.offsetTop + el.offsetHeight * HIT_INSET && gy <= el.offsetTop + el.offsetHeight * (1 - HIT_INSET));
    if (over?.dataset.tileId) moveOverId(id, over.dataset.tileId);
  };
  const endDrag = (id: string) => {
    const d = drag.current;
    if (!d || d.id !== id) return;
    drag.current = null;
    if (!d.moved) return;
    // Settle into the slot it was left over, then let the others carry on.
    const mover = slotEl(id)?.firstElementChild as HTMLElement | null;
    if (mover) { mover.style.transition = 'transform 200ms ease'; mover.style.transform = ''; }
    window.setTimeout(() => setDragging(null), 220);
  };

  // Tiles that change slot (a neighbour was dragged over them, one was removed or added) glide from
  // where they were to where they are now instead of jumping.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // Entering or leaving edit mode shifts the whole grid (the badges' headroom): that is not a tile
    // changing slot, so it is recorded without gliding.
    const modeChanged = wasEditing.current !== editing;
    wasEditing.current = editing;
    grid.querySelectorAll<HTMLElement>('[data-tile-id]').forEach((el) => {
      const id = el.dataset.tileId as string;
      const now = { left: el.offsetLeft, top: el.offsetTop };
      const was = slots.current[id];
      slots.current[id] = now;
      if (modeChanged || !was || (was.left === now.left && was.top === now.top)) return;
      if (drag.current?.id === id) { placeDragged(); return; }
      el.style.transition = 'none';
      el.style.transform = `translate(${was.left - now.left}px, ${was.top - now.top}px)`;
      el.getBoundingClientRect();
      el.style.transition = 'transform 400ms ease';
      el.style.transform = '';
    });
  });
  return (
    <div
      ref={gridRef}
      // Editing adds Medium of room above the tiles for the badges that overhang their top edge; the
      // header gives the same Medium back from its bottom padding, so the tiles do not move.
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: isPhone ? '1fr' : 'repeat(2, minmax(0, 1fr))',
        alignContent: 'start',
        gap: 'var(--space-md)',
        padding: `${editing ? 'calc(var(--space-sm) + var(--space-md))' : 'var(--space-sm)'} var(--space-md) ${clearBottom ? 'calc(var(--size-small) + var(--space-xxl))' : 'var(--space-md)'}`,
      }}
    >
      {ordered.map((u, i) => (
        <div key={u.id} data-tile-id={u.id} style={{ borderRadius: 'var(--radius-md)', outline: dragging === u.id ? '3px dashed var(--color-primary)' : 'none', outlineOffset: -3 }}>
          <div
            // The mover follows the pointer while dragged; its slot stays behind, a dashed primary outline, where the tile will land.
            onPointerDown={(e) => beginDrag(e, u.id)}
            onPointerMove={(e) => moveDrag(e, u.id)}
            onPointerUp={() => endDrag(u.id)}
            onPointerCancel={() => endDrag(u.id)}
            style={{ position: 'relative', zIndex: dragging === u.id ? 20 : undefined, touchAction: editing ? 'none' : undefined, cursor: editing ? (dragging === u.id ? 'grabbing' : 'grab') : undefined }}
          >
            {u.render(i)}
          </div>
        </div>
      ))}
      <AddTile onClick={() => setAddOpen(true)} />
      {addOpen && <AddTilePage onClose={() => setAddOpen(false)} />}
    </div>
  );
}

/** How far into a tile (as a share of its width/height, from each edge) the pointer has to be before the dragged tile takes its slot — only the middle of it counts, so tiles move late, close to the final position. */
const HIT_INSET = 0.075;

/** The system tiles Add tile offers, in the order the design lists them. */
export const SYSTEM_TILES: { id: HomeTileId; label: string }[] = [
  { id: 'custom-amount', label: 'Custom amount' },
  { id: 'apply-coupon', label: 'Apply coupon' },
  { id: 'add-staff', label: 'Add staff to sale' },
];

/** A system tile's illustration, laid into its 60 × 60 box. The dark drawings are whole 60 × 60
 *  artboards, placed as-is; the light ones are exported as trimmed pieces and positioned inside it. */
export function TileArt({ id, disabled }: { id: HomeTileId; disabled?: boolean }) {
  const isDark = useIsDark();
  const full = { left: 0, top: 0, w: 60, h: 60 };
  // Disabled tiles (already on the home page) use the greyscale drawings, whole 60 × 60 artboards;
  if (disabled && id === 'custom-amount') return <Art src={isDark ? moneyDisabledArtDark : moneyDisabledArt} {...full} />;
  if (disabled && id === 'apply-coupon') return <Art src={isDark ? couponDisabledArtDark : couponDisabledArt} {...full} />;
  if (disabled && id === 'add-staff') return <Art src={isDark ? staffDisabledArtDark : staffDisabledArt} {...full} />;
  const art =
    id === 'custom-amount'
      ? isDark ? { src: customAmountArtDark, ...full } : { src: customAmountArt, left: 2.493, top: 2.493, w: 55.5634, h: 55.5124 }
      : id === 'apply-coupon'
        ? isDark ? { src: applyCouponArtDark, ...full } : { src: applyCouponArt, left: 2.727, top: 4.77, w: 54.5451, h: 50.4547 }
        : isDark ? { src: addStaffArtDark, ...full } : { src: addStaffArt, left: 2.727, top: 2.727, w: 54.5461, h: 54.5457 };
  return <Art {...art} />;
}

function Art({ src, left, top, w, h }: { src: string; left: number; top: number; w: number; h: number }) {
  return <img src={src} alt="" aria-hidden style={{ position: 'absolute', left, top, width: w, height: h, maxWidth: 'none' }} />;
}

/** The product tiles on the page, one per product however many of its variations were picked. */
function groupProducts(keys: string[]): { product: MockProduct; keys: string[] }[] {
  const out: { product: MockProduct; keys: string[] }[] = [];
  for (const key of keys) {
    const id = Number(key.slice(2));
    const productId = key.startsWith('p:') ? id : variationParent(id);
    const product = products.find((x) => x.id === productId);
    if (!product) continue;
    const g = out.find((x) => x.product.id === product.id);
    if (g) g.keys.push(key);
    else out.push({ product, keys: [key] });
  }
  return out;
}
const variationParent = (variationId: number) => Math.floor(variationId / 100);

const COUPON_CARD = (c: MockCoupon, onClick: () => void) => <CouponCard coupon={c} onClick={onClick} titleVariant="bodyMedium" detailVariant="bodySmall" />;

/** The Products tab's own card for a product. */
const CARD = (p: MockProduct, onClick: () => void) => <ProductListItem product={{ id: p.id, name: p.name, price: formatUsd(p.price), variable: p.variable }} onClick={onClick} titleVariant="bodyMedium" detailVariant="bodySmall" />;

function Tile({ id, index, editing, hidden, label, bg, art, card, onClick, onRemove }: { card?: ReactNode; onRemove?: () => void; id: HomeTileId; index: number; editing: boolean; hidden: HomeTileId[]; label: string; bg: string; art: ReactNode; onClick?: () => void }) {
  if (hidden.includes(id)) return null;
  const body = (
    <>
      <div style={{ width: 112, height: 112, flex: 'none', background: bg, position: 'relative' }}>
        {/* The illustration box is 60 × 60, centered in the 112 square. */}
        <div style={{ position: 'absolute', left: 26, top: 26, width: 60, height: 60 }}>{art}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', padding: 'var(--space-md)', background: 'var(--color-surface-container-lowest)' }}>
        <Text variant="bodyMedium" bold>{label}</Text>
      </div>
    </>
  );
  const style = { display: 'flex', alignItems: 'stretch', overflow: 'hidden', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-soft-medium)', textAlign: 'left' as const, border: 'none', background: 'transparent', padding: 0, font: 'inherit', color: 'var(--color-on-surface)', width: '100%' };
  // Editing: the tiles stop being buttons, jiggle (each out of step with the others) and get a red
  // delete badge on their top-right corner (Figma 4310-42449).
  const jiggle = editing ? { className: 'ca-jiggle', style: { animationDuration: `${0.24 + index * 0.025}s`, animationDelay: `-${index * 0.09}s` } } : { style: {} };
  return (
    // The badge sits inside the jiggling wrapper so it moves with its tile.
    <div className={jiggle.className} style={{ position: 'relative', ...jiggle.style }}>      {card
        ? <div style={{ pointerEvents: editing ? 'none' : undefined }}>{card}</div>
        : onClick && !editing
        ? <button type="button" onClick={onClick} style={{ ...style, cursor: 'pointer' }}>{body}</button>
        : <div style={style}>{body}</div>}
      {editing && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={() => (onRemove ? onRemove() : removeHomeTile(id))}
          style={{ position: 'absolute', top: -16, right: -16, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--color-error)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, zIndex: 1 }}
        >
          <Trash size="18px" />
        </button>
      )}
    </div>
  );
}

function AddTile({ onClick }: { onClick: () => void }) {
  const isDark = useIsDark();
  return (
    <button type="button" onClick={onClick} style={{ background: 'transparent', font: 'inherit', cursor: 'pointer', width: '100%', height: 112, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', border: '2px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}>
      <img src={isDark ? addTileArtDark : addTileArt} alt="" aria-hidden style={{ width: 32, height: 32 }} />
      <span style={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: 'var(--font-body-md-size)', color: '#a7aaad' }}>Add tile</span>
    </button>
  );
}
