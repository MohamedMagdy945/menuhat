import { Component, computed, inject, input } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { RouterLink } from '@angular/router';
import { MenuItem } from '../../../menu-items/models';
import { FavoritesService } from '../../../favorites/favorites.service';

@Component({
  imports: [RouterLink],
  selector: 'app-home-menu-item-card',
  styleUrl: './home-menu-item-card.component.css',
  templateUrl: './home-menu-item-card.component.html',
})
export class HomeMenuItemCardComponent {
  private readonly favoritesService = inject(FavoritesService);

  readonly menuItem = input.required<MenuItem>();
  readonly apiUrl = environment.filesUrl;
  readonly Math = Math;

  getItemImageUrl(photoURL: string | null | undefined): string {
    if (!photoURL) {
      return '/images/default-meal.png';
    }
    if (photoURL.startsWith('http')) {
      return photoURL;
    }
    const cleanPath = photoURL.startsWith('/') ? photoURL : `/${photoURL}`;
    const serverHost = environment.apiUrl.replace(/\/api\/?$/, '');

    if (cleanPath.startsWith('/DefaultImages') || cleanPath.startsWith('/UploadedFiles')) {
      return `${serverHost}${encodeURI(cleanPath)}`;
    }
    return `${environment.filesUrl}${encodeURI(cleanPath)}`;
  }

  readonly itemId = computed(() => {
    const item = this.menuItem() as any;
    return item.id ?? item.menuProductId ?? item.mostrequestesId ?? item.productId ?? item.menuId;
  });

  readonly isFavorite = computed(() => {
    return this.favoritesService.isFavorite(this.itemId());
  });

  toggleFavorite(): void {
    this.favoritesService.toggleFavorite(this.itemId(), this.menuItem());
  }
}
