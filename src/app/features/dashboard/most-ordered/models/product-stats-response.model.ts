import { ProductStatItem } from './product-stat-item.model';

export interface ProductStatsResponse {
  items: ProductStatItem[];
  itemsCount: number;
  totalPages: number;
}
