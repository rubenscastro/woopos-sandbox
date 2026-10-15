import { useSyncExternalStore } from 'react';
import { confirmIfDirty } from './unsavedGuard';

/**
 * Custom amounts proposal, Option 2 — whether "Custom amount details" is open in the home's
 * content area (where Keypad / Products / Coupons normally are), and which cart line it edits
 * (none = the keypad's own amount, or a blank one when `fresh`). Shared because it is opened from the Keypad tab ("Edit
 * details") and from the cart, and rendered by the item screen. In memory only.
 */
interface HomeDetailsState {
  open: boolean;
  editKey?: string;
  /** Opened to add a new custom amount: blank, with the value entry already up. */
  fresh?: boolean;
  /** False while an add is still on its value entry: the details aren't on screen yet, so the home
   *  content stays put until they are. */
  shown?: boolean;
  /** The details have started to slide out — the home content slides back in step with them. */
  leaving?: boolean;
}

const CLOSED: HomeDetailsState = { open: false };
const listeners = new Set<() => void>();
let state: HomeDetailsState = CLOSED;

function set(next: HomeDetailsState) {
  state = next;
  listeners.forEach((l) => l());
}

export const openHomeDetails = (editKey?: string, fresh = false) => set({ open: true, editKey, fresh, shown: !fresh });
export const closeHomeDetails = () => set(CLOSED);
export const markHomeDetailsShown = () => set({ ...state, shown: true });
export const markHomeDetailsLeaving = () => set({ ...state, leaving: true });

export function useHomeDetails(): HomeDetailsState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

/**
 * Open the details on a cart line from the cart. Tapping the line already open does nothing; moving
 * to another while the open one has unsaved changes asks before discarding them.
 */
export function requestOpenHomeDetails(editKey: string) {
  if (state.open && state.editKey === editKey) return;
  confirmIfDirty(() => openHomeDetails(editKey));
}
