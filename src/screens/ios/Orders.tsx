import { useEffect, useState } from 'react';
import { PosText } from '../../components/ios/PosText';
import { Close, ChevronLeft, ErrorX } from '../../components/ios/IosIcons';
import { PosOverflowMenu } from '../../components/ios/PosOverflowMenu';
import { useVersion } from '../../versions/VersionContext';
import { PosNavFloatingLauncher } from '../../components/versions/cash-reconciliation/ios/PosNavLauncher';
import { PosGhostOrderList } from '../../components/ios/PosGhostOrderRow';
import { PosGhostOrderDetails } from '../../components/ios/PosGhostOrderDetails';
import { usePublishPreviewState } from '../../device/PreviewStateContext';
import { refundScenarioOptions, type RefundScenario } from '../../state/refundScenarios';
import { PosButton } from '../../components/ios/PosButton';
import { ProductImage } from '../../components/android/ProductImage';
import { SuccessCheckmark } from '../../components/android/SuccessCheckmark';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { useNav } from '../../device/platformNav';
import { formatUsd } from '../../lib/currency';
import { orders, STATUS_COLORS, type MockOrder } from '../../mocks/android/orders';

/** How long the arrival skeleton holds — long enough to register, short enough not to nag. */
const ARRIVAL_SKELETON_MS = 900;

/**
 * iOS Orders (Orders/POSOrdersView + POSOrderListView + POSOrderDetailsView). Master/detail:
 * order list on the left, details ("Items" + "Totals" sections) on the right (tablet);
 * stacked on phone. Empty: "No orders yet". Same order data as Android; iOS card styling.
 */
