import { DateFilterType } from '../../../../shared/models/date-filter-type.model';

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
