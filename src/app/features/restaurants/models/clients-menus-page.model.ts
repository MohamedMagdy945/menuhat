import { Restaurant } from './restaurant.model';

export interface ClientsMenusPage {
  items: Restaurant[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}
