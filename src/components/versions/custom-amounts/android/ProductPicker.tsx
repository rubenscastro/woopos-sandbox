import { useMemo, useState } from 'react';
import { Text } from '../../../android/Text';
import { Search, ChevronDown } from '../../../android/icons';
import { ProductImage } from '../../../android/ProductImage';
import { formatUsd } from '../../../../lib/currency';
import { products, variations, type MockProduct } from '../../../../mocks/android/products';
import { AddedBadge } from './AddedBadge';
import checkedBox from '../../../../assets/shared/home-tab/checkbox-checked.svg';

/**
 * Option 4 (Home tab) — Android "Add tile" → Products (Figma: POS Playground, nodes 4311-61696 and
 * 4311-61859). The store's products, each with a checkbox. A variable product shows "X/N variations"
 * and a chevron: its checkbox (the only thing on that row that selects) selects every variation, and
 * a variation's whole row selects it; tapping the count expands the card into its variations. With only some variations ticked the parent's checkbox shows a dash, and the whole
 * card takes the primary outline. Selection keys: `p:<id>` for a simple product, `v:<id>` per variation.
 */
export function ProductPicker({ selected, onChange, onHome }: { selected: string[]; onChange: (next: string[]) => void; onHome: string[] }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number[]>([]);
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => (q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products), [q]);
  const has = (k: string) => selected.includes(k);
  const toggleKeys = (keys: string[], on: boolean) =>
    onChange(on ? [...selected, ...keys.filter((k) => !has(k))] : selected.filter((k) => !keys.includes(k)));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px', background: 'var(--color-surface-bright)', borderRadius: 'var(--radius-md)', flex: 'none' }}>
        <Search size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
        <input
          className="ca-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-on-surface)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-body-md-size)' }}
        />
      </div>
      {shown.length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-lowest)">No products found.</Text>
        </div>
      )}
      {shown.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          expanded={open.includes(p.id)}
          onExpand={() => setOpen((o) => (o.includes(p.id) ? o.filter((x) => x !== p.id) : [...o, p.id]))}
          has={has}
          locked={(k) => onHome.includes(k)}
          toggleKeys={toggleKeys}
        />
      ))}
    </>
  );
}

type Box = 'off' | 'on' | 'partial';

