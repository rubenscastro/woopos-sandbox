import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Breakpoint } from '../hooks/useBreakpoint';

/**
 * Which simulated device the flow screens render into, and the color scheme. This is the
 * source of truth for the adaptive breakpoint (a *chosen* device, not the browser window),
 * so tokens.css / useBreakpoint key off this rather than window width.
 */
export type DeviceId = 'tablet' | 'phone';
export type ThemeId = 'light' | 'dark';

interface DeviceContextValue {
  device: DeviceId;
  setDevice: (d: DeviceId) => void;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  /** The breakpoint the chosen device maps to (tablet device -> 'tablet', etc.). */
  breakpoint: Breakpoint;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

const DEVICE_KEY = 'woopos.device';
const THEME_KEY = 'woopos.theme';

function readStored<T extends string>(key: string, allowed: T[], fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  const v = localStorage.getItem(key) as T | null;
  return v && allowed.includes(v) ? v : fallback;
}

const DEVICE_BREAKPOINT: Record<DeviceId, Breakpoint> = {
  tablet: 'tablet',
  phone: 'phone',
};

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<DeviceId>(() =>
    readStored(DEVICE_KEY, ['tablet', 'phone'], 'tablet'),
  );
  const [theme, setTheme] = useState<ThemeId>(() =>
    readStored(THEME_KEY, ['light', 'dark'], 'light'),
  );

  // Theme applies to the whole document so chrome and device both respond.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(DEVICE_KEY, device);
  }, [device]);

  const value = useMemo<DeviceContextValue>(
    () => ({ device, setDevice, theme, setTheme, breakpoint: DEVICE_BREAKPOINT[device] }),
    [device, theme],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice(): DeviceContextValue {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error('useDevice must be used within a DeviceProvider');
  return ctx;
}

/** Non-throwing variant for code that may render outside a provider. */
export function useOptionalDevice(): DeviceContextValue | null {
  return useContext(DeviceContext);
}
