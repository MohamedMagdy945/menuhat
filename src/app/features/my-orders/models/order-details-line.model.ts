/** One product row shown in the order details sheet. */
export interface OrderDetailsLine {
  id: number;
  name: string;
  size: string | null;
  quantity: number;
  price: number;
  total: number;
  imageUrl: string;
}
