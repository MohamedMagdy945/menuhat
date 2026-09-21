export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5;



















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
  details: Detail[];
}

interface Detail {
  id: number;
  itemId: number;
  menuOrderId: number;
  quantity: number;
  title: null;
  title_En: null;
  productPriceId: null;
  price: number;
  total: number;
  menuProducts: MenuProduct[];
}

interface MenuProduct {
  id: number;
  no: number;
  name: string;
  name_En: string;
  menuCategoryId: number;
  menuSubCategoryId: number;
  price: number;
  photoURL: string;
  description: string;
  description_En: null;
}


