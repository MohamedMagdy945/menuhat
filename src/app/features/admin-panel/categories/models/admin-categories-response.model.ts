import { AdminCategory } from './admin-category.model';

/** GET /Admin/GetAllMainCategory */
export interface AdminCategoriesResponse {
  items: AdminCategory[];
  itemsCount: number;
  totalPages: number;
}
