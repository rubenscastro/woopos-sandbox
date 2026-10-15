import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Text } from '../../../android/Text';
import { Button } from '../../../android/Button';
import { Close, ChevronLeft } from '../../../android/icons';
import { useIsPhone } from '../../../../hooks/useBreakpoint';
import { useHomeEdit, addHomeTiles, addProductTiles, type HomeTileId } from '../../../../state/homeEdit';
import { SYSTEM_TILES, TileArt } from './HomeTiles';
import { ProductPicker } from './ProductPicker';
import { CouponPicker } from './CouponPicker';
import { AddedBadge } from './AddedBadge';
import checkedBox from '../../../../assets/shared/home-tab/checkbox-checked.svg';
import '../CustomAmountFlow.css';

/**
 * Option 4 (Home tab) — Android "Add tile" (Figma: POS Playground, node 4311-42948), a full-screen
 * page over everything. Left, the categories (System / Products / Coupons); right, the selected
 * category's tiles with a checkbox each and, once at least one is ticked, an "Add to home page"
 * button. Only System is built for now — Products and Coupons are listed but do nothing yet. It
 * offers the system tiles that aren't already on the page.
 */
// Each column clears the status bar itself, so the sidebar's fill runs up behind it instead of starting under it.
const SAFE_TOP = 'var(--device-safe-top, 0px)';

export function AddTilePage({ onClose }: { onClose: () => void }) {
  const isPhone = useIsPhone();
  const { hidden, productTiles } = useHomeEdit();
  const [selected, setSelected] = useState<HomeTileId[]>([]);
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [category, setCategory] = useState<'system' | 'products' | 'coupons'>('system');
  const [leaving, setLeaving] = useState(false);
  const [detail, setDetail] = useState(false); // phone: the category's page, once it's been opened

  const close = () => {
    setLeaving(true);
    window.setTimeout(onClose, 300);
  };
  const toggle = (id: HomeTileId) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const add = () => {
    addHomeTiles(selected);
    addProductTiles(productKeys);
    close();
  };

  const showMenu = !isPhone || !detail;
  const showDetail = !isPhone || detail;

  const menu = (
    <div style={{ flex: isPhone ? 1 : '0 0 34%', minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-bright)', paddingTop: SAFE_TOP, boxSizing: 'border-box' }}>
      <Header onLeading={close} leading={<Close size="var(--icon-medium)" />} leadingLabel="Close" title="Add tile" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: '0 var(--space-md)' }}>
        <Category label="System" selected={category === 'system'} onClick={() => { setCategory('system'); setDetail(true); }} />
        <Category label="Products" selected={category === 'products'} onClick={() => { setCategory('products'); setDetail(true); }} />
        <Category label="Coupons" selected={category === 'coupons'} onClick={() => { setCategory('coupons'); setDetail(true); }} />
      </div>
    </div>
  );

  const content = (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', paddingTop: SAFE_TOP, boxSizing: 'border-box' }}>
      {/* No back button beside the title on tablet, where the category list is already beside it; on
          phone the page is stacked, so it keeps the one that returns to the categories. */}
      <Header onLeading={isPhone ? () => setDetail(false) : undefined} leading={isPhone ? <ChevronLeft size="var(--icon-medium)" /> : undefined} leadingLabel="Back" title={category === 'system' ? 'System tiles' : category === 'products' ? 'Products' : 'Coupons'} />
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: '0 var(--space-md) var(--space-md)' }}>
        {category === 'products' && <ProductPicker selected={productKeys} onChange={setProductKeys} onHome={productTiles} />}
        {category === 'coupons' && <CouponPicker selected={productKeys} onChange={setProductKeys} onHome={productTiles} />}
        {category === 'system' && SYSTEM_TILES.map((t) => (
          // Tiles already on the home page are listed too, disabled and checked.
          <TileRow key={t.id} id={t.id} label={t.label} disabled={!hidden.includes(t.id)} checked={selected.includes(t.id) || !hidden.includes(t.id)} onToggle={() => toggle(t.id)} />
        ))}
      </div>
      {/* Only offered once something is ticked. */}
      {(selected.length > 0 || productKeys.length > 0) && (
        <div style={{ padding: 'var(--space-md)' }}>
          <Button text="Add to home page" fullWidth onClick={add} />
        </div>
      )}
    </div>
  );

  const page = (
    <div
      className={leaving ? 'ca-push-out' : 'ca-push-in'}
      style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', background: 'var(--color-surface)' }}
    >
      {showMenu && menu}
      {showDetail && content}
    </div>
  );
  const screen = typeof document !== 'undefined' ? document.querySelector('.device-screen') : null;
  return screen ? createPortal(page, screen) : page;
}

function Header({ leading, leadingLabel, onLeading, title }: { leading?: React.ReactNode; leadingLabel: string; onLeading?: () => void; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', minHeight: 'var(--size-xsmall)' }}>
      {leading && (
        <button type="button" aria-label={leadingLabel} onClick={onLeading} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
          {leading}
        </button>
      )}
      <Text variant="heading" bold>{title}</Text>
    </div>
  );
}

/** A category in the left list; the selected one has a 2px inverse-surface outline. */
function Category({ label, selected, onClick }: { label: string; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ textAlign: 'left', cursor: onClick ? 'pointer' : 'default', padding: 'var(--space-md)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-soft-medium)', border: selected ? '2px solid var(--color-inverse-surface)' : '2px solid transparent', color: 'var(--color-on-surface)', font: 'inherit' }}
    >
      <Text variant="bodyLarge" bold>{label}</Text>
    </button>
  );
}

/** A selectable tile: the illustration square, the label, and a checkbox; ticked, it gets a 3px primary outline. */
function TileRow({ id, label, checked, disabled, onToggle }: { id: HomeTileId; label: string; checked: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      style={{ display: 'flex', alignItems: 'stretch', width: '100%', padding: 0, overflow: 'hidden', cursor: disabled ? 'default' : 'pointer', textAlign: 'left', font: 'inherit', color: 'var(--color-on-surface)', background: 'transparent', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-soft-medium)', border: 'none', position: 'relative' }}
    >
      <div style={{ width: 112, height: 112, flex: 'none', background: 'var(--color-surface-dim)', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 26, top: 26, width: 60, height: 60 }}><TileArt id={id} disabled={disabled} /></div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg) var(--space-md) var(--space-md)', background: disabled ? 'var(--color-surface-dim)' : 'var(--color-surface-container-lowest)' }}>
        <Text variant="bodyMedium" bold color={disabled ? 'var(--color-on-disabled-container)' : undefined}>{label}</Text>
        {disabled ? <AddedBadge /> : checked
          ? <img src={checkedBox} alt="" aria-hidden style={{ width: 32, height: 32, flex: 'none' }} />
          : <span aria-hidden style={{ width: 32, height: 32, flex: 'none', boxSizing: 'border-box', border: '2px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }} />}
      </div>
      {checked && !disabled && <span aria-hidden style={{ position: 'absolute', inset: 0, border: '3px solid var(--color-primary)', borderRadius: 'var(--radius-md)', pointerEvents: 'none' }} />}
    </button>
  );
}
