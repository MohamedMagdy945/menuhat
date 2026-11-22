export interface MenuSubCategory {
  id: number;
  name: string;
  name_En?: string;
  menuMainCategoryId: number;
  mainCategoryName?: string;
  notes?: string;
  isActive?: boolean;
}
