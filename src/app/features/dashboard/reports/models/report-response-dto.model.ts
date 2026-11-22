import { ReportView } from './report-view.model';

export interface ReportResponseDto {
  items?: ReportView[] | null;
  itemsCount?: number;
  totalPages?: number;
}
