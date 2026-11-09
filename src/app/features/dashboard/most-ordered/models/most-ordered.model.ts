export type MostOrderedPeriodFilter = 'all' | 'today' | 'yesterday' | 'week';

export type DateFilterType =
  | 'None'
  | 'CurrentDate'
  | 'Yesterday'
  | 'LastSevenDays'
  | 'LastThirtyDays'
  | 'ThisMonth'
  | 'LastMonth';

export interface ProductStatItem {
  rowNo: number;
  id: number;
  name: string;
  name_En: string | null;
  productPriceId: number | null;
  title: string | null;
  title_En: string | null;
  menuId: number;
  menuCategoryId: number;
  menuCategoryName: string;
  menuCategoryName_En: string | null;
  menuSubCategoryId: number;
  menuSubCategoryName: string;
  menuSubCategoryName_En: string | null;
  productCount: number;
  percentage?: number;
}

export interface ProductStatsResponse {
  items: ProductStatItem[];
  itemsCount: number;
  totalPages: number;
}

export interface ProductStatsParams {
  SortField?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchValue?: string;
  DateFilter?: DateFilterType | string;
  StartDate?: string;
  EndDate?: string;
}

