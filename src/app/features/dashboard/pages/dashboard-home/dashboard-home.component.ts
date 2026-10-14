import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardService } from '../../../../core/services/dashboard.service';

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  time: string;
  price: number;
  status: 'new' | 'preparing' | 'on_the_way' | 'completed' | 'pending';
  statusLabel: string;
  statusColor: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink, MatRippleModule, MatTooltipModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css',
})
export class DashboardHomeComponent {
  protected readonly dashboardService = inject(DashboardService);
  readonly isRestaurantOpen = this.dashboardService.isRestaurantOpen;

  readonly restaurant = {
    name: 'مطعم بيت المندي',
    branch: 'السادات، السابعة',
    rating: 4.8,
    reviewsCount: '+500 تقييم',
  };

  readonly stats = [
    {
      id: 'total',
      title: 'إجمالي الطلبات',
      value: '124',
      badge: '+12%',
      badgeVariant: 'success',
      icon: 'receipt_long',
      iconBg: 'bg-orange-50 text-orange-500',
    },
    {
      id: 'new',
      title: 'طلبات جديدة',
      value: '18',
      badge: 'NEW',
      badgeVariant: 'warning',
      icon: 'notifications_active',
      iconBg: 'bg-amber-50 text-amber-500',
    },
    {
      id: 'preparing',
      title: 'قيد التجهيز',
      value: '32',
      badge: null,
      icon: 'soup_kitchen',
      iconBg: 'bg-blue-50 text-blue-500',
    },
    {
      id: 'completed',
      title: 'مكتملة',
      value: '74',
      badge: null,
      icon: 'check_circle',
      iconBg: 'bg-emerald-50 text-emerald-500',
    },
  ];

  readonly orders: OrderItem[] = [
    {
      id: '1',
      orderNumber: '#103',
      customerName: 'سارة عبد الله',
      time: 'اليوم، 12:30 م',
      price: 45,
      status: 'on_the_way',
      statusLabel: 'في الطريق',
      statusColor: 'bg-sky-50 text-sky-600 border border-sky-100',
    },
    {
      id: '2',
      orderNumber: '#101',
      customerName: 'محمد علي',
      time: 'اليوم، 12:15 م',
      price: 85,
      status: 'pending',
      statusLabel: 'قيد الانتظار',
      statusColor: 'bg-amber-50 text-amber-600 border border-amber-100',
    },
    {
      id: '3',
      orderNumber: '#104',
      customerName: 'عبد الرحمن خالد',
      time: 'اليوم، 12:50 م',
      price: 190,
      status: 'preparing',
      statusLabel: 'يتم التحضير',
      statusColor: 'bg-orange-50 text-orange-600 border border-orange-100',
    },
    {
      id: '4',
      orderNumber: '#105',
      customerName: 'فاطمة الزهراء',
      time: 'اليوم، 11:40 ص',
      price: 140,
      status: 'completed',
      statusLabel: 'مكتمل',
      statusColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    },
    {
      id: '5',
      orderNumber: '#106',
      customerName: 'فاطمة الزهراء',
      time: 'اليوم، 11:40 ص',
      price: 140,
      status: 'completed',
      statusLabel: 'مكتمل',
      statusColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    },
  ];

  toggleStatus(): void {
    this.dashboardService.toggleRestaurantStatus();
  }
}
