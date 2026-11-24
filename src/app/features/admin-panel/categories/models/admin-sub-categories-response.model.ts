import { AdminSubCategory } from './admin-sub-category.model';

/** GET /Admin/GetAllSubCategory */
export interface AdminSubCategoriesResponse {
  items: AdminSubCategory[];
  itemsCount: number;
  totalPages: number;
}
