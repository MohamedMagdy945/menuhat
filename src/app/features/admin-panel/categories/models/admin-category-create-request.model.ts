import { AdminMenuFilePayload } from '../../restaurants/models/admin-menu-file-payload.model';

/** Body of POST /Admin/PostMainCategory/{menuSerial} (MenuMainCategoryDTO). */
export interface AdminCategoryCreateRequest {
  id: 0;
  name: string;
  name_En: string | null;
  description: string | null;
  description_En: string | null;
  /** Data URL (`data:image/...;base64,`) or null. */
  photoURL: AdminMenuFilePayload | null;
}
