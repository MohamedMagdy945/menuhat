/** Query params of GET /Admin/GetAllSubCategory. */
export interface AdminSubCategoriesQuery {
  pageNumber: number;
  pageSize: number;
  searchValue?: string;
  /** Main category id. */
  menuCategoryId: number;
}
