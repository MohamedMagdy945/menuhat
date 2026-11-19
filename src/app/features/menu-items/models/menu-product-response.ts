import { MenuProductDetails } from './menu-product-details';

export interface MenuProductResponse {
  result: MenuProductDetails[];
  rank?: number;
  totalCount?: number;
}
