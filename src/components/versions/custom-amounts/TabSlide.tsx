import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import './CustomAmountFlow.css';

/**
 * Custom amounts proposal — switching between the item screen's tabs (Keypad / Home / Products /
 * Coupons) slides sideways: the new tab comes in from the side it sits on, and the one it
 * replaces leaves the other way. Both are rendered for the 300ms it takes. Disabled, it renders
 * the current tab and nothing else, so other versions keep their plain swap.
 */
export function TabSlideArea<T extends string>({
  tab,
  order,
  enabled,
  render,
}: {
  tab: T;
  /** Left-to-right order of the tabs as they appear in the header. */
  order: readonly T[];
  enabled: boolean;
  render: (tab: T) => ReactNode;
}) {
  const last = useRef(tab);
  const [slide, setSlide] = useState<{ prev: T; dir: 1 | -1 } | null>(null);

  // Layout effect: the slide must be in place before the new tab's first paint, or it flashes.
  useLayoutEffect(() => {
    if (last.current === tab) return;
    const prev = last.current;
    last.current = tab;
    if (!enabled) return;
    setSlide({ prev, dir: order.indexOf(tab) > order.indexOf(prev) ? 1 : -1 });
    const t = window.setTimeout(() => setSlide(null), 300);
    return () => window.clearTimeout(t);
  }, [tab, enabled, order]);

  if (!enabled) return <>{render(tab)}</>;

  const layer: React.CSSProperties = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', minHeight: 0 };
  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {slide && (
        <div className={slide.dir === 1 ? 'ca-tab-out-left' : 'ca-tab-out-right'} style={layer}>
          {render(slide.prev)}
        </div>
      )}
      <div className={slide ? (slide.dir === 1 ? 'ca-tab-in-right' : 'ca-tab-in-left') : undefined} style={layer}>
        {render(tab)}
      </div>
    </div>
  );
}

export const TAB_ORDER = ['keypad', 'home', 'products', 'coupons'] as const;
