import { useEffect, useMemo, useRef, useState } from 'react';
import { PosText } from '../../components/ios/PosText';
import { PosButton } from '../../components/ios/PosButton';
import { PosItemCard, CouponThumbnail } from '../../components/ios/PosItemCard';
import { PosCartPane } from '../../components/ios/PosCartPane';
import { CreateCouponSheet } from '../../components/ios/CreateCouponSheet';
import { AddCustomAmountForm } from '../../components/ios/AddCustomAmountForm';
import { PosPreSearch } from '../../components/ios/PosPreSearch';
import { PosFloatingControl, OperatorRow } from '../../components/ios/PosFloatingControl';
import { Checkout } from './Checkout';
import { Search, Plus, ChevronLeft, Tag, DotsHorizontal, Description, SettingsFilled, ExitToApp } from '../../components/ios/IosIcons';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useNav } from '../../device/platformNav';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useBarcodeSetup } from '../../tools/BarcodeSetup';
import { useFlags } from '../../state/FlagsContext';
import { useCart } from '../../state/CartContext';
import { formatUsd } from '../../lib/currency';
// Catalog sample data is the same store on both platforms; copy differences live in the UI.
import { products, variations, type MockProduct } from '../../mocks/android/products';
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
  const { openSetup } = useBarcodeSetup();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [createCouponOpen, setCreateCouponOpen] = useState(autoCreateCoupon);
  const [customAmountOpen, setCustomAmountOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  // Shared by PosCartPane (coupon green state) and Checkout (its own skeleton) so both
  // resolve on the exact same timer — the coupons must not go green before the checkout
  // pane has actually finished loading.
  const [checkoutReady, setCheckoutReady] = useState(false);
  useEffect(() => {
    if (!checkout) { setCheckoutReady(false); return; }
    const t = window.setTimeout(() => setCheckoutReady(true), 3000);
    return () => window.clearTimeout(t);
  }, [checkout]);
  const [variationOf, setVariationOf] = useState<MockProduct | null>(null);
  const [cartBumping, setCartBumping] = useState(false);
  const prevItemCount = useRef(cart.itemCount);
  useEffect(() => {
    if (cart.itemCount > prevItemCount.current) {
      setCartBumping(true);
      const t = window.setTimeout(() => setCartBumping(false), 350);
      prevItemCount.current = cart.itemCount;
      return () => window.clearTimeout(t);
    }
    prevItemCount.current = cart.itemCount;
  }, [cart.itemCount]);

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

  const catalog = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      {/* Header: tabs + search / create-coupon (POSPageHeaderView). Extra top padding keeps the
          title clear of the OS status bar. */}
      <div style={{ padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <button type="button" aria-label="Back" onClick={() => { setSearchOpen(false); setQuery(''); }} style={plainBack}>
              <ChevronLeft size="30px" />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              {tab === 'coupons' && !isPhone && (
                <button type="button" aria-label="Create coupon" onClick={() => setCreateCouponOpen(true)} style={iconBtn}>
                  <Plus size="var(--icon-small)" />
                </button>
              )}
              <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} style={iconBtn}>
                <Search size="var(--icon-small)" />
              </button>
              {/* Phone: the main menu lives top-right next to search (tablet uses the floating control).
                  When on the Coupons tab, "Create coupon" appears as the first item in this menu. */}
              {isPhone && <PhoneHeaderMenu tab={tab} onCreateCoupon={() => setCreateCouponOpen(true)} />}
            </div>
          </div>
        )}
      </div>

      {/* Extra bottom padding on tablet so the last product clears the floating menu / reader pill. */}
      <div className="woopos-no-scrollbar" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: `0 var(--space-lg) ${isPhone ? 'var(--space-md)' : 'calc(var(--size-small) + var(--space-xl))'}` }}>
        {searchOpen && !q ? (
          <PosPreSearch
            tab={tab}
            onPick={(t) => setQuery(t)}
            onSelectProduct={(id, name, price) => cart.addProduct({ id, name, price })}
          />
        ) : (
          <>
        {tab === 'products'
          ? shownProducts.map((p) => (
              <PosItemCard
                key={p.id}
                item={{ id: p.id, name: p.name, detail: p.variable ? 'Options available' : formatUsd(p.price), variable: p.variable }}
                onClick={() => (p.variable ? setVariationOf(p) : cart.addProduct({ id: p.id, name: p.name, price: p.price }))}
              />
            ))
          : shownCoupons.map((c) => (
              <PosItemCard
                key={c.id}
                item={{
                  id: 100 + c.id,
                  name: c.code,
                  detail: c.expiredOn ? `Expired ${c.expiredOn}` : c.summary,
                  thumbnail: <CouponThumbnail expired={!!c.expiredOn} />,
                  expired: !!c.expiredOn,
                }}
                onClick={() => !c.expiredOn && cart.addCoupon(c.code, c.summary, c.discount)}
              />
            ))}
          </>
        )}
      </div>

      {isPhone && (
        <div className={cartBumping ? 'woopos-cart-bump' : undefined} style={{ padding: 'var(--space-md) var(--space-lg)' }}>
          <PosButton label={`Cart (${cart.itemCount})`} fullWidth onClick={() => setCartOpen(true)} />
        </div>
      )}
    </div>
  );

  // Variable products drill into a variations list (Item Selector → variations); simple products
  // add straight to the cart.
  const list = variationOf ? (
    <IosVariations product={variationOf} onBack={() => setVariationOf(null)} onAdd={(v) => { cart.addProduct(v); setVariationOf(null); }} />
  ) : catalog;

  if (isPhone) {
    return (
      <div style={{ height: '100%', background: 'var(--color-surface)', position: 'relative' }}>
        {list}
        {cartOpen && (
          <div className="woopos-scrim" role="presentation" onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
            {/* Cart drawer: opens at 50% height with a drag handle, no close button or item count. */}
            <div className="woopos-slide-up" onClick={(e) => e.stopPropagation()} style={{ width: '100%', height: '50%', background: 'var(--color-surface-bright)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', overflow: 'hidden', boxShadow: 'var(--shadow-normal-large)', display: 'flex', flexDirection: 'column', paddingTop: 'var(--space-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-sm) 0', flex: 'none' }}>
                <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--color-outline-variant)' }} />
              </div>
              <div style={{ flex: 1, minHeight: 0, padding: '0 var(--space-md)' }}>
                <PosCartPane onCheckout={() => nav('/checkout')} onScanBarcode={() => { setCartOpen(false); openSetup(); }} showItemCount={false} />
              </div>
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
            onScanBarcode={openSetup}
            hideCheckout={checkout}
            checkoutReady={checkoutReady}
            onBack={checkout ? () => setCheckout(false) : undefined}
          />
        </div>
        <div className="woopos-safe-pane" style={{ width: `${(65 / ROW) * 100}%`, minWidth: 0 }}>
          <Checkout onBack={() => setCheckout(false)} showBack={false} loading={checkout && !checkoutReady} />
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
        borderRadius: 'var(--radius-md)', boxShadow: 'var(--pos-shadow-medium)', overflow: 'hidden', padding: 0, cursor: 'pointer',
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

/** iOS variations drill-in (Item Selector → variations): back + product name, then a list of
 *  the product's variations as item cards; tapping one adds it to the cart. */
function IosVariations({ product, onBack, onAdd }: { product: MockProduct; onBack: () => void; onAdd: (v: { id: number; name: string; price: number }) => void }) {
  const vars = variations[product.id] ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        <button type="button" aria-label="Back" onClick={onBack} style={plainBack}>
          <ChevronLeft size="30px" />
        </button>
        <PosText variant="heading" bold>{product.name}</PosText>
      </div>
      <div className="woopos-no-scrollbar" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: '0 var(--space-lg) var(--space-xxl)' }}>
        {vars.map((v) => (
          <PosItemCard
            key={v.id}
            item={{ id: v.id, name: `${product.name} · ${v.name}`, detail: formatUsd(v.price) }}
            onClick={() => onAdd({ id: v.id, name: `${product.name} (${v.name})`, price: v.price })}
          />
        ))}
      </div>
    </div>
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
  cursor: 'pointer',
  flex: 'none',
};

/** Nav back button — plain chevron, no circle container (POSPageHeaderBackButton). */
const plainBack: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  background: 'none',
  color: 'var(--color-on-surface)',
  padding: '4px 8px 4px 0',
  cursor: 'pointer',
  flex: 'none',
};

