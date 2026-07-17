import { useState } from 'react';
import { PosText } from '../../components/ios/PosText';
import { Close, HelpCircle, ChevronLeft } from '../../components/ios/IosIcons';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useNav } from '../../device/platformNav';
import { useCardReader } from '../../tools/CardReaderContext';
import { useBarcodeSetup } from '../../tools/BarcodeSetup';
import { usePrinter } from '../../state/PrinterContext';

/**
 * iOS Settings (Settings/POSSettingsView + POSSettingsCard + detail views). Master/detail:
 * a list of setting cards (Store / Hardware) with a Help entry, and a detail pane. iOS card
 * styling; store detail content is representative. Hardware has nested pages (Card readers /
 * Barcode scanners) per POSSettingsHardwareDetailView, each its own POSItemCard, wired to the
 * shared Card reader + Barcode tools.
 */
type Category = 'store' | 'hardware' | 'help';
const CATS: { id: Category; title: string; subtitle: string }[] = [
  // iOS POS Settings sidebar: Store + Hardware (Product catalog is gated on local-catalog
  // eligibility in the real app, so it's not a default entry). Help lives at the bottom.
  { id: 'store', title: 'Store', subtitle: 'Store configuration and settings' },
  { id: 'hardware', title: 'Hardware', subtitle: 'Manage hardware connections' },
];
const BLOCKS: Record<'store' | 'help', { title: string; rows: [string, string][] }[]> = {
  store: [
    { title: 'General', rows: [['Store name', 'My WooCommerce Store'], ['Address', '123 Main Street, City, State 12345, US']] },
    { title: 'Receipt Information', rows: [['Store name', 'My WooCommerce Store'], ['Physical address', '123 Main Street, City, State 12345, US'], ['Phone number', '+1 555 1234 1234'], ['Email', 'store@example.com'], ['Refund & Returns Policy', 'Returns accepted within 30 days']] },
  ],
  help: [
    { title: '', rows: [['Where are my products?', 'Which products are supported in POS'], ['Documentation', 'Guides and tutorials'], ['Get support', 'Contact our support team']] },
  ],
};
const TITLES: Record<Category, string> = { store: 'Store', hardware: 'Hardware', help: 'Get help and support' };

export function Settings() {
  const isPhone = useIsPhone();
  const nav = useNav();
  const [cat, setCat] = useState<Category>('store');
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);
  const pick = (c: Category) => { setCat(c); if (isPhone) setShowDetailOnPhone(true); };

  const list = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        <button type="button" aria-label="Close" onClick={() => nav('/products')} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
          <Close size="var(--icon-medium)" />
        </button>
        <PosText variant="heading" bold>Settings</PosText>
      </div>
      <div className="woopos-no-scrollbar" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: '0 var(--space-lg)' }}>
        {CATS.map((c) => (
          <SettingRow key={c.id} title={c.title} subtitle={c.subtitle} selected={!isPhone && cat === c.id} onClick={() => pick(c.id)} />
        ))}
      </div>
      <button type="button" onClick={() => pick('help')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', alignSelf: 'flex-start', padding: 'var(--space-lg)', border: 'none', background: 'none', color: !isPhone && cat === 'help' ? 'var(--color-primary)' : 'var(--color-on-surface)', cursor: 'pointer' }}>
        <HelpCircle size="var(--icon-medium)" />
        <PosText variant="bodyMedium" bold color={!isPhone && cat === 'help' ? 'var(--color-primary)' : undefined}>Get help and support</PosText>
      </button>
    </div>
  );

  const detail = <SettingsDetail cat={cat} onBack={isPhone ? () => setShowDetailOnPhone(false) : undefined} />;

  if (isPhone) return <div style={{ height: '100%', background: 'var(--color-surface)' }}>{showDetailOnPhone ? detail : list}</div>;
  // Sidebar/list = posSurfaceBright (lighter); detail = posSurface (darker) — matches POSSettingsView.
  return (
    <div className="woopos-fills-safe-top" style={{ display: 'flex', background: 'var(--color-surface)' }}>
      <div className="woopos-safe-pane" style={{ flex: '0 0 34%', minWidth: 0, background: 'var(--color-surface-bright)' }}>{list}</div>
      <div className="woopos-safe-pane" style={{ flex: 1, minWidth: 0, background: 'var(--color-surface)' }}>{detail}</div>
    </div>
  );
}

type HardwareSub = 'overview' | 'cardReaders' | 'barcodeScanners' | 'printers';

