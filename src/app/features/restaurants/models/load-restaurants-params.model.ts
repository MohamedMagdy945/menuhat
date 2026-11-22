import { RestaurantQueryParams } from './restaurant-query-params.model';

export interface LoadRestaurantsParams {
  pageNumber?: number;
  pageSize?: number;
  PageNumber?: number;
  PageSize?: number;
  globalLoading?: boolean;
  extraParams?: Partial<RestaurantQueryParams>;
}
