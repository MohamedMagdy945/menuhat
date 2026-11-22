export interface CreateSubCategoryDto {
  id?: number;
  name: string;
  name_En?: string;
  menuCategoryId: number;
  description?: string;
  description_En?: string;
  catOrder?: number;
  photoURL?: {
    base64String: string;
  } | null;
  photoBase64?: string | null;
}
