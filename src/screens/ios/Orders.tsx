import { useState } from 'react';
import { PosText } from '../../components/ios/PosText';
import { Close, ChevronLeft } from '../../components/android/icons';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useNav } from '../../device/platformNav';
import { formatUsd } from '../../lib/currency';
import { orders, STATUS_COLORS, type MockOrder } from '../../mocks/android/orders';

/**
 * iOS Orders (Orders/POSOrdersView + POSOrderListView + POSOrderDetailsView). Master/detail:
 * order list on the left, details ("Items" + "Totals" sections) on the right (tablet);
 * stacked on phone. Empty: "No orders yet". Same order data as Android; iOS card styling.
 */
export function Orders() {
  const isPhone = useIsPhone();
  const nav = useNav();
  const [selectedId, setSelectedId] = useState(orders[0].id);
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);
  const selected = orders.find((o) => o.id === selectedId) ?? orders[0];

  const list = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        <button type="button" aria-label="Close" onClick={() => nav('/products')} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
          <Close size="var(--icon-medium)" />
        </button>
        <PosText variant="heading" bold>Orders</PosText>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: '0 var(--space-lg) var(--space-xxl)' }}>
        {orders.map((o) => (
          <OrderRow key={o.id} order={o} selected={!isPhone && o.id === selectedId} onClick={() => { setSelectedId(o.id); if (isPhone) setShowDetailOnPhone(true); }} />
        ))}
      </div>
    </div>
  );

  const detail = <OrderDetail order={selected} onBack={isPhone ? () => setShowDetailOnPhone(false) : undefined} />;

  if (isPhone) return <div style={{ height: '100%', background: 'var(--color-surface)' }}>{showDetailOnPhone ? detail : list}</div>;

  return (
    <div className="woopos-fills-safe-top" style={{ display: 'flex', background: 'var(--color-surface)' }}>
      <div className="woopos-safe-pane" style={{ flex: '1 1 38%', minWidth: 0 }}>{list}</div>
      <div className="woopos-safe-pane" style={{ flex: '1 1 62%', minWidth: 0, background: 'var(--color-surface-bright)' }}>{detail}</div>
    </div>
  );
}

function OrderRow({ order, selected, onClick }: { order: MockOrder; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)', width: '100%', textAlign: 'left', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-lowest)', border: `2px solid ${selected ? 'var(--color-on-surface)' : 'transparent'}`, color: 'var(--color-on-surface)', cursor: 'pointer' }}>
      <div style={{ minWidth: 0 }}>
        <PosText variant="bodyLarge" bold>Order {order.number}</PosText>
        <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 2 }}>{order.date}</PosText>
        <div style={{ marginTop: 'var(--space-sm)' }}><Badge status={order.status} /></div>
      </div>
      <PosText variant="bodyLarge" bold>{formatUsd(order.total)}</PosText>
    </button>
  );
}

function OrderDetail({ order, onBack }: { order: MockOrder; onBack?: () => void }) {
  const productsSubtotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        {onBack && (
          <button type="button" aria-label="Back" onClick={onBack} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: '4px 8px 4px 0', cursor: 'pointer' }}>
            <ChevronLeft size="30px" />
          </button>
        )}
        <PosText variant="heading" bold>Order {order.number}</PosText>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: '0 var(--space-lg) var(--space-xxl)' }}>
        <div><Badge status={order.status} /></div>
        <Section title="Items">
          {order.items.map((it, i) => (
            <div key={i}>
              {i > 0 && <PosDivider />}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
                <PosText variant="bodyLarge">{it.name} × {it.quantity}</PosText>
                <PosText variant="bodyLarge">{formatUsd(it.lineTotal)}</PosText>
              </div>
            </div>
          ))}
        </Section>
        <Section title="Totals">
          <SumRow label="Products" value={formatUsd(productsSubtotal)} />
          <PosDivider />
          {order.discountTotal > 0 && <><SumRow label="Discount total" value={`-${formatUsd(order.discountTotal)}`} /><PosDivider /></>}
          <SumRow label="Taxes" value={formatUsd(order.taxTotal)} />
          <PosDivider />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <PosText variant="bodyLarge" bold>Total</PosText>
            <PosText variant="bodyLarge" bold>{formatUsd(order.total)}</PosText>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <PosText variant="bodyLarge" bold style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>{title}</PosText>
      {children}
    </div>
  );
}
function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)">{label}</PosText>
      <PosText variant="bodyMedium">{value}</PosText>
    </div>
  );
}
/** iOS POSDivider: a hairline in posOutlineVariant at 50% opacity. */
function PosDivider() {
  return <div style={{ height: 1, background: 'color-mix(in srgb, var(--color-outline-variant) 50%, transparent)' }} />;
}
function Badge({ status }: { status: MockOrder['status'] }) {
  const c = STATUS_COLORS[status];
  return <span style={{ display: 'inline-block', background: c.bg, color: c.fg, borderRadius: 'var(--radius-md)', padding: '4px 10px', fontSize: 'var(--font-caption-size)', fontWeight: 700 }}>{status}</span>;
}
