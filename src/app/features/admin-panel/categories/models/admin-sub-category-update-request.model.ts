/** Body of PUT /Admin/PutSubCategory/{id} (MenuSubCategoryPutDTO). */
export interface AdminSubCategoryUpdateRequest {
  id: number;
  menuCategoryId: number;
  name: string;
  name_En: string | null;
  description: string | null;
  description_En: string | null;
  catOrder: number | null;
}
