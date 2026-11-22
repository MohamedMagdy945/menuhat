export interface DashboardOrder {
  orderId?: number | string;
  id?: string | number;
  orderNumber?: string;
  customerName?: string;
  totalAmount?: number;
  price?: number;
  orderStatusId?: number;
  orderStatusName?: string;
  createdAt?: string;
  time?: string;
  status?: string;
  statusLabel?: string;
  statusColor?: string;
  [key: string]: any;
}
