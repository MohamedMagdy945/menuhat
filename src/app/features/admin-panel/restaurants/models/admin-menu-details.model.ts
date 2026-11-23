import { AdminMenuUpdateRequest } from './admin-menu-update-request.model';

/** GET /Admin/GetMenu/{id}: the editable fields (any of them may be missing). */
export type AdminMenuDetails = Partial<AdminMenuUpdateRequest> & { menuId?: number };
