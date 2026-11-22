import { DateFilterType } from '../../../../shared/models/date-filter-type.model';

export interface ProductStatsParams {
  SortField?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchValue?: string;
  DateFilter?: DateFilterType | string;
  StartDate?: string;
  EndDate?: string;
}
