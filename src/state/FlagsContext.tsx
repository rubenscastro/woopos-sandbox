import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Prototype feature flags — mirror the iOS POS FeatureFlag gates so we can preview behaviour both
 * on and off. Persisted to localStorage. Only the flags we actually wire up are listed here.
 */
export type FlagId = 'roles';

export const FLAG_DEFS: { id: FlagId; label: string; description: string }[] = [
  // pointOfSaleRoles — signed-in operator + capability gating. Off by default in production.
  { id: 'roles', label: 'POS roles', description: 'Signed-in operator & role gating' },
];

const DEFAULTS: Record<FlagId, boolean> = { roles: false };
const KEY = 'woopos-flags';

function readStored(): Record<FlagId, boolean> {
  if (typeof localStorage === 'undefined') return { ...DEFAULTS };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

interface FlagsValue {
  flags: Record<FlagId, boolean>;
  setFlag: (id: FlagId, value: boolean) => void;
}

const FlagsContext = createContext<FlagsValue | null>(null);

export function FlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<FlagId, boolean>>(readStored);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(flags));
  }, [flags]);

  const setFlag = useCallback((id: FlagId, value: boolean) => setFlags((f) => ({ ...f, [id]: value })), []);
  const value = useMemo<FlagsValue>(() => ({ flags, setFlag }), [flags, setFlag]);
  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
}

export function useFlags(): FlagsValue {
  const ctx = useContext(FlagsContext);
  if (!ctx) throw new Error('useFlags must be used within a FlagsProvider');
  return ctx;
}
