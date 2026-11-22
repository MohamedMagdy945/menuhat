import { OrderItemDetail } from './order-item-detail.model';

export interface OwnerOrderDetails {
  id: number | string;
  orderCode: string;
  statusId: number;
  statusLabel: string;
  statusVariant: 'warning' | 'success' | 'info' | 'danger' | 'default';
  dateTime: string;
  orderType: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  totalPrice: number;
  currency: string;
  itemsCount: number;
  items: OrderItemDetail[];
}
