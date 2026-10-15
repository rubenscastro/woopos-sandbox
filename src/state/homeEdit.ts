import { useSyncExternalStore } from 'react';

/**
 * Option 4 (Home tab) — the Home page's edit mode ("Edit home page"). While editing, tiles can be
 * removed with their red badge; Cancel throws those removals away, Save keeps them. In memory only.
 */
export type HomeTileId = 'custom-amount' | 'apply-coupon';

interface HomeEditState {
  editing: boolean;
  /** Tiles taken off the page and saved. */
  removed: HomeTileId[];
  /** The removals being made in this edit session. */
  draft: HomeTileId[];
  /** Product tiles on the page (`p:<id>` simple product, `v:<id>` variation) — saved, and the edit in progress. */
  products: string[];
  draftProducts: string[];
  /** The order tiles are laid out in (ids of the tiles on the page; unlisted ones follow in their default order) — saved, and the edit in progress. */
  order: string[];
  draftOrder: string[];
}

const listeners = new Set<() => void>();
let state: HomeEditState = { editing: false, removed: [], draft: [], products: [], draftProducts: [], order: [], draftOrder: [] };
const set = (next: HomeEditState) => {
  state = next;
  listeners.forEach((l) => l());
};

export const startHomeEdit = () => set({ ...state, editing: true, draft: state.removed, draftProducts: state.products, draftOrder: state.order });
export const cancelHomeEdit = () => set({ ...state, editing: false, draft: [], draftProducts: [], draftOrder: [] });
export const saveHomeEdit = () => set({ editing: false, removed: state.draft, draft: [], products: state.draftProducts, draftProducts: [], order: state.draftOrder, draftOrder: [] });
export const removeHomeTile = (id: HomeTileId) =>
  set({ ...state, draft: state.draft.includes(id) ? state.draft : [...state.draft, id] });

/** Put tiles back on the page — into the edit in progress, or straight onto the saved page when not editing. */
export const addHomeTiles = (ids: HomeTileId[]) =>
  set(
    state.editing
      ? { ...state, draft: state.draft.filter((i) => !ids.includes(i)) }
      : { ...state, removed: state.removed.filter((i) => !ids.includes(i)) },
  );

export const removeProductTile = (key: string) => set({ ...state, draftProducts: state.draftProducts.filter((k) => k !== key) });

/** Add product tiles — into the edit in progress, or straight onto the saved page when not editing. */
export const addProductTiles = (keys: string[]) => {
  const add = (list: string[]) => [...list, ...keys.filter((k) => !list.includes(k))];
  set(state.editing ? { ...state, draftProducts: add(state.draftProducts) } : { ...state, products: add(state.products) });
};

/** Drag-to-reorder: set the order tiles are laid out in, in the edit in progress. */
export const setHomeOrder = (ids: string[]) => set({ ...state, draftOrder: ids });

export function useHomeEdit() {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
  /** What the page shows right now: the in-progress removals while editing, the saved ones otherwise. */
  return { editing: s.editing, hidden: s.editing ? s.draft : s.removed, productTiles: s.editing ? s.draftProducts : s.products, order: s.editing ? s.draftOrder : s.order };
}
