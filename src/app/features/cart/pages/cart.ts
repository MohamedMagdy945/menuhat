import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { IOrder, OrderStatus } from '../models/order';
import { Subscription } from 'rxjs';
import { CartService } from '../services/cart.service';
import { environment } from '../../../core/environments/environment';
@Component({
  imports: [CommonModule],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})

export class Cart implements OnInit {
  private readonly _CartService = inject(CartService);

  env = environment;
  GetAllCartItems !: Subscription
  CartList: WritableSignal<IOrder[]> = signal([]);

  ngOnInit(): void {
    this.GetAllCartItems = this._CartService.GetUserCart().subscribe({
      next: (res) => { console.log(res.items); this.CartList.set(res.items); },
      error: (err) => { console.log(err); }
    });
    console.log(this.env.apiUrl);
  }

  activeStatus: OrderStatus = 0;
  filterTabs: { label: string; value: OrderStatus }[] = [
    { label: 'الكل', value: 0 },
    { label: 'قيد الانتظار', value: 1 },
    { label: 'جاري التجهيز', value: 2 },
    { label: 'جاري التوصيل', value: 3 },
    { label: 'المكتملة', value: 4 },
    { label: 'المرفوضة', value: 5 }
  ];

  get filteredOrders(): IOrder[] {
    if (this.activeStatus === 0) {
      return this.CartList();
    }
    return this.CartList().filter(order => order.orderStatusId === this.activeStatus);
  }

  // تغيير الحالة المعروضة
  setStatusFilter(status: OrderStatus): void {
    this.activeStatus = status;
  }

  onCancelOrder(orderId: number): void {
  }

  onViewDetails(orderId: number): void {
  }
}


