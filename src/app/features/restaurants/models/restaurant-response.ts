import { Restaurant } from "./restaurant";

export interface RestaurantResponse {
  result: Restaurant[];
  itemsCount: number;
  totalPages: number;
}
