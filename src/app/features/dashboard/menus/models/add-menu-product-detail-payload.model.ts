export interface AddMenuProductDetailPayload {
  id?: number;
  oneClickParentId?: string | null;
  oneClickProductId?: string | null;
  title: string;
  title_En?: string | null;
  price: number;
}
