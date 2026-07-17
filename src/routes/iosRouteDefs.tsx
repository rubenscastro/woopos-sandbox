import { ItemSelector } from '../screens/ios/ItemSelector';
import { Checkout } from '../screens/ios/Checkout';
import { Orders } from '../screens/ios/Orders';
import { EmailReceipt } from '../screens/ios/EmailReceipt';
import { Settings } from '../screens/ios/Settings';
import { PaymentsOnboarding } from '../screens/ios/PaymentsOnboarding';
import { Loading } from '../screens/ios/Loading';
import type { RouteDef } from './androidRouteDefs';

/**
 * iOS screen routes for the `main` version. Reused as-is by every proposal version
 * (see `src/versions/overrides.tsx`) unless that proposal forks a specific screen.
 */
export const iosRouteDefs: RouteDef[] = [
  { path: 'products', element: <ItemSelector /> },
  { path: 'loading', element: <Loading /> },
  // Create coupon is a sheet over the item list (Coupons tab), not its own screen — this
  // entry just opens the catalog with the sheet auto-presented.
  { path: 'add-coupon', element: <ItemSelector initialTab="coupons" autoCreateCoupon /> },
  { path: 'checkout', element: <Checkout /> },
  { path: 'orders', element: <Orders /> },
  { path: 'email-receipt', element: <EmailReceipt /> },
  { path: 'settings', element: <Settings /> },
  { path: 'payments-onboarding', element: <PaymentsOnboarding /> },
];
