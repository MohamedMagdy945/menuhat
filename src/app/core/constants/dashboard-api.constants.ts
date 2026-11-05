import { environment } from '../environments/environment';

/**
 * Centralized API endpoints for the Restaurant Owner Dashboard
 * Provided by Swagger: http://192.168.1.150:500/swagger/index.html
 */
export const DASHBOARD_API_ENDPOINTS = {
  // Orders Endpoints
  ownerMenusOrders: `${environment.apiUrl}/MenusOrders/GetOrdersOfMenusByUId`,
  ownerGetOrderDetails: `${environment.apiUrl}/MenusOrders/GetOrderDetails`,
  receiveOwnerOrder: `${environment.apiUrl}/MenusOrders/Receive`,
  cancelOwnerOrder: `${environment.apiUrl}/MenusOrders/Cancel`,

  // Categories Endpoints
  menuMainCategories: `${environment.apiUrl}/MenuMainCategories`,
  menuMainCategoriesGetAll: `${environment.apiUrl}/MenuMainCategories/GetAll`,
  menuSubCategories: `${environment.apiUrl}/MenuSubCategories`,
  menuSubCategoriesGetAll: `${environment.apiUrl}/MenuSubCategories/GetAll`,

  // Dashboard & Reports Endpoints
  ownerDashboard: `${environment.apiUrl}/Dashboard`,
  ownerProductStats: `${environment.apiUrl}/Reports/product-stats`,
  ownerDailyMenuOrders: `${environment.apiUrl}/Reports/DailyMenuOrders`,
  ownerMenuOwnerReports: `${environment.apiUrl}/Reports/MenuOwnerReports`,

  // Profile & Media Endpoints
  ownerProfileMenu: `${environment.apiUrl}/Profile/menu`,
  albums: `${environment.apiUrl}/Albums/menu`,
  baseAlbums: `${environment.apiUrl}/Albums`,
  selectProfilePicture: `${environment.apiUrl}/ClientsMenus/profile/select`,
  selectCoverPicture: `${environment.apiUrl}/ClientsMenus/cover/select`,
} as const;

export type DashboardApiEndpointKey = keyof typeof DASHBOARD_API_ENDPOINTS;

