import { FavoriteProductDetail } from './favorite-product-detail.model';

export interface FavoriteProduct {
  menuProductFavoriteId: number;
  rowNo: number;
  userId: number;
  productName: string;
  productName_En: string | null;
  id: number; // Menu Product ID
  menuId: number;
  serial: string;
  haveMoreInfo: boolean;
  clientName: string;
  clientName_En: string | null;
  price: number | null;
  oldPrice: number | null;
  isOffer: boolean;
  discountPercentage: number | null;
  description: string | null;
  description_En: string | null;
  photoURL: string | null;
  isFavorite: boolean;
  details: FavoriteProductDetail[];
}
