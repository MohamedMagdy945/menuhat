export interface ReportDailyItem {
  id: string | number;
  name: string;
  mainCategory: string;
  subCategory: string;
  size: string;
  ordersCount: number;
  price?: number;
  revenue?: number;
  date?: string;
  totalDayOrders?: number;
  peakHour?: number;
}
