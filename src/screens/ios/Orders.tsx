import { useState } from 'react';
import { PosText } from '../../components/ios/PosText';
import { Close, ChevronLeft, DotsHorizontal } from '../../components/ios/IosIcons';
import { PosButton } from '../../components/ios/PosButton';
import { ProductImage } from '../../components/android/ProductImage';
import { SuccessCheckmark } from '../../components/android/SuccessCheckmark';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useClickOutside } from '../../hooks/useClickOutside';
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

  const detail = (
    <OrderDetail
      order={selected}
      onBack={isPhone ? () => setShowDetailOnPhone(false) : undefined}
      onEmail={() => nav('/email-receipt')}
    />
  );

  if (isPhone) return <div style={{ height: '100%', background: 'var(--color-surface)' }}>{showDetailOnPhone ? detail : list}</div>;

  return (
    <div className="woopos-fills-safe-top" style={{ display: 'flex' }}>
      <div className="woopos-safe-pane" style={{ flex: '1 1 38%', minWidth: 0, background: 'var(--color-surface-bright)' }}>{list}</div>
      <div className="woopos-safe-pane" style={{ flex: '1 1 62%', minWidth: 0, background: 'var(--color-surface)' }}>{detail}</div>
    </div>
  );
}

function OrderRow({ order, selected, onClick }: { order: MockOrder; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)', width: '100%', textAlign: 'left', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-lowest)', border: `2px solid ${selected ? 'var(--color-on-surface)' : 'transparent'}`, boxShadow: 'var(--pos-shadow-medium)', color: 'var(--color-on-surface)', cursor: 'pointer' }}>
      <div style={{ minWidth: 0 }}>
        <PosText variant="bodySmall" bold>{order.number}</PosText>
        <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 'var(--space-xs)' }}>{order.date}</PosText>
        {order.customerEmail && (
          <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 'var(--space-xs)' }}>{order.customerEmail}</PosText>
        )}
        <div style={{ marginTop: 'var(--space-sm)' }}><Badge status={order.status} /></div>
      </div>
      <PosText variant="bodySmall">{formatUsd(order.total)}</PosText>
    </button>
  );
}

