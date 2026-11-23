import { AdminDashboardStats } from './admin-dashboard-stats.model';

/** One tile on the admin dashboard. */
export interface AdminStatCard {
  key: keyof AdminDashboardStats;
  label: string;
  icon: string;
  /** Tailwind classes for the icon box (background + text color). */
  iconClasses: string;
}
