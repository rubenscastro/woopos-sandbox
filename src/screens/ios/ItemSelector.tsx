import { useMemo, useState } from 'react';
import { PosText } from '../../components/ios/PosText';
import { PosButton } from '../../components/ios/PosButton';
import { PosItemCard } from '../../components/ios/PosItemCard';
import { PosCartPane } from '../../components/ios/PosCartPane';
import { CreateCouponSheet } from '../../components/ios/CreateCouponSheet';
import { AddCustomAmountForm } from '../../components/ios/AddCustomAmountForm';
import { PosPreSearch } from '../../components/ios/PosPreSearch';
import { PosFloatingControl } from '../../components/ios/PosFloatingControl';
import { Checkout } from './Checkout';
import { Search, Plus, ChevronLeft, Close, Tag } from '../../components/android/icons';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useNav } from '../../device/platformNav';
import { useCart } from '../../state/CartContext';
import { formatUsd } from '../../lib/currency';
// Catalog sample data is the same store on both platforms; copy differences live in the UI.
import { products } from '../../mocks/android/products';
import { coupons } from '../../mocks/android/coupons';

/**
 * iOS Item Selector — the catalog / home (Presentation/Item Selector/ + ItemListView + CartView
 * + PointOfSaleDashboardView). Tablet: items list (~65%, left) beside the cart (~35%, right),
 * mirroring the iOS dashboard HStack. Phone: items full-screen with a bottom "Cart" button that
 * opens the cart as a sheet. Header carries Products / Coupons tabs, a search toggle, and (on the
 * Coupons tab) a "+" that opens Create coupon. Uses the shared cart state.
 */
type Tab = 'products' | 'coupons';

