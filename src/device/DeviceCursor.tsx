import { useEffect, useState } from 'react';
import { useTools } from '../tools/ToolsContext';
import './DeviceCursor.css';

/**
 * The device screen shows a translucent "fingertip" circle instead of the system arrow,
 * simulating a touch device driven by a mouse (see .device-screen's `cursor: none` in
 * DeviceFrame.css). Native `cursor: url(...)` custom cursors flicker back to the system
 * arrow on rapid movement in some browsers, so — like the barcode scanner tool — this
 * renders the circle as a JS-positioned element instead of relying on the native `cursor`
 * property. Hidden while the barcode tool is active (its own scanner image takes over).
 */
export function DeviceCursor() {
  const { activeTool } = useTools();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (activeTool === 'barcode') {
      setPos(null);
      return;
    }

    const onMove = (e: PointerEvent) => {
      const under = document.elementFromPoint(e.clientX, e.clientY);
      if (!under || !under.closest('.device-screen')) {
        setPos(null);
        return;
      }
      setPos({ x: e.clientX, y: e.clientY });
    };
    const onLeave = () => setPos(null);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [activeTool]);

  if (!pos) return null;

  return (
    <div
      className="device-cursor"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)` }}
      aria-hidden
    />
  );
}
