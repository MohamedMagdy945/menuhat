import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { UserDataService } from '../../../../core/services/userData.service';
import { SidebarNavItem } from '../../../dashboard-layout/models/sidebar-nav-item.model';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  private readonly _userData = inject(UserDataService);
  private readonly _router = inject(Router);

  readonly isMobileOpen = input(false);
  readonly closed = output<void>();

  readonly userName = computed(() => this._userData.currentUser()?.fullName || 'مدير النظام');
  readonly userInitials = computed(() =>
    this.userName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  );

  readonly navItems: SidebarNavItem[] = [
    { id: 'home', label: 'الرئيسية', icon: 'space_dashboard', route: '/admin', exact: true },
    { id: 'restaurants', label: 'المطاعم', icon: 'storefront', route: '/admin/restaurants' },
    { id: 'categories', label: 'الأقسام', icon: 'category', route: '/admin/categories' },
    { id: 'users', label: 'المستخدمين', icon: 'group', route: '/admin/users' },
    { id: 'orders', label: 'الطلبات', icon: 'receipt_long', route: '/admin/orders' },
    { id: 'reports', label: 'التقارير', icon: 'bar_chart', route: '/admin/reports' },
    { id: 'settings', label: 'الإعدادات', icon: 'settings', route: '/admin/settings' },
  ];

  close(): void {
    this.closed.emit();
  }

  logout(): void {
    this.close();
    this._userData.clearUserData();
    this._router.navigate(['/login']);
  }
}
