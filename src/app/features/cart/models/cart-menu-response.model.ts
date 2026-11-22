import { CartMenuItem } from './cart-menu-item.model';

export interface CartMenuResponse {
  result: CartMenuItem[];
  totalCount: number;
  totalPrice: number;
}
