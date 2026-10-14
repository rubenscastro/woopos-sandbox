/** Sample POS orders, from the WooPosOrders / OrderDetails @Preview composables. */

export type OrderStatus = 'Completed' | 'Processing' | 'Failed' | 'On hold' | 'Refunded';

export interface OrderLineItem {
  /** Keys into ProductImage's catalog art (reuses catalog ids where the product matches;
   *  otherwise a dedicated id so it still renders a distinct colored tile). */
  productId: number;
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
    // Real catalog products (with real photos via ProductImage) rather than invented items.
    items: [
      { productId: 1, name: 'Cotton Crew T-Shirt', quantity: 1, unitPrice: 18.0, lineTotal: 18.0 },
      { productId: 3, name: 'Wool Blend Scarf', quantity: 1, unitPrice: 16.0, lineTotal: 16.0 },
      { productId: 7, name: 'Wool Socks (3-Pack)', quantity: 1, unitPrice: 12.0, lineTotal: 12.0 },
    ],
    discountCode: 'SAVE5',
    discountTotal: 5.0,
    taxTotal: 0.0,
    total: 41.0,
    paymentMethod: 'WooCommerce In-Person Payments',
    refunds: [
      {
        id: 1,
        amount: 12.0,
        date: 'Aug 29, 2025 at 12:26 PM',
        reason: 'Customer bought an extra item.',
        items: [{ productId: 7, name: 'Wool Socks (3-Pack)', quantity: 1, unitPrice: 12.0, lineTotal: 12.0 }],
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
      { productId: 4, name: 'Leather Belt', quantity: 1, unitPrice: 24.0, lineTotal: 24.0 },
      { productId: 10, name: 'Canvas Tote Bag', quantity: 1, unitPrice: 18.0, lineTotal: 18.0 },
    ],
    discountTotal: 0,
    taxTotal: 3.6,
    total: 45.6,
    paymentMethod: 'Cash',
    refunds: [],
  },
  {
    id: 12,
    number: '#012',
    date: 'Jul 27, 2025 at 4:02 PM',
    customerEmail: 'maria@mail.com',
    status: 'Failed',
    items: [{ productId: 5, name: 'Denim Jacket', quantity: 1, unitPrice: 89.0, lineTotal: 89.0 }],
    discountTotal: 0,
    taxTotal: 0,
    total: 89.0,
    paymentMethod: 'Card',
    refunds: [],
  },
  {
    id: 11,
    number: '#011',
    date: 'Jul 26, 2025 at 3:18 PM',
    customerEmail: 'alex.tan@mail.com',
    status: 'Refunded',
    items: [{ productId: 8, name: 'Running Sneakers', quantity: 1, unitPrice: 68.0, lineTotal: 68.0 }],
    discountTotal: 0,
    taxTotal: 0,
    total: 68.0,
    paymentMethod: 'WooCommerce In-Person Payments',
    // Fully refunded, so the order status follows — WooCommerce only moves an order to
    // `refunded` when the whole amount goes back.
    refunds: [
      {
        id: 2,
        amount: 68.0,
        date: 'Jul 27, 2025 at 9:04 AM',
        reason: 'Wrong size, no replacement in stock.',
        items: [{ productId: 8, name: 'Running Sneakers', quantity: 1, unitPrice: 68.0, lineTotal: 68.0 }],
      },
    ],
  },
  {
    id: 10,
    number: '#010',
    date: 'Jul 25, 2025 at 11:47 AM',
    customerEmail: 'priya@mail.com',
    status: 'Completed',
    items: [
      { productId: 11, name: 'Striped Cotton Dress', quantity: 1, unitPrice: 42.0, lineTotal: 42.0 },
      { productId: 12, name: 'Zip-Up Hoodie', quantity: 1, unitPrice: 58.0, lineTotal: 58.0 },
    ],
    discountCode: 'TENOFF',
    discountTotal: 10.0,
    taxTotal: 0.0,
    total: 90.0,
    paymentMethod: 'Card',
    // Partial refund — the order keeps its original status.
    refunds: [
      {
        id: 3,
        amount: 58.0,
        date: 'Jul 26, 2025 at 2:11 PM',
        reason: 'Returned the hoodie, kept the dress.',
        items: [{ productId: 12, name: 'Zip-Up Hoodie', quantity: 1, unitPrice: 58.0, lineTotal: 58.0 }],
      },
    ],
  },
  {
    id: 9,
    number: '#009',
    date: 'Jul 24, 2025 at 5:53 PM',
    status: 'Refunded',
    items: [{ productId: 6, name: 'Baseball Cap', attributes: 'Navy', quantity: 2, unitPrice: 22.0, lineTotal: 44.0 }],
    discountTotal: 0,
    taxTotal: 0,
    total: 44.0,
    paymentMethod: 'Cash',
    refunds: [
      {
        id: 4,
        amount: 44.0,
        date: 'Jul 24, 2025 at 6:20 PM',
        reason: 'Customer changed their mind.',
        items: [{ productId: 6, name: 'Baseball Cap', attributes: 'Navy', quantity: 2, unitPrice: 22.0, lineTotal: 44.0 }],
      },
    ],
  },
  {
    id: 8,
    number: '#008',
    date: 'Jul 23, 2025 at 1:05 PM',
    customerEmail: 'johndoe@mail.com',
    status: 'Completed',
    items: [
      { productId: 2, name: 'Slim Fit Jeans', attributes: '32W, Indigo', quantity: 1, unitPrice: 56.0, lineTotal: 56.0 },
      { productId: 1, name: 'Cotton Crew T-Shirt', quantity: 2, unitPrice: 18.0, lineTotal: 36.0 },
      { productId: 7, name: 'Wool Socks (3-Pack)', quantity: 1, unitPrice: 12.0, lineTotal: 12.0 },
    ],
    discountTotal: 0,
    taxTotal: 8.32,
    total: 112.32,
    paymentMethod: 'WooCommerce In-Person Payments',
    refunds: [],
  },
  {
    id: 7,
    number: '#007',
    date: 'Jul 22, 2025 at 9:30 AM',
    customerEmail: 'sam.oduya@mail.com',
    status: 'On hold',
    items: [{ productId: 9, name: 'Store Gift Card', attributes: '$25', quantity: 1, unitPrice: 25.0, lineTotal: 25.0 }],
    discountTotal: 0,
    taxTotal: 0,
    total: 25.0,
    paymentMethod: 'Order marked as paid',
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
