export interface ReportView {
  id?: number | null;
  orderDay?: string | null;
  menuId?: number | null;
  menuName?: string | null;
  menuName_En?: string | null;
  orderCount?: number | null;
  totalAmount?: number | null;
  customerCount?: number | null;
  topItemId?: number | null;
  topItemName?: string | null;
  topItemName_En?: string | null;
  topItemCount?: number | null;
  peakHour?: number | null;
}
