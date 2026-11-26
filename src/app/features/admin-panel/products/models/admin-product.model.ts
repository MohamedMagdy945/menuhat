import { AdminProductDetail } from './admin-product-detail.model';

/** Item of GET /Admin/GetAllProducts (`listWithDetails`). */
export interface AdminProduct {
  id: number;
  productName: string | null;
  productName_En: string | null;
  menuCategoryId: number;
  menuCategoryName: string | null;
  menuCategoryName_En: string | null;
  menuSubCategoryId: number;
  menuSubCategoryName: string | null;
  menuSubCategoryName_En: string | null;
  description: string | null;
  description_En: string | null;
  clientName: string | null;
  clientName_En: string | null;
  /** Serial of the product's restaurant. */
  serial: string | null;
  /** True when the product is sold in several sizes (`details`). */
  haveMoreInfo: boolean | null;
  /** Single price (null for products priced by size). */
  price: number | null;
  photoURL: string | null;
  isHidden: boolean | null;
  isOpen: boolean | null;
  details: AdminProductDetail[] | null;
}