export function Orders() {
  const isPhone = useIsPhone();
  const nav = useNav();
  const isCashRecon = useVersion().version === 'cash-reconciliation';
  const [selectedId, setSelectedId] = useState(orders[0].id);
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);
  const selected = orders.find((o) => o.id === selectedId) ?? orders[0];

  // Refund error scenario, induced from the chrome's State menu (happy path by default).
  const [refundScenario, setRefundScenario] = useState<RefundScenario>('none');
  usePublishPreviewState({
    label: 'Refund error',
    options: refundScenarioOptions("Create: couldn't confirm"),
    active: refundScenario,
    onSelect: (id) => setRefundScenario(id as RefundScenario),
  });

  /*
   * Loading has two halves, because one alone isn't enough to review it.
   *
   * `auto` (the default) plays the skeleton on arrival, the way it actually happens: orders
   * are fetched when the screen opens, so a merchant sees this every single time. It is part
   * of the happy path, not an edge case — which is why it isn't menu-only.
   *
   * The explicit options pin a state open, because a skeleton that clears itself after a beat
   * is impossible to actually look at. `page` is the append-the-next-page state: one ghost row
   * under the orders already on screen, not a full sheet.
   */
  const [loadingMode, setLoadingMode] = useState<'auto' | 'none' | 'list' | 'page'>('auto');
  const [arriving, setArriving] = useState(true);

  useEffect(() => {
    if (loadingMode !== 'auto') return;
    setArriving(true);
    const timer = setTimeout(() => setArriving(false), ARRIVAL_SKELETON_MS);
    return () => clearTimeout(timer);
  }, [loadingMode]);

  const loading = loadingMode === 'auto' ? (arriving ? 'list' : 'none') : loadingMode;

  usePublishPreviewState({
    label: 'Orders loading',
    options: [
      { id: 'auto', label: 'Auto (on open)' },
      { id: 'none', label: 'Loaded' },
      { id: 'list', label: 'Loading list' },
      { id: 'page', label: 'Loading next page' },
    ],
    active: loadingMode,
    onSelect: (id) => setLoadingMode(id as 'auto' | 'none' | 'list' | 'page'),
  });

  const list = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        {/* Cash reconciliation drops the close button: the floating menu is always on screen,
            and leaving is what picking another destination in it already does. */}
        {!isCashRecon && (
          <button type="button" aria-label="Close" onClick={() => nav('/products')} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
            <Close size="var(--icon-medium)" />
          </button>
        )}
        <PosText variant="heading" bold>Orders</PosText>
      </div>
      {/* The floating menu button overlays the bottom-left of the screen in this proposal, so the
          list reserves its height plus a gap — otherwise the last order sits underneath it at
          the end of the scroll. Trunk has no such button here and keeps its normal padding. */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: `0 var(--space-lg) ${isCashRecon ? 'calc(var(--space-lg) + var(--size-small) + var(--space-md))' : 'var(--space-xxl)'}` }}>
        {loading !== 'list' &&
          orders.map((o) => (
            <OrderRow key={o.id} order={o} selected={!isPhone && o.id === selectedId} onClick={() => { setSelectedId(o.id); if (isPhone) setShowDetailOnPhone(true); }} />
          ))}
        {loading === 'list' && <PosGhostOrderList />}
        {loading === 'page' && <PosGhostOrderList rows={1} />}
      </div>
    </div>
  );

  // The detail pane skeletons alongside the list — source has a loading view for both, and a
  // half-loaded screen reads as broken rather than loading.
  const detail = loading === 'list' ? (
    <PosGhostOrderDetails />
  ) : (
    <OrderDetail
      order={selected}
      scenario={refundScenario}
      onBack={isPhone ? () => setShowDetailOnPhone(false) : undefined}
      onEmail={() => nav('/email-receipt')}
    />
  );

  if (isPhone) return (
    <div style={{ height: '100%', background: 'var(--color-surface)', position: 'relative' }}>
      {showDetailOnPhone ? detail : list}
      {isCashRecon && <PosNavFloatingLauncher />}
    </div>
  );

  return (
    <div className="woopos-fills-safe-top" style={{ display: 'flex', position: 'relative' }}>
      <div className="woopos-safe-pane" style={{ flex: '1 1 38%', minWidth: 0, background: 'var(--color-surface-bright)' }}>{list}</div>
      <div className="woopos-safe-pane" style={{ flex: '1 1 62%', minWidth: 0, background: 'var(--color-surface)' }}>{detail}</div>
      {isCashRecon && <PosNavFloatingLauncher />}
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

/**
 * Exported so the same order detail can be shown outside this screen — Cash reconciliation
 * opens it in a sheet from the cash-drawer log. One order detail everywhere, so an order looks
 * and behaves the same (Issue refund, the overflow menu) wherever you reach it from.
 */
export function OrderDetail({
  order,
  scenario,
  onBack,
  backIcon = 'chevron',
  onEmail,
}: {
  order: MockOrder;
  scenario: RefundScenario;
  onBack?: () => void;
  /** `close` for a sheet that dismisses, `chevron` for a pane that goes back. */
  backIcon?: 'chevron' | 'close';
  onEmail: () => void;
}) {
  const [refunding, setRefunding] = useState(false);
  const productsSubtotal = order.items.reduce((s, i) => s + i.lineTotal, 0);

  if (refunding) {
    // Keyed on the scenario so switching it in the State menu restarts the refund flow armed.
    return <IssueRefund key={scenario} order={order} scenario={scenario} onDone={() => setRefunding(false)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-lg) var(--space-lg) var(--space-md)' }}>
        {onBack && (
          <button type="button" aria-label={backIcon === 'close' ? 'Close' : 'Back'} onClick={onBack} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface)', padding: '4px 8px 4px 0', cursor: 'pointer' }}>
            {backIcon === 'close' ? <Close size="30px" /> : <ChevronLeft size="30px" />}
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
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 'none' }}>
      {/* POSButtonStyle .extraSmall — the header size, the same one Close session uses. */}
      <PosButton label="Issue refund" size="extraSmall" onClick={onIssueRefund} />
      <PosOverflowMenu items={[{ label: 'Email receipt', onSelect: onEmail }]} />
    </div>
  );
}

