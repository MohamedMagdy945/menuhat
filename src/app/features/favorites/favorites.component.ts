import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserDataService } from '../../core/services/userData.service';
import { MenuItemSkeletonComponent } from '../../shared/skeleton/menu-item-skeleton/menu-item-skeleton.component';
import { FavoriteItemCardComponent } from './components/favorite-item-card/favorite-item-card.component';
import { FavoritesService } from './favorites.service';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, FavoriteItemCardComponent, MenuItemSkeletonComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent {
  readonly favoritesService = inject(FavoritesService);
  readonly userDataService = inject(UserDataService);

  readonly searchQuery = signal<string>('');
  readonly skeletonCards = Array.from({ length: 12 }, (_, i) => i);

  /** Favorites filtered by meal or restaurant name. Loading is handled by FavoritesService. */
  readonly filteredFavorites = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.favoritesService.favorites();
    if (!query) return list;
    return list.filter(
      (item) =>
        item.productName?.toLowerCase().includes(query) ||
        item.clientName?.toLowerCase().includes(query),
    );
  });

  refresh(): void {
    this.favoritesService.loadFavorites(true);
  }
}
