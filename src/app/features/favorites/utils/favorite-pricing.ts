import { FavoriteProduct } from '../models/favorite-product.model';

/** Display price: the product price, or the first size price for multi-size products. */
export function favoritePrice(item: FavoriteProduct): number {
  return item.price ?? item.details?.[0]?.price ?? 0;
}

/** Discount percentage to show, or 0 when the product has no real discount. */
export function favoriteDiscount(item: FavoriteProduct): number {
  const price = favoritePrice(item);
  const oldPrice = item.oldPrice ?? 0;
  if (!price || oldPrice <= price) return 0;
  return item.discountPercentage || Math.round(((oldPrice - price) / oldPrice) * 100);
}
