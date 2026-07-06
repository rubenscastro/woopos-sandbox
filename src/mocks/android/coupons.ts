/** Sample coupons for the coupons flow, from the WooPOS coupon @Preview composables. */

export interface MockCoupon {
  id: number;
  code: string;
  summary: string;
  discount: number; // amount applied to the cart in this prototype
  expiredOn?: string;
}

export const coupons: MockCoupon[] = [
  { id: 1, code: 'SUMMER10', summary: '10% off, minimum spend $50.00', discount: 10 },
  { id: 2, code: 'SUMMER20', summary: '20% off, minimum spend $100.00', discount: 20 },
  { id: 3, code: 'SAVE5', summary: '$5.00 off your order', discount: 5 },
  { id: 4, code: 'WELCOME', summary: '15% off everything', discount: 12 },
  { id: 5, code: 'SPRING2024', summary: '20% off', discount: 0, expiredOn: '24 Apr 2025' },
];

export const recentCouponSearches = ['SUMMER', 'DISCOUNT', 'SALE', 'WINTER'];
