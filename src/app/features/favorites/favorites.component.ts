import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from './favorites.service';
import { UserDataService } from '../auth/services/user-storage.service';
import { FavoriteItemCardComponent } from './components/favorite-item-card/favorite-item-card.component';
import { MenuItemSkeletonComponent } from '../../shared/skeleton/menu-item-skeleton/menu-item-skeleton.component';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, FavoriteItemCardComponent, MenuItemSkeletonComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnInit {
  readonly favoritesService = inject(FavoritesService);
  readonly userDataService = inject(UserDataService);

  readonly skeletonCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  readonly skeletonCount = this.skeletonCards;

  ngOnInit(): void {
    if (this.userDataService.getToken()) {
      this.favoritesService.loadFavorites();
    }
  }
}
