import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ScannerCursor } from './ScannerCursor';

/**
 * Prototype "tools" — meta-interactions layered over the device, not part of the real app.
 * The barcode tool turns the cursor into a virtual barcode scanner: moving the mouse moves
 * the scanner, and hovering its read-head over a registered on-screen barcode fires that
 * barcode's scan handler (e.g. advancing the scanner-setup test step).
 */
export type Tool = 'none' | 'barcode';

export interface ToolTarget {
  el: HTMLElement;
  onScan: () => void;
}

interface ToolsValue {
  activeTool: Tool;
  setActiveTool: (t: Tool) => void;
  toggleTool: (t: Tool) => void;
  registerTarget: (id: string, el: HTMLElement, onScan: () => void) => void;
  unregisterTarget: (id: string) => void;
  targetsRef: React.MutableRefObject<Map<string, ToolTarget>>;
}

const ToolsContext = createContext<ToolsValue | null>(null);

export function ToolsProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<Tool>('none');
  const targetsRef = useRef<Map<string, ToolTarget>>(new Map());

  const registerTarget = useCallback((id: string, el: HTMLElement, onScan: () => void) => {
    targetsRef.current.set(id, { el, onScan });
  }, []);
  const unregisterTarget = useCallback((id: string) => {
    targetsRef.current.delete(id);
  }, []);
  const toggleTool = useCallback((t: Tool) => setActiveTool((cur) => (cur === t ? 'none' : t)), []);

  // Hide the system cursor while a cursor-replacing tool is active.
  useEffect(() => {
    const cls = 'tool-cursor-active';
    document.documentElement.classList.toggle(cls, activeTool !== 'none');
    return () => document.documentElement.classList.remove(cls);
  }, [activeTool]);

  // While the barcode tool is active, disable clicks everywhere except the top bar (so the
  // scanner reads by hovering, not clicking — and the toolbar stays usable to turn it off).
  useEffect(() => {
    if (activeTool !== 'barcode') return;
    const block = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest('.chrome-bar')) return;
      e.stopPropagation();
      e.preventDefault();
    };
    document.addEventListener('click', block, true);
    document.addEventListener('mousedown', block, true);
    document.addEventListener('pointerdown', block, true);
    return () => {
      document.removeEventListener('click', block, true);
      document.removeEventListener('mousedown', block, true);
      document.removeEventListener('pointerdown', block, true);
    };
  }, [activeTool]);

  const value = useMemo<ToolsValue>(
    () => ({ activeTool, setActiveTool, toggleTool, registerTarget, unregisterTarget, targetsRef }),
    [activeTool, toggleTool, registerTarget, unregisterTarget],
  );

  return (
    <ToolsContext.Provider value={value}>
      {children}
      <ScannerCursor />
    </ToolsContext.Provider>
  );
}

export function useTools(): ToolsValue {
  const ctx = useContext(ToolsContext);
  if (!ctx) throw new Error('useTools must be used within a ToolsProvider');
  return ctx;
}

let targetSeq = 0;

/**
 * Mark an element as a scannable barcode. Returns a ref to attach. When the barcode tool's
 * read-head hovers over it (with a short dwell), onScan fires once until the head leaves.
 */
export function useBarcodeTarget<T extends HTMLElement = HTMLDivElement>(
  onScan: () => void,
  enabled = true,
) {
  const ref = useRef<T>(null);
  const { registerTarget, unregisterTarget } = useTools();
  const cb = useRef(onScan);
  cb.current = onScan;

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const id = `bt-${targetSeq++}`;
    registerTarget(id, el, () => cb.current());
    return () => unregisterTarget(id);
  }, [enabled, registerTarget, unregisterTarget]);

  return ref;
}
