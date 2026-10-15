import { useEffect, useMemo, useState } from 'react';
import { useNav } from '../../device/platformNav';
import { Text } from '../../components/android/Text';
import { Card } from '../../components/android/Card';
import { SearchInput } from '../../components/android/SearchInput';
import { EmptyScreen } from '../../components/android/EmptyScreen';
import { ProductListItem, ProductListItemSkeleton } from '../../components/android/ProductListItem';
import { CouponCard } from '../../components/android/CouponCard';
import { CartPanel } from '../../components/android/CartPanel';
import { CheckoutPane } from '../../components/android/CheckoutPane';
import { CustomAmountDialog } from '../../components/android/CustomAmountDialog';
import { CouponCreationDialog } from '../../components/android/CouponCreationDialog';
import { DragScroll } from '../../components/android/DragScroll';
import { FloatingToolbar } from '../../components/android/FloatingToolbar';
import { Toolbar } from '../../components/android/Toolbar';
import { OutlinedButton } from '../../components/android/Button';
import { Search, Inventory, Tag, DotsVertical, Description, SettingsFilled, ExitToApp, ArrowBack, Plus, EditSquare } from '../../components/android/icons';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useBarcodeSetup } from '../../tools/BarcodeSetup';
import { useCart } from '../../state/CartContext';
import { useFlags } from '../../state/FlagsContext';
import { useGeneralSettings } from '../../state/generalSettings';
import { useCustomAmountOption, hasKeypad } from '../../state/customAmountOption';
import '../../components/versions/custom-amounts/CustomAmountFlow.css';
import { confirmIfDirty } from '../../state/unsavedGuard';
import { useHomeDetails, openHomeDetails, closeHomeDetails, markHomeDetailsLeaving, markHomeDetailsShown } from '../../state/homeDetails';
import { CustomAmountDetailsView } from '../../screens/versions/custom-amounts/android/CustomAmountDetails';
import { TabSlideArea, TAB_ORDER } from '../../components/versions/custom-amounts/TabSlide';
import { useHomeEdit, startHomeEdit, cancelHomeEdit, saveHomeEdit } from '../../state/homeEdit';
import { HomeMenu } from '../../components/versions/custom-amounts/android/HomeMenu';
import { GlobalSearchResults } from '../../components/versions/custom-amounts/android/GlobalSearchResults';
import { HomeTiles } from '../../components/versions/custom-amounts/android/HomeTiles';
import { AddMenu } from '../../components/versions/custom-amounts/android/AddMenu';
import { KeypadPane } from '../../components/versions/custom-amounts/android/KeypadPane';
import { useCheckoutPane } from '../../state/useCheckoutPane';
import { formatUsd } from '../../lib/currency';
import { products, variations, type MockProduct } from '../../mocks/android/products';
import { coupons, type MockCoupon } from '../../mocks/android/coupons';

type Tab = 'home' | 'keypad' | 'products' | 'coupons';

/**
 * Flow 2–6 — Item selection (WooPosItemsScreen) with the cart alongside it. On tablet the
 * items list and cart sit side by side (WooPosHomePanes: items ~65%, cart ~35%); on phone
 * the items list is full-screen with a persistent "View cart" button to the cart pane.
 * Handles the Products/Coupons tabs, search, the variations drill-in, and custom amounts.
 */
