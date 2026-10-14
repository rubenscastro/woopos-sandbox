import { useLocation } from 'react-router-dom';
import { useNav } from '../../../../device/platformNav';
import { CustomAmountFlow } from '../../../../components/versions/custom-amounts/ios/CustomAmountFlow';
import { useCart } from '../../../../state/CartContext';

/**
 * Custom amounts proposal — the custom amount flow as a full-screen modal route (like Issue
 * refund), on phone and tablet. Reached from the "Custom amount" row (add) and from tapping a
 * custom amount's card in the cart (`state.editKey` — opens on Review for that line).
 */
export function CustomAmount() {
  const navigate = useNav();
  const cart = useCart();
  const editKey = (useLocation().state as { editKey?: string } | null)?.editKey;
  const editing = cart.lines.find((l) => l.key === editKey && l.kind === 'custom');

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <CustomAmountFlow
        initial={editing && editing.kind === 'custom' ? { name: editing.name, amount: editing.amount, taxable: editing.taxable } : undefined}
        onClose={() => navigate(-1)}
        onSubmit={({ name, amount, taxable }) => {
          if (editing) cart.updateCustomAmount(editing.key, name, amount, taxable);
          else cart.addCustomAmount(name, amount, taxable);
          navigate(-1);
        }}
      />
    </div>
  );
}
