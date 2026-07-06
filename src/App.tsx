import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PlatformProvider, usePlatform } from './device/PlatformContext';
import { DeviceProvider } from './device/DeviceContext';
import { DeviceLayout } from './device/DeviceLayout';
import { CartProvider } from './state/CartContext';
import { ToolsProvider } from './tools/ToolsContext';
import { CardReaderProvider } from './tools/CardReaderContext';
import { useBarcodeSetup } from './tools/BarcodeSetup';
import { Home } from './screens/android/Home';
import { IosHome } from './screens/ios/Home';
import { ItemSelector as IosItemSelector } from './screens/ios/ItemSelector';
import { Checkout as IosCheckout } from './screens/ios/Checkout';
import { Orders as IosOrders } from './screens/ios/Orders';
import { Settings as IosSettings } from './screens/ios/Settings';
import { PaymentsOnboarding as IosPaymentsOnboarding } from './screens/ios/PaymentsOnboarding';
import { Splash } from './screens/android/Splash';
import { Eligibility } from './screens/android/Eligibility';
import { ItemSelection } from './screens/android/ItemSelection';
import { Cart } from './screens/android/Cart';
import { Totals } from './screens/android/Totals';
import { CardPayment } from './screens/android/CardPayment';
import { CashPayment } from './screens/android/CashPayment';
import { PaymentSuccess } from './screens/android/PaymentSuccess';
import { MarkComplete } from './screens/android/MarkComplete';
import { ScanToPay } from './screens/android/ScanToPay';
import { EmailReceipt } from './screens/android/EmailReceipt';
import { OrderHistory } from './screens/android/OrderHistory';
import { Settings } from './screens/android/Settings';
import { Support } from './screens/android/Support';

/** Opens the barcode-setup modal over the items screen (flow 15 entry point). */
function BarcodeSetupLaunch() {
  const { openSetup } = useBarcodeSetup();
  useEffect(() => {
    openSetup();
  }, [openSetup]);
  return <ItemSelection />;
}

/** `/` and unknown paths land on the active platform's home/index. */
function RootRedirect() {
  const { platform } = usePlatform();
  return <Navigate to={`/${platform}`} replace />;
}

/** Keep platform context in sync with the URL (direct navigation / reload / back-forward),
 *  so chrome + tokens match the route the user is actually on. */
function PlatformUrlSync() {
  const { platform, setPlatform } = usePlatform();
  const location = useLocation();
  useEffect(() => {
    const seg = location.pathname.split('/')[1];
    if ((seg === 'android' || seg === 'ios') && seg !== platform) setPlatform(seg);
  }, [location.pathname, platform, setPlatform]);
  return null;
}

export default function App() {
  return (
    <PlatformProvider>
    <DeviceProvider>
      <ToolsProvider>
        <CardReaderProvider>
        <CartProvider>
          <BrowserRouter>
            <PlatformUrlSync />
            <Routes>
              {/* Root + unknown paths → active platform's home/index. */}
              <Route path="/" element={<RootRedirect />} />

              {/* ---- Android platform tree ---- */}
              <Route path="/android">
                {/* Flow index (launcher) lives outside the device frame. */}
                <Route index element={<Home />} />
                {/* Every flow screen renders inside the simulated device shell. */}
                <Route element={<DeviceLayout />}>
                  <Route path="splash" element={<Splash />} />
                  <Route path="eligibility" element={<Eligibility />} />
                  <Route path="products" element={<ItemSelection />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="totals" element={<Totals />} />
                  <Route path="card-payment" element={<CardPayment />} />
                  <Route path="cash-payment" element={<CashPayment />} />
                  <Route path="payment-success" element={<PaymentSuccess />} />
                  <Route path="mark-complete" element={<MarkComplete />} />
                  <Route path="scan-to-pay" element={<ScanToPay />} />
                  <Route path="email-receipt" element={<EmailReceipt />} />
                  <Route path="order-history" element={<OrderHistory />} />
                  <Route path="barcode-setup" element={<BarcodeSetupLaunch />} />
                  <Route path="settings" element={<Settings initialCategory="store" />} />
                  <Route path="settings-hardware" element={<Settings initialCategory="hardware" />} />
                  <Route path="settings-catalog" element={<Settings initialCategory="catalog" />} />
                  <Route path="support" element={<Support />} />
                </Route>
              </Route>

              {/* ---- iOS platform tree (flows added one at a time in Phase 3) ---- */}
              <Route path="/ios">
                <Route index element={<IosHome />} />
                <Route element={<DeviceLayout />}>
                  <Route path="products" element={<IosItemSelector />} />
                  {/* Create coupon is a sheet over the item list (Coupons tab), not its own
                      screen — this entry just opens the catalog with the sheet auto-presented. */}
                  <Route path="add-coupon" element={<IosItemSelector initialTab="coupons" autoCreateCoupon />} />
                  <Route path="checkout" element={<IosCheckout />} />
                  <Route path="orders" element={<IosOrders />} />
                  <Route path="settings" element={<IosSettings />} />
                  <Route path="payments-onboarding" element={<IosPaymentsOnboarding />} />
                </Route>
              </Route>

              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
        </CardReaderProvider>
      </ToolsProvider>
    </DeviceProvider>
    </PlatformProvider>
  );
}
