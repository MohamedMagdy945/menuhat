import { RestaurantDetailsMain } from './restaurant-details-main.model';
import { RestaurantMenuCategory } from './restaurant-menu-category.model';

export interface RestaurantDetails {
  main: RestaurantDetailsMain;
  details: RestaurantMenuCategory[];
}