export function ItemSelector({
  initialTab = 'products',
  autoCreateCoupon = false,
}: {
  initialTab?: Tab;
  /** Open the Create coupon sheet on mount (used by the /ios/add-coupon entry). */
  autoCreateCoupon?: boolean;
} = {}) {
  const isPhone = useIsPhone();
  const cart = useCart();
  const nav = useNav();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [createCouponOpen, setCreateCouponOpen] = useState(autoCreateCoupon);
  const [customAmountOpen, setCustomAmountOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);

  const couponSheet = (
    <CreateCouponSheet
      open={createCouponOpen}
      onClose={() => setCreateCouponOpen(false)}
      onCreated={(code, summary, discount) => {
        cart.addCoupon(code, summary, discount);
        setCreateCouponOpen(false);
      }}
    />
  );

  const customAmountForm = customAmountOpen ? (
    <AddCustomAmountForm
      onDismiss={() => setCustomAmountOpen(false)}
      onSubmit={(name, amount, taxable) => cart.addCustomAmount(name, amount, taxable)}
    />
  ) : null;

  const q = query.trim().toLowerCase();
  const shownProducts = useMemo(
    () => (q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products),
    [q],
  );
  const shownCoupons = useMemo(
    () => (q ? coupons.filter((c) => c.code.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)) : coupons),
    [q],
  );

  const list = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      {/* Header: tabs + search / create-coupon (POSPageHeaderView). */}
      <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <button type="button" aria-label="Back" onClick={() => { setSearchOpen(false); setQuery(''); }} style={iconBtn}>
              <ChevronLeft size="var(--icon-medium)" />
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'var(--color-surface-bright)', border: '2px solid var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-md)', minHeight: 'var(--size-xsmall)' }}>
              <Search size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tab === 'products' ? 'Search products' : 'Search coupons'} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-on-surface)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-body-md-size)' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            <TabTitle label="Products" active={tab === 'products'} onClick={() => setTab('products')} />
            <TabTitle label="Coupons" active={tab === 'coupons'} onClick={() => setTab('coupons')} />
            <div style={{ flex: 1 }} />
            {tab === 'coupons' && (
              <button type="button" aria-label="Create coupon" onClick={() => setCreateCouponOpen(true)} style={iconBtn}>
                <Plus size="var(--icon-small)" />
              </button>
            )}
            <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} style={iconBtn}>
              <Search size="var(--icon-small)" />
            </button>
          </div>
        )}
      </div>

      <div className="woopos-no-scrollbar" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: `0 var(--space-lg) ${isPhone ? 'var(--space-md)' : 'var(--space-xxl)'}` }}>
        {searchOpen && !q ? (
          <PosPreSearch
            tab={tab}
            onPick={(t) => setQuery(t)}
            onSelectProduct={(id, name, price) => cart.addProduct({ id, name, price })}
          />
        ) : (
          <>
        {tab === 'products' && !searchOpen && <CustomAmountEntryRow onTap={() => setCustomAmountOpen(true)} />}
        {tab === 'products'
          ? shownProducts.map((p) => (
              <PosItemCard
                key={p.id}
                item={{ id: p.id, name: p.name, detail: p.variable ? 'Options available' : formatUsd(p.price), variable: p.variable }}
                onClick={() => cart.addProduct({ id: p.id, name: p.name, price: p.price })}
              />
            ))
          : shownCoupons.map((c) => (
              <PosItemCard
                key={c.id}
                item={{ id: 100 + c.id, name: c.code, detail: c.expiredOn ? `Expired ${c.expiredOn}` : c.summary }}
                onClick={() => !c.expiredOn && cart.addCoupon(c.code, c.summary, c.discount)}
              />
            ))}
          </>
        )}
      </div>

      {isPhone && (
        <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
          <PosButton label={`Cart (${cart.itemCount})`} fullWidth onClick={() => setCartOpen(true)} />
        </div>
      )}
    </div>
  );

  if (isPhone) {
    return (
      <div style={{ height: '100%', background: 'var(--color-surface)', position: 'relative' }}>
        {list}
        {cartOpen && (
          <div className="woopos-scrim" role="presentation" onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', height: '88%', background: 'var(--color-surface-bright)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', overflow: 'hidden', boxShadow: 'var(--shadow-normal-large)', position: 'relative' }}>
              <button type="button" aria-label="Close" onClick={() => setCartOpen(false)} style={{ ...iconBtn, position: 'absolute', top: 'var(--space-sm)', right: 'var(--space-sm)', zIndex: 1 }}>
                <Close size="var(--icon-medium)" />
              </button>
              <PosCartPane onCheckout={() => nav('/checkout')} />
            </div>
          </div>
        )}
        {couponSheet}
        {customAmountForm}
      </div>
    );
  }

  // Tablet: a 3-pane horizontal row (items 65% | cart 35% | checkout 65%). "Check out" slides
  // the catalog off to the left, leaving the cart as a sidebar with the checkout on the right —
  // mirroring the Android home-screen pane transition (the iOS design keeps the same motion).
  const ROW = 165;
  return (
    <div className="woopos-fills-safe-top" style={{ overflow: 'hidden', background: 'var(--color-surface)', position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: `${ROW}%`,
          transform: checkout ? `translateX(-${(65 / ROW) * 100}%)` : 'translateX(0)',
          transition: 'transform 0.45s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <div className="woopos-safe-pane" style={{ width: `${(65 / ROW) * 100}%`, minWidth: 0 }}>{list}</div>
        <div className="woopos-safe-pane" style={{ width: `${(35 / ROW) * 100}%`, minWidth: 0, background: 'var(--color-surface-bright)' }}>
          <PosCartPane
            onCheckout={() => setCheckout(true)}
            hideCheckout={checkout}
            onBack={checkout ? () => setCheckout(false) : undefined}
          />
        </div>
        <div className="woopos-safe-pane" style={{ width: `${(65 / ROW) * 100}%`, minWidth: 0 }}>
          <Checkout onBack={() => setCheckout(false)} showBack={false} />
        </div>
      </div>
      <PosFloatingControl />
      {couponSheet}
      {customAmountForm}
    </div>
  );
}

/** iOS custom-amount entry row (Custom Amount/CustomAmountEntryRow.swift): a product-list card
 *  with a tag + plus avatar, "Custom amount" / "Add a one-off charge." */
function CustomAmountEntryRow({ onTap }: { onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      style={{
        display: 'flex', alignItems: 'stretch', width: '100%', minHeight: 112,
        background: 'var(--color-surface-container-lowest)', border: 'none',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: 0, cursor: 'pointer',
        textAlign: 'left', color: 'var(--color-on-surface)', font: 'inherit',
      }}
    >
      <div style={{ width: 112, minHeight: 112, flex: 'none', background: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Tag size="var(--icon-large)" style={{ color: 'var(--color-on-surface)' }} />
        <span style={{ position: 'absolute', right: 26, bottom: 26, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-surface-dim)' }}>
          <Plus size="12px" style={{ color: 'var(--color-on-surface)' }} />
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-xs)', padding: 'var(--space-sm) var(--space-md)' }}>
        <PosText variant="bodyLarge" bold>
          Custom amount
        </PosText>
        <PosText variant="bodyLarge" color="var(--color-on-surface-variant-highest)">
          Add a one-off charge.
        </PosText>
      </div>
    </button>
  );
}

function TabTitle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
      <PosText variant="heading" bold color={active ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant-lowest)'}>
        {label}
      </PosText>
    </button>
  );
}

const iconBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'var(--size-xsmall)',
  height: 'var(--size-xsmall)',
  borderRadius: '50%',
  background: 'var(--color-surface-container-low)',
  color: 'var(--color-on-surface)',
  border: 'none',
  boxShadow: 'var(--shadow-soft-medium)',
  cursor: 'pointer',
  flex: 'none',
};
