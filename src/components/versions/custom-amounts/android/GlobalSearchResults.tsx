import { useMemo } from 'react';
import { Text } from '../../../android/Text';
import { EmptyScreen } from '../../../android/EmptyScreen';
import { ProductListItem } from '../../../android/ProductListItem';
import { CouponCard } from '../../../android/CouponCard';
import { Search } from '../../../android/icons';
import { formatUsd } from '../../../../lib/currency';
import { products, type MockProduct } from '../../../../mocks/android/products';
import { coupons, type MockCoupon } from '../../../../mocks/android/coupons';

/**
 * Home tab proposal (Option 4) — Android search from the Home tab: one search over everything, so it
 * returns products and coupons together, each under its own heading, instead of moving to the
 * Products tab. Empty query shows a prompt; no matches shows the usual empty state.
 */
export function GlobalSearchResults({
  query,
  onSelectProduct,
  onSelectCoupon,
}: {
  query: string;
  onSelectProduct: (p: MockProduct) => void;
  onSelectCoupon: (c: MockCoupon) => void;
}) {
  const q = query.trim().toLowerCase();
  const foundProducts = useMemo(() => (q ? products.filter((p) => p.name.toLowerCase().includes(q)) : []), [q]);
  const foundCoupons = useMemo(
    () => (q ? coupons.filter((c) => c.code.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)) : []),
    [q],
  );

  if (!q) {
    // Centered in the space the results would fill, both ways — above the keyboard, which is up while searching.
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingBottom: 'var(--device-keyboard-height, 0px)' }}>
        <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-lowest)">Search for products and coupons.</Text>
      </div>
    );
  }
  if (foundProducts.length === 0 && foundCoupons.length === 0) {
    return <EmptyScreen icon={<Search size="var(--size-small)" />} title="No results found" message="We couldn't find any matching products or coupons. Try adjusting your search term." />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {foundProducts.length > 0 && (
        <Section title="Products">
          {foundProducts.map((p) => (
            <ProductListItem key={p.id} product={{ id: p.id, name: p.name, price: formatUsd(p.price), variable: p.variable }} onClick={() => onSelectProduct(p)} />
          ))}
        </Section>
      )}
      {foundCoupons.length > 0 && (
        <Section title="Coupons">
          {foundCoupons.map((c) => (
            <CouponCard key={c.id} coupon={c} onClick={() => onSelectCoupon(c)} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <Text variant="bodyLarge" bold style={{ display: 'block' }}>{title}</Text>
      {children}
    </div>
  );
}
