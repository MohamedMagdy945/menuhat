export interface MenuMainCategory {
  id: number;
  rowNo?: number;
  no?: number;
  menuId?: number;
  clientName?: string;
  clientName_En?: string;
  menuMainCategoryName: string;
  menuMainCategoryName_En?: string;
  photoURL?: string | null;
  description?: string | null;
  description_En?: string | null;
  catOrder?: number | null;
  // Aliases for compatibility
  name?: string;
  name_En?: string;
  [key: string]: any;
}
