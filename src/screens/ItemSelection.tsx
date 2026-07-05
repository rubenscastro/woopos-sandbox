import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { SearchInput } from '../components/SearchInput';
import { EmptyScreen } from '../components/EmptyScreen';
import { ProductListItem } from '../components/ProductListItem';
import { CouponCard } from '../components/CouponCard';
import { CartPanel } from '../components/CartPanel';
import { CheckoutPane } from '../components/CheckoutPane';
import { CustomAmountDialog } from '../components/CustomAmountDialog';
import { DragScroll } from '../components/DragScroll';
import { FloatingToolbar } from '../components/FloatingToolbar';
import { Toolbar } from '../components/Toolbar';
import { Button } from '../components/Button';
import { Search, Plus, Inventory, Tag } from '../components/icons';
import { useIsPhone } from '../hooks/useBreakpoint';
import { useBarcodeSetup } from '../tools/BarcodeSetup';
import { useCart } from '../state/CartContext';
import { formatUsd } from '../lib/currency';
import { products, variations, popularProducts, recentProductSearches, type MockProduct } from '../mocks/products';
import { coupons, recentCouponSearches, type MockCoupon } from '../mocks/coupons';

type Tab = 'products' | 'coupons';

/**
 * Flow 2–6 — Item selection (WooPosItemsScreen) with the cart alongside it. On tablet the
 * items list and cart sit side by side (WooPosHomePanes: items ~65%, cart ~35%); on phone
 * the items list is full-screen with a persistent "View cart" button to the cart pane.
 * Handles the Products/Coupons tabs, search, the variations drill-in, and custom amounts.
 */
export function ItemSelection() {
  const navigate = useNavigate();
  const isPhone = useIsPhone();
  const cart = useCart();
  const { openSetup } = useBarcodeSetup();

  const [tab, setTab] = useState<Tab>('products');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [variationOf, setVariationOf] = useState<MockProduct | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);

  const goScan = () => openSetup();

  const itemsPane = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, position: 'relative' }}>
      {variationOf ? (
        <Variations product={variationOf} onBack={() => setVariationOf(null)} onAdd={(v) => {
          cart.addProduct(v);
          setVariationOf(null);
        }} />
      ) : (
        <>
          <ItemsToolbar
            tab={tab}
            onTab={setTab}
            searchOpen={searchOpen}
            query={query}
            onQuery={setQuery}
            onToggleSearch={() => {
              setSearchOpen((o) => !o);
              setQuery('');
            }}
          />
          <DragScroll style={{ flex: 1, padding: 'var(--space-sm) var(--space-md) var(--space-xxl)' }}>
            {tab === 'products' ? (
              <ProductsList
                query={query}
                searchOpen={searchOpen}
                onOpenCustom={() => setCustomOpen(true)}
                onPickSearch={(t) => setQuery(t)}
                onSelect={(p) => {
                  if (p.variable) setVariationOf(p);
                  else cart.addProduct({ id: p.id, name: p.name, price: p.price });
                }}
              />
            ) : (
              <CouponsList
                query={query}
                searchOpen={searchOpen}
                onPickSearch={(t) => setQuery(t)}
                onSelect={(c) => cart.addCoupon(c.code, c.summary, c.discount)}
              />
            )}
          </DragScroll>
        </>
      )}

      {isPhone && (
        <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-outline-variant)' }}>
          <Button
            text={cart.itemCount > 0 ? `View cart · ${formatUsd(cart.total)}` : 'Cart is empty'}
            fullWidth
            state={cart.itemCount > 0 ? 'enabled' : 'disabled'}
            onClick={() => navigate('/cart')}
          />
        </div>
      )}

      {!isPhone && <FloatingToolbar />}

      {customOpen && (
        <CustomAmountDialog
          onDismiss={() => setCustomOpen(false)}
          onSubmit={(name, amount, taxable) => {
            cart.addCustomAmount(name, amount, taxable);
            setCustomOpen(false);
          }}
        />
      )}
    </div>
  );

  if (isPhone) {
    return <div style={{ height: '100%', position: 'relative' }}>{itemsPane}</div>;
  }

  // Tablet: a 3-pane horizontal row (items | cart | checkout). Starting "checkout" slides
  // the catalog off to the left, leaving the cart as a left sidebar with the checkout on
  // the right — mirroring WooPosHomeScreen's animated pane transition.
  const ROW = 165; // items 65 + cart 35 + checkout 65 (percent of the container)
  return (
    <div className="woopos-fills-safe-top" style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: `${ROW}%`,
          transform: checkout ? `translateX(-${(65 / ROW) * 100}%)` : 'translateX(0)',
          transition: 'transform 0.45s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <div className="woopos-safe-pane" style={{ width: `${(65 / ROW) * 100}%`, minWidth: 0 }}>{itemsPane}</div>
        <div
          className="woopos-safe-pane"
          style={{
            width: `${(35 / ROW) * 100}%`,
            minWidth: 0,
            background: 'var(--color-surface-bright)',
          }}
        >
          <CartPanel onCheckout={() => setCheckout(true)} onScanBarcode={goScan} hideCheckout={checkout} />
        </div>
        <div className="woopos-safe-pane" style={{ width: `${(65 / ROW) * 100}%`, minWidth: 0 }}>
          <CheckoutPane active={checkout} onBack={() => setCheckout(false)} />
        </div>
      </div>
    </div>
  );
}

