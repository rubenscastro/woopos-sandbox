import { useCallback } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { usePlatform, type PlatformId } from './PlatformContext';

/**
 * Route helpers for the two platform trees (`/android/*`, `/ios/*`). Screens keep writing
 * app-level paths like `navigate('/totals')`; these map them into the active platform's
 * tree so call sites don't hardcode a platform prefix. `/flows` (and `/`) map to the
 * platform's home/index route.
 */
export function platformPath(platform: PlatformId, to: string): string {
  if (to === '/flows' || to === '/') return `/${platform}`;
  return `/${platform}${to}`;
}

/** Drop-in replacement for useNavigate() that routes within the active platform tree. */
export function useNav() {
  const navigate = useNavigate();
  const { platform } = usePlatform();
  return useCallback(
    (to: string | number, opts?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to);
      return navigate(platformPath(platform, to), opts);
    },
    [navigate, platform],
  );
}
