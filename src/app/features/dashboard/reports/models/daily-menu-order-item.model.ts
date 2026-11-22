export interface DailyMenuOrderItem {
  id: number;
  orderDay: string;
  menuId: number;
  menuName: string;
  menuName_En: string | null;
  orderCount: number;
  totalAmount: number;
  customerCount: number;
  topItemId: number;
  topItemName: string;
  topItemName_En: string | null;
  topItemCount: number;
  peakHour: number;
}
