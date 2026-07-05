import { useEffect, useRef, useState } from 'react';
import { useDevice } from './DeviceContext';
import './DeviceKeyboard.css';

/**
 * A simulated Android soft keyboard. This is NOT a real Android IME (that can't run in a
 * browser) — it's a faithful on-screen keyboard that slides up inside the device frame when
 * a text field within the device is focused, and types into that field. Physical typing
 * still works too.
 */
type Field = HTMLInputElement | HTMLTextAreaElement;

const LETTERS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];
const SYMBOLS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['@', '#', '$', '%', '&', '-', '+', '(', ')', '/'],
  ['*', '"', "'", ':', ';', '!', '?'],
];

function setNativeValue(el: Field, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

export function DeviceKeyboard() {
  const { device } = useDevice();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'letters' | 'symbols'>('letters');
  const [shift, setShift] = useState(false);
  const fieldRef = useRef<Field | null>(null);

  // Track focus of text fields inside the device.
  useEffect(() => {
    const isDeviceField = (t: EventTarget | null): t is Field =>
      (t instanceof HTMLInputElement &&
        !['checkbox', 'radio', 'button', 'submit', 'range'].includes(t.type)) ||
      t instanceof HTMLTextAreaElement
        ? Boolean((t as HTMLElement).closest('.device-scroll'))
        : false;

    const onFocusIn = (e: FocusEvent) => {
      if (isDeviceField(e.target)) {
        fieldRef.current = e.target as Field;
        setMode('letters');
        setVisible(true);
      }
    };
    const onFocusOut = () => {
      // Delay so tapping a key (which briefly moves focus) doesn't dismiss the keyboard.
      window.setTimeout(() => {
        if (!isDeviceField(document.activeElement)) {
          fieldRef.current = null;
          setVisible(false);
        }
      }, 120);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const edit = (fn: (value: string, start: number, end: number) => [string, number]) => {
    const el = fieldRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const [next, caret] = fn(el.value, start, end);
    setNativeValue(el, next);
    try {
      el.setSelectionRange(caret, caret);
    } catch {
      /* number inputs don't support selection */
    }
  };

  const insert = (ch: string) =>
    edit((v, s, e) => [v.slice(0, s) + ch + v.slice(e), s + ch.length]);
  const backspace = () =>
    edit((v, s, e) => (s === e ? [v.slice(0, Math.max(0, s - 1)) + v.slice(e), Math.max(0, s - 1)] : [v.slice(0, s) + v.slice(e), s]));

  if (!visible) return null;

  const rows = mode === 'letters' ? LETTERS : SYMBOLS;
  const tx = (ch: string) => (mode === 'letters' && shift ? ch.toUpperCase() : ch);

  // Keep focus on the field: prevent the mousedown from blurring it.
  const hold = (fn: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    fn();
  };

  return (
    <div
      className="device-keyboard"
      // On tablet the soft keyboard occupies at least 40% of the screen height.
      style={device === 'tablet' ? { minHeight: '40%' } : undefined}
      // Keep focus on the text field — mousedown preventDefault stops the key buttons
      // from stealing focus (which would dismiss the keyboard).
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => e.preventDefault()}
    >
      {rows.map((row, ri) => (
        <div className="kb-row" key={ri}>
          {ri === 2 && mode === 'letters' && (
            <button className={`kb-key kb-key--mod${shift ? ' is-active' : ''}`} onPointerDown={hold(() => setShift((s) => !s))}>
              ⇧
            </button>
          )}
          {ri === 2 && mode === 'symbols' && (
            <button className="kb-key kb-key--mod" onPointerDown={hold(() => setMode('letters'))}>
              ABC
            </button>
          )}
          {row.map((ch) => (
            <button key={ch} className="kb-key" onPointerDown={hold(() => insert(tx(ch)))}>
              {tx(ch)}
            </button>
          ))}
          {ri === 2 && (
            <button className="kb-key kb-key--mod" onPointerDown={hold(backspace)} aria-label="Backspace">
              ⌫
            </button>
          )}
        </div>
      ))}
      <div className="kb-row">
        <button
          className="kb-key kb-key--mod"
          onPointerDown={hold(() => setMode((m) => (m === 'letters' ? 'symbols' : 'letters')))}
        >
          {mode === 'letters' ? '?123' : 'ABC'}
        </button>
        <button className="kb-key" onPointerDown={hold(() => insert(','))}>
          ,
        </button>
        <button className="kb-key kb-key--space" onPointerDown={hold(() => insert(' '))} aria-label="Space" />
        <button className="kb-key" onPointerDown={hold(() => insert('.'))}>
          .
        </button>
        <button className="kb-key kb-key--mod kb-key--return" onPointerDown={hold(() => fieldRef.current?.blur())}>
          return
        </button>
      </div>
    </div>
  );
}
