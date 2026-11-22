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
