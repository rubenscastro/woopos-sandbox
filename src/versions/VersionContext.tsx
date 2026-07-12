import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { VERSIONS, type VersionId } from './registry';

/**
 * Which prototype version is being previewed — `main` or a proposal (see registry.ts).
 * Set as `data-version` on <html> (same attribute-driven pattern as [data-platform] /
 * [data-theme] / [data-device]) in case a proposal ever needs a CSS hook, and persisted to
 * localStorage. Defaults to `main`.
 */
interface VersionContextValue {
  version: VersionId;
  setVersion: (v: VersionId) => void;
}

const VersionContext = createContext<VersionContextValue | null>(null);

const VERSION_KEY = 'woopos.version';

function readStored(): VersionId {
  if (typeof localStorage === 'undefined') return 'main';
  const v = localStorage.getItem(VERSION_KEY);
  return VERSIONS.some((entry) => entry.id === v) ? (v as VersionId) : 'main';
}

export function VersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState<VersionId>(readStored);

  useEffect(() => {
    document.documentElement.setAttribute('data-version', version);
    localStorage.setItem(VERSION_KEY, version);
  }, [version]);

  const value = useMemo<VersionContextValue>(() => ({ version, setVersion }), [version]);

  return <VersionContext.Provider value={value}>{children}</VersionContext.Provider>;
}

export function useVersion(): VersionContextValue {
  const ctx = useContext(VersionContext);
  if (!ctx) throw new Error('useVersion must be used within a VersionProvider');
  return ctx;
}
