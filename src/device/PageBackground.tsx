import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * The current screen's background color, lifted to the device shell so the phone safe-area
 * (notch) strip can share it. A screen that isn't plain `surface` calls usePageBackground()
 * to publish its color; the device screen paints that color behind everything — including
 * the top safe-area padding — so the notch strip always matches the page.
 */
const DEFAULT_BG = 'var(--color-surface)';

interface PageBackgroundValue {
  bg: string;
  setBg: (c: string) => void;
}

const PageBackgroundContext = createContext<PageBackgroundValue>({ bg: DEFAULT_BG, setBg: () => {} });

export function PageBackgroundProvider({ children }: { children: ReactNode }) {
  const [bg, setBg] = useState(DEFAULT_BG);
  const value = useMemo(() => ({ bg, setBg }), [bg]);
  return <PageBackgroundContext.Provider value={value}>{children}</PageBackgroundContext.Provider>;
}

/** Read the active page background (used by the device shell). */
export function useCurrentPageBackground(): string {
  return useContext(PageBackgroundContext).bg;
}

/** Publish this screen's background; resets to the default surface on unmount. */
export function usePageBackground(color: string) {
  const { setBg } = useContext(PageBackgroundContext);
  useEffect(() => {
    setBg(color);
    return () => setBg(DEFAULT_BG);
  }, [setBg, color]);
}
