import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Which platform's implementation of the POS flows is being previewed. Both platforms live
 * in one app (screens/android + screens/ios, components/android + components/ios); this is
 * the source of truth for which route tree and which token deltas apply. Set as
 * `data-platform` on <html> so tokens.css can key off it (like [data-theme]/[data-device]),
 * and persisted to localStorage. Defaults to Android.
 */
export type PlatformId = 'android' | 'ios';

interface PlatformContextValue {
  platform: PlatformId;
  setPlatform: (p: PlatformId) => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

const PLATFORM_KEY = 'woopos.platform';

function readStored(): PlatformId {
  if (typeof localStorage === 'undefined') return 'android';
  const v = localStorage.getItem(PLATFORM_KEY);
  return v === 'ios' || v === 'android' ? v : 'android';
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<PlatformId>(readStored);

  // Applies to the whole document so chrome and device both respond to platform deltas.
  useEffect(() => {
    document.documentElement.setAttribute('data-platform', platform);
    localStorage.setItem(PLATFORM_KEY, platform);
  }, [platform]);

  const value = useMemo<PlatformContextValue>(() => ({ platform, setPlatform }), [platform]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within a PlatformProvider');
  return ctx;
}
