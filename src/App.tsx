import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DeviceProvider } from './device/DeviceContext';
import { DeviceLayout } from './device/DeviceLayout';
import { CartProvider } from './state/CartContext';
import { ToolsProvider } from './tools/ToolsContext';
import { CardReaderProvider } from './tools/CardReaderContext';
import { useBarcodeSetup } from './tools/BarcodeSetup';
import { Home } from './screens/Home';
import { Splash } from './screens/Splash';
import { Eligibility } from './screens/Eligibility';
import { ItemSelection } from './screens/ItemSelection';
import { Cart } from './screens/Cart';
import { Totals } from './screens/Totals';
import { CardPayment } from './screens/CardPayment';
import { CashPayment } from './screens/CashPayment';
import { PaymentSuccess } from './screens/PaymentSuccess';
import { MarkComplete } from './screens/MarkComplete';
import { ScanToPay } from './screens/ScanToPay';
import { EmailReceipt } from './screens/EmailReceipt';
import { OrderHistory } from './screens/OrderHistory';
import { Settings } from './screens/Settings';
import { Support } from './screens/Support';

/** Opens the barcode-setup modal over the items screen (flow 15 entry point). */
function BarcodeSetupLaunch() {
  const { openSetup } = useBarcodeSetup();
  useEffect(() => {
    openSetup();
  }, [openSetup]);
  return <ItemSelection />;
}

export default function App() {
  return (
    <DeviceProvider>
      <ToolsProvider>
        <CardReaderProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* The app boots into the splash/eligibility flow (tablet by default). */}
              <Route path="/" element={<Navigate to="/splash" replace />} />
              {/* Flow index (launcher) lives outside the device frame. */}
              <Route path="/flows" element={<Home />} />
              {/* Every flow screen renders inside the simulated device shell. */}
              <Route element={<DeviceLayout />}>
                <Route path="/splash" element={<Splash />} />
                <Route path="/eligibility" element={<Eligibility />} />
                <Route path="/products" element={<ItemSelection />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/totals" element={<Totals />} />
                <Route path="/card-payment" element={<CardPayment />} />
                <Route path="/cash-payment" element={<CashPayment />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/mark-complete" element={<MarkComplete />} />
                <Route path="/scan-to-pay" element={<ScanToPay />} />
                <Route path="/email-receipt" element={<EmailReceipt />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/barcode-setup" element={<BarcodeSetupLaunch />} />
                <Route path="/settings" element={<Settings initialCategory="store" />} />
                <Route path="/settings-hardware" element={<Settings initialCategory="hardware" />} />
                <Route path="/settings-catalog" element={<Settings initialCategory="catalog" />} />
                <Route path="/support" element={<Support />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
        </CardReaderProvider>
      </ToolsProvider>
    </DeviceProvider>
  );
}
