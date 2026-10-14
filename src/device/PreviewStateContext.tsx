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
  configs: PreviewStateConfig[];
  publish: (c: PreviewStateConfig) => void;
  retract: (label: string) => void;
}

const PreviewStateContext = createContext<PreviewStateContextValue | null>(null);

/**
 * Screens can publish more than one set of states — Orders has both a refund-error scenario
 * and a loading state, and they're independent. Configs are keyed by label, so republishing
 * (on every options/active change) replaces in place and keeps the menu order stable.
 */
export function PreviewStateProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<PreviewStateConfig[]>([]);

  const publish = useCallback((c: PreviewStateConfig) => {
    setConfigs((list) => {
      const i = list.findIndex((x) => x.label === c.label);
      if (i === -1) return [...list, c];
      const next = list.slice();
      next[i] = c;
      return next;
    });
  }, []);

  const retract = useCallback((label: string) => {
    setConfigs((list) => list.filter((x) => x.label !== label));
  }, []);

  const value = useMemo(() => ({ configs, publish, retract }), [configs, publish, retract]);
  return <PreviewStateContext.Provider value={value}>{children}</PreviewStateContext.Provider>;
}

/** Read every published config, in publish order (used by the chrome). */
export function usePreviewStateConfigs(): PreviewStateConfig[] {
  return useContext(PreviewStateContext)?.configs ?? [];
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
  const publish = ctx?.publish;
  const retract = ctx?.retract;
  const latest = useRef(config);
  latest.current = config;

  const stableOnSelect = useCallback((id: string) => latest.current.onSelect(id), []);

  const label = config.label ?? 'State';
  const optionsKey = JSON.stringify(config.options);
  const { active } = config;

  useEffect(() => {
    if (!publish || !retract) return;
    publish({
      label,
      options: JSON.parse(optionsKey) as PreviewStateOption[],
      active,
      onSelect: stableOnSelect,
    });
    return () => retract(label);
  }, [publish, retract, label, optionsKey, active, stableOnSelect]);
}
