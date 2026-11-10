import { Component, inject, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardOrderSectionComponent } from './components/dashboard-order-section/dashboard-order-section.component';
import { DashboardService } from './dashboard.service';
import { environment } from '../../../core/environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardOrderSectionComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  protected readonly dashboardService = inject(DashboardService);

  readonly isRestaurantOpen = this.dashboardService.isRestaurantOpen;
  readonly isLoading = this.dashboardService.isLoadingDashboard;
  readonly dashboardData = this.dashboardService.dashboardData;

  ngOnInit(): void {
    this.dashboardService.loadDashboard();
  }

  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${environment.filesUrl}${path}`;
  }

  readonly restaurant = computed(() => {
    const data = this.dashboardData();
    if (data?.restaurant) {
      return {
        id: data.restaurant.id,
        name: data.restaurant.name || 'مطعم جديد',
        branch: data.restaurant.location || '',
        rating: data.restaurant.rating || 0,
        reviewsCount: `+${data.restaurant.reviewsCount || 0} تقييم`,
        isOpen: data.restaurant.isOpen ?? true,
        coverUrl: this.resolveImageUrl(data.restaurant.coverUrl),
        profileUrl: this.resolveImageUrl(data.restaurant.profileUrl),
        visitsCount: data.restaurant.visitsCount || 0,
        backgroundColor: (data.restaurant as any)?.backgroundColor || (data.restaurant as any)?.bgColor || null,
      };
    }
    return {
      id: 0,
      name: 'جاري التحميل...',
      branch: '',
      rating: 0,
      reviewsCount: '0 تقييم',
      isOpen: true,
      coverUrl: '',
      profileUrl: '',
      visitsCount: 0,
      backgroundColor: null,
    };
  });

  readonly stats = computed(() => {
    const data = this.dashboardData();
    const st = data?.statistics;
    return [
      {
        id: 'total',
        title: 'إجمالي الطلبات',
        value: st?.totalOrders?.toString() ?? '0',
        badge: st?.salesGrowthPercentage ? `+${st.salesGrowthPercentage}%` : '0.0%',
        badgeVariant: 'success',
        icon: 'receipt_long',
        iconBg: 'bg-orange-50 text-orange-500',
      },
      {
        id: 'new',
        title: 'طلبات جديدة',
        value: st?.newOrders?.toString() ?? '0',
        badge: 'جديد',
        badgeVariant: 'warning',
        icon: 'notifications_active',
        iconBg: 'bg-orange-50 text-orange-500',
      },
      {
        id: 'preparing',
        title: 'قيد التجهيز',
        value: st?.preparingOrders?.toString() ?? '0',
        badge: null,
        badgeVariant: 'default',
        icon: 'soup_kitchen',
        iconBg: 'bg-slate-100 text-slate-600',
      },
      {
        id: 'completed',
        title: 'مكتملة',
        value: st?.completedOrders?.toString() ?? '0',
        badge: null,
        badgeVariant: 'default',
        icon: 'check_circle',
        iconBg: 'bg-emerald-50 text-emerald-600',
      },
    ];
  });

  readonly orders = this.dashboardService.orders;

  toggleStatus(): void {
    this.dashboardService.toggleRestaurantStatus();
  }
}

export { DashboardComponent as DashboardHomeComponent };
