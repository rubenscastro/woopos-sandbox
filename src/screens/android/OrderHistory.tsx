import { useState } from 'react';
import { useNav } from '../../device/platformNav';
import { Text } from '../../components/android/Text';
import { Card } from '../../components/android/Card';
import { Button, OutlinedButton } from '../../components/android/Button';
import { Toolbar } from '../../components/android/Toolbar';
import { SearchInput } from '../../components/android/SearchInput';
import { Search, ArrowBack, Close, DotsHorizontal } from '../../components/android/icons';
import { ProductImage } from '../../components/android/ProductImage';
import { SuccessCheckmark } from '../../components/android/SuccessCheckmark';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useClickOutside } from '../../hooks/useClickOutside';
import { formatUsd } from '../../lib/currency';
import { orders, STATUS_COLORS, type MockOrder, type OrderLineItem } from '../../mocks/android/orders';

/**
 * Flow 14 — Order history (WooPosOrdersScreen + details + refund). Two-pane list/detail on
 * tablet, stacked on phone. Order details show line items, totals, and refunds; "Issue
 * refund" opens an item-selection → confirm refund sub-flow.
 */
export function OrderHistory() {
  const navigate = useNav();
  const isPhone = useIsPhone();
  const [selectedId, setSelectedId] = useState<number>(orders[0].id);
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const selected = orders.find((o) => o.id === selectedId) ?? orders[0];

  const q = query.trim().toLowerCase();
  const filteredOrders = q
    ? orders.filter((o) => o.number.toLowerCase().includes(q) || (o.customerEmail ?? '').toLowerCase().includes(q))
    : orders;

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const list = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {searchOpen ? (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', padding: 'var(--space-sm) var(--space-md)', minHeight: 'var(--size-xsmall)' }}>
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Back"
            style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, flex: 'none', cursor: 'pointer' }}
          >
            <ArrowBack size="var(--icon-medium)" />
          </button>
          <div style={{ flex: 1 }}>
            <SearchInput value={query} onChange={setQuery} autoFocus placeholder="Search orders" />
          </div>
        </div>
      ) : (
        <Toolbar
          title="Orders"
          onBack={() => navigate('/products')}
          trailing={
            <RoundIconButton ariaLabel="Search orders" onClick={() => setSearchOpen(true)}>
              <Search size="var(--icon-small)" />
            </RoundIconButton>
          }
        />
      )}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-sm) var(--space-md) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {filteredOrders.map((o) => (
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
      key={selected.id}
      order={selected}
      onBack={isPhone ? () => setShowDetailOnPhone(false) : undefined}
      onEmail={() => navigate('/email-receipt')}
    />
  );

  if (isPhone) {
    return <div style={{ height: '100%' }}>{showDetailOnPhone ? detail : list}</div>;
  }

  return (
    <div className="woopos-fills-safe-top" style={{ display: 'flex' }}>
      <div className="woopos-safe-pane" style={{ flex: '1 1 38%', minWidth: 0, background: 'var(--color-surface-bright)' }}>{list}</div>
      <div className="woopos-safe-pane" style={{ flex: '1 1 62%', minWidth: 0, background: 'var(--color-surface)' }}>{detail}</div>
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
        background: 'var(--color-surface)',
        color: 'var(--color-on-surface)',
        flex: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function OrderRow({ order, selected, onClick }: { order: MockOrder; selected: boolean; onClick: () => void }) {
  return (
    <Card onClick={onClick} selected={selected} padding="var(--space-md)">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
        <div style={{ minWidth: 0 }}>
          <Text variant="bodySmall" bold>
            {order.number}
          </Text>
          <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 'var(--space-xs)' }}>
            {order.date}
          </Text>
          {order.customerEmail && (
            <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 'var(--space-xs)' }}>
              {order.customerEmail}
            </Text>
          )}
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <StatusBadge status={order.status} />
          </div>
        </div>
        <Text variant="bodySmall">
          {formatUsd(order.total)}
        </Text>
      </div>
    </Card>
  );
}

/** Matches WooPosOrdersStatusBadge.kt exactly: bodySmall regular text (not caption/bold),
 *  uniform Spacing.Small padding, Spacing.Small corner radius. */
