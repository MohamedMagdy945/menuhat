import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardService, NavGroup } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    MatRippleModule,
    MatDividerModule,
  ],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.css',
})
export class DashboardSidebarComponent {
  protected readonly dashboardService = inject(DashboardService);

  readonly isCollapsed = this.dashboardService.isCollapsed;
  readonly isMobileOpen = this.dashboardService.isMobileOpen;

  // Track expanded groups (for accordion/collapsible sections like Apex)
  readonly expandedGroups = signal<Record<string, boolean>>({
    overview: true,
    commerce: true,
    operations: true,
    support: true,
  });

  // Navigation schema following Apex layout & Menuhat restaurant domains
  readonly navGroups: NavGroup[] = [
    {
      id: 'overview',
      title: 'نظرة عامة',
      isCollapsible: true,
      items: [
        {
          id: 'dashboard',
          label: 'الرئيسية',
          icon: 'space_dashboard',
          route: '/dashboard',
        },
        {
          id: 'analytics',
          label: 'الإحصائيات والتحليلات',
          icon: 'monitoring',
          route: '/dashboard/analytics',
        },
        {
          id: 'live-monitor',
          label: 'مراقبة الصالة الحية',
          icon: 'table_restaurant',
          route: '/dashboard/live-monitor',
        },
      ],
    },
    {
      id: 'commerce',
      title: 'إدارة المطعم والطلبات',
      isCollapsible: true,
      items: [
        {
          id: 'orders',
          label: 'الطلبات الحالية',
          icon: 'receipt_long',
          route: '/dashboard/orders',
          badge: { text: '18', variant: 'primary' },
        },
        {
          id: 'menu',
          label: 'قائمة الطعام (المنيو)',
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
          id: 'offers',
          label: 'العروض والخصومات',
          icon: 'local_offer',
          route: '/dashboard/offers',
          badge: { text: 'جديد', variant: 'success' },
        },
      ],
    },
    {
      id: 'operations',
      title: 'العمليات والتقارير',
      isCollapsible: true,
      items: [
        {
          id: 'reports',
          label: 'التقارير اليومية والشهرية',
          icon: 'bar_chart',
          route: '/dashboard/reports',
        },
        {
          id: 'delivery',
          label: 'مناديب التوصيل',
          icon: 'two_wheeler',
          route: '/dashboard/delivery',
          badge: { text: '4', variant: 'info' },
        },
        {
          id: 'invoices',
          label: 'الفواتير والمالية',
          icon: 'account_balance_wallet',
          route: '/dashboard/invoices',
        },
        {
          id: 'reviews',
          label: 'تقييمات العملاء',
          icon: 'reviews',
          route: '/dashboard/reviews',
        },
      ],
    },
    {
      id: 'support',
      title: 'الدعم الفني والإعدادات',
      isCollapsible: true,
      items: [
        {
          id: 'support',
          label: 'الدعم الفني',
          icon: 'support_agent',
          route: '/dashboard/support',
        },
        {
          id: 'complaints',
          label: 'الشكاوى والملاحظات',
          icon: 'report_problem',
          route: '/dashboard/complaints',
        },
        {
          id: 'settings',
          label: 'إعدادات المطعم',
          icon: 'tune',
          route: '/dashboard/settings',
        },
      ],
    },
  ];

  // User Profile details (matches Image 1)
  readonly userProfile = {
    name: 'أحمد المحمد',
    email: 'ahmed.m@beitmandi.com',
    role: 'مدير المطعم',
    restaurant: 'مطعم بيت المندي',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  };

  /**
   * Toggle a navigation group collapse/expand
   */
  toggleGroup(groupId: string): void {
    if (this.isCollapsed()) {
      // If sidebar is collapsed, clicking expands it
      this.dashboardService.setCollapsed(false);
      return;
    }
    this.expandedGroups.update((groups) => ({
      ...groups,
      [groupId]: !groups[groupId],
    }));
  }

  isGroupExpanded(groupId: string): boolean {
    return this.expandedGroups()[groupId] ?? true;
  }

  /**
   * Toggle desktop sidebar collapsed state
   */
  toggleSidebar(): void {
    this.dashboardService.toggleSidebar();
  }

  /**
   * Close mobile drawer
   */
  closeMobile(): void {
    this.dashboardService.closeMobile();
  }
}
