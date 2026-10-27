import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CartMenuItem } from '../../models/cart-item';
import { environment } from '../../../../core/environments/environment';

@Component({
  selector: 'app-cart-item-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './cart-item-card.component.html',
  styleUrl: './cart-item-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemCardComponent {
  readonly item = input.required<CartMenuItem>();
  readonly changeQuantity = output<number>();
  readonly deleteItem = output<CartMenuItem>();

  private readonly filesUrl = environment.filesUrl;

  readonly imageUrl = computed(() => {
    const photoURL = this.item()?.photoURL;
    if (!photoURL) {
      return '/images/default.png';
    }
    if (photoURL.startsWith('http://') || photoURL.startsWith('https://')) {
      return photoURL;
    }
    const cleanPath = photoURL.startsWith('/') ? photoURL : `/${photoURL}`;
    return `${this.filesUrl}${cleanPath}`;
  });

  onIncrease(): void {
    this.changeQuantity.emit(1);
  }

  onDecrease(): void {
    this.changeQuantity.emit(-1);
  }

  onDelete(): void {
    this.deleteItem.emit(this.item());
  }
}
