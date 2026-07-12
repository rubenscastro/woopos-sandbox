import { useEffect, useState } from 'react';

const KEY = 'woopos.checkoutPaneOpen';

/**
 * On tablet the checkout ("Ready for payment") is a *pane* inside ItemSelection, not its own
 * route — so navigating out to a full-screen payment sub-screen (cash / scan to pay / mark as
 * paid) and pressing Back would remount ItemSelection with the pane closed, dumping the user on
 * the plain product list (the cart appears to "vanish"). Persisting the pane's open state for
 * the tab session lets Back land right back on the checkout pane with the cart intact.
 *
 * Auto-closes when the cart empties (e.g. after a completed payment clears it, or the last item
 * is removed) so a stale flag can never reopen an empty checkout.
 */
export function useCheckoutPane(cartCount: number): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(() => sessionStorage.getItem(KEY) === '1' && cartCount > 0);

  useEffect(() => {
    if (open) sessionStorage.setItem(KEY, '1');
    else sessionStorage.removeItem(KEY);
  }, [open]);

  useEffect(() => {
    if (cartCount === 0 && open) setOpen(false);
  }, [cartCount, open]);

  return [open, setOpen];
}
