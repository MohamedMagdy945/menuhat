/** One size in AdminProductRequest.details (PriceDetailDTO). */
export interface AdminProductDetailRequest {
  /** 0 for a new size, the detail id for an existing one. */
  id: number;
  title: string;
  title_En: string | null;
  price: number;
}
