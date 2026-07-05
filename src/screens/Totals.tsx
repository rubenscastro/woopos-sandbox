import { useNavigate } from 'react-router-dom';
import { CheckoutPane } from '../components/CheckoutPane';

/**
 * Flow 7 — Totals / checkout (WooPosTotalsScreen). Standalone route (phone / direct link);
 * on tablet the same CheckoutPane appears as the right pane of the animated home. Card
 * payment is driven by the Card reader tool.
 */
export function Totals() {
  const navigate = useNavigate();
  return <CheckoutPane onBack={() => navigate('/cart')} />;
}
