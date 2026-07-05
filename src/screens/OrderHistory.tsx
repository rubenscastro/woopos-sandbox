import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button, OutlinedButton } from '../components/Button';
import { Toolbar } from '../components/Toolbar';
import { Inventory } from '../components/icons';
import { useIsPhone } from '../hooks/useBreakpoint';
import { formatUsd } from '../lib/currency';
import { orders, STATUS_COLORS, type MockOrder, type OrderLineItem } from '../mocks/orders';

/**
 * Flow 14 — Order history (WooPosOrdersScreen + details + refund). Two-pane list/detail on
 * tablet, stacked on phone. Order details show line items, totals, and refunds; "Issue
 * refund" opens an item-selection → confirm refund sub-flow.
 */
export function OrderHistory() {
  const navigate = useNavigate();
  const isPhone = useIsPhone();
  const [selectedId, setSelectedId] = useState<number>(orders[0].id);
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);
  const selected = orders.find((o) => o.id === selectedId) ?? orders[0];

  const list = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar title="Orders" onBack={() => navigate('/products')} />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-sm) var(--space-md) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {orders.map((o) => (
          <OrderRow
            key={o.id}
            order={o}
            selected={!isPhone && o.id === selectedId}
            onClick={() => {
              setSelectedId(o.id);
              if (isPhone) setShowDetailOnPhone(true);
            }}
          />
        ))}
      </div>
    </div>
  );

  const detail = (
    <OrderDetail
      order={selected}
      onBack={isPhone ? () => setShowDetailOnPhone(false) : undefined}
      onEmail={() => navigate('/email-receipt')}
    />
  );

  if (isPhone) {
    return <div style={{ height: '100%' }}>{showDetailOnPhone ? detail : list}</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: '1 1 38%', minWidth: 0, borderRight: '1px solid var(--color-outline-variant)' }}>{list}</div>
      <div style={{ flex: '1 1 62%', minWidth: 0, background: 'var(--color-surface-bright)' }}>{detail}</div>
    </div>
  );
}

function OrderRow({ order, selected, onClick }: { order: MockOrder; selected: boolean; onClick: () => void }) {
  return (
    <Card onClick={onClick} selected={selected} padding="var(--space-md)">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
        <div style={{ minWidth: 0 }}>
          <Text variant="bodyLarge" bold>
            Order {order.number}
          </Text>
          <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 2 }}>
            {order.date}
          </Text>
          {order.customerEmail && (
            <Text variant="bodySmall" color="var(--color-on-surface-variant-lowest)" style={{ display: 'block' }}>
              {order.customerEmail}
            </Text>
          )}
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <StatusBadge status={order.status} />
          </div>
        </div>
        <Text variant="bodyLarge" bold>
          {formatUsd(order.total)}
        </Text>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: MockOrder['status'] }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: 'inline-block',
        background: c.bg,
        color: c.fg,
        borderRadius: 'var(--radius-md)',
        padding: '4px 10px',
        fontSize: 'var(--font-caption-size)',
        fontWeight: 700,
      }}
    >
      {status}
    </span>
  );
}

function OrderDetail({ order, onBack, onEmail }: { order: MockOrder; onBack?: () => void; onEmail: () => void }) {
  const [refunding, setRefunding] = useState(false);

  if (refunding) {
    return <IssueRefund order={order} onDone={() => setRefunding(false)} />;
  }

  const productsSubtotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
  const refundTotal = order.refunds.reduce((s, r) => s + r.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar title={`Order ${order.number}`} onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-md) var(--space-lg) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div>
          <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
            {order.date}
          </Text>
          {order.customerEmail && (
            <Text variant="bodySmall" color="var(--color-on-surface-variant-lowest)" style={{ display: 'block' }}>
              {order.customerEmail}
            </Text>
          )}
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <Section title="Products">
          {order.items.map((it, i) => (
            <LineItemRow key={i} item={it} />
          ))}
        </Section>

        <Section title="Totals">
          <TotalRow label="Products" value={formatUsd(productsSubtotal)} />
          {order.discountTotal > 0 && (
            <TotalRow
              label={`Discount total${order.discountCode ? ` (${order.discountCode})` : ''}`}
              value={`-${formatUsd(order.discountTotal)}`}
            />
          )}
          <TotalRow label="Taxes" value={formatUsd(order.taxTotal)} />
          <Divider />
          <TotalRow label="Total" value={formatUsd(order.total)} bold />
          <TotalRow label="Total paid" value={formatUsd(order.total)} bold />
          <Text variant="caption" color="var(--color-on-surface-variant-lowest)">
            Via {order.paymentMethod}
          </Text>
          {order.refunds.map((r) => (
            <div key={r.id} style={{ marginTop: 'var(--space-sm)' }}>
              <TotalRow label={`Refund #${r.id}`} value={`-${formatUsd(r.amount)}`} />
              <Text variant="caption" color="var(--color-on-surface-variant-lowest)" style={{ display: 'block' }}>
                {r.date}
              </Text>
              {r.reason && (
                <Text variant="caption" color="var(--color-on-surface-variant-lowest)" style={{ display: 'block' }}>
                  {r.reason}
                </Text>
              )}
            </div>
          ))}
          {refundTotal > 0 && (
            <>
              <Divider />
              <TotalRow label="Total Net" value={formatUsd(order.total - refundTotal)} bold />
            </>
          )}
        </Section>
      </div>

      <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <Button text="Issue refund" fullWidth onClick={() => setRefunding(true)} />
        </div>
        <div style={{ flex: 1 }}>
          <OutlinedButton text="Email receipt" fullWidth onClick={onEmail} />
        </div>
      </div>
    </div>
  );
}

