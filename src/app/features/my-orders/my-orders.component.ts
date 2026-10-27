import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrder } from '../cart/models/order';
import { CartService } from '../cart/cart.service';
import { CommonDateService } from '../../core/common-data/common-date';
import { OrderItemCardComponent } from './components/order-item-card/order-item-card.component';

export interface FilterTab {
  label: string;
  value: number;
}

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, OrderItemCardComponent],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly commonDataService = inject(CommonDateService);

  readonly ordersList = signal<IOrder[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly activeStatus = signal<number>(0);
  readonly searchQuery = signal<string>('');

  readonly filterTabs = signal<FilterTab[]>([
    { label: 'الكل', value: 0 },
    { label: 'قيد الانتظار', value: 3 },
    { label: 'تم الشحن', value: 5 },
    { label: 'تم التوصيل', value: 4 },
    { label: 'مكتمل', value: 1 },
    { label: 'ملغي', value: 2 },
  ]);

  getTabCount(status: number): number {
    const list = this.ordersList();
    if (status === 0) return list.length;
    return list.filter((o) => o.orderStatusId === status).length;
  }

  readonly filteredOrders = computed(() => {
    const status = this.activeStatus();
    const query = this.searchQuery().trim().toLowerCase();
    let orders = this.ordersList();

    if (status !== 0) {
      orders = orders.filter((order) => order.orderStatusId === status);
    }

    if (query) {
      orders = orders.filter(
        (order) =>
          order.serialOrder?.toLowerCase().includes(query) ||
          order.clientName?.toLowerCase().includes(query) ||
          String(order.menuOrdersId).includes(query)
      );
    }

    return orders;
  });

  ngOnInit(): void {
    this.isLoading.set(true);

    // Fetch dynamic order statuses from CommonData API
    this.commonDataService.getOrderStatuses().subscribe({
      next: (statuses) => {
        if (statuses && statuses.length > 0) {
          this.filterTabs.set([
            { label: 'الكل', value: 0 },
            ...statuses.map((s) => ({ label: s.name, value: s.id })),
          ]);
        }
      },
      error: () => {
        // Fallback to initial defaults
      },
    });

    // Fetch orders list
    this.cartService.GetUserCart().subscribe({
      next: (res) => {
        this.ordersList.set(res?.items || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  refresh(): void {
    this.isLoading.set(true);
    this.cartService.GetUserCart().subscribe({
      next: (res) => {
        this.ordersList.set(res?.items || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setStatusFilter(status: number): void {
    this.activeStatus.set(status);
  }

  onCancelOrder(orderId: number): void {
    console.log('Cancel order:', orderId);
  }

  onViewDetails(orderId: number): void {
    console.log('View order details:', orderId);
  }
}
