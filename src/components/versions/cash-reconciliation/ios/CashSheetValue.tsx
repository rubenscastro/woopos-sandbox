import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * The one value a cash step is asking for — an amount, a count, a note. Typed at
 * `--cash-sheet-value-size`, and shrinking from there once what's typed is wider than the
 * field, down to half size: the floor the app's own single-line fields use
 * (`.minimumScaleFactor(0.5)` on POSCollectCashView's button, POSPageHeaderView's title).
 *
 * Shrinking rather than wrapping or clipping, because the value is the screen: a note that ran
 * off the right edge would leave the merchant typing into somewhere they can't see, and a
 * second line would push the block off its centre. Below the floor it scrolls the way any
 * single-line field does — by then the text is long enough that no size would show all of it.
 */
export interface CashSheetValueProps {
  value: string;
  onChange: (next: string) => void;
  /** What the field is called, for anyone not looking at the header. */
  ariaLabel: string;
  placeholder?: string;
  /** Dims the figure while it's still a prompt rather than something entered. */
  empty?: boolean;
  /** Raises the decimal pad instead of the letter keyboard, as `.decimalPad` does. */
  numeric?: boolean;
}

/**
 * Text is measured off-screen rather than by growing the field and reading it back, which
 * would need a layout pass per keystroke. One canvas for the module — it holds no state
 * between calls beyond the font, which every call sets.
 */
let measureContext: CanvasRenderingContext2D | null = null;
function measurer(): CanvasRenderingContext2D | null {
  if (!measureContext) measureContext = document.createElement('canvas').getContext('2d');
  return measureContext;
}

/** Room left at the end of the line for the caret, which `measureText` knows nothing about. */
const CARET_ALLOWANCE = 8;

/**
 * How far the value is allowed to shrink, as a fraction of its full size — the same floor the
 * app's own single-line fields set with `.minimumScaleFactor(0.5)`. A factor rather than a
 * second CSS variable: a `calc()` custom property comes back out of `getComputedStyle`
 * unevaluated, so there would be nothing to read.
 */
const MINIMUM_SCALE_FACTOR = 0.5;

export function CashSheetValue({ value, onChange, ariaLabel, placeholder, empty, numeric }: CashSheetValueProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState<number | null>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    const ctx = measurer();
    if (!el || !ctx) return;

    const styles = getComputedStyle(el);
    const max = parseFloat(styles.getPropertyValue('--cash-sheet-value-size'));
    const room =
      el.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight) - CARET_ALLOWANCE;
    if (!Number.isFinite(max) || !(room > 0)) return;
    const min = max * MINIMUM_SCALE_FACTOR;

    /*
     * Always measured at the full size, never at whatever size is currently applied, so the
     * answer doesn't depend on the last one — otherwise deleting a character would leave the
     * field stuck small, each pass only ever measuring the shrunken text.
     */
    ctx.font = `${styles.fontWeight} ${max}px ${styles.fontFamily}`;
    const width = ctx.measureText(el.value || placeholder || '').width;
    setSize(width > room ? Math.max(min, (max * room) / width) : max);
  }, [placeholder]);

  useLayoutEffect(fit, [fit, value]);

  // The field is as wide as the sheet, so it re-fits when the device does — switching to the
  // phone frame is the same problem as typing a long note.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  return (
    <input
      ref={ref}
      className={`cash-sheet__value${empty ? ' is-empty' : ''}`}
      style={size === null ? undefined : { fontSize: `${size}px` }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={numeric ? 'decimal' : undefined}
      aria-label={ariaLabel}
    />
  );
}

/**
 * A line under the value that the step only sometimes has to say. Always rendered, collapsed
 * when it has nothing to say, so it opens and closes over a transition instead of appearing
 * and disappearing between frames — see `.cash-sheet__reveal`.
 */
export function CashSheetReveal({ shown, children }: { shown: boolean; children: ReactNode }) {
  const lineRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  /*
   * Opened and closed by animating to a measured height rather than the `0fr`/`1fr` grid
   * trick: that one collapses correctly but won't come back, because an `fr` track in an
   * auto-height grid has no free space to resolve against once it has been squeezed to
   * nothing. Measuring costs a ResizeObserver and works in both directions.
   */
  useLayoutEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /*
   * A line that is already there when the sheet opens is just part of the step, so it should
   * be at its height in the first painted frame. Only what changes afterwards travels.
   */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`cash-sheet__reveal${shown ? ' is-shown' : ''}${ready ? ' is-ready' : ''}`}
      style={{ height: shown ? height : 0 }}
      aria-hidden={!shown}
    >
      {/* Measured separately from the wrapper being animated, so the line's own spacing above
          it collapses with it and leaves no gap behind. */}
      <div className="cash-sheet__reveal-line" ref={lineRef}>
        {children}
      </div>
    </div>
  );
}
