import { AdminMenu } from './admin-menu.model';

export interface AdminMenusResponse {
  items: AdminMenu[];
  itemsCount: number;
  totalPages: number;
}
