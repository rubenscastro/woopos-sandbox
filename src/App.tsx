import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCustomAmountOption, optionParam, parseOptionParam } from './state/customAmountOption';
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
import { CashDrawerProvider } from './state/versions/cash-reconciliation/CashDrawerContext';
import { VersionProvider, useVersion } from './versions/VersionContext';
import { PROPOSAL_VERSIONS, versionPlatforms } from './versions/registry';
import { versionOverrides } from './versions/overrides';
import { resolvePath, parseRoutedPath } from './versions/routing';
import { androidRouteDefs } from './routes/androidRouteDefs';
import { iosRouteDefs } from './routes/iosRouteDefs';
import { mergeRouteDefs } from './routes/mergeRouteDefs';

/** Loading the prototype boots the active platform the way the real app does — Android's
 *  WooPosSplashScreen, iOS's PointOfSaleLoadingView — both of which sync the catalog and
 *  then open the products screen. Replaces the old Setup gate; platform/device/theme are
 *  now changed from the chrome sidebar instead of being picked up front. */
function StartupRedirect() {
  const { platform } = usePlatform();
  const { version } = useVersion();
  const startup = platform === 'android' ? '/splash' : '/loading';
  return <Navigate to={resolvePath(version, platform, startup)} replace />;
}

/** Unknown paths land directly on the active version+platform's product catalog
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

/**
 * Custom amounts versions are reachable by URL: `…/versions/custom-amounts/…?option=4` opens that
 * option (1, 2, 2b, 3, 4), and the address bar follows the Option control so the link can be shared.
 */
function CustomAmountOptionUrlSync() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const { option, setOption } = useCustomAmountOption();
  const inVersion = pathname.startsWith('/versions/custom-amounts');
  // Following a link (or the browser's back/forward) to a different option.
  useEffect(() => {
    const fromUrl = parseOptionParam(new URLSearchParams(search).get('option'));
    if (inVersion && fromUrl && fromUrl !== option) setOption(fromUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  // The Option control, or navigating inside the prototype, keeps the param on the address.
  useEffect(() => {
    if (!inVersion) return;
    const params = new URLSearchParams(search);
    if (params.get('option') === optionParam(option)) return;
    params.set('option', optionParam(option));
    navigate({ pathname, search: `?${params}`, hash }, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option, pathname]);
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
            <CustomAmountOptionUrlSync />
            <Routes>
              {/* No landing gate — loading the prototype goes straight into the startup
                  path for the persisted platform (default iOS / tablet / dark). Platform,
                  device and theme are changed from the chrome sidebar, not up front. */}
              <Route path="/" element={<StartupRedirect />} />

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
                  {/* A proposal built for one platform doesn't route the other at all —
                      otherwise the unbuilt side quietly serves Trunk's screens back. */}
                  {versionPlatforms(v.id).includes('android') && (
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
                  )}
                  {versionPlatforms(v.id).includes('ios') && (
                  <Route path="ios">
                    <Route index element={<Navigate to={`/versions/${v.id}/ios/products`} replace />} />
                    <Route
                      element={
                        // The cash drawer session outlives the screen showing it, so its
                        // provider wraps this proposal's whole iOS tree — leaving the drawer
                        // for the catalog has to keep the session, and is in fact what ages
                        // it. Scoped to the proposal, like System Events above.
                        v.id === 'cash-reconciliation' ? (
                          <CashDrawerProvider>
                            <DeviceLayout />
                          </CashDrawerProvider>
                        ) : (
                          <DeviceLayout />
                        )
                      }
                    >
                      {mergeRouteDefs(iosRouteDefs, versionOverrides[v.id]?.ios).map((r) => (
                        <Route key={r.path} path={r.path} element={r.element} />
                      ))}
                    </Route>
                  </Route>
                  )}
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