/** Phone-only header menu (top-right): the "…" main menu — Orders / Settings / Exit POS — in a
 *  liquid-glass popover, matching the tablet floating control's menu. When on the Coupons tab,
 *  "Create coupon" appears as the first item (iOS POSHeaderMenuView behaviour). */
function PhoneHeaderMenu({ tab, onCreateCoupon }: { tab: Tab; onCreateCoupon: () => void }) {
  const nav = useNav();
  const { flags } = useFlags();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const divider = <div style={{ height: 1, background: 'color-mix(in srgb, var(--color-on-surface) 12%, transparent)' }} />;
  return (
    <div ref={ref} style={{ position: 'relative', flex: 'none' }}>
      <button type="button" aria-label="Menu" onClick={() => setOpen((o) => !o)} style={iconBtn}>
        <DotsHorizontal size="var(--icon-small)" />
      </button>
      {open && (
        <div className="woopos-liquid-glass" style={{ position: 'absolute', top: 'calc(var(--size-xsmall) + var(--space-sm))', right: 0, minWidth: 200, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-normal-large)', padding: 'var(--space-xs) 0', overflow: 'hidden', zIndex: 30 }}>
          {flags.roles && (
            <>
              <OperatorRow />
              {divider}
            </>
          )}
          {tab === 'coupons' && (
            <>
              <HeaderMenuRow icon={<Plus size="var(--icon-small)" />} label="Create coupon" onClick={() => { setOpen(false); onCreateCoupon(); }} />
              {divider}
            </>
          )}
          <HeaderMenuRow icon={<Description size="var(--icon-small)" />} label="Orders" onClick={() => { setOpen(false); nav('/orders'); }} />
          {divider}
          <HeaderMenuRow icon={<SettingsFilled size="var(--icon-small)" />} label="Settings" onClick={() => { setOpen(false); nav('/settings'); }} />
          {divider}
          <HeaderMenuRow icon={<ExitToApp size="var(--icon-small)" />} label="Exit POS" onClick={() => { setOpen(false); nav('/flows'); }} />
        </div>
      )}
    </div>
  );
}
function HeaderMenuRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', padding: 'var(--space-sm) var(--space-lg)', border: 'none', background: 'transparent', color: 'var(--color-on-surface)', cursor: 'pointer' }}>
      <PosText variant="bodyMedium" style={{ flex: 1, textAlign: 'left' }}>{label}</PosText>
      <span style={{ display: 'flex', color: 'var(--color-on-surface)' }}>{icon}</span>
    </button>
  );
}
