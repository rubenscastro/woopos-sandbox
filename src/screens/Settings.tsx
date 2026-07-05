import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button, OutlinedButton } from '../components/Button';
import { Toolbar } from '../components/Toolbar';
import { MenuItem, InfoRow } from '../components/MenuItem';
import { useIsPhone } from '../hooks/useBreakpoint';
import { useBarcodeSetup } from '../tools/BarcodeSetup';
import { useCardReader } from '../tools/CardReaderContext';

/**
 * Flows 16–19 — Settings (WooPosSettingsScreen). Two-pane master/detail: category list on
 * the left, detail on the right (tablet); stacked on phone. Categories: Store, Hardware
 * (→ card reader / barcode scanner), Product catalog, plus a Help entry. The "Where are my
 * products?" product-info dialog is reachable from Help.
 */
type Category = 'store' | 'hardware' | 'catalog' | 'help';

const CATEGORIES: { id: Category; title: string; subtitle: string }[] = [
  { id: 'store', title: 'Store', subtitle: 'Store configuration and settings' },
  { id: 'hardware', title: 'Hardware', subtitle: 'Manage hardware connections' },
  { id: 'catalog', title: 'Product catalog', subtitle: 'Manage catalog settings' },
  { id: 'help', title: 'Get help and support', subtitle: 'Documentation and support' },
];

export function Settings({ initialCategory = 'store' }: { initialCategory?: Category }) {
  const navigate = useNavigate();
  const isPhone = useIsPhone();
  const [category, setCategory] = useState<Category>(initialCategory);
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);

  const categoryList = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar title="Settings" onBack={() => navigate('/products')} backIcon="close" />
      <div className="woopos-no-scrollbar" style={{ flex: 1, overflow: 'auto', padding: 'var(--space-sm) var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {CATEGORIES.map((c) => (
          <MenuItem
            key={c.id}
            title={c.title}
            subtitle={c.subtitle}
            selected={!isPhone && category === c.id}
            onClick={() => {
              setCategory(c.id);
              if (isPhone) setShowDetailOnPhone(true);
            }}
          />
        ))}
      </div>
    </div>
  );

  const detail = (
    <SettingsDetail key={category} category={category} onBack={isPhone ? () => setShowDetailOnPhone(false) : undefined} />
  );

  if (isPhone) {
    return <div style={{ height: '100%' }}>{showDetailOnPhone ? detail : categoryList}</div>;
  }

  return (
    <div className="woopos-fills-safe-top" style={{ display: 'flex' }}>
      <div className="woopos-safe-pane" style={{ flex: '0 0 34%', minWidth: 0 }}>
        {categoryList}
      </div>
      <div className="woopos-safe-pane" style={{ flex: 1, minWidth: 0, background: 'var(--color-surface-bright)' }}>
        {detail}
      </div>
    </div>
  );
}

type HardwareSub = 'overview' | 'cardReaders' | 'barcodeScanners';

