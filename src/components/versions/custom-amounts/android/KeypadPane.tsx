import { Text } from '../../../android/Text';
import { Plus } from '../../../android/icons';
import { useNav } from '../../../../device/platformNav';
import { useCart } from '../../../../state/CartContext';
import { useKeypadDraft } from '../../../../state/keypadDraft';
import { formatUsd } from '../../../../lib/currency';
import '../CustomAmountFlow.css';

/**
 * Custom amounts proposal, Option 2 — Android Keypad tab on the item screen. The amount reads
 * out above a 3 × 4 keypad (7 8 9 / 4 5 6 / 1 2 3 / C 0 +): digits type in minor units, C
 * discards the custom amount, + adds it to the cart and resets the keypad. "Edit details" opens
 * the Review screen for the name and tax flag. Figma: POS Playground, node 4277-25934.
 */
const ROWS: (number | 'C' | '+')[][] = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
  ['C', 0, '+'],
];

export function KeypadPane({ clearBottom }: { /** Tablet: keep the grid clear of the floating menu / reader pill. */ clearBottom?: boolean }) {
  const navigate = useNav();
  const cart = useCart();
  const { cents, name, taxable, typeDigit, clear } = useKeypadDraft();

  const press = (key: number | 'C' | '+') => {
    if (key === 'C') clear();
    else if (key === '+') {
      if (cents <= 0) return;
      cart.addCustomAmount(name, cents / 100, taxable);
      clear();
    } else typeDigit(key);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: `0 var(--space-md) ${clearBottom ? 'calc(var(--size-small) + var(--space-xxl))' : 'var(--space-md)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', padding: 'var(--space-sm) 0' }}>
        {/* Figma "Display/Bold": 52px — not in DESIGN.md's type scale. */}
        <span style={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: 52, lineHeight: 1, color: cents > 0 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant-lowest)' }}>
          {formatUsd(cents / 100)}
        </span>
        <button
          type="button"
          onClick={() => navigate('/custom-amount-details')}
          style={{ border: '2px solid var(--color-inverse-surface)', background: 'transparent', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)', cursor: 'pointer', flex: 'none' }}
        >
          <Text variant="bodySmall" bold>Edit details</Text>
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 1 }}>
        {ROWS.flat().map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key === '+' ? 'Add to cart' : key === 'C' ? 'Clear' : String(key)}
            onClick={() => press(key)}
            className="ca-key"
            style={{ border: 'none', color: 'var(--color-on-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: 52, lineHeight: 1 }}
          >
            {key === '+' ? <Plus size="48px" /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}
