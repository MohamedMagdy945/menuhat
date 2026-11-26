/** Query params of GET /Admin/GetAllProducts. */
export interface AdminProductsQuery {
  pageNumber: number;
  pageSize: number;
  searchValue?: string;
  menuId?: number | null;
  menuCategoryId?: number | null;
  menuSubCategoryId?: number | null;
}
