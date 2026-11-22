export interface AddCartItem {
  productId: number;
  productPriceId: number | null;
  quantity: number;
  serial: string;
  price?: number;
}
