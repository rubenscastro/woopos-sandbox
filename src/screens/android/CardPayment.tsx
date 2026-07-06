import { useNav } from '../../device/platformNav';
import { CheckoutPane } from '../../components/android/CheckoutPane';

/**
 * Flow 8 — Card payment (WooPosCardPaymentScreen). The card-reader interaction lives on the
 * checkout surface: connect the reader, then process the transaction from the Card reader
 * tool (authorized → success, declined → failed). No on-screen "simulate" button.
 */
export function CardPayment() {
  const navigate = useNav();
  return <CheckoutPane onBack={() => navigate('/totals')} />;
}
