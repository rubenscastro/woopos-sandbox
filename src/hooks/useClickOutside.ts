import { useEffect, useRef } from 'react';

/**
 * Returns a ref to attach to a container; while `open`, calls `onClose` when a pointer-down
 * occurs outside it. Used to dismiss top-bar dropdowns without an onMouseLeave (which closes
 * them as soon as the cursor moves off the trigger toward the menu).
 */
export function useClickOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open, onClose]);
  return ref;
}
