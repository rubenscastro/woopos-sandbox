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

/**
 * Lets a flow screen publish its "preview states" (transient/backend-driven variants a
 * reviewer would otherwise never see) up to the chrome top bar, so the switcher lives
 * OUTSIDE the device frame instead of floating over the screen.
 */
export interface PreviewStateOption {
  id: string;
  label: string;
}

export interface PreviewStateConfig {
  label: string;
  options: PreviewStateOption[];
  active: string;
  onSelect: (id: string) => void;
}

interface PreviewStateContextValue {
  config: PreviewStateConfig | null;
  setConfig: (c: PreviewStateConfig | null) => void;
}

const PreviewStateContext = createContext<PreviewStateContextValue | null>(null);

export function PreviewStateProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PreviewStateConfig | null>(null);
  const value = useMemo(() => ({ config, setConfig }), [config]);
  return <PreviewStateContext.Provider value={value}>{children}</PreviewStateContext.Provider>;
}

/** Read the currently published config (used by the chrome). */
export function usePreviewStateConfig(): PreviewStateConfig | null {
  return useContext(PreviewStateContext)?.config ?? null;
}

/**
 * Publish a screen's preview states to the chrome. Safe to call with a fresh `onSelect`
 * each render — the published handler is stable and always calls the latest one, so this
 * only re-publishes when the label, options, or active id actually change.
 */
export function usePublishPreviewState(config: {
  label?: string;
  options: PreviewStateOption[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const ctx = useContext(PreviewStateContext);
  const setConfig = ctx?.setConfig;
  const latest = useRef(config);
  latest.current = config;

  const stableOnSelect = useCallback((id: string) => latest.current.onSelect(id), []);

  const label = config.label ?? 'State';
  const optionsKey = JSON.stringify(config.options);
  const { active } = config;

  useEffect(() => {
    if (!setConfig) return;
    setConfig({
      label,
      options: JSON.parse(optionsKey) as PreviewStateOption[],
      active,
      onSelect: stableOnSelect,
    });
    return () => setConfig(null);
  }, [setConfig, label, optionsKey, active, stableOnSelect]);
}
