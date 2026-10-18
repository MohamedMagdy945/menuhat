import { Component, inject } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.css',
})
export class DashboardHeaderComponent {
  protected readonly dashboardService = inject(DashboardService);

  readonly isRestaurantOpen = this.dashboardService.isRestaurantOpen;
  readonly isCollapsed = this.dashboardService.isCollapsed;

  toggleMobileSidebar(): void {
    this.dashboardService.toggleMobile();
  }

  toggleRestaurantStatus(): void {
    this.dashboardService.toggleRestaurantStatus();
  }
}
