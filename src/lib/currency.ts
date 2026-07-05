/** Format a numeric amount as USD, e.g. 1234.5 -> "$1,234.50". */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
