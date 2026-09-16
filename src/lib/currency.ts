/** Format a numeric amount as USD, e.g. 1234.5 -> "$1,234.50". */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * ATM-style minor-unit entry: reads the amount back out of a field that displays a formatted
 * currency string. Digits shift in from the right — `5` is $0.05, `50` is $0.50 — so the field
 * is driven by what's typed rather than by parsing free text, and the decimal key does nothing.
 * Capped at 13 digits so a stuck key can't overflow the figure.
 */
export function centsFromInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits.slice(0, 13), 10);
}
