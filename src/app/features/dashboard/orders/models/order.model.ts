export interface OrderItemDetail {
  id: number | string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
}

export interface OrderCardData {
  id: string | number;
  orderNumber: string;
  customerName: string;
  time: string;
  price: number;
  formattedPrice?: string;
  status: string;
  statusId?: number;
  statusLabel: string;
  statusColor: string;
  isPending?: boolean;
  phone?: string;
  createdAt?: string;
}

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

export type OrderTab = 'all' | 'pending' | 'preparing' | 'today' | 'completed' | 'rejected';

