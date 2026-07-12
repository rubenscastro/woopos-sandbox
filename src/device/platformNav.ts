import { useCallback } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { usePlatform } from './PlatformContext';
import { useVersion } from '../versions/VersionContext';
import { resolvePath } from '../versions/routing';

/**
 * Drop-in replacement for useNavigate() that routes within the active version + platform
 * tree. Screens keep writing app-level paths like `navigate('/totals')`; this maps them via
 * `resolvePath` so call sites don't hardcode a version/platform prefix. `/flows` (and `/`)
 * map to the current version+platform's home/index route.
 */
export function useNav() {
  const navigate = useNavigate();
  const { platform } = usePlatform();
  const { version } = useVersion();
  return useCallback(
    (to: string | number, opts?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to);
      return navigate(resolvePath(version, platform, to), opts);
    },
    [navigate, platform, version],
  );
}
