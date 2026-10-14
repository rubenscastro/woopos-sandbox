import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import './DragScroll.css';

const DRAG_THRESHOLD = 5;

/**
 * A scroll container with a hidden scrollbar that can be panned by click-dragging (like a
 * touch device). Preserves clicks below a small movement threshold. Divides the drag delta
 * by the container's effective scale so panning tracks the cursor inside the scaled device.
 */
export function DragScroll({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0, left: 0, top: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('input, textarea, select')) return;
    const el = ref.current;
    if (!el) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      left: el.scrollLeft,
      top: el.scrollTop,
    };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      const el = ref.current;
      if (!d.active || !el) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      const scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
      el.scrollLeft = d.left - dx / scale;
      el.scrollTop = d.top - dy / scale;
      el.classList.add('is-grabbing');
    };
    const onUp = () => {
      ref.current?.classList.remove('is-grabbing');
      drag.current.active = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`woopos-dragscroll${className ? ` ${className}` : ''}`}
      style={style}
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
}
