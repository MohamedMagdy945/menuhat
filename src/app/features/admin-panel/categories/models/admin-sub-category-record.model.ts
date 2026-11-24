/** `result` of PostSubCategory / PutSubCategory / UpdatePhotoSubCategory (the saved entity). */
export interface AdminSubCategoryRecord {
  id: number;
  no: number;
  menuId: number;
  menuCategoryId: number;
  name: string | null;
  name_En: string | null;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  catOrder: number | null;
}
