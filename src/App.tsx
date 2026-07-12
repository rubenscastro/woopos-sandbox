import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PlatformProvider, usePlatform } from './device/PlatformContext';
import { DeviceProvider } from './device/DeviceContext';
import { DeviceLayout } from './device/DeviceLayout';
import { CartProvider } from './state/CartContext';
import { PrinterProvider } from './state/PrinterContext';
import { PaymentSettingsProvider } from './state/PaymentSettingsContext';
import { FlagsProvider } from './state/FlagsContext';
import { ToolsProvider } from './tools/ToolsContext';
import { ConnectivityProvider } from './tools/ConnectivityContext';
import { CardReaderProvider } from './tools/CardReaderContext';
import { BarcodeScannerProvider } from './tools/BarcodeScannerContext';
import { SystemEventsProvider } from './components/versions/scaling-pos-experience/android/systemEvents/SystemEventsContext';
import { VersionProvider, useVersion } from './versions/VersionContext';
import { PROPOSAL_VERSIONS } from './versions/registry';
import { versionOverrides } from './versions/overrides';
import { resolvePath, parseRoutedPath } from './versions/routing';
import { androidRouteDefs } from './routes/androidRouteDefs';
import { iosRouteDefs } from './routes/iosRouteDefs';
import { mergeRouteDefs } from './routes/mergeRouteDefs';

/** `/` and unknown paths land directly on the active version+platform's product catalog
 *  (no launcher). */
function RootRedirect() {
  const { platform } = usePlatform();
  const { version } = useVersion();
  return <Navigate to={resolvePath(version, platform, '/products')} replace />;
}

/** Keep platform + version context in sync with the URL (direct navigation / reload /
 *  back-forward), so chrome + tokens match the route the user is actually on. */
function RouteContextSync() {
  const { platform, setPlatform } = usePlatform();
  const { version, setVersion } = useVersion();
  const location = useLocation();
  useEffect(() => {
    const parsed = parseRoutedPath(location.pathname);
    if (parsed.platform && parsed.platform !== platform) setPlatform(parsed.platform);
    if (parsed.version !== version) setVersion(parsed.version);
  }, [location.pathname, platform, setPlatform, version, setVersion]);
  return null;
}

export default function App() {
  return (
    <PlatformProvider>
    <VersionProvider>
    <FlagsProvider>
    <DeviceProvider>
      <ToolsProvider>
        <ConnectivityProvider>
        <CardReaderProvider>
        <BarcodeScannerProvider>
        <PrinterProvider>
        <PaymentSettingsProvider>
        <CartProvider>
          <BrowserRouter>
            <RouteContextSync />
            <Routes>
              {/* Root + unknown paths → active version+platform's home/index. */}
              <Route path="/" element={<RootRedirect />} />

              {/* ---- Main version — Android platform tree ---- */}
              <Route path="/android">
                {/* No launcher page — open straight into the catalog. */}
                <Route index element={<Navigate to="/android/products" replace />} />
                {/* Every flow screen renders inside the simulated device shell. */}
                <Route element={<DeviceLayout />}>
                  {androidRouteDefs.map((r) => (
                    <Route key={r.path} path={r.path} element={r.element} />
                  ))}
                </Route>
              </Route>

              {/* ---- Main version — iOS platform tree (flows added one at a time in Phase 3) ---- */}
              <Route path="/ios">
                <Route index element={<Navigate to="/ios/products" replace />} />
                <Route element={<DeviceLayout />}>
                  {iosRouteDefs.map((r) => (
                    <Route key={r.path} path={r.path} element={r.element} />
                  ))}
                </Route>
              </Route>

              {/* ---- Proposal versions (see src/versions/) — each gets the same android/ios
                  tree as Main, with its own overrides layered on top. Add a new proposal by
                  registering it in versions/registry.ts + versions/overrides.tsx; no route
                  changes needed here. ---- */}
              {PROPOSAL_VERSIONS.map((v) => (
                <Route key={v.id} path={`/versions/${v.id}`}>
                  <Route path="android">
                    <Route index element={<Navigate to={`/versions/${v.id}/android/products`} replace />} />
                    <Route
                      element={
                        // System Events is a scaling-pos-experience-only subsystem — its
                        // provider only wraps this proposal's Android tree, not Main or
                        // future proposals, so nothing elsewhere can accidentally depend on it.
                        v.id === 'scaling-pos-experience' ? (
                          <SystemEventsProvider>
                            <DeviceLayout />
                          </SystemEventsProvider>
                        ) : (
                          <DeviceLayout />
                        )
                      }
                    >
                      {mergeRouteDefs(androidRouteDefs, versionOverrides[v.id]?.android).map((r) => (
                        <Route key={r.path} path={r.path} element={r.element} />
                      ))}
                    </Route>
                  </Route>
                  <Route path="ios">
                    <Route index element={<Navigate to={`/versions/${v.id}/ios/products`} replace />} />
                    <Route element={<DeviceLayout />}>
                      {mergeRouteDefs(iosRouteDefs, versionOverrides[v.id]?.ios).map((r) => (
                        <Route key={r.path} path={r.path} element={r.element} />
                      ))}
                    </Route>
                  </Route>
                </Route>
              ))}

              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
        </PaymentSettingsProvider>
        </PrinterProvider>
        </BarcodeScannerProvider>
        </CardReaderProvider>
        </ConnectivityProvider>
      </ToolsProvider>
    </DeviceProvider>
    </FlagsProvider>
    </VersionProvider>
    </PlatformProvider>
  );
}
