import { MenuProductDetail } from './menu-product-detail.model';

export interface MenuProduct {
  id: number;
  productName: string;
  productName_En?: string | null;
  menuCategoryId: number;
  menuCategoryName: string;
  menuCategoryName_En?: string | null;
  menuSubCategoryId: number;
  menuSubCategoryName: string;
  menuSubCategoryName_En?: string | null;
  description?: string | null;
  description_En?: string | null;
  clientName?: string | null;
  clientName_En?: string | null;
  serial?: string | null;
  haveMoreInfo?: boolean;
  price: number;
  oldPrice?: number | null;
  photoURL?: string | null;
  isHidden?: boolean;
  productIsHidden?: boolean;
  isOpen?: boolean;
  isOffer?: boolean;
  discountPercentage?: number;
  details?: MenuProductDetail[];
}

export interface MenuProductsResponse {
  listWithDetails: MenuProduct[];
  itemsCount: number;
  totalPages: number;
}
