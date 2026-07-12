import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Payment configuration set in Settings → Payments, shared so the checkout surface can reflect
 * it. Platform-agnostic config state (per the project's `src/state/` convention) — no backend,
 * just in-memory for the prototype.
 */
export interface PaymentMethods {
  cardReader: boolean;
  cash: boolean;
  scanToPay: boolean;
  markAsPaid: boolean;
}

export type PaymentMethodId = keyof PaymentMethods;

interface PaymentSettingsValue {
  /** Which methods are enabled as accepted at checkout. */
  methods: PaymentMethods;
  setMethod: (id: PaymentMethodId, value: boolean) => void;
  /** Whether the till sound plays when a payment completes. */
  successSound: boolean;
  setSuccessSound: (v: boolean) => void;
}

const DEFAULT_METHODS: PaymentMethods = {
  cardReader: true,
  cash: true,
  scanToPay: false,
  markAsPaid: true,
};

const PaymentSettingsContext = createContext<PaymentSettingsValue | null>(null);

export function PaymentSettingsProvider({ children }: { children: ReactNode }) {
  const [methods, setMethods] = useState<PaymentMethods>(DEFAULT_METHODS);
  const [successSound, setSuccessSound] = useState(true);

  const setMethod = useCallback((id: PaymentMethodId, value: boolean) => {
    setMethods((m) => ({ ...m, [id]: value }));
  }, []);

  const value = useMemo<PaymentSettingsValue>(
    () => ({ methods, setMethod, successSound, setSuccessSound }),
    [methods, setMethod, successSound],
  );

  return <PaymentSettingsContext.Provider value={value}>{children}</PaymentSettingsContext.Provider>;
}

export function usePaymentSettings(): PaymentSettingsValue {
  const ctx = useContext(PaymentSettingsContext);
  if (!ctx) throw new Error('usePaymentSettings must be used within a PaymentSettingsProvider');
  return ctx;
}
