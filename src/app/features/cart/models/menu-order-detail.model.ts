import { MenuOrderProduct } from './menu-order-product.model';

export interface MenuOrderDetail {
  id: number;
  itemId: number;
  menuOrderId: number;
  quantity: number;
  title: null;
  title_En: null;
  productPriceId: null;
  price: number;
  total: number;
  menuProducts: MenuOrderProduct[];
}
