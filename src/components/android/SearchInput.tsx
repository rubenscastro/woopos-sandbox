import { useState } from 'react';
import { Search, Close } from './icons';

/**
 * WooPosSearchInput — search field on surfaceContainerLow, md radius, leading search icon.
 * Border is transparent at rest and animates to primary while focused (mirrors the app).
 */
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({ value, onChange, placeholder, autoFocus }: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        backgroundColor: 'var(--color-surface-container-low)',
        border: `2px solid ${focused ? 'var(--color-primary)' : 'transparent'}`,
        borderRadius: 'var(--radius-md)',
        padding: '0 var(--space-md)',
        height: 'var(--size-xsmall)',
        boxShadow: 'var(--shadow-soft-medium)',
        transition: 'border-color 0.2s ease',
      }}
    >
      <Search size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)', flex: 'none' }} />
      <input
        value={value}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'var(--color-on-surface)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-body-sm-size)',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear"
          style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface-variant-lowest)' }}
        >
          <Close size="var(--icon-small)" />
        </button>
      )}
    </div>
  );
}
