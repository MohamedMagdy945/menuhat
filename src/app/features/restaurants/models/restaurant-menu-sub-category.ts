import { RestaurantMenuProduct } from './restaurant-menu-product';

export interface RestaurantMenuSubCategory {
  id: number;
  no: number;
  name: string;
  name_En: string;
  menuCategoryId: number;
  catOrder: number;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  menuProducts: RestaurantMenuProduct[];
}
