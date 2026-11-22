import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { resolveImageUrl } from '../../../../shared/utils/resolve-image-url';
import { FavoritesService } from '../../favorites.service';
import { FavoriteProduct } from '../../models/favorite-product.model';
import { favoriteDiscount, favoritePrice } from '../../utils/favorite-pricing';

@Component({
  selector: 'app-favorite-item-card',
  imports: [RouterLink],
  templateUrl: './favorite-item-card.component.html',
  styleUrl: './favorite-item-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteItemCardComponent {
  private readonly _favorites = inject(FavoritesService);

  readonly item = input.required<FavoriteProduct>();

  readonly imageUrl = computed(() =>
    resolveImageUrl(this.item().photoURL, '/images/default-meal.png'),
  );
  readonly price = computed(() => favoritePrice(this.item()));
  readonly discount = computed(() => favoriteDiscount(this.item()));
  readonly isPending = computed(() => this._favorites.isPending(this.item().id));

  toggleFavorite(): void {
    this._favorites.toggleFavorite(this.item().id, this.item());
  }
}
