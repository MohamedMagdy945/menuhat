import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Subscription } from 'rxjs';
import { IOrder, OrderStatus } from '../../models/order';
import { CartService } from '../../cart.service';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, CartItemComponent],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css',
})
export class MyOrdersComponent implements OnInit {
  private readonly _cartService = inject(CartService);

  private ordersSubscription!: Subscription;
  ordersList: WritableSignal<IOrder[]> = signal([]);
  isLoading = signal<boolean>(true);

  activeStatus: OrderStatus = 0;
  readonly filterTabs: { label: string; value: OrderStatus }[] = [
    { label: 'الكل', value: 0 },
    { label: 'قيد الانتظار', value: 1 },
    { label: 'جاري التجهيز', value: 2 },
    { label: 'جاري التوصيل', value: 3 },
    { label: 'المكتملة', value: 4 },
    { label: 'المرفوضة', value: 5 }
  ];

  ngOnInit(): void {
    this.isLoading.set(true);
    this.ordersSubscription = this._cartService.GetUserCart().subscribe({
      next: (res) => {
        this.ordersList.set(res?.items || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  get filteredOrders(): IOrder[] {
    if (this.activeStatus === 0) {
      return this.ordersList();
    }
    return this.ordersList().filter(order => order.orderStatusId === this.activeStatus);
  }

  setStatusFilter(status: OrderStatus): void {
    this.activeStatus = status;
  }

  onCancelOrder(orderId: number): void {
    console.log('Cancel order:', orderId);
  }

  onViewDetails(orderId: number): void {
    console.log('View order details:', orderId);
  }
}
