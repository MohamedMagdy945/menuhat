import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoriteProduct } from '../../models';
import { FavoritesService } from '../../favorites.service';
import { environment } from '../../../../core/environments/environment';

@Component({
  selector: 'app-favorite-item-card',
  imports: [RouterLink],
  templateUrl: './favorite-item-card.component.html',
  styleUrl: './favorite-item-card.component.css',
})
export class FavoriteItemCardComponent {
  private readonly favoritesService = inject(FavoritesService);

  readonly item = input.required<FavoriteProduct>();
  readonly apiUrl = environment.filesUrl;
  readonly Math = Math;

  toggleFavorite(): void {
    this.favoritesService.toggleFavorite(this.item().id, this.item());
  }
}
