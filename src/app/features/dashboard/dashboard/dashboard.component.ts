import { Component, inject, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { environment } from '../../../core/environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const cleanBase = environment.filesUrl.replace(/\/+$/, '');
    if (trimmed.startsWith('/UploadedFiles')) {
      const origin = cleanBase.replace(/\/UploadedFiles$/, '');
      return `${origin}${trimmed}`;
    }
    if (trimmed.startsWith('UploadedFiles')) {
      const origin = cleanBase.replace(/\/UploadedFiles$/, '');
      return `${origin}/${trimmed}`;
    }
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${cleanBase}${path}`;
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
        badge: st?.salesGrowthPercentage ? `+${st.salesGrowthPercentage}%` : null,
        badgeVariant: 'success',
        icon: 'receipt_long',
        iconBg: 'bg-orange-50 text-orange-500',
      },
      {
        id: 'new',
        title: 'طلبات جديدة',
        value: st?.newOrders?.toString() ?? '0',
        badge: (st?.newOrders ?? 0) > 0 ? 'جديد' : null,
        badgeVariant: 'warning',
        icon: 'notifications_active',
        iconBg: 'bg-amber-50 text-amber-500',
      },
      {
        id: 'preparing',
        title: 'قيد التجهيز',
        value: st?.preparingOrders?.toString() ?? '0',
        badge: null,
        icon: 'soup_kitchen',
        iconBg: 'bg-blue-50 text-blue-500',
      },
      {
        id: 'completed',
        title: 'مكتملة',
        value: st?.completedOrders?.toString() ?? '0',
        badge: null,
        icon: 'check_circle',
        iconBg: 'bg-emerald-50 text-emerald-500',
      },
    ];
  });

  readonly orders = computed(() => {
    const data = this.dashboardData();
    const list = data?.currentOrders ?? [];
    return list.map((order: any, index: number) => ({
      id: order.id ?? (index + 1).toString(),
      orderNumber: order.orderNumber ?? order.number ?? `#${order.id ?? index + 100}`,
      customerName: order.customerName ?? order.clientName ?? order.name ?? 'عميل',
      time: order.time ?? order.createdAt ?? 'الآن',
      price: order.price ?? order.total ?? order.amount ?? 0,
      status: order.status ?? 'new',
      statusLabel: order.statusLabel ?? order.status ?? 'جديد',
      statusColor: order.statusColor ?? 'bg-sky-50 text-sky-600 border border-sky-100',
    }));
  });

  toggleStatus(): void {
    this.dashboardService.toggleRestaurantStatus();
  }
}

export { DashboardComponent as DashboardHomeComponent };
