import { AdminMenuFilePayload } from '../../restaurants/models/admin-menu-file-payload.model';
import { AdminProductDetailRequest } from './admin-product-detail-request.model';

/** Body of POST /Admin/AddMenuProduct/{serial} and PUT /Admin/UpdateMenuProduct/{id} (MenuProductDTO). */
export interface AdminProductRequest {
  name: string;
  name_En: string | null;
  menuCategoryId: number;
  menuSubCategoryId: number;
  /** Single price, or the first size's price when `haveMoreInfo`. */
  price: number;
  description: string | null;
  description_En: string | null;
  haveMoreInfo: boolean;
  /** Create: data URL (`data:image/...;base64,`) or null. Update: null (photo has its own endpoints). */
  photoURL: AdminMenuFilePayload | null;
  details: AdminProductDetailRequest[] | null;
  selectedSystemImageId: number | null;
  additions: [] | null;
}