function OrderDetail({ order, onBack, onEmail }: { order: MockOrder; onBack?: () => void; onEmail: () => void }) {
  const [refunding, setRefunding] = useState(false);
  const productsSubtotal = order.items.reduce((s, i) => s + i.lineTotal, 0);

  if (refunding) {
    return <IssueRefund order={order} onDone={() => setRefunding(false)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        {onBack && (
          <button type="button" aria-label="Back" onClick={onBack} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: '4px 8px 4px 0', cursor: 'pointer' }}>
            <ChevronLeft size="30px" />
          </button>
        )}
        <PosText variant="heading" bold style={{ flex: 1 }}>{order.number}</PosText>
        <OrderDetailActions onIssueRefund={() => setRefunding(true)} onEmail={onEmail} />
      </div>
      {/* headerBottomContent (POSOrderDetailsView.swift): date, then customer email if
          present, then the status badge — directly below the title. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', padding: '0 var(--space-lg) var(--space-md)' }}>
        <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
          {order.date}
        </PosText>
        {order.customerEmail && (
          <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
            {order.customerEmail}
          </PosText>
        )}
        <div style={{ marginTop: 'var(--space-xs)' }}><Badge status={order.status} /></div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: '0 var(--space-lg) var(--space-xxl)' }}>
        <Section title="Items">
          {order.items.map((it, i) => (
            <div key={i}>
              {i > 0 && <PosDivider />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', flex: 'none' }}>
                  <ProductImage id={it.productId} radius="var(--radius-md)" />
                </div>
                <PosText variant="bodyLarge" style={{ flex: 1 }}>{it.name} × {it.quantity}</PosText>
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
          <PosDivider />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <PosText variant="bodyLarge" bold>Total paid</PosText>
            <PosText variant="bodyLarge" bold>{formatUsd(order.total)}</PosText>
          </div>
        </Section>
      </div>
    </div>
  );
}

/** Trailing header actions (POSOrderDetailsView.swift's `actionsSection`): a compact
 *  "Issue refund" filled button (POSButtonStyle .extraSmall) + an "..." menu with
 *  Email receipt. */
function OrderDetailActions({ onIssueRefund, onEmail }: { onIssueRefund: () => void; onEmail: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(menuOpen, () => setMenuOpen(false));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 'none' }}>
      <button
        type="button"
        onClick={onIssueRefund}
        style={{
          border: 'none',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          font: 'inherit',
          fontWeight: 600,
          fontSize: 'var(--font-body-md-size)',
          padding: 'var(--space-sm) var(--space-md)',
          cursor: 'pointer',
        }}
      >
        Issue refund
      </button>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          aria-label="More actions"
          onClick={() => setMenuOpen((o) => !o)}
          style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 'var(--space-sm)', cursor: 'pointer' }}
        >
          <DotsHorizontal size="var(--icon-medium)" />
        </button>
        {menuOpen && (
          <div className="woopos-liquid-glass" style={{ position: 'absolute', top: 'calc(100% + var(--space-xs))', right: 0, minWidth: 200, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-normal-large)', padding: 'var(--space-xs) 0', overflow: 'hidden', zIndex: 30 }}>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onEmail(); }}
              style={{ display: 'flex', alignItems: 'center', width: '100%', padding: 'var(--space-sm) var(--space-lg)', border: 'none', background: 'transparent', color: 'var(--color-on-surface)', cursor: 'pointer' }}
            >
              <PosText variant="bodyMedium">Email receipt</PosText>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type RefundStep = 'select' | 'review' | 'reason' | 'confirm' | 'success';

/** Left-aligned header (icon + title side by side) — used for the "Refund reason" step,
 *  distinct from the centered RefundHeader used by select/review/confirm. */
function LeftAlignedHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
      <button type="button" aria-label="Back" onClick={onBack} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: '4px 8px 4px 0', cursor: 'pointer' }}>
        <ChevronLeft size="30px" />
      </button>
      <PosText variant="heading" bold>{title}</PosText>
    </div>
  );
}

/** RefundScreenHeader (WooPosIssueRefundScreen.kt's shared header, used identically on
 *  iOS): back button pinned to the start, title truly centered — not the usual
 *  left-aligned title-next-to-back-button layout. */
function RefundHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 56, padding: 'var(--space-lg) var(--space-md)' }}>
      <button type="button" aria-label="Back" onClick={onBack} style={{ position: 'absolute', left: 'var(--space-md)', border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
        <ChevronLeft size="30px" />
      </button>
      <PosText variant="heading" bold align="center" style={{ padding: '0 var(--space-xxl)' }}>
        {title}
      </PosText>
    </div>
  );
}

/** iOS refund flow (mirrors Android's item-selection → review → confirm sub-flow in
 *  OrderHistory.tsx), styled with iOS components. Rendered full screen — position:absolute
 *  + inset:0 resolves against the nearest positioned ancestor (the device screen), since
 *  none of the panes in between set their own position. */
