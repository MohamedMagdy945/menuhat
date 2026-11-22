import { MenuOrderDetail } from './menu-order-detail.model';

export interface IOrder {
  menuOrdersId: number;
  clientName: string;
  clientName_En: string;
  serial: string;
  logoURL: string;
  fullName: string;
  serialOrder: string;
  orderTotal: number;
  orderDate: string;
  isRecieved: null;
  menuSerial: string;
  isCompleted: null;
  refuseReason: null;
  orderStatusId: number;
  orderStatusName_Ar: string;
  orderStatusName_En: string;
  isDelivery: null;
  rate: number;
  deliveryService: null;
  orderTypeId: number;
  items: any[];
  notes: null;
  details: MenuOrderDetail[];
}
