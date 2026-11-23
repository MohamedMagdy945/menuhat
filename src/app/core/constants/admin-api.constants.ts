import { environment } from '../environments/environment';

/**
 * Centralized API endpoints for the platform Admin Panel.
 * Swagger: http://192.168.1.150:500/swagger/index.html
 */
export const ADMIN_API_ENDPOINTS = {
  /** GET → AdminDashboardStats */
  dashboardStats: `${environment.apiUrl}/Admin/GetDashboardStats`,
  /** GET (paged, filterable) → AdminMenusResponse */
  allMenus: `${environment.apiUrl}/Admin/GetAllMenu`,
  /** GET /{id} → full menu record (used before editing) */
  menuById: `${environment.apiUrl}/Admin/GetMenu`,
  /** PUT /{id} ← AdminMenuUpdateRequest */
  updateMenu: `${environment.apiUrl}/Admin/PutMenu`,
  /** DELETE /{id} — soft delete (restorable, counted as deleted in the stats) */
  softDeleteMenu: `${environment.apiUrl}/Admin/SoftDeleteMenu`,
} as const;