function ProductCard({ product: p, expanded, onExpand, has, locked, toggleKeys }: { product: MockProduct; expanded: boolean; onExpand: () => void; has: (k: string) => boolean; locked: (k: string) => boolean; toggleKeys: (keys: string[], on: boolean) => void }) {
  const vars = p.variable ? variations[p.id] ?? [] : [];
  const keys = p.variable ? vars.map((v) => `v:${v.id}`) : [`p:${p.id}`];
  // What is already on the home page can't be picked again: those rows are shown disabled, checked.
  const free = keys.filter((k) => !locked(k));
  const allLocked = free.length === 0;
  const picked = free.filter(has).length;
  const count = keys.filter((k) => has(k) || locked(k)).length;
  const box: Box = count === 0 ? 'off' : count === keys.length ? 'on' : 'partial';
  // Tapping the card (or its checkbox) selects everything left to pick, or clears it when all of it already is.
  const toggleAll = () => toggleKeys(free, picked < free.length);
  const nameColor = allLocked ? 'var(--color-on-disabled-container)' : undefined;

  return (
    <div
      style={{ flex: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-soft-medium)', position: 'relative', background: allLocked ? 'var(--color-surface-dim)' : 'var(--color-surface-bright)' }}
    >
      {/* A simple product is one tap target; with variations, only the checkbox selects. */}
      <div {...(p.variable || allLocked ? {} : { role: 'checkbox', 'aria-checked': box === 'on', tabIndex: 0, onClick: toggleAll, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAll(); } } })} style={{ display: 'flex', alignItems: 'stretch', cursor: p.variable || allLocked ? 'default' : 'pointer' }}>
        <Thumb id={p.id} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg) var(--space-md) var(--space-md)', background: allLocked ? 'var(--color-surface-dim)' : 'var(--color-surface-bright)' }}>
          {p.variable ? (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
              <Text variant="bodyMedium" bold color={nameColor}>{p.name}</Text>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={(e) => { e.stopPropagation(); onExpand(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: nameColor ?? 'var(--color-on-surface-variant-lowest)', flex: 'none' }}
              >
                <Text variant="bodyMedium" color={nameColor ?? 'var(--color-on-surface-variant-lowest)'}>{count}/{vars.length} variations</Text>
                {expanded ? <ChevronDown size="var(--icon-small)" style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size="var(--icon-small)" />}
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <Text variant="bodyMedium" bold color={nameColor}>{p.name}</Text>
              <Text variant="bodyMedium" color={nameColor ?? 'var(--color-on-surface-variant-lowest)'}>{formatUsd(p.price)}</Text>
            </div>
          )}
          <Checkbox state={box} onToggle={p.variable && !allLocked ? toggleAll : undefined} disabled={allLocked} label={p.name} />
        </div>
      </div>
      {p.variable && expanded && vars.map((v) => {
        const isLocked = locked(`v:${v.id}`);
        const on = isLocked || has(`v:${v.id}`);
        return (
          <div key={v.id} onClick={isLocked ? undefined : () => toggleKeys([`v:${v.id}`], !on)} style={{ display: 'flex', alignItems: 'stretch', boxShadow: 'var(--shadow-soft-medium)', cursor: isLocked ? 'default' : 'pointer' }}>
            {/* A variation's photo sits in a surface-colored square, like the design's nested cards. */}
            <div style={{ width: 112, flex: 'none', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Thumb id={v.id} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg) var(--space-md) var(--space-md)', background: isLocked ? 'var(--color-surface-dim)' : 'var(--color-surface-bright)' }}>
              <Text variant="bodyMedium" color={isLocked ? 'var(--color-on-disabled-container)' : 'var(--color-on-surface-variant-lowest)'}>{v.name}</Text>
              <Checkbox state={on ? 'on' : 'off'} onToggle={isLocked ? undefined : () => toggleKeys([`v:${v.id}`], !on)} disabled={isLocked} label={`${p.name} ${v.name}`} />
            </div>
          </div>
        );
      })}
      {picked > 0 && <span aria-hidden style={{ position: 'absolute', inset: 0, border: '3px solid var(--color-primary)', borderRadius: 'var(--radius-md)', pointerEvents: 'none' }} />}
    </div>
  );
}

function Thumb({ id }: { id: number }) {
  return (
    <div style={{ width: 112, height: 112, flex: 'none', background: 'var(--color-surface-dim)', overflow: 'hidden' }}>
      <ProductImage id={id} />
    </div>
  );
}

/** Unchecked, checked (the Figma export) or partial — primary fill with a white dash (Figma 4311-62005). */
function Checkbox({ state, onToggle, label, disabled }: { state: Box; onToggle?: () => void; label?: string; disabled?: boolean }) {
  // Disabled (already on the home page): an "Added" badge instead of the box.
  if (disabled) return <AddedBadge />;
  const box = <CheckboxArt state={state} />;
  if (!onToggle) return box;
  return (
    <button type="button" role="checkbox" aria-checked={state === 'partial' ? 'mixed' : state === 'on'} aria-label={label} onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ border: 'none', background: 'none', padding: 0, display: 'flex', cursor: 'pointer', flex: 'none' }}>
      {box}
    </button>
  );
}

function CheckboxArt({ state }: { state: Box }) {
  if (state === 'on') return <img src={checkedBox} alt="" aria-hidden style={{ width: 32, height: 32, flex: 'none' }} />;
  if (state === 'partial') {
    return (
      <span aria-hidden style={{ width: 32, height: 32, flex: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 13, height: 2.5, background: '#fff' }} />
      </span>
    );
  }
  return <span aria-hidden style={{ width: 32, height: 32, flex: 'none', boxSizing: 'border-box', border: '2px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }} />;
}
