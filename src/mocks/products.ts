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

/** Real product photos (CC-licensed, Flickr CDN via Openverse) keyed by product id. */
export const productPhotos: Record<number, string> = {
  1: 'https://live.staticflickr.com/2768/4198676685_a9cd656950_b.jpg',
  2: 'https://live.staticflickr.com/2062/5791957122_73cfae8053_b.jpg',
  3: 'https://live.staticflickr.com/5211/5493919823_a15449ec3e_b.jpg',
  4: 'https://live.staticflickr.com/8786/28668439201_ed6286ed6d_b.jpg',
  5: 'https://live.staticflickr.com/7395/9158937344_0b8ab95ba1_b.jpg',
  6: 'https://live.staticflickr.com/8005/7658912802_e2cbb21cd6.jpg',
  7: 'https://live.staticflickr.com/4193/33647188804_bb9efce46a.jpg',
  8: 'https://live.staticflickr.com/4023/4302164182_7a935a0e75_b.jpg',
  9: 'https://live.staticflickr.com/3165/2885468787_6ab2d83a56_b.jpg',
  10: 'https://live.staticflickr.com/4074/4860486736_c4c3459f1d_b.jpg',
  11: 'https://live.staticflickr.com/3428/3375886335_b195b829e1.jpg',
  12: 'https://live.staticflickr.com/158/355818762_40ae060480.jpg',
};

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
