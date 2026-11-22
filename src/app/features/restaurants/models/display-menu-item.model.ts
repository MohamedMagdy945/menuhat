import { RestaurantMenuProduct } from './restaurant-menu-product.model';

export interface DisplayMenuItem {
  product: RestaurantMenuProduct;
  categoryName: string;
  subCategoryName: string;
}
