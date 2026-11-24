import { AdminMenuFilePayload } from '../../restaurants/models/admin-menu-file-payload.model';
import { AdminSubCategoryUpdateRequest } from './admin-sub-category-update-request.model';

/** Body of POST /Admin/PostSubCategory/{menuSerial} (MenuSubCategoryDTO). */
export type AdminSubCategoryCreateRequest = Omit<AdminSubCategoryUpdateRequest, 'id'> & {
  id: 0;
  /** Data URL (`data:image/...;base64,`) or null. */
  photoURL: AdminMenuFilePayload | null;
};