export function ItemSelection() {
  const isPhone = useIsPhone();
  const cart = useCart();
  const { openSetup } = useBarcodeSetup();
  const navigate = useNav();
  // Custom amounts proposal: the flow is a full-screen modal route, not an items-pane overlay.
  const customFullScreen = useFlags().flags.customAmounts;

  // Custom amounts proposal, Option 2: a Keypad tab, first, and the screen opens on it.
  const { option } = useCustomAmountOption();
  const { keypadEnabled } = useGeneralSettings();
  const keypadAvailable = useFlags().flags.customAmounts && hasKeypad(option) && keypadEnabled;
  // Home tab proposal: a Home tab of action tiles, first, and the screen opens on it.
  const homeTab = useFlags().flags.customAmounts && option === 'option4';
  const homeEdit = useHomeEdit();
  useEffect(() => () => cancelHomeEdit(), []);
  // Starts on the right tab from the first render (not products, then corrected) — otherwise the tab
  // slide plays on every mount, e.g. when a modal route closes and returns here.
  const [tabState, setTab] = useState<Tab>(homeTab ? 'home' : keypadAvailable ? 'keypad' : 'products');
  const tab: Tab = tabState === 'home' && !homeTab ? 'products' : tabState === 'keypad' && !keypadAvailable ? 'products' : tabState;
  useEffect(() => { setTab(homeTab ? 'home' : keypadAvailable ? 'keypad' : 'products'); }, [keypadAvailable, homeTab]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [variationOf, setVariationOf] = useState<MockProduct | null>(null);
  // Custom amounts proposal: the variations list comes in and goes out like the details do — in from
  // the right over the home content (which shifts left), and back out to the right. Other versions
  // keep the plain swap.
  const slideVariations = useFlags().flags.customAmounts;
  const [variationsLeaving, setVariationsLeaving] = useState(false);
  const leaveVariations = () => {
    setVariationsLeaving(true);
    window.setTimeout(() => { setVariationOf(null); setVariationsLeaving(false); }, 300);
  };
  const [customOpen, setCustomOpen] = useState(false);
  // Custom amounts, Option 2: the details open in this pane, in place of the tabs and their content.
  const home = useHomeDetails();
  useEffect(() => () => closeHomeDetails(), []);
  const [couponCreateOpen, setCouponCreateOpen] = useState(false);
  // Persisted so returning from a full-screen payment sub-screen (cash / scan / mark-as-paid)
  // lands back on the checkout pane, not the bare product list. See useCheckoutPane.
  const [checkout, setCheckout] = useCheckoutPane(cart.itemCount);

  // Shared by CartPanel (coupon green state) and CheckoutPane (its own skeleton) so both
  // resolve on the exact same timer — the coupons must not go green before the checkout
  // pane has actually finished loading.
  const [checkoutReady, setCheckoutReady] = useState(false);
  useEffect(() => {
    if (!checkout) { setCheckoutReady(false); return; }
    const t = window.setTimeout(() => setCheckoutReady(true), 3000);
    return () => window.clearTimeout(t);
  }, [checkout]);

  const goScan = () => openSetup();

  const itemsPane = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, position: 'relative' }}>
      {/* Option 2B: the home content stays mounted and slides left while the details come in over it. */}
      <div className="ca-home-shift" data-away={(home.open && !home.leaving && home.shown !== false) || (slideVariations && !!variationOf && !variationsLeaving)} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {variationOf && !slideVariations ? (
        <Variations product={variationOf} onBack={() => setVariationOf(null)} onAdd={(v) => {
          cart.addProduct(v);
          setVariationOf(null);
        }} />
      ) : (
        <>
          <ItemsToolbar
            keypadAvailable={keypadAvailable}
            homeEditing={homeTab && tab === 'home' && homeEdit.editing}
            homeTab={homeTab}
            addMenu={useFlags().flags.customAmounts && option === 'option3'}
            onAddCustomAmount={() => navigate('/custom-amount-details', { state: { fresh: true } })}
            tab={tab}
            onTab={setTab}
            searchOpen={searchOpen}
            query={query}
            onQuery={setQuery}
            onToggleSearch={() => {
              // The Keypad has nothing to search, so its search goes to Products; the Home tab keeps its own,
              // a search over products and coupons together.
              if (tab === 'keypad') setTab('products');
              setSearchOpen((o) => !o);
              setQuery('');
            }}
            onAddCoupon={() => setCouponCreateOpen(true)}
          />
          <TabSlideArea tab={tab} order={TAB_ORDER} enabled={slideVariations} render={(t) => (t === 'home' ? (searchOpen ? <DragScroll style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isPhone ? 'var(--space-sm) var(--space-md) var(--space-md)' : 'var(--space-sm) var(--space-md) calc(var(--size-small) + var(--space-xxl))' }}><GlobalSearchResults query={query} onSelectProduct={(p) => { if (p.variable) setVariationOf(p); else cart.addProduct({ id: p.id, name: p.name, price: p.price }); }} onSelectCoupon={(c) => cart.addCoupon(c.code, c.summary, c.discount)} /></DragScroll> : <HomeTiles onCoupon={(c) => cart.addCoupon(c.code, c.summary, c.discount)} clearBottom={!isPhone} onCustomAmount={() => openHomeDetails(undefined, true)} onApplyCoupon={() => setTab('coupons')} onProduct={(p) => { if (p.variable) setVariationOf(p); else cart.addProduct({ id: p.id, name: p.name, price: p.price }); }} />) : t === 'keypad' ? <KeypadPane clearBottom={!isPhone} /> : <DragScroll
            style={{
              flex: 1,
              // Tablet clears the bottom-left floating toolbar; phone has none, so just a small pad.
              padding: isPhone
                ? 'var(--space-sm) var(--space-md) var(--space-md)'
                : 'var(--space-sm) var(--space-md) calc(var(--size-small) + var(--space-xxl))',
            }}
          >
            {t === 'products' ? (
              <ProductsList
                query={query}
                searchOpen={searchOpen}
                onOpenCustom={() => (customFullScreen ? navigate('/custom-amount-details', { state: { fresh: true } }) : setCustomOpen(true))}
                onSelect={(p) => {
                  if (p.variable) setVariationOf(p);
                  else cart.addProduct({ id: p.id, name: p.name, price: p.price });
                }}
              />
            ) : (
              <CouponsList
                query={query}
                searchOpen={searchOpen}
                onSelect={(c) => cart.addCoupon(c.code, c.summary, c.discount)}
              />
            )}
          </DragScroll>)} />
        </>
      )}
      </div>
      {slideVariations && variationOf && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 40 }}>
          <div className={variationsLeaving ? 'ca-push-out' : 'ca-push-in'} style={{ height: '100%', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
            <Variations product={variationOf} onBack={leaveVariations} onAdd={(v) => { cart.addProduct(v); leaveVariations(); }} />
          </div>
        </div>
      )}
      {home.open && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 40 }}>
          <CustomAmountDetailsView editKey={home.editKey} fresh={home.fresh} onClose={closeHomeDetails} onLeaveStart={markHomeDetailsLeaving} onShown={markHomeDetailsShown} ctaPlacement="title" />
        </div>
      )}

      {customOpen && (
        <CustomAmountDialog
          onDismiss={() => setCustomOpen(false)}
          onSubmit={(name, amount, taxable) => {
            cart.addCustomAmount(name, amount, taxable);
            setCustomOpen(false);
          }}
        />
      )}

      {couponCreateOpen && (
        <CouponCreationDialog
          onDismiss={() => setCouponCreateOpen(false)}
          onCreate={(code, summary, discount) => {
            cart.addCoupon(code, summary, discount);
            setCouponCreateOpen(false);
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
    <div className="woopos-fills-safe-top" style={{ overflow: 'hidden', position: 'relative' }}>
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
          <CartPanel
            onCheckout={() => confirmIfDirty(() => setCheckout(true))}
            onScanBarcode={goScan}
            hideCheckout={checkout}
            checkoutReady={checkoutReady}
            onBack={checkout ? () => setCheckout(false) : undefined}
            hideClear={checkout}
            hideRemove={checkout}
          />
        </div>
        <div className="woopos-safe-pane" style={{ width: `${(65 / ROW) * 100}%`, minWidth: 0 }}>
          <CheckoutPane active={checkout} loading={checkout && !checkoutReady} onBack={() => setCheckout(false)} showBackButton={false} />
        </div>
      </div>

      {/* Rendered outside the sliding row so the menu + card-reader stay pinned bottom-left
          across both the items and checkout panes — except over the custom amount form, which
          owns the whole pane down to its own submit button
          (WooPosHomeScreen: `itemsState !is CustomAmountForm`). */}
      {!customOpen && <FloatingToolbar />}
    </div>
  );
}

function ItemsToolbar({
  homeEditing,
  keypadAvailable,
  homeTab,
  addMenu,
  onAddCustomAmount,
  tab,
  onTab,
  searchOpen,
  query,
  onQuery,
  onToggleSearch,
  onAddCoupon,
}: {
  /** Option 4: the Home page is in edit mode. */
  homeEditing?: boolean;
  keypadAvailable?: boolean;
  homeTab?: boolean;
  /** Option 3: a + menu left of search on the Products tab. */
  addMenu?: boolean;
  onAddCustomAmount: () => void;
  tab: Tab;
  onTab: (t: Tab) => void;
  searchOpen: boolean;
  query: string;
  onQuery: (q: string) => void;
  onToggleSearch: () => void;
  onAddCoupon: () => void;
}) {
  const isPhone = useIsPhone();
  return (
    <div style={{ padding: homeEditing ? 'var(--space-md) var(--space-md) 0' : 'var(--space-md)' }}>
      {homeEditing ? (
        // Home page edit mode (Figma 4310-42449): just the title, with Cancel and Save.
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', minHeight: 'var(--size-xsmall)' }}>
          <TabButton label="Home" active onClick={() => {}} />
          <div style={{ flex: 1 }} />
          <OutlinedButton text="Cancel" size="small" onClick={cancelHomeEdit} />
          <OutlinedButton text="Save" size="small" onClick={saveHomeEdit} />
        </div>
      ) : searchOpen ? (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onToggleSearch}
            aria-label="Back"
            style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, flex: 'none', cursor: 'pointer' }}
          >
            <ArrowBack size="var(--icon-medium)" />
          </button>
          <div style={{ flex: 1 }}>
            <SearchInput
              value={query}
              onChange={onQuery}
              autoFocus
              placeholder={tab === 'home' ? 'Search products and coupons' : tab === 'products' ? 'Search products' : 'Search coupons'}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          {homeTab && <TabButton label="Home" active={tab === 'home'} onClick={() => onTab('home')} />}
          {keypadAvailable && <TabButton label="Keypad" active={tab === 'keypad'} onClick={() => onTab('keypad')} />}
          <TabButton label="Products" active={tab === 'products'} onClick={() => onTab('products')} />
          <TabButton label="Coupons" active={tab === 'coupons'} onClick={() => onTab('coupons')} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            {tab === 'coupons' && !isPhone && (
              <RoundIconButton ariaLabel="Create coupon" onClick={onAddCoupon}>
                <Plus size="var(--icon-small)" />
              </RoundIconButton>
            )}
            {addMenu && tab === 'products' && <AddMenu onAddCustomAmount={onAddCustomAmount} />}
            {homeTab && tab === 'home' && <HomeMenu onEditHomePage={startHomeEdit} />}
            <RoundIconButton ariaLabel="Search products" onClick={onToggleSearch}>
              <Search size="var(--icon-small)" />
            </RoundIconButton>
            {isPhone && <PhoneMenu tab={tab} onAddCoupon={onAddCoupon} />}
          </div>
        </div>
      )}
    </div>
  );
}

