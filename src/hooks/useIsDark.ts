import { useEffect, useState } from 'react';

/**
 * Whether the simulated device is in dark mode. Theme is an attribute on `<html>` (the same
 * attribute-driven pattern as platform and device size), so this watches it rather than taking
 * a prop — anything needing a per-appearance asset can ask for itself.
 *
 * Only for things CSS can't express: a light/dark *image* pair. Colours belong in tokens.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark',
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
