import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNav } from './platformNav';
import { CartPanel } from '../components/android/CartPanel';
import { useBarcodeSetup } from '../tools/BarcodeSetup';
import './CartSheet.css';

/**
 * Phone cart, presented as a draggable bottom sheet over the device (rendered in the device
 * overlay so its background reaches the very bottom, past the safe area). Opens at ~50%
 * height; dragging the top handle up snaps it to ~90%, dragging down snaps back / dismisses.
 */
interface CartSheetValue {
  open: boolean;
  openCartSheet: () => void;
  closeCartSheet: () => void;
}

const CartSheetContext = createContext<CartSheetValue | null>(null);

export function CartSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo<CartSheetValue>(
    () => ({ open, openCartSheet: () => setOpen(true), closeCartSheet: () => setOpen(false) }),
    [open],
  );
  return <CartSheetContext.Provider value={value}>{children}</CartSheetContext.Provider>;
}

export function useCartSheet(): CartSheetValue {
  const ctx = useContext(CartSheetContext);
  if (!ctx) throw new Error('useCartSheet must be used within a CartSheetProvider');
  return ctx;
}

// translateY of the 90%-tall sheet: 0 = full (90% visible), 44.4% ≈ 50% visible, 100% = off.
const SNAP = { off: '100%', half: '44.4%', full: '0%' } as const;
type Snap = keyof typeof SNAP;

export function CartSheetHost() {
  const { open, closeCartSheet } = useCartSheet();
  const navigate = useNav();
  const { openSetup } = useBarcodeSetup();
  const [snap, setSnap] = useState<Snap>('off');
  const snapRef = useRef<Snap>('off');
  snapRef.current = snap;

  // Slide in to half on open; slide out before unmount on close.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setSnap('half'), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  const close = useCallback(() => {
    setSnap('off');
    window.setTimeout(closeCartSheet, 280);
  }, [closeCartSheet]);

  const onHandleDown = (e: React.PointerEvent) => {
    // Stop the drag from turning into a text selection of the content behind the sheet.
    e.preventDefault();
    const startY = e.clientY;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointerup', onUp);
      document.body.style.userSelect = prevUserSelect;
      const dy = ev.clientY - startY;
      if (dy < -40) setSnap('full');
      else if (dy > 40) (snapRef.current === 'full' ? setSnap('half') : close());
    };
    window.addEventListener('pointerup', onUp);
  };

  if (!open) return null;

  return (
    <div className="cart-sheet-scrim woopos-scrim" onClick={close} role="presentation">
      <div
        className="cart-sheet"
        style={{ transform: `translateY(${SNAP[snap]})` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-sheet__handle-area" onPointerDown={onHandleDown}>
          <div className="cart-sheet__handle" />
        </div>
        <div className="cart-sheet__body">
          <CartPanel
            onCheckout={() => { close(); navigate('/totals'); }}
            onScanBarcode={() => { close(); openSetup(); }}
          />
        </div>
      </div>
    </div>
  );
}
