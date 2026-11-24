/** `result` of PostMainCategory / PutMainCategory / UpdatePhotoMainCategory (the saved entity). */
export interface AdminCategoryRecord {
  id: number;
  no: number;
  menuId: number;
  name: string | null;
  name_En: string | null;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  catOrder: number | null;
}
