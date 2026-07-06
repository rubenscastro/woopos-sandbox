import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useDevice, type DeviceId } from './DeviceContext';
import { useCurrentPageBackground } from './PageBackground';
import { StatusBar } from './StatusBar';
import './DeviceFrame.css';

/**
 * Logical device dimensions. Content size is what the screen renders into; the frame
 * outer size adds the bezel. WooPOS is a landscape tablet register, so the tablet is
 * landscape; the phone is portrait.
 */
interface DeviceSpec {
  content: { w: number; h: number };
  bezel: number;
  radius: number;
  notch: boolean;
}

const SPECS: Record<DeviceId, DeviceSpec> = {
  tablet: { content: { w: 1194, h: 834 }, bezel: 22, radius: 34, notch: false },
  phone: { content: { w: 390, h: 844 }, bezel: 14, radius: 46, notch: true },
};

const DRAG_THRESHOLD = 5;

export function DeviceFrame({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  const { device, theme } = useDevice();
  const spec = SPECS[device];
  const outerW = spec.content.w + spec.bezel * 2;
  const outerH = spec.content.h + spec.bezel * 2;

  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Scale the frame to fit the available stage area, never upscaling past 1:1.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const recompute = () => {
      const pad = 32;
      const availW = stage.clientWidth - pad;
      const availH = stage.clientHeight - pad;
      setScale(Math.min(1, availW / outerW, availH / outerH));
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [outerW, outerH]);

  return (
    <div className="device-stage" ref={stageRef}>
      <div
        className="device-slot"
        style={{ width: outerW * scale, height: outerH * scale }}
      >
        <div
          className={`device-bezel device-bezel--${device}`}
          style={{
            width: outerW,
            height: outerH,
            padding: spec.bezel,
            borderRadius: spec.radius,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            // Exposed so device-scoped fixed overlays (e.g. the floating-menu scrim, which is
            // positioned against this transformed box) can inset themselves to the screen.
            ['--device-bezel' as string]: `${spec.bezel}px`,
          } as React.CSSProperties}
        >
          {spec.notch && <div className="device-notch" />}
          <DeviceScreen
            device={device}
            theme={theme}
            scale={scale}
            radius={Math.max(spec.radius - spec.bezel, 8)}
            overlay={overlay}
          >
            {children}
          </DeviceScreen>
        </div>
      </div>
    </div>
  );
}

function DeviceScreen({
  device,
  theme,
  scale,
  radius,
  children,
  overlay,
}: {
  device: DeviceId;
  theme: string;
  scale: number;
  radius: number;
  children: ReactNode;
  overlay?: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll (touch-like panning) without swallowing clicks: only start dragging
  // once the pointer moves past a threshold, and suppress the click that follows a drag.
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Let form controls handle their own pointer interactions.
    if ((e.target as HTMLElement).closest('input, textarea, select')) return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      const el = scrollRef.current;
      if (!el) return;
      // Pointer moves in screen px; content is scaled, so divide the delta by scale.
      el.scrollLeft = d.scrollLeft - dx / scale;
      el.scrollTop = d.scrollTop - dy / scale;
      el.classList.add('is-grabbing');
    };
    const onUp = () => {
      const el = scrollRef.current;
      el?.classList.remove('is-grabbing');
      drag.current.active = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [scale]);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (drag.current.moved) {
      // The pointer-up ended a drag — cancel the click it would otherwise fire.
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  }, []);

  // The screen paints the current page's background, so it fills behind everything —
  // including the phone top safe-area (notch) padding on .device-canvas.
  const pageBg = useCurrentPageBackground();

  return (
    <div
      className="device-screen"
      style={{ borderRadius: radius, background: pageBg, ['--device-screen-radius' as string]: `${radius}px` } as React.CSSProperties}
      data-theme={theme}
      data-device={device}
    >
      <div
        ref={scrollRef}
        className="device-scroll"
        data-device={device}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        <div className="device-canvas">{children}</div>
      </div>
      {/* OS status bar in the top safe-area. */}
      <StatusBar device={device} />
      {/* Overlays (modals, keyboard) fixed to the device screen, above the scroll area. */}
      {overlay}
    </div>
  );
}
