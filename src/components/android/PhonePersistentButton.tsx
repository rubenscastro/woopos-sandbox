import { confirmIfDirty } from '../../state/unsavedGuard';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, type ButtonState } from './Button';
import { useNav } from '../../device/platformNav';
import { useCartSheet } from '../../device/CartSheet';
import { useCart } from '../../state/CartContext';
import { usePlatform } from '../../device/PlatformContext';
import { useIsPhone } from '../../hooks/useBreakpoint';

/**
 * Android phone's single persistent bottom button (WooPosHomePhonePersistentButton).
 *
 * On phone the real app does NOT put a checkout button inside the cart — the cart passes
 * `WooPosCartCheckoutButtonSlot.External` and renders nothing. Instead the home shell owns one
 * button, overlaid on the bottom of whatever screen is showing, and its label/action change
 * with the screen position: "Cart (N)" on the products list, "Check out" on the cart, hidden
 * at checkout. This file is the prototype's equivalent, mounted once in the device overlay.
 */
export type PhonePersistentButtonAction = 'openCart' | 'checkout';

/** WooPosHomeState.ScreenPositionState, plus `other` for routes the button doesn't serve. */
export type PhoneScreenPosition = 'products' | 'cart' | 'checkout' | 'other';

/** WooPosCartState.CheckoutButtonState. */
export type CheckoutButtonState = 'enabled' | 'disabled' | 'invisible';

export type PhonePersistentButtonState =
  | { kind: 'hidden' }
  | { kind: 'primary'; label: string; buttonState: ButtonState; action: PhonePersistentButtonAction };

const HIDDEN: PhonePersistentButtonState = { kind: 'hidden' };

/**
 * WooPosPhonePersistentButtonStateResolver.resolve — kept as a pure function so the mapping
 * can be read against the Kotlin side by side.
 */
export function resolvePhonePersistentButtonState({
  screenPosition,
  itemCount,
  checkoutButtonState,
}: {
  screenPosition: PhoneScreenPosition;
  itemCount: number;
  checkoutButtonState: CheckoutButtonState;
}): PhonePersistentButtonState {
  switch (screenPosition) {
    case 'products':
      return itemCount > 0
        ? { kind: 'primary', label: `Cart (${itemCount})`, buttonState: 'enabled', action: 'openCart' }
        : HIDDEN;
    case 'cart':
      switch (checkoutButtonState) {
        case 'enabled':
          return { kind: 'primary', label: 'Check out', buttonState: 'enabled', action: 'checkout' };
        case 'disabled':
          return { kind: 'primary', label: 'Check out', buttonState: 'disabled', action: 'checkout' };
        case 'invisible':
          return HIDDEN;
      }
    // eslint-disable-next-line no-fallthrough
    case 'checkout':
    case 'other':
      return HIDDEN;
  }
}

/**
 * WooPosCartViewModel.updateStateDependingOnCartStatus: an empty cart has no checkout button,
 * a cart still resolving items (the prototype's barcode-scan skeletons stand in for
 * `cartContainsLoadingOrErrorItems`) has a disabled one, otherwise it's enabled.
 */
export function resolveCheckoutButtonState({
  itemCount,
  pendingScans,
}: {
  itemCount: number;
  pendingScans: number;
}): CheckoutButtonState {
  if (itemCount === 0 && pendingScans === 0) return 'invisible';
  if (pendingScans > 0) return 'disabled';
  return 'enabled';
}

/** Last path segment, so the `/versions/<id>/android/*` forks resolve the same as `/android/*`. */
function screenPositionFor(pathname: string, cartSheetOpen: boolean): PhoneScreenPosition {
  const slug = pathname.split('/').filter(Boolean).pop() ?? '';
  if (slug === 'totals') return 'checkout';
  // The prototype presents the phone cart as a sheet over the products list rather than as its
  // own pager page, so an open sheet *is* the Cart screen position.
  if (cartSheetOpen || slug === 'cart') return 'cart';
  if (slug === 'products') return 'products';
  return 'other';
}

/**
 * WooPosHomePhonePersistentButton's AnimatedVisibility: slide up + fade in on appear, slide
 * down + fade out on leave, holding the last renderable state through the exit so the label
 * doesn't blank out mid-animation (`lastRenderable` in the Kotlin).
 */
export function PhonePersistentButtonHost() {
  const location = useLocation();
  const navigate = useNav();
  const { platform } = usePlatform();
  const isPhone = useIsPhone();
  const { open: cartSheetOpen, openCartSheet, closeCartSheet } = useCartSheet();
  const { itemCount, pendingScans } = useCart();

  // Android phone only: iOS keeps its own in-screen "Cart (N)" button (ItemSelector), and
  // tablet has no persistent button at all — the cart pane carries its own checkout.
  const enabled = platform === 'android' && isPhone;
  const screenPosition = enabled ? screenPositionFor(location.pathname, cartSheetOpen) : 'other';
  const state = resolvePhonePersistentButtonState({
    screenPosition,
    itemCount,
    checkoutButtonState: resolveCheckoutButtonState({ itemCount, pendingScans }),
  });

  const visible = state.kind === 'primary';
  const lastRenderable = useRef<PhonePersistentButtonState | null>(null);
  if (visible) lastRenderable.current = state;
  const shown = lastRenderable.current;

  // Keep the node mounted through the exit animation, then drop it.
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 200);
    return () => window.clearTimeout(t);
  }, [visible]);

  if (!mounted || !shown || shown.kind !== 'primary') return null;

  const onClick = () => {
    if (shown.action === 'openCart') {
      openCartSheet();
    } else {
      confirmIfDirty(() => {
        closeCartSheet();
        navigate('/totals');
      });
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        // Above the cart sheet and its scrim (z-index 50) — the real button is drawn over the
        // screen content, not inside it.
        zIndex: 60,
        background: 'var(--color-surface-bright)',
        padding: 'var(--space-md)',
        paddingBottom: 'calc(var(--space-md) + var(--space-sm) + var(--device-safe-bottom, 0px))',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        opacity: visible ? 1 : 0,
        transition: visible
          ? 'transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s ease'
          : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s ease',
      }}
    >
      <Button text={shown.label} state={shown.buttonState} fullWidth onClick={onClick} />
    </div>
  );
}
