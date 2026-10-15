import { useSyncExternalStore } from 'react';

/**
 * Custom amounts proposal — which design is being shown (chrome toolbar → "Custom amount").
 *  - Option 1: the Custom amount row.
 *  - Option 2: a Keypad tab on the item screen; Edit details opens the details as a full-screen
 *    modal, with a primary button at the foot.
 *  - Option 2B: the same Keypad, but the details open in the home's content area, in place of the
 *    tabs, with the action as a small secondary button in the title row.
 *  - Option 3: a + menu next to search on the Products tab ("Add custom amount"), no Keypad.
 *  - Option 4: a Home tab of action tiles ahead of Products and Coupons (Custom amount is one of
 *    the tiles), no Keypad.
 * A tiny external store (no provider needed), persisted across reloads.
 */
export type CustomAmountOption = 'option1' | 'option2' | 'option2b' | 'option3' | 'option4';

export const CUSTOM_AMOUNT_OPTIONS: { id: CustomAmountOption; label: string }[] = [
  { id: 'option1', label: 'Option 1' },
  { id: 'option2', label: 'Option 2 · Keypad' },
  { id: 'option2b', label: 'Option 2B · Keypad, details in place' },
  { id: 'option3', label: 'Option 3 · Add menu' },
  { id: 'option4', label: 'Option 4 · Home tab' },
];

const KEY = 'woopos-custom-amount-option.v1';
const listeners = new Set<() => void>();

function read(): CustomAmountOption {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'option2' || v === 'option2b' || v === 'option3' || v === 'option4' ? v : 'option1';
  } catch {
    return 'option1';
  }
}

let current = read();

export function useCustomAmountOption() {
  const option = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
  const setOption = (next: CustomAmountOption) => {
    current = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Persistence is a convenience only.
    }
    listeners.forEach((l) => l());
  };
  return { option, setOption };
}

/** Options 2 and 2B both have the Keypad tab. */
export const hasKeypad = (option: CustomAmountOption) => option === 'option2' || option === 'option2b';
