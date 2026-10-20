import { Component, computed, inject, input, signal } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { RouterLink } from '@angular/router';
import { RestaurantMenuProduct } from '../../models/restaurant-details';
import { CartService } from '../../../cart/cart.service';

@Component({
  imports: [RouterLink],
  selector: 'app-restaurant-menu-item-card',
  styleUrl: './restaurant-menu-item-card.component.css',
  templateUrl: './restaurant-menu-item-card.component.html',
})
export class RestaurantMenuItemCardComponent {
  private readonly _cartService = inject(CartService);

  readonly item = input.required<RestaurantMenuProduct>();
  readonly apiUrl = environment.filesUrl;
  readonly isFavorite = signal(false);
  readonly isAddingToCart = signal(false);
  readonly _addedManually = signal(false);

  // true if item is already in cart (from service) OR was just added in this session
  readonly isAddedToCart = computed(() =>
    this._addedManually() ||
    this._cartService.cartItems().some((it) => it.productId === this.item().id)
  );

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }

  addToCart(): void {
    if (this.isAddingToCart()) return;

    this.isAddingToCart.set(true);

    const newItem = this.item();
    const existingItems = this._cartService.cartItems();

    // Build full payload: existing items + new item (increment qty if already in cart)
    const alreadyInCart = existingItems.some((it) => it.productId === newItem.id);

    const payload = [
      ...existingItems.map((it) => ({
        productId: it.productId,
        productPriceId: it.productPriceId,
        quantity: it.productId === newItem.id ? it.quantity + 1 : it.quantity,
        serial: it.serial,
      })),
      ...(!alreadyInCart ? [{
        productId: newItem.id,
        productPriceId: null,
        quantity: 1,
        serial: newItem.serial,
      }] : []),
    ];

    this._cartService.AddItemsAndRefreshCart(payload).subscribe({
      next: () => {
        this.isAddingToCart.set(false);
        this._addedManually.set(true);
      },
      error: () => {
        this.isAddingToCart.set(false);
      },
    });
  }
}

