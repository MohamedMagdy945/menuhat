import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DashboardService } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
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
