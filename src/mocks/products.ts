/**
 * Sample catalog for the items flows. Names/prices are drawn from the WooPOS @Preview
 * composables and the order-details preview (Cup, Coffee Container, Paper Filter, Women's
 * Haircut, Gift wrap) so the whole prototype reads as one coherent coffee-shop store.
 * Prices are clean numbers; the ViewModel-formatted strings in the app are reproduced via
 * formatUsd() at render time.
 */

export interface MockProduct {
  id: number;
  name: string;
  price: number; // simple products / the "from" price of variable ones
  imageUrl?: string;
  variable?: boolean;
  numOfVariations?: number;
}

export interface MockVariation {
  id: number;
  productId: number;
  name: string; // attribute summary, e.g. "Blue, Large"
  price: number;
}

export const products: MockProduct[] = [
  { id: 1, name: 'Cup', price: 8.5 },
  { id: 2, name: 'Coffee Container', price: 10.0, variable: true, numOfVariations: 6 },
  { id: 3, name: 'Paper Filter (100 pack)', price: 4.5 },
  { id: 4, name: 'Espresso Beans 1kg', price: 24.0 },
  { id: 5, name: "Women's Haircut", price: 55.0 },
  { id: 6, name: 'Ceramic Mug', price: 14.0, variable: true, numOfVariations: 3 },
  { id: 7, name: 'Cold Brew Bottle', price: 6.0 },
  { id: 8, name: 'Hario V60 Dripper', price: 29.99 },
  { id: 9, name: 'Gift Card', price: 25.0, variable: true, numOfVariations: 4 },
  { id: 10, name: 'Canvas Tote Bag', price: 18.0 },
  { id: 11, name: 'Drip Coffee', price: 3.5 },
  { id: 12, name: 'Flat White', price: 4.75 },
];

export const variations: Record<number, MockVariation[]> = {
  2: [
    { id: 201, productId: 2, name: 'Small, Matte Black', price: 10.0 },
    { id: 202, productId: 2, name: 'Small, Steel', price: 12.0 },
    { id: 203, productId: 2, name: 'Medium, Matte Black', price: 14.0 },
    { id: 204, productId: 2, name: 'Medium, Steel', price: 16.0 },
    { id: 205, productId: 2, name: 'Large, Matte Black', price: 18.0 },
    { id: 206, productId: 2, name: 'Large, Steel', price: 20.0 },
  ],
  6: [
    { id: 601, productId: 6, name: 'Blue', price: 14.0 },
    { id: 602, productId: 6, name: 'Sand', price: 14.0 },
    { id: 603, productId: 6, name: 'Forest Green', price: 16.0 },
  ],
  9: [
    { id: 901, productId: 9, name: '$25', price: 25.0 },
    { id: 902, productId: 9, name: '$50', price: 50.0 },
    { id: 903, productId: 9, name: '$100', price: 100.0 },
    { id: 904, productId: 9, name: '$250', price: 250.0 },
  ],
};

export const popularProducts: MockProduct[] = [products[3], products[7], products[1]];

export const recentProductSearches = ['Chocolate', 'Mug', 'Hario', 'Coffee'];
