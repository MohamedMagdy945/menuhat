export interface DailyOrderReportItem {
  id: number | string;
  date: string;
  dayName: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}
