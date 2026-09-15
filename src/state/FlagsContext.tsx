import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useVersion } from '../versions/VersionContext';
import { VERSIONS, type VersionId } from '../versions/registry';
import { FLAG_DEFAULTS, type FlagId } from './flags';

export { FLAG_DEFS } from './flags';
export type { FlagId } from './flags';

/**
 * Prototype feature flags, held **per version**. A proposal usually exists to explore what a
 * flag turns on, so it declares its own defaults in `registry.ts` (`flagDefaults`) — e.g. Cash
 * reconciliation runs with POS roles on, while Trunk keeps production's off. Without the
 * per-version split, toggling a flag inside a proposal would follow you back into Trunk and
 * quietly misrepresent the shipped baseline.
 *
 * Explicit toggles from the Flags menu are persisted per version, so a version's defaults only
 * apply until the reviewer overrides them there.
 */
type FlagMap = Record<FlagId, boolean>;

const KEY = 'woopos-flags.v2';

/** Defaults for a version: production defaults, with that version's declared overrides on top. */
function defaultsFor(version: VersionId): FlagMap {
  const entry = VERSIONS.find((v) => v.id === version);
  return { ...FLAG_DEFAULTS, ...entry?.flagDefaults };
}

type StoredFlags = Partial<Record<VersionId, Partial<FlagMap>>>;

function readStored(): StoredFlags {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return typeof raw === 'object' && raw !== null ? (raw as StoredFlags) : {};
  } catch {
    return {};
  }
}

interface FlagsValue {
  flags: FlagMap;
  setFlag: (id: FlagId, value: boolean) => void;
}

const FlagsContext = createContext<FlagsValue | null>(null);

export function FlagsProvider({ children }: { children: ReactNode }) {
  const { version } = useVersion();
  const [stored, setStored] = useState<StoredFlags>(readStored);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(stored));
  }, [stored]);

  // The version's declared defaults, with any explicit toggles for that version layered on top.
  const flags = useMemo<FlagMap>(
    () => ({ ...defaultsFor(version), ...stored[version] }),
    [version, stored],
  );

  const setFlag = useCallback(
    (id: FlagId, value: boolean) =>
      setStored((s) => ({ ...s, [version]: { ...s[version], [id]: value } })),
    [version],
  );

  const value = useMemo<FlagsValue>(() => ({ flags, setFlag }), [flags, setFlag]);
  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
}

export function useFlags(): FlagsValue {
  const ctx = useContext(FlagsContext);
  if (!ctx) throw new Error('useFlags must be used within a FlagsProvider');
  return ctx;
}
