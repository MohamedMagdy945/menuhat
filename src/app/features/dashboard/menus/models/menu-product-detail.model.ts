export interface MenuProductDetail {
  id: number;
  menuProductId: number;
  title: string;
  title_En?: string | null;
  price: number;
  oldPrice?: number | null;
  isOffer?: boolean;
  discountPercentage?: number;
  oneClickProductId?: number | null;
  oneClickParentId?: number | null;
}
