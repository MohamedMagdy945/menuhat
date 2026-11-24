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
  /** GET /{id} → { result: menu (has orderConditionId, no address), rank, totalCount } */
  menuById: `${environment.apiUrl}/Admin/GetMenu`,
  /** GET /{serial} → AdminMenuBySerial ({ main, details }); 204 (empty body) when not found */
  menuBySerial: `${environment.apiUrl}/Admin/GetMenus`,
  /** GET → AdminMenuPreparedInsert (next id / number before adding a menu) */
  preparedForInsertMenu: `${environment.apiUrl}/Admin/PreparedForInsertMenu`,
  /** POST ← AdminMenuCreateRequest. userId must be an owner without a menu (one menu per owner). */
  createMenu: `${environment.apiUrl}/Admin/PostMenu`,
  /** PUT /{id} ← AdminMenuUpdateRequest */
  updateMenu: `${environment.apiUrl}/Admin/PutMenu`,
  /** PUT /{id} ← AdminMenuFilePayload (data URL) — menu PDF/image. Note the backend spelling. */
  updateMenuPdf: `${environment.apiUrl}/Admin/UpdatePdfURMenuL`,
  /** PUT /{id} ← AdminMenuFilePayload (data URL) — logo */
  updateMenuLogo: `${environment.apiUrl}/Admin/UpdateLogoURLMenu`,
  /** DELETE /{id} — removes the menu PDF/image */
  deleteMenuPdf: `${environment.apiUrl}/Admin/DeletePdfURLMenu`,
  /** DELETE /{id} — removes the logo */
  deleteMenuLogo: `${environment.apiUrl}/Admin/DeleteLogoURLMenu`,
  /** DELETE /{id} — soft delete (restorable, counted as deleted in the stats) */
  softDeleteMenu: `${environment.apiUrl}/Admin/SoftDeleteMenu`,

  // ---------- Main categories ----------
  /** GET (paged) ?SortField=Id&PageNumber&PageSize&SearchValue&MenuId → AdminCategoriesResponse.
   *  SearchValue matches the Arabic name, description and restaurant name (not name_En). */
  allMainCategories: `${environment.apiUrl}/Admin/GetAllMainCategory`,
  /** GET /{id} → { result: AdminCategory, rank, totalCount }; 404 when missing */
  mainCategoryById: `${environment.apiUrl}/Admin/GetMainCategory`,
  /** GET → { id, rank, totalCount } before adding a category */
  preparedForInsertMainCategory: `${environment.apiUrl}/Admin/PreparedForInsertMainCategory`,
  /** POST /{menuSerial} ← AdminCategoryCreateRequest (name required — null crashes with 500) */
  createMainCategory: `${environment.apiUrl}/Admin/PostMainCategory`,
  /** PUT /{id} ← AdminCategoryUpdateRequest */
  updateMainCategory: `${environment.apiUrl}/Admin/PutMainCategory`,
  /** PUT /{id} ← { base64String: dataUrl } (raw base64 stores an empty path) */
  updateMainCategoryPhoto: `${environment.apiUrl}/Admin/UpdatePhotoMainCategory`,
  /** DELETE /{id} — removes the photo only */
  deleteMainCategoryPhoto: `${environment.apiUrl}/Admin/DeletePhotoMainCategory`,
  /** DELETE /{id} — removes the category */
  deleteMainCategory: `${environment.apiUrl}/Admin/DeleteMainCategory`,

  // ---------- Sub categories ----------
  /** GET (paged) ?SortField=Id&PageNumber&PageSize&SearchValue&MenuCategoryId → AdminSubCategoriesResponse */
  allSubCategories: `${environment.apiUrl}/Admin/GetAllSubCategory`,
  /** GET /{subId} → { result: AdminSubCategory, rank, totalCount } (one sub by its own id); 404 when missing */
  subCategoryById: `${environment.apiUrl}/Admin/GetSubCategory`,
  /** GET → { id, rank, totalCount } before adding a sub category */
  preparedForInsertSubCategory: `${environment.apiUrl}/Admin/PreparedForInsertSubCategory`,
  /**
   * POST /{menuSerial} ← AdminSubCategoryCreateRequest. The backend does NOT check that
   * menuCategoryId belongs to that restaurant — always use the main category's own restaurant serial.
   */
  createSubCategory: `${environment.apiUrl}/Admin/PostSubCategory`,
  /** PUT /{id} ← AdminSubCategoryUpdateRequest */
  updateSubCategory: `${environment.apiUrl}/Admin/PutSubCategory`,
  /** PUT /{id} ← { base64String: dataUrl } (raw base64 stores an empty path) */
  updateSubCategoryPhoto: `${environment.apiUrl}/Admin/UpdatePhotoSubCategory`,
  /** DELETE /{id} — removes the photo only */
  deleteSubCategoryPhoto: `${environment.apiUrl}/Admin/DeletePhotoSubCategory`,
  /** DELETE /{id} — removes the sub category */
  deleteSubCategory: `${environment.apiUrl}/Admin/DeleteSubCategory`,
} as const;