function IssueRefund({ order, onDone }: { order: MockOrder; onDone: () => void }) {
  const nav = useNav();
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
          <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-lg)' }}>
            <PosText variant="bodySmall" bold color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
              {count} SELECTED
            </PosText>
            {/* Plain rows separated by dividers — no card/shadow container, unlike the
                Items section on the order detail. */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {order.items.map((it, i) => (
                <div key={i}>
                  {i > 0 && <PosDivider />}
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '100%', textAlign: 'left', padding: 'var(--space-sm) 0', border: 'none', background: 'none', color: 'var(--color-on-surface)', cursor: 'pointer' }}
                  >
                    <input type="checkbox" checked={selected.has(i)} readOnly style={{ width: 20, height: 20, accentColor: 'var(--color-primary)', flex: 'none' }} />
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', flex: 'none' }}>
                      <ProductImage id={it.productId} radius="var(--radius-md)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <PosText variant="bodyLarge" bold style={{ display: 'block' }}>{it.name}</PosText>
                      <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)">
                        {it.quantity} × {formatUsd(it.unitPrice)}
                      </PosText>
                    </div>
                    <PosText variant="bodyLarge">{formatUsd(it.lineTotal)}</PosText>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <PosButton label="Continue" fullWidth disabled={count === 0} onClick={() => setStep('review')} />
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <RefundHeader title="Review refund" onBack={() => setStep('select')} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-xl) var(--space-lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <SumRow label={`Items subtotal (${count} item${count === 1 ? '' : 's'})`} value={formatUsd(itemsSubtotal)} />
              <SumRow label="Taxes" value={formatUsd(taxes)} />
              <PosDivider />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <PosText variant="bodyLarge" bold>Refund total</PosText>
                  <PosText variant="bodyLarge" bold>{formatUsd(refundTotal)}</PosText>
                </div>
                <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)">
                  Via {order.paymentMethod}
                </PosText>
              </div>
              <PosDivider />
              <button
                type="button"
                onClick={() => { setReasonDraft(reason); setStep('reason'); }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <PosText variant="bodyLarge" bold>Refund reason</PosText>
                  <PosText variant="bodyMedium" color="var(--color-primary)">Edit reason</PosText>
                </div>
                {reason && (
                  <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)">
                    {reason}
                  </PosText>
                )}
              </button>
            </div>
          </div>
          <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <PosButton label="Continue" fullWidth onClick={() => setStep('confirm')} />
          </div>
        </>
      )}

      {step === 'reason' && (
        <>
          <LeftAlignedHeader title="Refund reason" onBack={() => setStep('review')} />
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
          <div style={{ padding: 'var(--space-md) var(--space-lg)', paddingBottom: 'calc(var(--space-md) + var(--device-keyboard-height, 0px))' }}>
            <PosButton label="Add" fullWidth onClick={() => { setReason(reasonDraft); setStep('review'); }} />
          </div>
        </>
      )}

      {step === 'confirm' && (
        <>
          <RefundHeader title="Confirm refund" onBack={() => setStep('review')} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)', padding: 'var(--space-xl)', textAlign: 'center' }}>
            <PosText variant="heading" bold align="center">Refund {formatUsd(refundTotal)}</PosText>
            <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)" style={{ maxWidth: 480 }}>
              Are you sure you wish to process the refund {formatUsd(refundTotal)} via {order.paymentMethod}? This action cannot be undone.
            </PosText>
          </div>
          <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <PosButton label="Yes, proceed" fullWidth onClick={() => setStep('success')} />
            <PosButton label="Cancel" variant="outlined" fullWidth onClick={() => setStep('review')} />
          </div>
        </>
      )}

      {step === 'success' && (
        <>
          <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <button type="button" aria-label="Close" onClick={onDone} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
              <Close size="var(--icon-medium)" />
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', padding: 'var(--space-xl)', textAlign: 'center' }}>
            <SuccessCheckmark />
            <PosText variant="heading" bold align="center" style={{ marginTop: 'var(--space-md)' }}>
              Refund complete
            </PosText>
            <PosText variant="bodyLarge" align="center" color="var(--color-on-surface)">
              You refunded {formatUsd(refundTotal)} via {order.paymentMethod}.
            </PosText>
            {order.customerEmail && (
              <PosText variant="bodyLarge" align="center" color="var(--color-on-surface-variant-highest)">
                A receipt has been sent to {order.customerEmail}.
              </PosText>
            )}
          </div>
          <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <PosButton label="Done" fullWidth onClick={onDone} />
            <PosButton label="Email receipt" variant="outlined" fullWidth onClick={() => nav('/email-receipt')} />
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--pos-shadow-medium)', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
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
/** Matches POSOrderBadgeView.swift exactly: caption regular text, asymmetric padding
 *  (horizontal small/8px, vertical xSmall/4px), small (4px) corner radius. */
function Badge({ status }: { status: MockOrder['status'] }) {
  const c = STATUS_COLORS[status];
  return (
    <PosText variant="caption" color={c.fg} style={{ display: 'inline-block', background: c.bg, borderRadius: 'var(--radius-sm)', padding: 'var(--space-xs) var(--space-sm)', lineHeight: 1 }}>
      {status}
    </PosText>
  );
}
