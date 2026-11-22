import { DashboardRestaurant } from './dashboard-restaurant.model';
import { DashboardStatistics } from './dashboard-statistics.model';
import { DashboardOrder } from './dashboard-order.model';

export interface DashboardResponse {
  restaurant: DashboardRestaurant;
  statistics: DashboardStatistics;
  currentOrders: DashboardOrder[];
}
