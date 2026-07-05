import { useEffect, useState } from 'react';
import { useOptionalDevice } from '../device/DeviceContext';

/**
 * Mirrors WooPosBreakpoint (Phone / SmallTablet / Tablet).
 *
 * Inside the device shell the breakpoint is whatever device the user picked (see
 * DeviceContext) — the screens render into a fixed-size frame, not the raw window.
 * As a fallback (no provider), we approximate from window width using the same
 * thresholds the tokens use:
 *   phone < 840px, smallTablet 840–1279px, tablet >= 1280px
 */
export type Breakpoint = 'phone' | 'smallTablet' | 'tablet';

const PHONE_MAX = 839;
const SMALL_TABLET_MAX = 1279;

function computeBreakpoint(width: number): Breakpoint {
  if (width <= PHONE_MAX) return 'phone';
  if (width <= SMALL_TABLET_MAX) return 'smallTablet';
  return 'tablet';
}

export function useBreakpoint(): Breakpoint {
  const device = useOptionalDevice();
  const [windowBreakpoint, setWindowBreakpoint] = useState<Breakpoint>(() =>
    computeBreakpoint(typeof window === 'undefined' ? 1280 : window.innerWidth),
  );

  useEffect(() => {
    if (device) return; // device selection wins; no need to track window
    const onResize = () => setWindowBreakpoint(computeBreakpoint(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [device]);

  return device ? device.breakpoint : windowBreakpoint;
}

export function useIsPhone(): boolean {
  return useBreakpoint() === 'phone';
}
