/**
 * Sample catalog for the items flows — a small apparel store: tees, denim, outerwear,
 * accessories, and footwear, some with size/color/denomination variations. Prices are clean
 * numbers; the ViewModel-formatted strings in the app are reproduced via formatUsd() at
 * render time.
 */

export interface MockProduct {
  id: number;
  name: string;
  price: number; // simple products / the "from" price of variable ones
  imageUrl?: string;
  variable?: boolean;
  numOfVariations?: number;
}

/**
 * Real product photos (CC-licensed/CC0, sourced from Openverse/rawpixel/Wikimedia Commons)
 * keyed by product id. Variations that share a real-world look with their parent (jeans
 * sizes, cap colors, gift card denominations) reuse the parent's photo rather than a
 * distinct one per variation id — CC-licensed apparel photography doesn't exist for every
 * exact size/color combination, so this is the same photo standing in for the whole group,
 * same as a real catalog would do when it hasn't shot every variant separately.
 */
export const productPhotos: Record<number, string> = {
  1: 'https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA0L2JzMjYzLWltYWdlLmpwZw.jpg', // Cotton Crew T-Shirt
  2: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Jeans_and_brown_shirt_folded.jpg', // Slim Fit Jeans
  3: 'https://live.staticflickr.com/3518/3979862983_80fa6a3803_b.jpg', // Wool Blend Scarf
  4: 'https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2ZyYmVsdHNfbGVhdGhlcl9idWNrbGVfbWV0YWwtaW1hZ2Uta3liZThkNTMuanBn.jpg', // Leather Belt
  5: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Jean_jacket.jpg', // Denim Jacket
  6: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYxODUxNTIzLXdpa2ltZWRpYS1pbWFnZS1rb3drbnlzei5qcGc.jpg', // Baseball Cap
  7: 'https://live.staticflickr.com/2509/4202477346_3a38524232_b.jpg', // Wool Socks (3-Pack)
  8: 'https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA0L2JzMTkzLWltYWdlLmpwZw.jpg', // Running Sneakers
  9: 'https://live.staticflickr.com/3165/2885468787_6ab2d83a56_b.jpg', // Store Gift Card
  10: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Canvas_two-tone_tote_Navy_and_Natural7_%289038437258%29.jpg', // Canvas Tote Bag
  11: 'https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2ZydW5zcGxhc2gxMjYxMC1pbWFnZS1rd3Z3eGdpMi5qcGc.jpg', // Striped Cotton Dress
  12: 'https://live.staticflickr.com/2084/1988440171_b05f747417_b.jpg', // Zip-Up Hoodie

  // Variations reuse their parent's photo (see note above).
  201: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Jeans_and_brown_shirt_folded.jpg',
  202: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Jeans_and_brown_shirt_folded.jpg',
  203: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Jeans_and_brown_shirt_folded.jpg',
  204: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Jeans_and_brown_shirt_folded.jpg',
  205: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Jeans_and_brown_shirt_folded.jpg',
  206: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Jeans_and_brown_shirt_folded.jpg',
  601: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYxODUxNTIzLXdpa2ltZWRpYS1pbWFnZS1rb3drbnlzei5qcGc.jpg',
  602: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYxODUxNTIzLXdpa2ltZWRpYS1pbWFnZS1rb3drbnlzei5qcGc.jpg',
  603: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYxODUxNTIzLXdpa2ltZWRpYS1pbWFnZS1rb3drbnlzei5qcGc.jpg',
  901: 'https://live.staticflickr.com/3165/2885468787_6ab2d83a56_b.jpg',
  902: 'https://live.staticflickr.com/3165/2885468787_6ab2d83a56_b.jpg',
  903: 'https://live.staticflickr.com/3165/2885468787_6ab2d83a56_b.jpg',
  904: 'https://live.staticflickr.com/3165/2885468787_6ab2d83a56_b.jpg',
};

export interface MockVariation {
  id: number;
  productId: number;
  name: string; // attribute summary, e.g. "32W, Indigo"
  price: number;
}

export const products: MockProduct[] = [
  { id: 1, name: 'Cotton Crew T-Shirt', price: 18.0 },
  { id: 2, name: 'Slim Fit Jeans', price: 54.0, variable: true, numOfVariations: 6 },
  { id: 3, name: 'Wool Blend Scarf', price: 16.0 },
  { id: 4, name: 'Leather Belt', price: 24.0 },
  { id: 5, name: 'Denim Jacket', price: 89.0 },
  { id: 6, name: 'Baseball Cap', price: 22.0, variable: true, numOfVariations: 3 },
  { id: 7, name: 'Wool Socks (3-Pack)', price: 12.0 },
  { id: 8, name: 'Running Sneakers', price: 68.0 },
  { id: 9, name: 'Store Gift Card', price: 25.0, variable: true, numOfVariations: 4 },
  { id: 10, name: 'Canvas Tote Bag', price: 18.0 },
  { id: 11, name: 'Striped Cotton Dress', price: 42.0 },
  { id: 12, name: 'Zip-Up Hoodie', price: 58.0 },
];

export const variations: Record<number, MockVariation[]> = {
  2: [
    { id: 201, productId: 2, name: '28W, Indigo', price: 54.0 },
    { id: 202, productId: 2, name: '30W, Indigo', price: 54.0 },
    { id: 203, productId: 2, name: '32W, Indigo', price: 56.0 },
    { id: 204, productId: 2, name: '32W, Black', price: 56.0 },
    { id: 205, productId: 2, name: '34W, Black', price: 58.0 },
    { id: 206, productId: 2, name: '36W, Black', price: 58.0 },
  ],
  6: [
    { id: 601, productId: 6, name: 'Black', price: 22.0 },
    { id: 602, productId: 6, name: 'Navy', price: 22.0 },
    { id: 603, productId: 6, name: 'Khaki', price: 22.0 },
  ],
  9: [
    { id: 901, productId: 9, name: '$25', price: 25.0 },
    { id: 902, productId: 9, name: '$50', price: 50.0 },
    { id: 903, productId: 9, name: '$75', price: 75.0 },
    { id: 904, productId: 9, name: '$100', price: 100.0 },
  ],
};

export const popularProducts: MockProduct[] = [products[3], products[7], products[1]];

export const recentProductSearches = ['Jeans', 'Hoodie', 'Sneakers', 'Scarf'];
