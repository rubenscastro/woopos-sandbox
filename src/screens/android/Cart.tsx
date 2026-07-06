import { useNav } from '../../device/platformNav';
import { CartPanel } from '../../components/android/CartPanel';
import { usePageBackground } from '../../device/PageBackground';
import { useBarcodeSetup } from '../../tools/BarcodeSetup';

/**
 * Flow 6 — standalone Cart (WooPosCartScreen / WooPosPhoneCartScreen). On phone this is a
 * full-screen pane reached from the items list; on tablet the cart normally sits beside the
 * items list, but the route is kept so the flow is directly linkable.
 */
export function Cart() {
  const navigate = useNav();
  const { openSetup } = useBarcodeSetup();
  usePageBackground('var(--color-surface-bright)');
  return (
    <CartPanel
      onBack={() => navigate('/products')}
      onCheckout={() => navigate('/totals')}
      onScanBarcode={openSetup}
    />
  );
}
