import { useEffect, useRef, useState } from 'react';
import { useTools } from './ToolsContext';
import './ScannerCursor.css';

// Read-head anchor within the scanner image (fractions of its width/height).
const HEAD_X = 0.5;
const HEAD_Y = 0.09;
const IMG_W = 290;
const IMG_H = (IMG_W * 300) / 180;
const DWELL_MS = 420;

/**
 * The virtual barcode scanner. When the barcode tool is active it replaces the cursor and
 * follows the mouse; its read-head (top-center) projects a horizontal red laser line — the
 * scan point. Dwelling the head over a registered barcode fires that target's onScan once.
 * Hidden while the pointer is over the navigation top bar so the toolbar stays usable.
 */
export function ScannerCursor() {
  const { activeTool, targetsRef } = useTools();
  const active = activeTool === 'barcode';

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [flash, setFlash] = useState(false);
  const hoveredId = useRef<string | null>(null);
  const firedId = useRef<string | null>(null);
  const dwellTimer = useRef<number | null>(null);
  const imgSrc = useRef('/scanner.png');

  useEffect(() => {
    if (!active) {
      setPos(null);
      hoveredId.current = null;
      firedId.current = null;
      if (dwellTimer.current) window.clearTimeout(dwellTimer.current);
      return;
    }

    const clearDwell = () => {
      if (dwellTimer.current) {
        window.clearTimeout(dwellTimer.current);
        dwellTimer.current = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Keep the scanner out of the navigation bar so the toolbar stays clickable.
      const under = document.elementFromPoint(x, y);
      if (under && under.closest('.chrome-bar')) {
        setPos(null);
        hoveredId.current = null;
        clearDwell();
        return;
      }
      setPos({ x, y });

      let over: string | null = null;
      for (const [id, t] of targetsRef.current) {
        const r = t.el.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          over = id;
          break;
        }
      }

      if (over !== hoveredId.current) {
        hoveredId.current = over;
        clearDwell();
        if (over && over !== firedId.current) {
          dwellTimer.current = window.setTimeout(() => {
            const target = targetsRef.current.get(over!);
            if (!target) return;
            firedId.current = over;
            setFlash(true);
            window.setTimeout(() => setFlash(false), 320);
            target.onScan();
          }, DWELL_MS);
        }
      }
      if (!over) firedId.current = null;
    };

    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      clearDwell();
    };
  }, [active, targetsRef]);

  if (!active || !pos) return null;

  return (
    <div className="scanner-cursor-layer" aria-hidden>
      {/* Horizontal laser line through the read-head. */}
      <div className={`scanner-beam${flash ? ' is-scanning' : ''}`} style={{ left: pos.x, top: pos.y }} />
      <div className={`scanner-point${flash ? ' is-scanning' : ''}`} style={{ left: pos.x, top: pos.y }} />
      <img
        className={`scanner-img${flash ? ' is-scanning' : ''}`}
        src={imgSrc.current}
        alt=""
        width={IMG_W}
        height={IMG_H}
        style={{ left: pos.x - IMG_W * HEAD_X, top: pos.y - IMG_H * HEAD_Y }}
        onError={(e) => {
          if (imgSrc.current !== '/scanner.svg') {
            imgSrc.current = '/scanner.svg';
            (e.target as HTMLImageElement).src = '/scanner.svg';
          }
        }}
      />
    </div>
  );
}
