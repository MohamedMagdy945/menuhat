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

export interface FavoritesResponse {
  result: FavoriteProduct[];
}

export interface ToggleFavoriteDto {
  menuProductId: number;
}
