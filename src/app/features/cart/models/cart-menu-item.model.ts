export interface CartMenuItem {
  id: number;
  rowNo: number;
  userId: number;
  productId: number;
  productName: string;
  isHidden: boolean | null;
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
