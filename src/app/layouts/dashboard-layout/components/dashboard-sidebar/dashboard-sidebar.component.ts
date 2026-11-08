import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DashboardService } from '../../../../core/services/dashboard.service';

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

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSidebarComponent {
  protected readonly dashboardService = inject(DashboardService);

  readonly isCollapsed = this.dashboardService.isCollapsed;
  readonly isMobileOpen = this.dashboardService.isMobileOpen;
  readonly restaurantName = computed(() => this.dashboardService.dashboardData()?.restaurant?.name || 'مطعمي');

  readonly userProfile = {
    name: 'أحمد المحمد',
    email: 'ahmed.m@beitmandi.com',
    role: 'مدير المطعم',
    restaurant: 'مطعم بيت المندي',
  };

  /**
   * Only active pages with existing components in the dashboard
   */
  readonly navItems: SidebarNavItem[] = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: 'space_dashboard',
      route: '/dashboard',
      exact: true,
    },
    {
      id: 'orders',
      label: 'الطلبات',
      icon: 'receipt_long',
      route: '/dashboard/orders',
      badge: '18',
      badgeVariant: 'primary',
    },
    {
      id: 'menu',
      label: 'المنيو',
      icon: 'restaurant_menu',
      route: '/dashboard/menu',
    },
    {
      id: 'most-ordered',
      label: 'الأكثر طلباً',
      icon: 'stars',
      route: '/dashboard/most-ordered',
    },
    {
      id: 'reports',
      label: 'التقارير اليومية والشهرية',
      icon: 'bar_chart',
      route: '/dashboard/reports',
    },
  ];

  closeMobile(): void {
    this.dashboardService.closeMobile();
  }
}