function ItemsToolbar({
  tab,
  onTab,
  searchOpen,
  query,
  onQuery,
  onToggleSearch,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  searchOpen: boolean;
  query: string;
  onQuery: (q: string) => void;
  onToggleSearch: () => void;
}) {
  return (
    <div style={{ padding: 'var(--space-md) var(--space-md) 0' }}>
      {searchOpen ? (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <SearchInput
              value={query}
              onChange={onQuery}
              autoFocus
              placeholder={tab === 'products' ? 'Search products' : 'Search coupons'}
            />
          </div>
          <button type="button" onClick={onToggleSearch} style={{ border: 'none', background: 'none' }}>
            <Text variant="bodySmall" color="var(--color-primary)">
              Cancel
            </Text>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <TabButton label="Products" active={tab === 'products'} onClick={() => onTab('products')} />
          <TabButton label="Coupons" active={tab === 'coupons'} onClick={() => onTab('coupons')} />
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onToggleSearch}
            aria-label="Search products"
            style={{
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'var(--size-xsmall)',
              height: 'var(--size-xsmall)',
              borderRadius: '50%',
              background: 'var(--color-surface-container-low)',
              color: 'var(--color-on-surface)',
              boxShadow: 'var(--shadow-soft-medium)',
            }}
          >
            <Search size="var(--icon-small)" />
          </button>
        </div>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ border: 'none', background: 'none', padding: 0 }}>
      <Text
        variant="heading"
        bold
        color={active ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant-lowest)'}
      >
        {label}
      </Text>
    </button>
  );
}

function ProductsList({
  query,
  searchOpen,
  onOpenCustom,
  onSelect,
  onPickSearch,
}: {
  query: string;
  searchOpen: boolean;
  onOpenCustom: () => void;
  onSelect: (p: MockProduct) => void;
  onPickSearch: (t: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => (q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products), [q]);

  // Search open with no query: recent searches + popular products.
  if (searchOpen && !q) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          {recentProductSearches.map((t) => (
            <Chip key={t} label={t} leadingIcon={<Search size="16px" />} onClick={() => onPickSearch(t)} />
          ))}
        </div>
        <Text variant="bodySmall" bold color="var(--color-on-surface-variant-highest)">
          Popular products
        </Text>
        <List>
          {popularProducts.map((p) => (
            <ProductListItem key={p.id} product={toRow(p)} onClick={() => onSelect(p)} />
          ))}
        </List>
      </div>
    );
  }

  if (searchOpen && filtered.length === 0) {
    return (
      <EmptyScreen
        icon={<Search size="var(--size-small)" />}
        title="No products found"
        message="We couldn't find any matching products. Try adjusting your search term."
      />
    );
  }

  return (
    <List>
      {!searchOpen && (
        <Card onClick={onOpenCustom} padding="0">
          <div style={{ display: 'flex', alignItems: 'center', minHeight: 'var(--size-large)' }}>
            <div
              style={{
                width: 'var(--size-large)',
                minHeight: 'var(--size-large)',
                background: 'var(--color-surface-container-low)',
                borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <Plus size="var(--icon-large)" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div style={{ padding: '0 var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <Text variant="bodyLarge" bold>
                Custom amount
              </Text>
              <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)">
                Add a one-off charge
              </Text>
            </div>
          </div>
        </Card>
      )}
      {filtered.map((p) => (
        <ProductListItem key={p.id} product={toRow(p)} onClick={() => onSelect(p)} />
      ))}
    </List>
  );
}

function CouponsList({
  query,
  searchOpen,
  onSelect,
  onPickSearch,
}: {
  query: string;
  searchOpen: boolean;
  onSelect: (c: MockCoupon) => void;
  onPickSearch: (t: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? coupons.filter((c) => c.code.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)) : coupons),
    [q],
  );

  if (searchOpen && !q) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        {recentCouponSearches.map((t) => (
          <Chip key={t} label={t} leadingIcon={<Search size="16px" />} onClick={() => onPickSearch(t)} />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyScreen
        icon={<Tag size="var(--size-small)" />}
        title="No coupons found"
        message="We couldn't find any matching coupons. Try adjusting your search term."
      />
    );
  }

  return (
    <List>
      {filtered.map((c) => (
        <CouponCard key={c.id} coupon={c} onClick={() => onSelect(c)} />
      ))}
    </List>
  );
}

function Variations({
  product,
  onBack,
  onAdd,
}: {
  product: MockProduct;
  onBack: () => void;
  onAdd: (v: { id: number; name: string; price: number }) => void;
}) {
  const vars = variations[product.id] ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar title={product.name} onBack={onBack} />
      {vars.length === 0 ? (
        <EmptyScreen
          icon={<Inventory size="var(--size-small)" />}
          title="No supported variations found"
          message={'POS currently only supports simple, variable, and virtual products –\ncreate one to get started.'}
        />
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-sm) var(--space-md) var(--space-xxl)' }}>
          <List>
            {vars.map((v) => (
              <ProductListItem
                key={v.id}
                product={{ id: v.id, name: `${product.name} · ${v.name}`, price: formatUsd(v.price) }}
                onClick={() => onAdd({ id: v.id, name: `${product.name} (${v.name})`, price: v.price })}
              />
            ))}
          </List>
        </div>
      )}
    </div>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>{children}</div>;
}

function toRow(p: MockProduct) {
  return {
    id: p.id,
    name: p.name,
    price: formatUsd(p.price),
    variable: p.variable,
  };
}
