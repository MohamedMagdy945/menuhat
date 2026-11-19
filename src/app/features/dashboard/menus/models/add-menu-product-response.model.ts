export interface AddMenuProductResponse {
  id: number;
  no?: number;
  name: string;
  name_En?: string | null;
  menuCategoryId: number;
  menuSubCategoryId: number;
  price: number;
  photoURL?: string | null;
  description?: string | null;
  description_En?: string | null;
  haveMoreInfo?: boolean;
  details?: any[];
}
