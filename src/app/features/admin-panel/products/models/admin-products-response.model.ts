import { AdminProduct } from './admin-product.model';

/** GET /Admin/GetAllProducts, with `listWithDetails` mapped to `items`. */
export interface AdminProductsResponse {
  items: AdminProduct[];
  itemsCount: number;
  totalPages: number;
}