type RefundStep = 'select' | 'review' | 'reason' | 'confirm' | 'success' | 'error' | 'nothing';

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
function IssueRefund({ order, scenario, onDone }: { order: MockOrder; scenario: RefundScenario; onDone: () => void }) {
  const nav = useNav();
  // orderNotRefundable at load routes to the terminal POSRefundNothingToRefundView.
  const [step, setStep] = useState<RefundStep>(scenario === 'loadNothing' ? 'nothing' : 'select');
  const [selected, setSelected] = useState<Set<number>>(new Set(order.items.map((_, i) => i)));
  // Indexes dropped by a "Review remaining items" reload (simulates an item refunded elsewhere).
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  // A recovery action resolves the armed scenario for the rest of this flow.
  const [resolved, setResolved] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonDraft, setReasonDraft] = useState('');

  const visibleItems = order.items.map((it, i) => ({ it, i })).filter(({ i }) => !removed.has(i));
  const itemsSubtotal = visibleItems.reduce((s, { it, i }) => (selected.has(i) ? s + it.lineTotal : s), 0);
  const productsSubtotal = order.items.reduce((s, it) => s + it.lineTotal, 0);
  const taxes = productsSubtotal > 0 ? order.taxTotal * (itemsSubtotal / productsSubtotal) : 0;
  const refundTotal = itemsSubtotal + taxes;
  const count = visibleItems.filter(({ i }) => selected.has(i)).length;

  // Inline preview failure on the selection step (POSRefundItemsSelectionView.actionsFooter):
  // centered error text + an outlined recovery button above the disabled Continue.
  const previewFailure = scenario === 'loadItemsChanged' && !resolved;

  // "Review remaining items" (refreshRefundableItems): reloads the refundable items — the
  // first item is gone (refunded elsewhere). iOS re-applies the previous selection intersected
  // with what's still refundable. Android diverges: it clears the selection (see OrderHistory.tsx).
  const refreshItems = () => {
    setRemoved(new Set([0]));
    setSelected((prev) => new Set([...prev].filter((i) => i !== 0)));
    setResolved(true);
  };

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
              {visibleItems.map(({ it, i }, vi) => (
                <div key={i}>
                  {vi > 0 && <PosDivider />}
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
          {/* actionsFooter: on preview failure, centered error text + one outlined recovery
              button above Continue, which stays disabled while the error is showing. */}
          <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {previewFailure && (
              <>
                <PosText variant="bodyMedium" align="center" color="var(--color-error)" style={{ display: 'block' }}>
                  The selected quantity is more than what's left to refund.
                </PosText>
                <PosButton label="Review remaining items" variant="outlined" fullWidth onClick={refreshItems} />
              </>
            )}
            <PosButton label="Continue" fullWidth disabled={count === 0 || previewFailure} onClick={() => setStep('review')} />
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
            <PosButton label="Yes, proceed" fullWidth onClick={() => setStep(scenario.startsWith('create') && !resolved ? 'error' : 'success')} />
            <PosButton label="Cancel" variant="outlined" fullWidth onClick={() => setStep('review')} />
          </div>
        </>
      )}

      {/* Full-screen refund error (POSRefundErrorView via POSRefundModalContentView): back
          chevron header, ErrorXMark + centered title/subtitle, buttons per the error's recovery —
          Retry alone (transient), "Review remaining items" + "Back to order" (deterministic
          rejection), or "Back to order" alone (card-present "Couldn't confirm refund"). */}
      {step === 'error' && (
        <>
          <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <button type="button" aria-label="Back" onClick={onDone} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
              <ChevronLeft size="30px" />
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', padding: 'var(--space-xl)', textAlign: 'center' }}>
            <ErrorX size="var(--size-small)" />
            <PosText variant="heading" bold align="center" style={{ marginTop: 'var(--space-lg)' }}>
              {scenario === 'createTerminal' ? "Couldn't confirm refund" : 'Failed to create refund'}
            </PosText>
            <PosText variant="bodyLarge" align="center" color="var(--color-on-surface)">
              {scenario === 'createItemsChanged'
                ? 'One of the selected items has already been fully refunded.'
                : scenario === 'createTerminal'
                  ? 'Go back to the order and check it before trying again.'
                  : 'Please try again.'}
            </PosText>
          </div>
          <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {scenario === 'createNetwork' && (
              <PosButton label="Retry" fullWidth onClick={() => { setResolved(true); setStep('success'); }} />
            )}
            {scenario === 'createItemsChanged' && (
              <>
                <PosButton label="Review remaining items" fullWidth onClick={() => { refreshItems(); setStep('select'); }} />
                <PosButton label="Back to order" variant="outlined" fullWidth onClick={onDone} />
              </>
            )}
            {scenario === 'createTerminal' && (
              <PosButton label="Back to order" variant="outlined" fullWidth onClick={onDone} />
            )}
          </div>
        </>
      )}

      {/* Terminal POSRefundNothingToRefundView: back chevron header, centered heading + message,
          a single filled Done button. */}
      {step === 'nothing' && (
        <>
          <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <button type="button" aria-label="Back" onClick={onDone} style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer' }}>
              <ChevronLeft size="30px" />
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', padding: 'var(--space-xl)', textAlign: 'center' }}>
            <PosText variant="heading" bold align="center">Nothing to refund</PosText>
            <PosText variant="bodyLarge" align="center" color="var(--color-on-surface)">
              All items in this order have already been refunded.
            </PosText>
          </div>
          <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <PosButton label="Done" fullWidth onClick={onDone} />
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
