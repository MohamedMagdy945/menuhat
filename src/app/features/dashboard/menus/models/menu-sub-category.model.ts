export interface MenuSubCategory {
  id: number;
  rowNo?: number;
  no?: number;
  menuSubCategoryName: string;
  menuSubCategoryName_En?: string | null;
  menuId?: number;
  clientName?: string;
  clientName_En?: string;
  menuCategoryId?: number;
  menuCategoryName?: string;
  menuCategoryName_En?: string;
  catOrder?: number | null;
  photoURL?: string | null;
  description?: string | null;
  description_En?: string | null;
  // Aliases for compatibility
  name?: string;
  name_En?: string;
  menuMainCategoryId?: number;
  mainCategoryName?: string;
  notes?: string;
  isActive?: boolean;
  [key: string]: any;
}
