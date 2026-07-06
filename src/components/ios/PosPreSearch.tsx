import { PosText } from './PosText';
import { PosItemCard } from './PosItemCard';
import { Search } from '../android/icons';
import { formatUsd } from '../../lib/currency';
import { popularProducts, recentProductSearches } from '../../mocks/android/products';
import { recentCouponSearches } from '../../mocks/android/coupons';

/**
 * iOS pre-search view (Item Search/POSPreSearchView.swift), shown when the search field is
 * open but empty. Products: "Recent searches" chips + "Popular products" list. Coupons:
 * recent-search chips, or "Search your store" when there are none. Item Search is its own
 * flow on iOS (richer than Android's inline filter) — hence this dedicated pre-search state.
 */
export function PosPreSearch({
  tab,
  onPick,
  onSelectProduct,
}: {
  tab: 'products' | 'coupons';
  onPick: (term: string) => void;
  onSelectProduct: (id: number, name: string, price: number) => void;
}) {
  const recents = tab === 'products' ? recentProductSearches : recentCouponSearches;

  if (tab === 'coupons' && recents.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PosText variant="bodyLarge">Search your store</PosText>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {recents.length > 0 && (
        <>
          <PosText variant="bodyMedium" bold>
            Recent searches
          </PosText>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', overflowX: 'auto', paddingBottom: 4 }}>
            {recents.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onPick(t)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 'none',
                  background: 'var(--color-surface-bright)', border: 'none', borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-soft-medium)', padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--color-on-surface)', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                <Search size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-highest)' }} />
                <PosText variant="bodyLarge">{t}</PosText>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'products' && (
        <>
          <PosText variant="bodyMedium" bold>
            Popular products
          </PosText>
          {popularProducts.map((p) => (
            <PosItemCard
              key={p.id}
              item={{ id: p.id, name: p.name, detail: p.variable ? 'Options available' : formatUsd(p.price), variable: p.variable }}
              onClick={() => onSelectProduct(p.id, p.name, p.price)}
            />
          ))}
        </>
      )}
    </div>
  );
}
