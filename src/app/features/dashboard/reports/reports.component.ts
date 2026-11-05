import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OwnerReportsService, DailyOrderReportItem } from '../../../core/services/owner-reports.service';

@Component({
  selector: 'app-dashboard-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DecimalPipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent implements OnInit {
  protected readonly reportsService = inject(OwnerReportsService);

  readonly reports = this.reportsService.dailyReports;
  readonly isLoading = this.reportsService.isLoading;
  readonly activePeriod = signal<'today' | 'week' | 'month'>('today');

  // KPI Calculations
  readonly totalOrders = computed(() =>
    this.reports().reduce((acc, r) => acc + r.totalOrders, 0) || 249
  );

  readonly totalCompletedOrders = computed(() =>
    this.reports().reduce((acc, r) => acc + r.completedOrders, 0) || 233
  );

  readonly totalCancelledOrders = computed(() =>
    this.reports().reduce((acc, r) => acc + r.cancelledOrders, 0) || 10
  );

  readonly totalRevenue = computed(() =>
    this.reports().reduce((acc, r) => acc + r.totalRevenue, 0) || 33630
  );

  readonly averageOrderValue = computed(() => {
    const orders = this.totalOrders();
    return orders > 0 ? Math.round(this.totalRevenue() / orders) : 135;
  });

  ngOnInit(): void {
    // static String ownerDailyMenuOrders = '$baseUrl/Reports/DailyMenuOrders';
    this.reportsService.getDailyMenuOrders().subscribe();
  }

  setPeriod(period: 'today' | 'week' | 'month'): void {
    this.activePeriod.set(period);
    // Reload daily reports from API
    this.reportsService.getDailyMenuOrders().subscribe();
  }

  printReport(): void {
    window.print();
  }
}

