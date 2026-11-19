export interface ProductDetailItem {
  id: number;
  menuProductId: number;
  title: string;
  title_En: string | null;
  price: number;
  oldPrice: number | null;
  isOffer: boolean;
  discountPercentage: number | null;
  oneClickProductId?: string | null;
  oneClickParentId?: string | null;
}
