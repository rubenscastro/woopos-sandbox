import { useNavigate } from 'react-router-dom';
import { usePlatform, type PlatformId } from '../device/PlatformContext';
import { useDevice, type DeviceId, type ThemeId } from '../device/DeviceContext';
import { useVersion } from '../versions/VersionContext';
import { resolvePath } from '../versions/routing';
import { TabletIcon, PhoneIcon, Sun, Moon } from '../components/android/icons';
import './Setup.css';

/**
 * Landing gate shown at `/` before any flow — pick Platform, Device, and Theme once, then
 * "Load prototype" drops into the chosen platform's normal startup path: Android's
 * WooPosSplashScreen (screens/android/Splash.tsx) or iOS's PointOfSaleLoadingView
 * (screens/ios/Loading.tsx) — both sync the local catalog before opening the products screen.
 */
export function Setup() {
  const { platform, setPlatform } = usePlatform();
  const { device, setDevice, theme, setTheme } = useDevice();
  const { version } = useVersion();
  const navigate = useNavigate();

  const start = () => {
    const path = resolvePath(version, platform, platform === 'android' ? '/splash' : '/loading');
    navigate(path);
  };

  return (
    <div className="setup">
      <div className="setup-card">
        <h1 className="setup-title">WooPOS</h1>
        <p className="setup-subtitle">Choose how you'd like to preview the prototype.</p>

        <SetupField label="Platform">
          <div className="segmented" role="group" aria-label="Platform">
            {(
              [
                { id: 'android', label: 'Android' },
                { id: 'ios', label: 'iOS' },
              ] as { id: PlatformId; label: string }[]
            ).map((o) => (
              <button
                key={o.id}
                type="button"
                className={o.id === platform ? 'is-active' : ''}
                aria-pressed={o.id === platform}
                onClick={() => setPlatform(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </SetupField>

        <SetupField label="Device">
          <div className="segmented" role="group" aria-label="Device">
            {(
              [
                { id: 'tablet', label: 'Tablet', icon: <TabletIcon size="18px" /> },
                { id: 'phone', label: 'Phone', icon: <PhoneIcon size="18px" /> },
              ] as { id: DeviceId; label: string; icon: React.ReactNode }[]
            ).map((o) => (
              <button
                key={o.id}
                type="button"
                className={o.id === device ? 'is-active' : ''}
                aria-pressed={o.id === device}
                onClick={() => setDevice(o.id)}
              >
                <span className="segmented__icon">{o.icon}</span>
                {o.label}
              </button>
            ))}
          </div>
        </SetupField>

        <SetupField label="Theme">
          <div className="segmented" role="group" aria-label="Color scheme">
            {(
              [
                { id: 'light', label: 'Light', icon: <Sun size="18px" /> },
                { id: 'dark', label: 'Dark', icon: <Moon size="18px" /> },
              ] as { id: ThemeId; label: string; icon: React.ReactNode }[]
            ).map((o) => (
              <button
                key={o.id}
                type="button"
                className={o.id === theme ? 'is-active' : ''}
                aria-pressed={o.id === theme}
                onClick={() => setTheme(o.id)}
              >
                <span className="segmented__icon">{o.icon}</span>
                {o.label}
              </button>
            ))}
          </div>
        </SetupField>

        <button type="button" className="setup-cta" onClick={start}>
          Load prototype
        </button>
      </div>
    </div>
  );
}

function SetupField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="setup-field">
      <span className="setup-field__label">{label}</span>
      {children}
    </div>
  );
}
