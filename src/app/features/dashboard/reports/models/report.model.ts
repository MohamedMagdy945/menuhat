export type ReportType =
  | 'TopCustomers'
  | 'TotalSales'
  | 'GroupedOrders'
  | 'PeakHours'
  | 'TopSellingItems'
  | 'LeastSellingItems'
  | 'AverageOrder'
  | 'CustomerFrequency';

export type ReportGroupBy = 'Daily' | 'Weekly' | 'Monthly';

export type ReportFilterPeriod = 'all' | 'today' | 'yesterday' | 'week';

export type DateFilterType =
  | 'None'
  | 'CurrentDate'
  | 'Yesterday'
  | 'LastSevenDays'
  | 'LastThirtyDays'
  | 'ThisMonth'
  | 'LastMonth';

export interface DailyMenuOrdersParams {
  PageNumber?: number;
  PageSize?: number;
  SearchValue?: string;
  SortField?: string;
  SortDirection?: string;
  StartDate?: string;
  EndDate?: string;
  Serial?: string;
  DateFilter?: DateFilterType | string;
  ExportAsExcel?: boolean;
}

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

export interface DailyMenuOrdersResponse {
  items: DailyMenuOrderItem[];
  itemsCount: number;
  totalPages: number;
}

export interface ReportParams {
  StartDay?: string;
  EndDay?: string;
  ReportType?: ReportType;
  GroupBy?: ReportGroupBy;
}

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

export interface ReportResponseDto {
  items?: ReportView[] | null;
  itemsCount?: number;
  totalPages?: number;
}

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

export interface ReportKpis {
  totalOrders: number;
  ordersGrowth: string;
  totalRevenue: number;
  revenueGrowth: string;
  customerCount: number;
  customerGrowth: string;
  visitorsCount: number;
  visitorsGrowth: string;
}

