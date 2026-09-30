export interface MostRequestedQuery {
  PageNumber?: number;
  PageSize?: number;
  SearchValue?: string;
  SortField: string;
  SortDirection?: string;

  Id?: number;
  MenuId?: number;
  MenuCategoryId?: number;
  MenuSubCategoryId?: number;

  lat?: number;
  lon?: number;
}