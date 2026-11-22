import { ReportType } from './report-type.model';
import { ReportGroupBy } from './report-group-by.model';

export interface ReportParams {
  StartDay?: string;
  EndDay?: string;
  ReportType?: ReportType;
  GroupBy?: ReportGroupBy;
}
