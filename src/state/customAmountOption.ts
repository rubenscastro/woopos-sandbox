import { useSyncExternalStore } from 'react';

/**
 * Custom amounts proposal — which design is being shown (chrome toolbar → "Custom amount").
 * Option 1: the Custom amount row → Amount / Review flow. Option 2: a Keypad tab on the item
 * screen. Option 3: a + menu next to search on the Products tab ("Add custom amount"), no Keypad. A tiny external store (no provider needed), persisted across reloads.
 */
export type CustomAmountOption = 'option1' | 'option2' | 'option3';

export const CUSTOM_AMOUNT_OPTIONS: { id: CustomAmountOption; label: string }[] = [
  { id: 'option1', label: 'Option 1' },
  { id: 'option2', label: 'Option 2 · Keypad' },
  { id: 'option3', label: 'Option 3 · Add menu' },
];

const KEY = 'woopos-custom-amount-option.v1';
const listeners = new Set<() => void>();

function read(): CustomAmountOption {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'option2' || v === 'option3' ? v : 'option1';
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
