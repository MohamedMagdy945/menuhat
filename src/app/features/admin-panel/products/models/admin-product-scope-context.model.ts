/** Names shown in the products list breadcrumb for the current scope. */
export interface AdminProductScopeContext {
  menuId: number | null;
  restaurantName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  subCategoryId: number | null;
  subCategoryName: string | null;
}
