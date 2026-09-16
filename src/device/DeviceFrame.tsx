import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useDevice, type DeviceId } from './DeviceContext';
import { usePlatform, type PlatformId } from './PlatformContext';
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
  /**
   * How much of the available stage the fitted device takes, so it reads as a preview on a
   * canvas rather than a full-bleed screen. Per device: the tablet is the register's real
   * working surface and where most flows are reviewed, so it sits larger than the phone.
   */
  fit: number;
}

const SPECS: Record<PlatformId, Record<DeviceId, DeviceSpec>> = {
  ios: {
    /* iPad Pro 11-inch (M4), from the simulator's own device profile and chrome: a 1668 × 2420
       @2x screen is 1210 × 834 points, its framebuffer mask rounds the display at 30, and
       tablet5.devicechrome puts a 45pt bezel around it with a 75 outer corner — which is the
       same 30 back again once the bezel is taken off. */
    tablet: { content: { w: 1210, h: 834 }, bezel: 45, radius: 75, notch: false, fit: 0.93 },
    // The phone's corners are rounder than the tablet's, as they are on the real hardware — the
    // display radius (radius − bezel) lands at 44, which is what an iPhone's screen actually is.
    phone: { content: { w: 390, h: 844 }, bezel: 14, radius: 58, notch: true, fit: 0.81 },
  },
  /*
   * Android is a Galaxy, and a Galaxy is not an iPad with different software — its borders are
   * a third of the iPad's and its corners far less round, which is most of why the two read as
   * different hardware at a glance.
   *
   * The bezel checks out against the Tab S11 Ultra's published dimensions: a 14.6" 16:10 panel
   * inside a 326.3 × 208.5 mm body leaves ~5.9 mm of border, or 1.8% of the body's width. 22 on
   * a 1238-wide frame is 1.78% — the same border, in the units this file works in.
   *
   * Screen sizes stay as they were: the Android layouts were built against them, and moving to
   * the Tab's real 16:10 would reflow every screen. Worth doing, but not as part of the frame.
   */
  android: {
    tablet: { content: { w: 1194, h: 834 }, bezel: 22, radius: 34, notch: false, fit: 0.93 },
    // Galaxy S26 Ultra: a 6.9" 3120 × 1440 panel in a 163.6 × 78.1 mm body leaves ~2.3 mm of
    // border — 13 of the 412 × 891 dp the phone reports. Corners scale from the tablet's rather
    // than being invented: no published radius exists for either device.
    phone: { content: { w: 412, h: 891 }, bezel: 13, radius: 30, notch: false, fit: 0.81 },
  },
};

const DRAG_THRESHOLD = 5;

/** Nearest scrollable ancestor of `node` (up to and excluding `stop`) — the element a drag
 *  should pan. Used so dragging a screen's inner scroll area (catalog, cart) works, not just
 *  the outer device-scroll. */
function scrollableUnder(node: HTMLElement | null, stop: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = node;
  while (el && el !== stop) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return null;
}

export function DeviceFrame({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  const { device, theme } = useDevice();
  const { platform } = usePlatform();
  const spec = SPECS[platform][device];
  const outerW = spec.content.w + spec.bezel * 2;
  const outerH = spec.content.h + spec.bezel * 2;

  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Scale the frame to fit the available stage area, never upscaling past 1:1, then hold it at
  // the device's own fit ratio so it sits inside the canvas rather than filling it edge to edge.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const recompute = () => {
      const pad = 32;
      const availW = stage.clientWidth - pad;
      const availH = stage.clientHeight - pad;
      setScale(Math.min(1, availW / outerW, availH / outerH) * spec.fit);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [outerW, outerH, spec.fit]);

  return (
    <div className="device-stage" ref={stageRef}>
      <div
        className="device-slot"
        style={{ width: outerW * scale, height: outerH * scale }}
      >
        <div
          className={`device-bezel device-bezel--${device} device-bezel--${platform}`}
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
          {/* The hardware keys. Purely scenery — they do nothing — but their absence is what
              made the phone read as a rounded rectangle rather than a device. */}
          {device === 'phone' && (
            <>
              <span className="device-key device-key--silent" aria-hidden />
              <span className="device-key device-key--volume-up" aria-hidden />
              <span className="device-key device-key--volume-down" aria-hidden />
              <span className="device-key device-key--power" aria-hidden />
            </>
          )}
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
    el: null as HTMLElement | null,
  });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Let form controls handle their own pointer interactions.
    if ((e.target as HTMLElement).closest('input, textarea, select')) return;
    // Drag-scroll the actual scrollable element under the pointer (e.g. the catalog's inner
    // list), falling back to the whole screen when nothing inner scrolls.
    const el = scrollableUnder(e.target as HTMLElement, scrollRef.current) ?? scrollRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      el,
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
      const el = d.el;
      if (!el) return;
      // Pointer moves in screen px; content is scaled, so divide the delta by scale.
      el.scrollLeft = d.scrollLeft - dx / scale;
      el.scrollTop = d.scrollTop - dy / scale;
      el.classList.add('is-grabbing');
    };
    const onUp = () => {
      drag.current.el?.classList.remove('is-grabbing');
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