function RoundIconButton({ children, ariaLabel, onClick }: { children: React.ReactNode; ariaLabel: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
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
        flex: 'none',
      }}
    >
      {children}
    </button>
  );
}

/** Phone-only overflow menu (Orders / Settings / Exit POS), matching the tablet floating menu. */
function PhoneMenu({ tab, onAddCoupon }: { tab: Tab; onAddCoupon: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNav();
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative', flex: 'none' }}>
      <RoundIconButton ariaLabel="Menu" onClick={() => setOpen((o) => !o)}>
        <DotsVertical size="var(--icon-small)" />
      </RoundIconButton>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-sm))',
            right: 0,
            zIndex: 30,
            minWidth: 200,
            background: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-normal-large)',
            padding: 'var(--space-xs)',
          }}
        >
          {tab === 'coupons' && (
            <PhoneMenuRow icon={<Tag size="var(--icon-small)" />} label="Create coupon" onClick={() => { setOpen(false); onAddCoupon(); }} />
          )}
          <PhoneMenuRow icon={<Description size="var(--icon-small)" />} label="Orders" onClick={() => { setOpen(false); navigate('/order-history'); }} />
          <PhoneMenuRow icon={<SettingsFilled size="var(--icon-small)" />} label="Settings" onClick={() => { setOpen(false); navigate('/settings'); }} />
          <PhoneMenuRow icon={<ExitToApp size="var(--icon-small)" />} label="Exit POS" onClick={() => { setOpen(false); navigate('/flows'); }} />
        </div>
      )}
    </div>
  );
}

function PhoneMenuRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        width: '100%',
        padding: 'var(--space-sm) var(--space-md)',
        border: 'none',
        background: 'transparent',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-on-surface)',
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', color: 'var(--color-on-surface-variant-highest)' }}>{icon}</span>
      <Text variant="bodyMedium">{label}</Text>
    </button>
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
}: {
  query: string;
  searchOpen: boolean;
  onOpenCustom: () => void;
  onSelect: (p: MockProduct) => void;
}) {
  const { flags } = useFlags();
  const { keypadEnabled } = useGeneralSettings();
  const { option } = useCustomAmountOption();
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => (q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products), [q]);

  // Simulate the catalog loading on first mount so the skeleton cards are exercised.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 750);
    return () => window.clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <List>
        {Array.from({ length: 7 }).map((_, i) => (
          <ProductListItemSkeleton key={i} />
        ))}
      </List>
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
    <>
      {searchOpen && !q && (
        <Text variant="bodyLarge" bold style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
          Popular products
        </Text>
      )}
      <List>
        {!searchOpen && !(flags.customAmounts && (!keypadEnabled || option !== 'option1')) && (
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
                {flags.customAmounts
                  ? <EditSquare size="var(--icon-large)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
                  : <Tag size="var(--icon-large)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />}
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
    </>
  );
}

function CouponsList({
  query,
  searchOpen,
  onSelect,
}: {
  query: string;
  searchOpen: boolean;
  onSelect: (c: MockCoupon) => void;
}) {
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? coupons.filter((c) => c.code.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)) : coupons),
    [q],
  );

  // Simulate the coupon list loading when the tab is opened.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 750);
    return () => window.clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <List>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductListItemSkeleton key={i} />
        ))}
      </List>
    );
  }

  if (searchOpen && !q) {
    return <List>{null}</List>;
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
