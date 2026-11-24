/** Query params of GET /Admin/GetAllMainCategory. */
export interface AdminCategoriesQuery {
  pageNumber: number;
  pageSize: number;
  searchValue?: string;
  menuId?: number | null;
}
