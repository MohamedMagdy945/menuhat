export interface MenuQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  sortField: string;
  sortDirection?: string;
  id?: number;
  menuId?: number;
  menuCategoryId?: number;
  menuSubCategoryId?: number;
  lat?: number;
  lon?: number;
}