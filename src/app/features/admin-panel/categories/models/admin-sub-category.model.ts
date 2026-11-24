/** Item of GET /Admin/GetAllSubCategory (also `result` of GET /Admin/GetSubCategory/{id}). */
export interface AdminSubCategory {
  id: number;
  rowNo: number;
  no: number;
  menuSubCategoryName: string | null;
  menuSubCategoryName_En: string | null;
  menuId: number;
  clientName: string | null;
  clientName_En: string | null;
  /** The main category it belongs to. */
  menuCategoryId: number;
  menuCategoryName: string | null;
  menuCategoryName_En: string | null;
  catOrder: number | null;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
}
