import { MenuProductDetails } from './menu-product-details.model';

export interface MenuProductResponse {
  result: MenuProductDetails[];
  rank?: number;
  totalCount?: number;
}
