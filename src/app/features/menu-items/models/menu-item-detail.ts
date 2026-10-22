export interface MenuItemDetail {
  id: number;
  menuProductId: number;
  title: string;
  title_En: string | null;
  price: number;
  oldPrice: number;
  discountPercentage: number;
  isOffer: boolean;
  fromTime: string;
  toTime: string;
}
