import { useMemo } from 'react';
import { PosText } from '../../../ios/PosText';
import { PosItemCard, CouponThumbnail } from '../../../ios/PosItemCard';
import { formatUsd } from '../../../../lib/currency';
import { products, type MockProduct } from '../../../../mocks/android/products';
import { coupons, type MockCoupon } from '../../../../mocks/android/coupons';

/**
 * Home tab proposal (Option 4) — iOS search from the Home tab: one search over everything, so it
 * returns products and coupons together, each under its own heading, instead of moving to the
 * Products tab. Empty query shows a prompt; no matches shows a centered message.
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
        <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-lowest)">Search for products and coupons.</PosText>
      </div>
    );
  }
  if (foundProducts.length === 0 && foundCoupons.length === 0) {
    return (
      <div style={{ padding: 'var(--space-xl) var(--space-lg)', textAlign: 'center' }}>
        <PosText variant="bodyLarge" bold align="center" style={{ display: 'block' }}>No results found</PosText>
        <PosText variant="bodyMedium" align="center" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 'var(--space-sm)' }}>
          We couldn't find any matching products or coupons. Try adjusting your search term.
        </PosText>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {foundProducts.length > 0 && (
        <Section title="Products">
          {foundProducts.map((p) => (
            <PosItemCard key={p.id} item={{ id: p.id, name: p.name, detail: p.variable ? 'Options available' : formatUsd(p.price), variable: p.variable }} onClick={() => onSelectProduct(p)} />
          ))}
        </Section>
      )}
      {foundCoupons.length > 0 && (
        <Section title="Coupons">
          {foundCoupons.map((c) => (
            <PosItemCard
              key={c.id}
              item={{ id: 100 + c.id, name: c.code, detail: c.expiredOn ? `Expired ${c.expiredOn}` : c.summary, thumbnail: <CouponThumbnail expired={!!c.expiredOn} />, expired: !!c.expiredOn }}
              onClick={() => !c.expiredOn && onSelectCoupon(c)}
            />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <PosText variant="bodyLarge" bold style={{ display: 'block' }}>{title}</PosText>
      {children}
    </div>
  );
}
