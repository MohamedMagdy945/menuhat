import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MenuCardComponent } from './components/menu-card/menu-card.component';
import { MenuRestaurantCardData } from './models/menu-restaurant-card-data.model';
import { DashboardService } from '../dashboard/dashboard.service';
import { MenusService } from './menus.service';

@Component({
  selector: 'app-dashboard-menus',
  standalone: true,
  imports: [CommonModule, RouterLink, MenuCardComponent],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenusComponent implements OnInit {
  protected readonly dashboardService = inject(DashboardService);
  protected readonly menusService = inject(MenusService);
  private readonly router = inject(Router);

  readonly restaurant = computed<MenuRestaurantCardData>(() => {
    const data = this.dashboardService.dashboardData();
    const rest = data?.restaurant;
    return {
      id: rest?.id ?? 0,
      name: rest?.name || 'كومبو سفن فودز',
      location: rest?.location || 'السادس من أكتوبر، القاهرة',
      isOpen: rest?.isOpen !== false,
      isVisible: rest?.isVisible !== false,
      coverUrl: rest?.coverUrl
        ? this.dashboardService.resolveImageUrl(rest.coverUrl)
        : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      profileUrl: rest?.profileUrl
        ? this.dashboardService.resolveImageUrl(rest.profileUrl)
        : '',
      pdfUrl: rest?.pdfUrl
        ? this.dashboardService.resolveImageUrl(rest.pdfUrl)
        : '',
      qrCodeUrl: rest?.qrCodeUrl
        ? this.dashboardService.resolveImageUrl(rest.qrCodeUrl)
        : '',
      visitsCount: rest?.visitsCount || 6714,
    };
  });

  ngOnInit(): void {
    if (!this.dashboardService.dashboardData()) {
      this.dashboardService.loadDashboard();
    }
    this.menusService.getAllMainCategories().subscribe();
  }

  openDetails(): void {
    this.router.navigate(['/dashboard/menu/details']);
  }
}
