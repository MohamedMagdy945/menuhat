export interface RestaurantMenuProduct {
  id: number;
  no: number;
  serial: string;
  productName: string;
  productName_En: string | null;
  menuCategoryId: number;
  menuSubCategoryId: number;
  price: number;
  oldPrice: number;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  isHidden: boolean;
  isOffer: boolean;
  discountPercentage: number;
  isFavorite: boolean;
  details: unknown[];
}
