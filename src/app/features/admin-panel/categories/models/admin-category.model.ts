/** Item of GET /Admin/GetAllMainCategory (also `result` of GET /Admin/GetMainCategory/{id}). */
export interface AdminCategory {
  id: number;
  rowNo: number;
  /** Order number inside its restaurant menu. */
  no: number;
  menuId: number;
  clientName: string | null;
  clientName_En: string | null;
  menuMainCategoryName: string | null;
  menuMainCategoryName_En: string | null;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  catOrder: number | null;
}
