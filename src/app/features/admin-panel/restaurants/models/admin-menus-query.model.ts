/** Query params of GET /Admin/GetAllMenu. */
export interface AdminMenusQuery {
  pageNumber: number;
  pageSize: number;
  searchValue?: string;
  governmentId?: number | null;
  cityId?: number | null;
}
