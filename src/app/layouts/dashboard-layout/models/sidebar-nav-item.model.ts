export interface SidebarNavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  hasLiveIndicator?: boolean;
}
