export interface CartMenuItem {
  id: number;
  rowNo: number;
  userId: number;
  productId: number;
  productName: string;
  isHidden: boolean;
  photoURL: string | null;
  description: string | null;
  productPriceId: number | null;
  title: string | null;
  quantity: number;
  price: number;
  total: number;
  menuId: number;
  clientName: string;
  serial: string;
  orderConditionId: number;
  orderConditions_Ar: string;
  orderConditions_En: string;
  isFavorite: boolean;
  isOpen: boolean;
  statusOpen: number;
  isDeleted: boolean;
}

export interface CartMenuResponse {
  result: CartMenuItem[];
  totalCount: number;
  totalPrice: number;
}

export interface AddCartItem {
  productId: number;
  productPriceId: number | null;
  quantity: number;
  serial: string;
}

export interface AddCartResponse {
  status: string;
  hiddenProducts: any[];
  hiddenProductsPrice: any[];
}
