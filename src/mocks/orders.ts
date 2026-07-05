/** Sample POS orders, from the WooPosOrders / OrderDetails @Preview composables. */

export type OrderStatus = 'Completed' | 'Processing' | 'Failed' | 'On hold' | 'Refunded';

export interface OrderLineItem {
  name: string;
  attributes?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderRefund {
  id: number;
  amount: number;
  date: string;
  reason?: string;
  items: OrderLineItem[];
}

export interface MockOrder {
  id: number;
  number: string;
  date: string;
  customerEmail?: string;
  status: OrderStatus;
  items: OrderLineItem[];
  discountCode?: string;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paymentMethod: string;
  refunds: OrderRefund[];
}

export const orders: MockOrder[] = [
  {
    id: 14,
    number: '#014',
    date: 'Aug 28, 2025 at 10:31 AM',
    customerEmail: 'johndoe@mail.com',
    status: 'Completed',
    items: [
      { name: 'Cup', quantity: 1, unitPrice: 8.5, lineTotal: 8.5 },
      { name: 'Coffee Container', attributes: 'Blue, Large', quantity: 1, unitPrice: 10.0, lineTotal: 10.0 },
      { name: 'Paper Filter (100 pack)', quantity: 1, unitPrice: 4.5, lineTotal: 4.5 },
    ],
    discountCode: 'SAVE5',
    discountTotal: 5.0,
    taxTotal: 0.0,
    total: 18.0,
    paymentMethod: 'WooCommerce In-Person Payments',
    refunds: [
      {
        id: 1,
        amount: 3.0,
        date: 'Aug 29, 2025 at 12:26 PM',
        reason: 'Customer bought an extra item.',
        items: [{ name: 'Cup', quantity: 1, unitPrice: 3.0, lineTotal: 3.0 }],
      },
    ],
  },
  {
    id: 13,
    number: '#013',
    date: 'Jul 28, 2025 at 10:31 AM',
    customerEmail: 'johndoe@mail.com',
    status: 'Processing',
    items: [
      { name: "Women's Haircut", quantity: 1, unitPrice: 55.0, lineTotal: 55.0 },
      { name: 'Canvas Tote Bag', quantity: 1, unitPrice: 18.0, lineTotal: 18.0 },
    ],
    discountTotal: 0,
    taxTotal: 3.9,
    total: 43.9,
    paymentMethod: 'Cash',
    refunds: [],
  },
  {
    id: 12,
    number: '#012',
    date: 'Jul 27, 2025 at 4:02 PM',
    customerEmail: 'maria@mail.com',
    status: 'Failed',
    items: [{ name: 'Espresso Beans 1kg', quantity: 2, unitPrice: 24.0, lineTotal: 48.0 }],
    discountTotal: 0,
    taxTotal: 0,
    total: 48.0,
    paymentMethod: 'Card',
    refunds: [],
  },
];

export const STATUS_COLORS: Record<OrderStatus, { bg: string; fg: string }> = {
  Completed: { bg: 'var(--color-info-lowest)', fg: 'var(--color-on-info-lowest)' },
  Processing: { bg: 'var(--color-default)', fg: 'var(--color-on-default)' },
  'On hold': { bg: 'var(--color-default)', fg: 'var(--color-on-default)' },
  Refunded: { bg: 'var(--color-default)', fg: 'var(--color-on-default)' },
  Failed: { bg: 'var(--color-error-lowest)', fg: 'var(--color-on-error-lowest)' },
};
