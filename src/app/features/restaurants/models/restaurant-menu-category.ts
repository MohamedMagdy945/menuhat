import { RestaurantMenuSubCategory } from './restaurant-menu-sub-category';

export interface RestaurantMenuCategory {
  id: number;
  menuId: number;
  name: string;
  name_En: string;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  catOrder: number;
  subCategories: RestaurantMenuSubCategory[];
}
