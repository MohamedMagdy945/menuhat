import { CartMenuItem } from './cart-menu-item.model';

export interface RestaurantCartGroup {
  menuId: number;
  clientName: string;
  serial: string;
  items: CartMenuItem[];
  /** Sum of `total` of the group's items. */
  subtotal: number;
}
