import { useLocation } from 'react-router-dom';
import { useNav } from '../../../../device/platformNav';
import { CustomAmountDetails } from '../../../../components/versions/custom-amounts/ios/CustomAmountDetails';
import { useKeypadDraft } from '../../../../state/keypadDraft';
import { useCart } from '../../../../state/CartContext';

/**
 * Custom amounts proposal — "Custom amount details", the only custom amount screen. Ways in:
 * the add paths (the Custom amount row, Option 3's + menu — blank, with the value entry up),
 * tapping a custom amount in the cart (edits that line; Save updates it) and, in Option 2, the
 * Keypad's "Edit details" (adds the keypad's amount and resets the keypad).
 *
 * `CustomAmountDetailsView` is the screen's content; Option 2 renders it in the home's content
 * area, every other path as the `custom-amount-details` route (`CustomAmountDetailsScreen`).
 */
export function CustomAmountDetailsView({
  editKey,
  fresh = false,
  onClose,
  ctaPlacement,
  onLeaveStart,
  onShown,
}: {
  editKey?: string;
  fresh?: boolean;
  onClose: () => void;
  ctaPlacement?: 'footer' | 'title';
  onLeaveStart?: () => void;
  onShown?: () => void;
}) {
  const cart = useCart();
  const draft = useKeypadDraft();
  const line = cart.lines.find((l) => l.key === editKey && l.kind === 'custom');

  const initial = line && line.kind === 'custom'
    ? { name: line.name, amount: line.amount, taxable: line.taxable }
    : fresh
      ? { name: '', amount: 0, taxable: false }
      : { name: draft.name, amount: draft.cents / 100, taxable: draft.taxable };

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CustomAmountDetails
        startOnAmount={fresh}
        ctaPlacement={ctaPlacement}
        onLeaveStart={onLeaveStart}
        onShown={onShown}
        requireChange={!!line}
        resetKey={line ? line.key : fresh ? 'fresh' : 'keypad'}
        // The custom amount being reviewed was deleted (from the cart's trash): close the review.
        leaveWhen={!!editKey && !line}
        submitText={line ? 'Save' : 'Add to cart'}
        initial={initial}
        onClose={onClose}
        onSubmit={(v) => {
          if (line) cart.updateCustomAmount(line.key, v.name, v.amount, v.taxable);
          else {
            // Straight from the keypad: this is the add-to-cart path, same as + (and resets the keypad).
            cart.addCustomAmount(v.name, v.amount, v.taxable);
            if (!fresh) draft.clear();
          }
          onClose();
        }}
      />
    </div>
  );
}

export function CustomAmountDetailsScreen() {
  const navigate = useNav();
  const routeState = useLocation().state as { editKey?: string; fresh?: boolean } | null;
  return <CustomAmountDetailsView editKey={routeState?.editKey} fresh={!!routeState?.fresh} onClose={() => navigate(-1)} />;
}
