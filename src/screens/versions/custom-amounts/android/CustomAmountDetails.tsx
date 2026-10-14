import { useLocation } from 'react-router-dom';
import { useNav } from '../../../../device/platformNav';
import { CustomAmountDetails } from '../../../../components/versions/custom-amounts/android/CustomAmountDetails';
import { useKeypadDraft } from '../../../../state/keypadDraft';
import { useCart } from '../../../../state/CartContext';

/**
 * Custom amounts proposal — "Custom amount details", the only custom amount screen. Ways in: the Keypad's
 * "Edit details" (the primary button reads "Add to cart": it adds the custom amount and resets
 * the keypad) or tapping a custom amount
 * in the cart (`state.editKey` — edits that line; Save updates it).
 */
export function CustomAmountDetailsScreen() {
  const navigate = useNav();
  const cart = useCart();
  const draft = useKeypadDraft();
  const routeState = useLocation().state as { editKey?: string; fresh?: boolean } | null;
  const editKey = routeState?.editKey;
  // Option 3: "Add custom amount" opens a blank details screen with the value entry on top.
  const fresh = !!routeState?.fresh;
  const line = cart.lines.find((l) => l.key === editKey && l.kind === 'custom');

  const initial = line && line.kind === 'custom'
    ? { name: line.name, amount: line.amount, taxable: line.taxable }
    : fresh
      ? { name: '', amount: 0, taxable: false }
      : { name: draft.name, amount: draft.cents / 100, taxable: draft.taxable };

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <CustomAmountDetails
        startOnAmount={fresh}
        submitText={line ? 'Save' : 'Add to cart'}
        initial={initial}
        onClose={() => navigate(-1)}
        onSubmit={(v) => {
          if (line) cart.updateCustomAmount(line.key, v.name, v.amount, v.taxable);
          else {
            // Straight from the keypad: this is the add-to-cart path, same as + (and resets the keypad).
            cart.addCustomAmount(v.name, v.amount, v.taxable);
            if (!fresh) draft.clear();
          }
          navigate(-1);
        }}
      />
    </div>
  );
}
