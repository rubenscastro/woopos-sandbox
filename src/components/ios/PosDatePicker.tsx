import { useState } from 'react';
import { PosIconButton } from './PosIconButton';
import { Calendar, ChevronLeft, ChevronRight } from './IosIcons';
import { useClickOutside } from '../../hooks/useClickOutside';
import './PosDatePicker.css';

/**
 * The system graphical date picker, simulated: a month grid in a popover under a calendar
 * glyph, used to filter a list by date. This is what `DatePicker(...).datePickerStyle(.graphical)`
 * draws, and it's the control the app already reaches for wherever a date filters something
 * (`BookingDateTimeFilterView`, `CouponExpiryDateView`) — paired with a Clear, as those are.
 *
 * It can't be imported: the real one is UIKit, drawn by the OS. What's below matches its
 * layout and behaviour — month stepper, weekday initials, today marked in the tint, the
 * selection as a filled tint circle — and takes only its tint from the app. It deliberately
 * doesn't follow the POS type and spacing scale, because the real control doesn't either.
 */

/** `MM/DD/YYYY` — the shape the mock data writes dates in. */
export type DateKey = string;

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function toDateKey(d: Date): DateKey {
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

/** Parses `MM/DD/YYYY` back into a local Date — `new Date(string)` would read it as UTC. */
export function fromDateKey(key: DateKey): Date {
  const [m, d, y] = key.split('/').map(Number);
  return new Date(y, m - 1, d);
}

export function PosDatePickerButton({
  label,
  selected,
  /** Days that can be picked. Everything else renders but is inert. */
  enabled,
  /** Which month to open on — the month the data is in, not necessarily this one. */
  defaultMonth,
  onSelect,
  onClear,
}: {
  label: string;
  selected: DateKey | null;
  enabled?: DateKey[];
  defaultMonth?: DateKey;
  onSelect: (date: DateKey) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const opening = selected ?? defaultMonth;
  const [month, setMonth] = useState(() => {
    const d = opening ? fromDateKey(opening) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = toDateKey(new Date());
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = month.getDay();
  const step = (by: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1));

  return (
    <div ref={ref} style={{ position: 'relative', flex: 'none' }}>
      <PosIconButton label={label} onClick={() => setOpen((o) => !o)}>
        {/* A filter that's on colours its own trigger, the way an active filter does. */}
        <Calendar
          size="var(--icon-medium)"
          style={{ color: selected ? 'var(--color-primary)' : undefined }}
        />
      </PosIconButton>
      {open && (
        <div className="pos-datepicker woopos-liquid-glass" role="dialog" aria-label={label}>
          <div className="pos-datepicker__header">
            <span className="pos-datepicker__month">
              {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <span className="pos-datepicker__spacer" />
            <button type="button" className="pos-datepicker__step" aria-label="Previous month" onClick={() => step(-1)}>
              <ChevronLeft size="var(--icon-small)" />
            </button>
            <button type="button" className="pos-datepicker__step" aria-label="Next month" onClick={() => step(1)}>
              <ChevronRight size="var(--icon-small)" />
            </button>
          </div>

          <div className="pos-datepicker__weekdays" aria-hidden>
            {WEEKDAY_INITIALS.map((d, i) => (
              <span key={i} className="pos-datepicker__weekday">
                {d}
              </span>
            ))}
          </div>

          <div className="pos-datepicker__grid">
            {Array.from({ length: leading }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const key = toDateKey(new Date(month.getFullYear(), month.getMonth(), day));
              const isSelected = key === selected;
              const isEnabled = !enabled || enabled.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!isEnabled}
                  aria-current={key === today ? 'date' : undefined}
                  aria-pressed={isSelected}
                  className={`pos-datepicker__day${isSelected ? ' is-selected' : ''}${
                    !isSelected && key === today ? ' is-today' : ''
                  }`}
                  onClick={() => {
                    onSelect(key);
                    setOpen(false);
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {selected && (
            <button
              type="button"
              className="pos-datepicker__clear"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
