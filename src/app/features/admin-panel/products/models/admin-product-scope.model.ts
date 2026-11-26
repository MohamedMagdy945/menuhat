/** What the products list is filtered by (from `?menuId=` / `?categoryId=` / `?subCategoryId=`). */
export interface AdminProductScope {
  menuId: number | null;
  categoryId: number | null;
  subCategoryId: number | null;
}
