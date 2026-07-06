import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Shared cart state for the POS checkout loop (products -> cart -> totals -> payment).
 * Mirrors the item types the real WooPosCartScreen renders: products (with quantity),
 * custom amounts, and coupons. Totals are computed here so every pane shows the same
 * numbers. Tax is a flat mock rate since there's no backend.
 */
const MOCK_TAX_RATE = 0.1;

export interface ProductLine {
  key: string;
  kind: 'product';
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
}

export interface CustomLine {
  key: string;
  kind: 'custom';
  name: string;
  amount: number;
  taxable: boolean;
}

export interface CouponLine {
  key: string;
  kind: 'coupon';
  code: string;
  summary: string;
  discount: number;
}

export type CartLine = ProductLine | CustomLine | CouponLine;

export interface AddableProduct {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  /** Number of barcode-scanned products still "loading" into the cart (renders skeleton rows). */
  pendingScans: number;
  addProduct: (p: AddableProduct) => void;
  /** Add a product as if scanned: shows a loading row briefly, then resolves to the item. */
  scanProduct: (p: AddableProduct) => void;
  addCustomAmount: (name: string, amount: number, taxable: boolean) => void;
  addCoupon: (code: string, summary: string, discount: number) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

let idSeq = 1;
const nextKey = (prefix: string) => `${prefix}-${idSeq++}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [pendingScans, setPendingScans] = useState(0);

  const addProduct = useCallback((p: AddableProduct) => {
    setLines((prev) => {
      const existing = prev.find(
        (l): l is ProductLine => l.kind === 'product' && l.productId === p.id,
      );
      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...existing, quantity: existing.quantity + 1 } : l,
        );
      }
      const line: ProductLine = {
        key: nextKey('p'),
        kind: 'product',
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        imageUrl: p.imageUrl,
      };
      return [line, ...prev];
    });
  }, []);

  // Barcode scan: show a loading row for a beat, then resolve into the actual product line.
  const scanProduct = useCallback((p: AddableProduct) => {
    setPendingScans((n) => n + 1);
    window.setTimeout(() => {
      addProduct(p);
      setPendingScans((n) => Math.max(0, n - 1));
    }, 800);
  }, [addProduct]);

  const addCustomAmount = useCallback((name: string, amount: number, taxable: boolean) => {
    setLines((prev) => [
      { key: nextKey('c'), kind: 'custom', name: name || 'Custom amount', amount, taxable },
      ...prev,
    ]);
  }, []);

  const addCoupon = useCallback((code: string, summary: string, discount: number) => {
    setLines((prev) => {
      if (prev.some((l) => l.kind === 'coupon' && l.code === code)) return prev;
      return [{ key: nextKey('cp'), kind: 'coupon', code, summary, discount }, ...prev];
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key && l.kind === 'product' ? { ...l, quantity } : l)),
    );
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setPendingScans(0);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, l) => {
      if (l.kind === 'product') return sum + l.price * l.quantity;
      if (l.kind === 'custom') return sum + l.amount;
      return sum;
    }, 0);
    const discountTotal = lines.reduce(
      (sum, l) => (l.kind === 'coupon' ? sum + l.discount : sum),
      0,
    );
    const taxable = lines.reduce((sum, l) => {
      if (l.kind === 'product') return sum + l.price * l.quantity;
      if (l.kind === 'custom' && l.taxable) return sum + l.amount;
      return sum;
    }, 0);
    const taxTotal = Math.max(0, taxable - discountTotal) * MOCK_TAX_RATE;
    const itemCount = lines.reduce(
      (n, l) => (l.kind === 'product' ? n + l.quantity : l.kind === 'custom' ? n + 1 : n),
      0,
    );
    return {
      lines,
      itemCount,
      subtotal,
      discountTotal,
      taxTotal,
      total: subtotal - discountTotal + taxTotal,
      pendingScans,
      addProduct,
      scanProduct,
      addCustomAmount,
      addCoupon,
      removeLine,
      setQuantity,
      clear,
    };
  }, [lines, pendingScans, addProduct, scanProduct, addCustomAmount, addCoupon, removeLine, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
