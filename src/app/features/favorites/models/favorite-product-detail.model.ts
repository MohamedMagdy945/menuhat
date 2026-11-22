export interface FavoriteProductDetail {
  id: number;
  menuProductId: number;
  title: string | null;
  title_En: string | null;
  price: number;
  oldPrice: number;
  isOffer: boolean;
  discountPercentage: number | null;
}