function StatusBadge({ status }: { status: MockOrder['status'] }) {
  const c = STATUS_COLORS[status];
  return (
    <Text
      variant="bodySmall"
      color={c.fg}
      style={{
        display: 'inline-block',
        background: c.bg,
        borderRadius: 'var(--space-sm)',
        padding: 'var(--space-sm)',
        lineHeight: 1,
      }}
    >
      {status}
    </Text>
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
      <Toolbar
        title={order.number}
        onBack={onBack}
        trailing={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 'none' }}>
            <Button text="Issue refund" size="small" onClick={() => setRefunding(true)} />
            <OrderActionsMenu onEmail={onEmail} />
          </div>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-md) var(--space-lg) var(--space-xxl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div>
          <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
            {order.date}
          </Text>
          {order.customerEmail && (
            <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 'var(--space-xs)' }}>
              {order.customerEmail}
            </Text>
          )}
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <Section title="Products">
          {order.items.map((it, i) => (
            <div key={i}>
              {i > 0 && <Divider />}
              <LineItemRow item={it} />
            </div>
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
          <Divider />
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
    </div>
  );
}

/** Horizontal ellipsis in the order-detail toolbar → dropdown with the Email receipt action. */
function OrderActionsMenu({ onEmail }: { onEmail: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative', flex: 'none' }}>
      <button
        type="button"
        aria-label="More actions"
        onClick={() => setOpen((o) => !o)}
        style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}
      >
        <DotsHorizontal size="var(--icon-medium)" />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-xs))',
            right: 0,
            zIndex: 30,
            minWidth: 180,
            background: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-normal-large)',
            padding: 'var(--space-xs)',
          }}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); onEmail(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              border: 'none',
              background: 'transparent',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-on-surface)',
              cursor: 'pointer',
            }}
          >
            <Text variant="bodyMedium">Email receipt</Text>
          </button>
        </div>
      )}
    </div>
  );
}

type RefundStep = 'select' | 'review' | 'reason' | 'confirm' | 'success';

/** WooPosIssueRefundScreen's RefundScreenHeader: back button pinned to the start, title
 *  truly centered in the header — distinct from the normal left-aligned Toolbar. */
function RefundHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'var(--size-xsmall)', padding: '0 var(--space-md)' }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{ position: 'absolute', left: 'var(--space-sm)', border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}
      >
        <ArrowBack size="var(--icon-medium)" />
      </button>
      <Text variant="heading" bold align="center" style={{ padding: '0 var(--space-xxl)' }}>
        {title}
      </Text>
    </div>
  );
}

/** WooPosIssueRefundScreen's item-selection → review → reason → confirm → success sub-flow.
 *  Rendered full screen (position:absolute + inset:0 resolves against .device-screen, the
 *  nearest positioned ancestor, since none of the panes in between set their own position)
 *  so it covers the whole device rather than just the detail pane. */
