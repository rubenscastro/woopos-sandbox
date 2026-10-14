import { useSyncExternalStore } from 'react';

/**
 * Custom amounts proposal, Option 2 — the custom amount being built on the Keypad tab. Lives
 * outside the screen because "Edit details" is its own route and must read and write the same
 * amount, name and tax flag. In memory only: a reload starts a fresh keypad.
 */
export interface KeypadDraft {
  cents: number;
  name: string;
  taxable: boolean;
}

const EMPTY: KeypadDraft = { cents: 0, name: '', taxable: false };
const MAX_CENTS = 999_999_999;
const listeners = new Set<() => void>();
let draft: KeypadDraft = EMPTY;

function set(next: KeypadDraft) {
  draft = next;
  listeners.forEach((l) => l());
}

export function useKeypadDraft() {
  const d = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => draft,
  );
  return {
    ...d,
    /** Digits shift in from the right, minor units first (`4`,`0`,`0`,`0` → $40.00). */
    typeDigit: (digit: number) => set({ ...draft, cents: Math.min(MAX_CENTS, draft.cents * 10 + digit) }),
    /** C — throw the whole custom amount away: amount, name and tax flag. */
    clear: () => set(EMPTY),
    setDetails: (next: KeypadDraft) => set(next),
  };
}
