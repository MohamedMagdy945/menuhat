/** One row of the admin products table. */
export interface AdminProductRow {
  id: number;
  name: string | null;
  nameEn: string | null;
  photoUrl: string;
  /** "25 ج.م" or "3 أحجام · من 20 ج.م". */
  priceLabel: string;
  categoryName: string | null;
  subCategoryName: string | null;
  restaurantName: string | null;
  isHidden: boolean;
  editLink: (string | number)[];
}
