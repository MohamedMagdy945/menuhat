import { MenuProduct } from './menu-product.model';

export interface MenuProductsResponse {
  listWithDetails: MenuProduct[];
  itemsCount: number;
  totalPages: number;
}
