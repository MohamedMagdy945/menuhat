/** One size / price of a product (`details` of GetAllProducts and GetProduct). */
export interface AdminProductDetail {
  id: number;
  menuProductId: number;
  title: string | null;
  title_En: string | null;
  price: number | null;
}
