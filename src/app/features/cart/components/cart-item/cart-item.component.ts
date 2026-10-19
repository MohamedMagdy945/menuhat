import { Component, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IOrder } from '../../models/order';
import { environment } from '../../../../core/environments/environment';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css',
})
export class CartItemComponent {
  readonly order = input.required<IOrder>();
  readonly cancelOrder = output<number>();
  readonly viewDetails = output<number>();

  readonly filesUrl = environment.filesUrl;

  get logoUrl(): string {
    const logo = this.order()?.logoURL;
    if (!logo) {
      return '/images/default.png';
    }
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    const cleanPath = logo.startsWith('/') ? logo : `/${logo}`;
    return `${this.filesUrl}${cleanPath}`;
  }

  onCancel(): void {
    this.cancelOrder.emit(this.order().menuOrdersId);
  }

  onView(): void {
    this.viewDetails.emit(this.order().menuOrdersId);
  }
}