function SettingsDetail({ category, onBack }: { category: Category; onBack?: () => void }) {
  // Hardware has nested pages (Card readers / Barcode scanners), shown on their own page.
  const [hw, setHw] = useState<HardwareSub>('overview');

  let title: string;
  let toolbarBack: (() => void) | undefined = onBack;
  if (category === 'hardware') {
    if (hw === 'cardReaders') {
      title = 'Card readers';
      toolbarBack = () => setHw('overview');
    } else if (hw === 'barcodeScanners') {
      title = 'Barcode scanners';
      toolbarBack = () => setHw('overview');
    } else {
      title = 'Hardware';
    }
  } else {
    title =
      category === 'store' ? 'Store' : category === 'catalog' ? 'Product catalog' : 'Get help and support';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar title={title} onBack={toolbarBack} />
      <div
        key={`${category}-${hw}`}
        className="woopos-page-anim woopos-no-scrollbar"
        style={{ flex: 1, overflow: 'auto', padding: 'var(--space-md) var(--space-lg) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      >
        {category === 'store' && <StorePane />}
        {category === 'hardware' && <HardwarePane sub={hw} onNavigate={setHw} />}
        {category === 'catalog' && <CatalogPane />}
        {category === 'help' && <HelpPane />}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding="var(--space-md)">
      <Text variant="bodyLarge" bold style={{ display: 'block', marginBottom: 'var(--space-md)' }}>
        {title}
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>{children}</div>
    </Card>
  );
}

function StorePane() {
  return (
    <>
      <SectionCard title="General">
        <InfoRow label="Store name" value="My WooCommerce Store" />
        <InfoRow label="Address" value="123 Main Street, City, State 12345, US" />
      </SectionCard>
      <SectionCard title="Receipt information">
        <InfoRow label="Store name" value="My WooCommerce Store" />
        <InfoRow label="Physical address" value="123 Main Street, City, State 12345, US" />
        <InfoRow label="Phone number" value="+1 555 1234 1234" />
        <InfoRow label="Email" value="store@example.com" />
        <InfoRow label="Refund and return policy" value="Returns accepted within 30 days" />
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <OutlinedButton text="Edit receipt information" size="small" onClick={() => {}} />
        </div>
      </SectionCard>
    </>
  );
}

function HardwarePane({ sub, onNavigate }: { sub: HardwareSub; onNavigate: (s: HardwareSub) => void }) {
  const { openSetup } = useBarcodeSetup();
  const { connected, startConnecting, setConnected } = useCardReader();

  if (sub === 'cardReaders') {
    return (
      <>
        {connected ? (
          <MenuItem title="Disconnect reader" subtitle="Stripe Reader M2 · connected" onClick={() => setConnected(false)} />
        ) : (
          <MenuItem title="Connect card reader" subtitle="Make sure card reader is charged" onClick={startConnecting} />
        )}
        <MenuItem title="Documentation" subtitle="Learn more about accepting mobile payments" onClick={() => {}} />
      </>
    );
  }

  if (sub === 'barcodeScanners') {
    return (
      <>
        <MenuItem title="Scanner Setup" subtitle="Configure and test your barcode scanner" onClick={openSetup} />
        <MenuItem title="Documentation" subtitle="Learn more about barcode scanning in POS" onClick={() => {}} />
      </>
    );
  }

  // Overview
  return (
    <>
      <MenuItem title="Card readers" subtitle="Manage card reader connections" onClick={() => onNavigate('cardReaders')} />
      <MenuItem title="Barcode scanners" subtitle="Set up and test your barcode scanner" onClick={() => onNavigate('barcodeScanners')} />
    </>
  );
}

function CatalogPane() {
  const [cellular, setCellular] = useState(true);
  return (
    <>
      <SectionCard title="Catalog status">
        <InfoRow label="Size" value="1250 products and 3420 variations" />
        <InfoRow label="Last incremental sync" value="2 hours ago" />
        <InfoRow label="Last full sync" value="Yesterday at 3:45 PM" />
      </SectionCard>
      <Card padding="var(--space-md)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text variant="bodyLarge" bold>
              Cellular data
            </Text>
            <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
              Allow sync using cellular data
            </Text>
          </div>
          <MiniSwitch checked={cellular} onChange={setCellular} />
        </div>
      </Card>
      <Card padding="var(--space-md)">
        <Text variant="bodyLarge" bold style={{ display: 'block' }}>
          Catalog update
        </Text>
        <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
          Update the catalog manually
        </Text>
        <Button text="Update catalog" size="small" onClick={() => {}} />
      </Card>
    </>
  );
}

function HelpPane() {
  const [dialog, setDialog] = useState(false);
  return (
    <>
      <MenuItem title="Where are my products?" subtitle="Learn about which products are supported in POS" onClick={() => setDialog(true)} />
      <MenuItem title="Documentation" subtitle="View guides and tutorials" onClick={() => {}} />
      <MenuItem title="Get Support" subtitle="Contact our support team" onClick={() => {}} />
      {dialog && <ProductInfoDialog onDismiss={() => setDialog(false)} />}
    </>
  );
}

function ProductInfoDialog({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="woopos-scrim"
      style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}
      onClick={onDismiss}
      role="presentation"
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--color-surface-bright)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', textAlign: 'center' }}>
        <Text variant="heading" bold align="center">
          Why can't I see my products?
        </Text>
        <Text variant="bodyLarge" align="center">
          Only simple physical, variable and virtual products can be used with POS right now.
        </Text>
        <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
          Other product types will be available in future updates.
        </Text>
        <Text variant="bodySmall" align="center" color="var(--color-on-surface-variant-highest)" style={{ background: 'var(--color-surface-dim)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
          To take payment for other products, exit POS and create a new order from the orders tab.
        </Text>
        <OutlinedButton text="OK" fullWidth onClick={onDismiss} />
      </div>
    </div>
  );
}

function MiniSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{ width: 52, height: 32, borderRadius: 16, border: 'none', background: checked ? 'var(--color-primary)' : 'var(--color-outline-variant)', position: 'relative', flex: 'none' }}
    >
      <span style={{ position: 'absolute', top: 4, left: checked ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
    </button>
  );
}