function IssueRefund({ order, onDone }: { order: MockOrder; onDone: () => void }) {
  const [selected, setSelected] = useState<Set<number>>(new Set(order.items.map((_, i) => i)));
  const [confirming, setConfirming] = useState(false);

  const refundTotal = order.items.reduce((s, it, i) => (selected.has(i) ? s + it.lineTotal : s), 0);
  const count = selected.size;

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  if (confirming) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Toolbar title="Confirm refund" onBack={() => setConfirming(false)} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)', padding: 'var(--space-xl)', textAlign: 'center' }}>
          <Text variant="heading" bold align="center">
            Refund {formatUsd(refundTotal)}
          </Text>
          <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)" style={{ maxWidth: 480 }}>
            Are you sure you wish to process the refund {formatUsd(refundTotal)} via {order.paymentMethod}?
            {'\n\n'}This action cannot be undone.
          </Text>
          <div className="woopos-fullscreen-action" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Button text="Yes, proceed" fullWidth onClick={onDone} />
            <OutlinedButton text="Cancel" fullWidth onClick={() => setConfirming(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar title="Select items to refund" onBack={onDone} />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-md) var(--space-lg)' }}>
        <Text variant="bodySmall" bold color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
          {count} SELECTED
        </Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {order.items.map((it, i) => (
            <Card key={i} onClick={() => toggle(i)} selected={selected.has(i)} padding="var(--space-sm)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <input type="checkbox" checked={selected.has(i)} readOnly style={{ width: 20, height: 20, accentColor: 'var(--color-primary)' }} />
                <div style={{ width: 'var(--size-medium)', height: 'var(--size-medium)', background: 'var(--color-surface-dim)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Inventory size="var(--icon-medium)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyLarge" bold style={{ display: 'block' }}>
                    {it.name}
                  </Text>
                  <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
                    {it.quantity} × {formatUsd(it.unitPrice)}
                  </Text>
                </div>
                <Text variant="bodyLarge">{formatUsd(it.lineTotal)}</Text>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-outline-variant)' }}>
        <Button text={`Continue · ${formatUsd(refundTotal)}`} fullWidth state={count > 0 ? 'enabled' : 'disabled'} onClick={() => setConfirming(true)} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding="var(--space-md)" shadow="soft">
      <Text variant="bodyLarge" bold style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
        {title}
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>{children}</div>
    </Card>
  );
}

function LineItemRow({ item }: { item: OrderLineItem }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
      <div style={{ width: 'var(--size-medium)', height: 'var(--size-medium)', background: 'var(--color-surface-dim)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <Inventory size="var(--icon-medium)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyLarge" bold style={{ display: 'block' }}>
          {item.name}
        </Text>
        {item.attributes && (
          <Text variant="bodySmall" color="var(--color-on-surface-variant-lowest)" style={{ display: 'block' }}>
            {item.attributes}
          </Text>
        )}
        <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
          {item.quantity} × {formatUsd(item.unitPrice)}
        </Text>
      </div>
      <Text variant="bodyLarge">{formatUsd(item.lineTotal)}</Text>
    </div>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text variant={bold ? 'bodyLarge' : 'bodyMedium'} bold={bold} color={bold ? undefined : 'var(--color-on-surface-variant-highest)'}>
        {label}
      </Text>
      <Text variant={bold ? 'bodyLarge' : 'bodyMedium'} bold={bold}>
        {value}
      </Text>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-outline-variant)', margin: 'var(--space-xs) 0' }} />;
}
