import type { ReactElement } from 'react';
import { Splash } from '../screens/android/Splash';
import { Eligibility } from '../screens/android/Eligibility';
import { ItemSelection } from '../screens/android/ItemSelection';
import { Cart } from '../screens/android/Cart';
import { Totals } from '../screens/android/Totals';
import { CardPayment } from '../screens/android/CardPayment';
import { CashPayment } from '../screens/android/CashPayment';
import { PaymentSuccess } from '../screens/android/PaymentSuccess';
import { MarkComplete } from '../screens/android/MarkComplete';
import { ScanToPay } from '../screens/android/ScanToPay';
import { EmailReceipt } from '../screens/android/EmailReceipt';
import { OrderHistory } from '../screens/android/OrderHistory';
import { Settings } from '../screens/android/Settings';
import { Support } from '../screens/android/Support';
import { BarcodeSetupLaunch } from '../screens/android/BarcodeSetupLaunch';

export interface RouteDef {
  path: string;
  element: ReactElement;
}

/**
 * Android screen routes for the `main` version. Reused as-is by every proposal version
 * (see `src/versions/overrides.tsx`) unless that proposal forks a specific screen.
 */
export const androidRouteDefs: RouteDef[] = [
  { path: 'splash', element: <Splash /> },
  { path: 'eligibility', element: <Eligibility /> },
  { path: 'products', element: <ItemSelection /> },
  { path: 'cart', element: <Cart /> },
  { path: 'totals', element: <Totals /> },
  { path: 'card-payment', element: <CardPayment /> },
  { path: 'cash-payment', element: <CashPayment /> },
  { path: 'payment-success', element: <PaymentSuccess /> },
  { path: 'mark-complete', element: <MarkComplete /> },
  { path: 'scan-to-pay', element: <ScanToPay /> },
  { path: 'email-receipt', element: <EmailReceipt /> },
  { path: 'order-history', element: <OrderHistory /> },
  { path: 'barcode-setup', element: <BarcodeSetupLaunch /> },
  { path: 'settings', element: <Settings initialCategory="store" /> },
  { path: 'settings-payments', element: <Settings initialCategory="payments" /> },
  { path: 'settings-hardware', element: <Settings initialCategory="hardware" /> },
  { path: 'settings-catalog', element: <Settings initialCategory="catalog" /> },
  { path: 'support', element: <Support /> },
];
