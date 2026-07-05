import { useEffect, useState } from 'react';
import type { DeviceId } from './DeviceContext';

/**
 * A simulated OS status bar in the device's top safe-area: clock (+ date on tablet) on the
 * left and signal / wi-fi / battery on the right. Sits above the screen content; text/icons
 * use on-surface so they read on both themes. Phone leaves the center clear for the notch.
 */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 20000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

export function StatusBar({ device }: { device: DeviceId }) {
  const now = useClock();
  const time = now
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    .replace(/\s?[AP]M/i, '');
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const color = 'var(--color-on-surface)';

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--device-safe-top)',
        zIndex: 6,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: device === 'phone' ? '0 26px' : '0 22px',
        color,
        font: '600 14px var(--font-family)',
        letterSpacing: 0.2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span>{time}</span>
        {device === 'tablet' && (
          <span style={{ fontWeight: 500, opacity: 0.9, fontSize: 13 }}>{date}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color }}>
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden>
      <path d="M1 3.5C5.4 -0.3 11.6 -0.3 16 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3.7 6.4C6.5 3.9 10.5 3.9 13.3 6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6.4 9.2C7.6 8.2 9.4 8.2 10.6 9.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.5" cy="11.2" r="1" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.2" stroke="currentColor" opacity="0.5" />
      <rect x="2" y="2" width="17" height="9" rx="1.8" fill="currentColor" />
      <rect x="25" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
