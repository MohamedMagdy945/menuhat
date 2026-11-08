import {
  Component, ChangeDetectionStrategy, inject, OnInit, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { AcceptOrderModalComponent } from './components/accept-order-modal/accept-order-modal.component';
import { RejectOrderModalComponent } from './components/reject-order-modal/reject-order-modal.component';
import { OrderCardData, OrderTab } from './models';
import { OrdersService } from './services/orders.service';

const PAGE_SIZE = 16;

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    OrderCardComponent,
    OrderDetailsComponent,
    AcceptOrderModalComponent,
    RejectOrderModalComponent,
  ],
  templateUrl: './orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ordersService = inject(OrdersService);

  readonly isLoading = this.ordersService.isLoading;
  readonly isLoadingOrder = this.ordersService.isLoadingOrder;
  readonly actionInProgress = this.ordersService.actionInProgress;
  readonly currentOrder = this.ordersService.currentOrder;

  readonly activeOrderId = signal<string | number | null>(null);
  readonly currentPage = signal(1);
  readonly pageSize = PAGE_SIZE;

  // Filter Signals matching mobile app design
  readonly searchQuery = signal<string>('');
  readonly selectedTab = signal<OrderTab>('all');

  // Modals state
  readonly selectedOrderForAccept = signal<OrderCardData | null>(null);
  readonly selectedOrderForReject = signal<OrderCardData | null>(null);

  // Independent orders signal from OrdersService
  readonly allOrders = this.ordersService.orders;

  // Filtered orders according to tab and search
  readonly filteredOrders = computed<OrderCardData[]>(() => {
    let list = this.allOrders();
    const tab = this.selectedTab();
    const q = this.searchQuery().trim().toLowerCase().replace(/^#/, '');

    // 1. Filter by Tab
    if (tab === 'today') {
      list = list.filter((o) => this.isToday(o.createdAt));
    } else if (tab === 'pending') {
      list = list.filter((o) => o.isPending || o.statusId === 1 || o.statusLabel?.includes('انتظار'));
    } else if (tab === 'preparing') {
      list = list.filter((o) => o.statusId === 2 || o.statusLabel?.includes('تحضير') || o.statusLabel?.includes('تجهيز') || o.statusLabel?.includes('طريق'));
    } else if (tab === 'completed') {
      list = list.filter((o) => o.statusId === 3 || o.statusId === 4 || o.statusLabel?.includes('مكتمل'));
    } else if (tab === 'rejected') {
      list = list.filter((o) => o.statusId === 5 || o.statusLabel?.includes('مرفوض') || o.statusLabel?.includes('ملغي'));
    }

    // 2. Filter by Search Query
    if (q) {
      list = list.filter((o) => {
        const orderNum = (o.orderNumber || '').toLowerCase().replace(/^#/, '');
        const idStr = (o.id || '').toString().toLowerCase();
        const customer = (o.customerName || '').toLowerCase();
        const phone = (o.phone || '').toLowerCase();
        return (
          orderNum.includes(q) ||
          idStr.includes(q) ||
          customer.includes(q) ||
          phone.includes(q)
        );
      });
    }

    return [...list].sort((a: OrderCardData, b: OrderCardData) => this.compareOrdersDesc(a, b));
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize)));

  readonly pagedOrders = computed<OrderCardData[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredOrders().slice(start, start + this.pageSize);
  });

  readonly pages = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  });

  ngOnInit(): void {
    // 1. Fetch orders independently (GetOrdersOfMenusByUId with Bearer token)
    this.ordersService.getOrdersOfMenusByUId().subscribe();

    // 2. Listen to route params: /dashboard/orders/:id
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.activeOrderId.set(idParam);
        this.ordersService.getOrderDetails(idParam).subscribe();
      } else {
        this.activeOrderId.set(null);
      }
    });
  }

  setTab(tab: OrderTab): void {
    this.selectedTab.set(tab);
    this.currentPage.set(1);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  acceptOrder(orderId: string | number): void {
    const target =
      this.allOrders().find((o) => o.id.toString() === orderId.toString()) ??
      (this.currentOrder()
        ? {
            id: this.currentOrder()!.id,
            orderNumber: this.currentOrder()!.orderCode,
            customerName: this.currentOrder()!.customerName,
            time: this.currentOrder()!.dateTime,
            price: this.currentOrder()!.totalPrice,
            formattedPrice: this.currentOrder()!.totalPrice.toString(),
            status: this.currentOrder()!.statusLabel,
            statusLabel: this.currentOrder()!.statusLabel,
            statusColor: '',
          }
        : null);

    if (target) {
      this.selectedOrderForAccept.set(target);
    } else {
      this.ordersService.receiveOrder(orderId).subscribe();
    }
  }

  confirmAccept(data: { deliveryFee?: number }): void {
    const order = this.selectedOrderForAccept();
    if (!order) return;
    this.ordersService.receiveOrder(order.id).subscribe();
    this.selectedOrderForAccept.set(null);
  }

  closeAcceptModal(): void {
    this.selectedOrderForAccept.set(null);
  }

  rejectOrder(orderId: string | number): void {
    const target =
      this.allOrders().find((o) => o.id.toString() === orderId.toString()) ??
      (this.currentOrder()
        ? {
            id: this.currentOrder()!.id,
            orderNumber: this.currentOrder()!.orderCode,
            customerName: this.currentOrder()!.customerName,
            time: this.currentOrder()!.dateTime,
            price: this.currentOrder()!.totalPrice,
            formattedPrice: this.currentOrder()!.totalPrice.toString(),
            status: this.currentOrder()!.statusLabel,
            statusLabel: this.currentOrder()!.statusLabel,
            statusColor: '',
          }
        : null);

    if (target) {
      this.selectedOrderForReject.set(target);
    } else {
      this.ordersService.cancelOrder(orderId, 'تم الرفض بواسطة المطعم').subscribe();
    }
  }

  confirmReject(reason: string): void {
    const order = this.selectedOrderForReject();
    if (!order) return;
    this.ordersService.cancelOrder(order.id, reason).subscribe();
    this.selectedOrderForReject.set(null);
  }

  closeRejectModal(): void {
    this.selectedOrderForReject.set(null);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList(): void {
    this.activeOrderId.set(null);
    this.router.navigate(['/dashboard/orders']);
  }

  receiveCurrentOrder(): void {
    const current = this.currentOrder();
    if (!current) return;
    this.acceptOrder(current.id);
  }

  cancelCurrentOrder(): void {
    const current = this.currentOrder();
    if (!current) return;
    this.rejectOrder(current.id);
  }

  printOrder(): void {
    window.print();
  }

  private isToday(dateStr?: string): boolean {
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      const today = new Date();
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    } catch {
      return false;
    }
  }

  private parseTimestamp(dateStr?: string): number {
    if (!dateStr) return 0;
    const direct = new Date(dateStr).getTime();
    if (!isNaN(direct) && direct > 0) return direct;
    const withT = new Date(dateStr.replace(' ', 'T')).getTime();
    if (!isNaN(withT) && withT > 0) return withT;
    return 0;
  }

  private compareOrdersDesc(a: OrderCardData, b: OrderCardData): number {
    const timeA = this.parseTimestamp(a.createdAt);
    const timeB = this.parseTimestamp(b.createdAt);
    if (timeA && timeB && timeA !== timeB) {
      return timeB - timeA;
    }
    const idA = Number(a.id);
    const idB = Number(b.id);
    if (!isNaN(idA) && !isNaN(idB)) {
      return idB - idA;
    }
    return 0;
  }
}
