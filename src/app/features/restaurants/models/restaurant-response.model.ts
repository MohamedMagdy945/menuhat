import { Restaurant } from './restaurant.model';

export interface RestaurantResponse {
  result: Restaurant[];
  itemsCount: number;
  totalPages: number;
}
