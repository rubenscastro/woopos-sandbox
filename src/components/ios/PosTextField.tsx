import { PosText } from './PosText';

/**
 * iOS POS single-field input (POSSingleFieldInputView.swift): a labeled field on a
 * surfaceBright rounded container, primary focus ring. Optional leading/trailing adornment
 * (e.g. "%" or a currency symbol for coupon amounts).
 */
interface PosTextFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  leading?: string;
  trailing?: string;
  inputMode?: 'text' | 'decimal';
  autoFocus?: boolean;
}

export function PosTextField({ label, value, onChange, placeholder, leading, trailing, inputMode = 'text', autoFocus }: PosTextFieldProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      {label && (
        <PosText variant="bodySmall" color="var(--color-on-surface-variant-highest)">
          {label}
        </PosText>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          background: 'var(--color-surface-bright)',
          border: '2px solid var(--color-outline-variant)',
          borderRadius: 'var(--radius-md)',
          padding: '0 var(--space-md)',
          minHeight: 'var(--size-xsmall)',
        }}
      >
        {leading && (
          <span style={{ color: 'var(--color-on-surface-variant-highest)', fontSize: 'var(--font-body-md-size)' }}>{leading}</span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--color-on-surface)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-body-md-size)',
          }}
        />
        {trailing && (
          <span style={{ color: 'var(--color-on-surface-variant-highest)', fontSize: 'var(--font-body-md-size)' }}>{trailing}</span>
        )}
      </div>
    </label>
  );
}
