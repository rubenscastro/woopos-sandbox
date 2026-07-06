import { useNav } from '../../device/platformNav';
import { CheckoutPane } from '../../components/android/CheckoutPane';

/**
 * Flow 7 — Totals / checkout (WooPosTotalsScreen). Standalone route (phone / direct link);
 * on tablet the same CheckoutPane appears as the right pane of the animated home. Card
 * payment is driven by the Card reader tool.
 */
export function Totals() {
  const navigate = useNav();
  return <CheckoutPane onBack={() => navigate('/cart')} />;
}
