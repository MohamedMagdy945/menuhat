import { RestaurantDetailsMain } from './restaurant-details-main';
import { RestaurantMenuCategory } from './restaurant-menu-category';

export interface RestaurantDetails {
  main: RestaurantDetailsMain;
  details: RestaurantMenuCategory[];
}

export * from './restaurant-details-main';
export * from './restaurant-menu-category';
export * from './restaurant-menu-sub-category';
export * from './restaurant-menu-product';