function IssueRefund({ order, onDone }: { order: MockOrder; onDone: () => void }) {
  const navigate = useNav();
  const [step, setStep] = useState<RefundStep>('select');
  const [selected, setSelected] = useState<Set<number>>(new Set(order.items.map((_, i) => i)));
  const [reason, setReason] = useState('');
  const [reasonDraft, setReasonDraft] = useState('');

  const itemsSubtotal = order.items.reduce((s, it, i) => (selected.has(i) ? s + it.lineTotal : s), 0);
  const productsSubtotal = order.items.reduce((s, it) => s + it.lineTotal, 0);
  const taxes = productsSubtotal > 0 ? order.taxTotal * (itemsSubtotal / productsSubtotal) : 0;
  const refundTotal = itemsSubtotal + taxes;
  const count = selected.size;

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 'var(--device-safe-top, 0px)' }}>
      {step === 'select' && (
        <>
          <RefundHeader title="Select items to refund" onBack={onDone} />
          <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-md) var(--space-lg)' }}>
            <Text variant="bodySmall" bold color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
              {count} SELECTED
            </Text>
            {/* Plain rows separated by dividers — WooPosIssueRefundScreen's RefundableItemRow
                has no card/shadow container, unlike the Products section on the order detail. */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {order.items.map((it, i) => (
                <div key={i}>
                  {i > 0 && <Divider />}
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: 'var(--space-sm) 0', cursor: 'pointer' }}
                  >
                    <input type="checkbox" checked={selected.has(i)} readOnly style={{ width: 20, height: 20, accentColor: 'var(--color-primary)', flex: 'none' }} />
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', flex: 'none' }}>
                      <ProductImage id={it.productId} radius="var(--radius-md)" />
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
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 'var(--space-md)' }}>
            <Button text="Continue" fullWidth state={count > 0 ? 'enabled' : 'disabled'} onClick={() => setStep('review')} />
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <RefundHeader title="Review refund" onBack={() => setStep('select')} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-xl) var(--space-lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <TotalRow label={`Items subtotal (${count} item${count === 1 ? '' : 's'})`} value={formatUsd(itemsSubtotal)} />
              <TotalRow label="Taxes" value={formatUsd(taxes)} />
              <Divider />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <TotalRow label="Refund total" value={formatUsd(refundTotal)} bold />
                <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)">
                  Via {order.paymentMethod}
                </Text>
              </div>
              <Divider />
              <button
                type="button"
                onClick={() => { setReasonDraft(reason); setStep('reason'); }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="bodyLarge" bold>Refund reason</Text>
                  <Text variant="bodyMedium" color="var(--color-primary)">Edit reason</Text>
                </div>
                {reason && (
                  <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)">
                    {reason}
                  </Text>
                )}
              </button>
            </div>
          </div>
          <div style={{ padding: 'var(--space-md)' }}>
            <Button text="Continue" fullWidth onClick={() => setStep('confirm')} />
          </div>
        </>
      )}

      {step === 'reason' && (
        <>
          <Toolbar title="Refund reason" onBack={() => setStep('review')} />
          {/* Input + CTA sit just above the on-screen keyboard rather than centering in the
              whole remaining screen — the flex-end + keyboard-aware bottom padding keep
              both hugging the keyboard's top edge as it rises. */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 'var(--space-xl)' }}>
            <textarea
              autoFocus
              value={reasonDraft}
              onChange={(e) => setReasonDraft(e.target.value)}
              placeholder="Reason for refunding order"
              rows={3}
              style={{ width: '100%', maxWidth: 640, resize: 'none', border: 'none', outline: 'none', textAlign: 'center', background: 'transparent', font: 'inherit', fontSize: 'var(--font-body-lg-size)', color: 'var(--color-on-surface)' }}
            />
          </div>
          <div style={{ padding: 'var(--space-md)', paddingBottom: 'calc(var(--space-md) + var(--device-keyboard-height, 0px))' }}>
            <Button text="Add" fullWidth onClick={() => { setReason(reasonDraft); setStep('review'); }} />
          </div>
        </>
      )}

      {step === 'confirm' && (
        <>
          <RefundHeader title="Confirm refund" onBack={() => setStep('review')} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)', padding: 'var(--space-xl)', textAlign: 'center' }}>
            <Text variant="heading" bold align="center">
              Refund {formatUsd(refundTotal)}
            </Text>
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)" style={{ maxWidth: 480 }}>
              Are you sure you wish to process the refund {formatUsd(refundTotal)} via {order.paymentMethod}?
              {'\n\n'}This action cannot be undone.
            </Text>
          </div>
          <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Button text="Yes, proceed" fullWidth onClick={() => setStep('success')} />
            <OutlinedButton text="Cancel" fullWidth onClick={() => setStep('review')} />
          </div>
        </>
      )}

      {step === 'success' && (
        <>
          <div style={{ padding: 'var(--space-md)' }}>
            <button type="button" aria-label="Close" onClick={onDone} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
              <Close size="var(--icon-medium)" />
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', padding: 'var(--space-xl)', textAlign: 'center' }}>
            <SuccessCheckmark />
            <Text variant="heading" bold align="center" style={{ marginTop: 'var(--space-md)' }}>
              Refund complete
            </Text>
            <Text variant="bodyLarge" align="center" color="var(--color-on-surface)">
              You refunded {formatUsd(refundTotal)} via {order.paymentMethod}.
            </Text>
            {order.customerEmail && (
              <Text variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
                A receipt has been sent to {order.customerEmail}.
              </Text>
            )}
          </div>
          <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Button text="Done" fullWidth onClick={onDone} />
            <OutlinedButton text="Email receipt" fullWidth onClick={() => navigate('/email-receipt')} />
          </div>
        </>
      )}
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
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', flex: 'none' }}>
        <ProductImage id={item.productId} radius="var(--radius-md)" />
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
