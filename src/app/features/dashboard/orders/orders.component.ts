import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OwnerOrdersService } from './services/owner-orders.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ownerOrdersService = inject(OwnerOrdersService);
  protected readonly dashboardService = inject(DashboardService);

  readonly order = this.ownerOrdersService.currentOrder;
  readonly isLoading = this.ownerOrdersService.isLoading;
  readonly actionInProgress = this.ownerOrdersService.actionInProgress;
  readonly errorMessage = this.ownerOrdersService.errorMessage;

  // Selected Order ID
  readonly activeOrderId = signal<string | number>(1024);

  // Incoming orders from Swagger API / dashboard
  readonly recentOrders = computed(() => {
    const apiOrders = this.ownerOrdersService.ordersList();
    if (apiOrders && apiOrders.length > 0) {
      return apiOrders.map((o) => ({
        id: o.id,
        code: o.orderCode,
        name: o.customerName,
        price: o.price,
      }));
    }

    const dashboardOrders = this.dashboardService.dashboardData()?.currentOrders ?? [];
    if (dashboardOrders.length > 0) {
      return dashboardOrders.map((o: any, idx: number) => ({
        id: o.id ?? idx + 1,
        code: o.orderNumber ?? `#${o.id ?? idx + 100}`,
        name: o.customerName ?? 'عميل',
        price: o.price ?? 0,
      }));
    }

    return [
      { id: 1024, code: '#1024', name: 'أحمد منصور', price: 120 },
      { id: 1025, code: '#1025', name: 'سارة خالد', price: 85 },
      { id: 1026, code: '#1026', name: 'محمد علي', price: 210 },
      { id: 1027, code: '#1027', name: 'إبراهيم يوسف', price: 175 },
    ];
  });

  ngOnInit(): void {
    // 1. Fetch orders list from Swagger API: /MenusOrders/GetOrdersOfMenusByUId
    this.ownerOrdersService.getOrdersOfMenusByUId().subscribe();

    // 2. Listen to route params: /dashboard/orders/:id or queryParam: ?id=
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.loadOrder(idParam);
        return;
      }

      this.route.queryParamMap.subscribe((queryParams) => {
        const queryId = queryParams.get('id') || queryParams.get('orderId');
        if (queryId) {
          this.loadOrder(queryId);
        } else {
          // Default initial order
          this.loadOrder(1024);
        }
      });
    });
  }

  loadOrder(orderId: number | string): void {
    this.activeOrderId.set(orderId);
    this.ownerOrdersService.getOrderDetails(orderId).subscribe();
  }

  selectOrder(orderId: number | string): void {
    this.loadOrder(orderId);
  }

  receiveCurrentOrder(): void {
    const current = this.order();
    if (!current) return;
    this.ownerOrdersService.receiveOrder(current.id).subscribe();
  }

  cancelCurrentOrder(): void {
    const current = this.order();
    if (!current) return;
    this.ownerOrdersService.cancelOrder(current.id, 'تم الإلغاء بواسطة مدير المطعم').subscribe();
  }

  printOrder(): void {
    window.print();
  }
}
