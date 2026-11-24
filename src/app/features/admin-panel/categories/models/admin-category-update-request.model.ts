/** Body of PUT /Admin/PutMainCategory/{id} (MenuMainCategoryputDTO). */
export interface AdminCategoryUpdateRequest {
  id: number;
  name: string;
  name_En: string | null;
  description: string | null;
  description_En: string | null;
  catOrder: number | null;
}
