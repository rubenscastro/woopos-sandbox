import { useEffect, useRef, useState } from 'react';

/** How long the slide/fade transition takes — must match the CSS transition duration in
 *  SystemEventsStack's SlideTransition so the exit timer doesn't cut the animation short. */
export const SLIDE_TRANSITION_MS = 220;

export interface AnimatedSlot<T> {
  key: string;
  value: T;
  phase: 'entering' | 'visible' | 'leaving';
}

/**
 * Keeps a "leaving" item mounted (and its latest value frozen) for SLIDE_TRANSITION_MS after
 * it drops out of `items`, and marks freshly-added items "entering" for one frame before
 * flipping to "visible" — so the caller can render enter/exit CSS transitions off `phase`
 * instead of items just vanishing/appearing instantly. Order follows `items`, with leaving
 * items staying wherever they last were. Entering items are held (hidden) until nothing is
 * leaving, so two notifications' animations never overlap — the next one only starts moving
 * in once the previous one has fully finished moving out.
 */
export function useAnimatedList<T>(items: { key: string; value: T }[]): AnimatedSlot<T>[] {
  const [slots, setSlots] = useState<AnimatedSlot<T>[]>(() =>
    items.map((i) => ({ key: i.key, value: i.value, phase: 'entering' })),
  );
  const timersRef = useRef(new Map<string, number>());
  // `items` is a fresh array every render (the caller rebuilds it inline), so it can't be the
  // effect's dependency directly — that would re-run (and re-`setSlots`) on every render
  // forever. Serializing it gives a value that's only *actually* different when a key or a
  // value inside it changes, which is what should trigger the effect.
  const itemsSignature = JSON.stringify(items);

  useEffect(() => {
    setSlots((prev) => {
      const nextByKey = new Map(items.map((i) => [i.key, i.value]));
      const next: AnimatedSlot<T>[] = [];

      for (const slot of prev) {
        if (nextByKey.has(slot.key)) {
          const timer = timersRef.current.get(slot.key);
          if (timer) {
            window.clearTimeout(timer);
            timersRef.current.delete(slot.key);
          }
          next.push({ key: slot.key, value: nextByKey.get(slot.key)!, phase: slot.phase === 'leaving' ? 'visible' : slot.phase });
        } else if (slot.phase !== 'leaving') {
          next.push({ ...slot, phase: 'leaving' });
        } else {
          next.push(slot);
        }
      }
      for (const i of items) {
        if (!prev.some((s) => s.key === i.key)) next.push({ key: i.key, value: i.value, phase: 'entering' });
      }
      // Bail out (same reference) when nothing actually changed — belt-and-braces guard so a
      // parent re-render with an unchanged (but referentially new) `items` array can never
      // turn into a real state update, regardless of how often this effect happens to run.
      // Values are compared by content (JSON), not reference, since the caller rebuilds them
      // as fresh object literals every render even when nothing in them actually changed.
      const unchanged =
        next.length === prev.length &&
        next.every((n, i) => n.key === prev[i].key && n.phase === prev[i].phase && JSON.stringify(n.value) === JSON.stringify(prev[i].value));
      return unchanged ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsSignature]);

  // Commit the "entering" (hidden) style first, then flip to "visible" a frame later so the
  // CSS transition actually animates instead of snapping straight to the end state. Held off
  // while anything is still "leaving" so a new notification's enter never overlaps the
  // previous one's exit — it re-fires once the leaving item's removal timer clears it below.
  useEffect(() => {
    const hasLeaving = slots.some((s) => s.phase === 'leaving');
    if (hasLeaving || !slots.some((s) => s.phase === 'entering')) return;
    const raf = requestAnimationFrame(() => {
      setSlots((prev) => prev.map((s) => (s.phase === 'entering' ? { ...s, phase: 'visible' } : s)));
    });
    return () => cancelAnimationFrame(raf);
  }, [slots]);

  // Actually drop "leaving" items once their exit transition has had time to finish.
  useEffect(() => {
    slots.forEach((slot) => {
      if (slot.phase === 'leaving' && !timersRef.current.has(slot.key)) {
        const t = window.setTimeout(() => {
          setSlots((prev) => prev.filter((s) => s.key !== slot.key));
          timersRef.current.delete(slot.key);
        }, SLIDE_TRANSITION_MS);
        timersRef.current.set(slot.key, t);
      }
    });
  }, [slots]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return slots;
}
