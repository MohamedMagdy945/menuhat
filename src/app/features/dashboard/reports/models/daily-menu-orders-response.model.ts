import { DailyMenuOrderItem } from './daily-menu-order-item.model';

export interface DailyMenuOrdersResponse {
  items: DailyMenuOrderItem[];
  itemsCount: number;
  totalPages: number;
}
