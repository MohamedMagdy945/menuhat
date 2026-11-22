import { CartMenuItem } from './cart-menu-item.model';

export interface RestaurantCartGroup {
  clientName: string;
  serial: string;
  items: CartMenuItem[];
}
