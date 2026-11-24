import { AdminMenuUpdateRequest } from './admin-menu-update-request.model';

/**
 * `result` of GET /Admin/GetMenu/{id} (404 `{ message }` when missing). Any field may be absent;
 * the backend does not return `address`.
 */
export type AdminMenuDetails = Partial<AdminMenuUpdateRequest> & {
  menuId?: number;
  userId?: number;
  no?: number;
  serial?: string;
  createdDate?: string;
  logoURL?: string | null;
  pdfURL?: string | null;
  isVisable?: boolean | null;
  isOpen?: boolean | null;
};
