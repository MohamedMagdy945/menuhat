import { AdminProductDetail } from './admin-product-detail.model';

/** `result[0]` of GET /Admin/GetProduct/{id} (no restaurant id / names — load them via the sub category). */
export interface AdminProductRecord {
  id: number;
  no: number;
  name: string | null;
  name_En: string | null;
  menuCategoryId: number;
  menuSubCategoryId: number;
  price: number | null;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  haveMoreInfo: boolean | null;
  details: AdminProductDetail[] | null;
}
