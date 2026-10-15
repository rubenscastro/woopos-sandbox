import { useSyncExternalStore } from 'react';

/**
 * Custom amounts proposal — guards an unsaved custom amount. While the details screen holds changes
 * that haven't been added to the cart or saved, anything that would take the merchant off it (back,
 * X, another custom amount, Check out, the menu…) goes through `confirmIfDirty`: with unsaved
 * changes it raises the system's own "discard changes?" dialog first, and only carries on if they
 * agree. A tiny external store so the details screen, the cart, the menus and the dialog host need
 * no shared provider.
 */
let dirty = false;
let pending: (() => void) | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Called by the details screen: whether it currently holds changes that would be lost. */
export function setUnsavedChanges(value: boolean) {
  dirty = value;
}

/** Runs `action` now, or — with unsaved changes — only once the merchant has agreed to lose them. */
export function confirmIfDirty(action: () => void) {
  if (!dirty) {
    action();
    return;
  }
  pending = action;
  notify();
}

/** The dialog's answer: discard (carry on with the action that was held back) or keep editing. */
export function resolveDiscard(discard: boolean) {
  const action = pending;
  pending = null;
  if (discard) dirty = false;
  notify();
  if (discard) action?.();
}

export function useDiscardPending(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => pending !== null,
  );
}
