import { useSyncExternalStore } from 'react';

/**
 * POS General settings (Custom amounts proposal — Settings → General). "Enable keypad" gates
 * whether custom amounts can be charged at all: off hides the Custom amount row in the item
 * list. A tiny external store rather than a context so it needs no provider, and persisted so
 * it survives reloads.
 */
interface GeneralSettings {
  keypadEnabled: boolean;
}

const KEY = 'woopos-general-settings.v1';
const listeners = new Set<() => void>();

function read(): GeneralSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { keypadEnabled: raw.keypadEnabled !== false };
  } catch {
    return { keypadEnabled: true };
  }
}

let state = read();

function set(next: GeneralSettings) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Persistence is a convenience; the in-memory value still applies.
  }
  listeners.forEach((l) => l());
}

export function useGeneralSettings() {
  const settings = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
  return { ...settings, setKeypadEnabled: (v: boolean) => set({ ...state, keypadEnabled: v }) };
}
