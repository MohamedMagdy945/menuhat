import { Component, input, signal } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { RouterLink } from '@angular/router';
import { RestaurantMenuProduct } from '../../models/restaurant-details';

@Component({
  imports: [RouterLink],
  selector: 'app-restaurant-menu-item-card',
  styleUrl: './restaurant-menu-item-card.component.css',
  templateUrl: './restaurant-menu-item-card.component.html',
})
export class RestaurantMenuItemCardComponent {
  readonly item = input.required<RestaurantMenuProduct>();
  readonly apiUrl = environment.filesUrl;
  readonly isFavorite = signal(false);
  Math: any;

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }
  readonly isAddingToCart = signal(false);
  readonly isAddedToCart = signal(false);

  addToCart(): void {
    if (this.isAddingToCart()) {
      return;
    }

    this.isAddingToCart.set(true);

    // هنا حط API بتاع إضافة المنتج للسلة
    setTimeout(() => {
      this.isAddingToCart.set(false);
      this.isAddedToCart.set(true);
    }, 800);
  }
}
