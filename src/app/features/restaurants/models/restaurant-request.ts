export interface RestaurantRequest {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  sortField: string;
  sortDirection?: string;
  id?: number;
  userId?: number;
  governmentId?: number;
  cityId?: number;
  fieldId?: number;
  lat?: number;
  lon?: number;
}