function SettingsDetail({ cat, onBack }: { cat: Category; onBack?: () => void }) {
  // Hardware has nested pages (Card readers / Barcode scanners) shown on their own page.
  const [hw, setHw] = useState<HardwareSub>('overview');

  let title = TITLES[cat];
  let back = onBack;
  if (cat === 'hardware' && hw !== 'overview') {
    title = hw === 'cardReaders' ? 'Card readers' : hw === 'printers' ? 'Receipt printers' : 'Barcode scanners';
    back = () => setHw('overview');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        {back && (
          <button type="button" aria-label="Back" onClick={back} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
            <ChevronLeft size="var(--icon-medium)" />
          </button>
        )}
        <PosText variant="heading" bold>{title}</PosText>
      </div>
      <div key={`${cat}-${hw}`} className="woopos-page-anim woopos-no-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-lg) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: cat === 'hardware' ? 'var(--space-sm)' : 'var(--space-md)' }}>
        {cat === 'hardware' ? <HardwarePane sub={hw} onNavigate={setHw} /> : (
          BLOCKS[cat].map((block, bi) => (
            <div key={bi} style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--pos-shadow-medium)', padding: 'var(--space-md)' }}>
              {block.title && <div style={{ padding: 'var(--space-xs) 0' }}><PosText variant="bodyLarge" bold>{block.title}</PosText></div>}
              {block.rows.map(([label, value]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 'var(--space-sm) 0' }}>
                  <PosText variant="bodyMedium">{label}</PosText>
                  <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)">{value}</PosText>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** Hardware overview + nested Card readers / Barcode scanners pages (POSSettingsHardwareDetailView):
 *  each hardware type is its own tappable card; sub-pages wire to the shared reader/barcode tools. */
function HardwarePane({ sub, onNavigate }: { sub: HardwareSub; onNavigate: (s: HardwareSub) => void }) {
  const { openSetup } = useBarcodeSetup();
  const { connected, startConnecting, setConnected } = useCardReader();
  const printer = usePrinter();

  if (sub === 'cardReaders') {
    return (
      <>
        {connected ? (
          <SettingRow title="Disconnect reader" subtitle={`${SAMPLE_READER} · connected`} selected={false} onClick={() => setConnected(false)} />
        ) : (
          <SettingRow title="Connect card reader" subtitle="Connect your card reader and start accepting payments" selected={false} onClick={startConnecting} />
        )}
        <SettingRow title="Documentation" subtitle="Learn more about accepting mobile payments" selected={false} onClick={() => {}} />
      </>
    );
  }
  if (sub === 'barcodeScanners') {
    return (
      <>
        <SettingRow title="Scanner Setup" subtitle="Configure and test your barcode scanner" selected={false} onClick={openSetup} />
        <SettingRow title="Documentation" subtitle="Learn more about barcode scanning in POS" selected={false} onClick={() => {}} />
      </>
    );
  }
  if (sub === 'printers') {
    return (
      <>
        {printer.connected ? (
          <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--pos-shadow-medium)', padding: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
              <div style={{ minWidth: 0 }}>
                <PosText variant="bodyMedium" color="var(--color-on-surface-variant-lowest)">Device name</PosText>
                <PosText variant="bodyMedium" style={{ display: 'block' }}>{printer.name}</PosText>
              </div>
              <button type="button" onClick={printer.disconnect} style={{ border: '2px solid var(--color-inverse-surface)', background: 'transparent', color: 'var(--color-on-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-xs) var(--space-md)', cursor: 'pointer', flex: 'none' }}>
                <PosText variant="bodySmall" bold>Disconnect</PosText>
              </button>
            </div>
          </div>
        ) : (
          <SettingRow title="Connect printer" subtitle="Connect your receipt printer and start printing receipts" selected={false} onClick={printer.openSetup} />
        )}
        <SettingRow title="Documentation" subtitle="Learn more about receipt printing in POS" selected={false} onClick={() => {}} />
      </>
    );
  }
  return (
    <>
      <SettingRow title="Card readers" subtitle="Manage card reader connections" selected={false} onClick={() => onNavigate('cardReaders')} />
      <SettingRow title="Barcode scanners" subtitle="Configure barcode scanner settings" selected={false} onClick={() => onNavigate('barcodeScanners')} />
      {/* Receipt printers is feature-gated in the app (printerConnectionController); shown here. */}
      <SettingRow title="Receipt printers" subtitle="Manage receipt printer connections" selected={false} onClick={() => onNavigate('printers')} />
    </>
  );
}

const SAMPLE_READER = 'STRM261380012691';

function SettingRow({ title, subtitle, selected, onClick }: { title: string; subtitle: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', textAlign: 'left', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-lowest)', border: `2px solid ${selected ? 'var(--color-on-surface)' : 'transparent'}`, boxShadow: 'var(--pos-shadow-medium)', color: 'var(--color-on-surface)', cursor: 'pointer' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <PosText variant="bodyLarge" bold>{title}</PosText>
        <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 2 }}>{subtitle}</PosText>
      </div>
    </button>
  );
}
