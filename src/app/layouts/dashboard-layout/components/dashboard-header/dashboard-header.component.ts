import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../../features/dashboard/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeaderComponent {
  protected readonly dashboardService = inject(DashboardService);

  readonly isRestaurantOpen = this.dashboardService.isRestaurantOpen;
  readonly isCollapsed = this.dashboardService.isCollapsed;
  readonly restaurantName = computed(() => this.dashboardService.dashboardData()?.restaurant?.name || 'مطعمي');

  toggleMobileSidebar(): void {
    this.dashboardService.toggleMobile();
  }

  toggleRestaurantStatus(): void {
    this.dashboardService.toggleRestaurantStatus();
  }
}
