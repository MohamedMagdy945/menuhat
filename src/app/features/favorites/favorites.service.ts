import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FavoriteProduct, FavoritesResponse, ToggleFavoriteDto } from './models';
import { environment } from '../../core/environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { UserDataService } from '../auth/services/user-storage.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly userDataService = inject(UserDataService);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = environment.apiUrl;

  readonly favorites = signal<FavoriteProduct[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /** Set of favorite product IDs for fast O(1) lookup */
  readonly favoriteProductIds = computed(() => {
    return new Set<number>(this.favorites().map((f) => f.id));
  });

  constructor() {
    if (this.userDataService.getToken()) {
      this.loadFavorites();
    }
  }

  /**
   * Checks if a product is in the user's favorites list.
   */
  isFavorite(productId: number | null | undefined): boolean {
    if (productId === null || productId === undefined) {
      return false;
    }
    return this.favoriteProductIds().has(productId);
  }

  /**
   * Loads the user's favorite products from the API.
   */
  loadFavorites(force = false): void {
    if (this.isLoading() && !force) {
      return;
    }

    if (!this.userDataService.getToken()) {
      this.favorites.set([]);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.http
      .get<FavoritesResponse>(`${this.apiUrl}/MenuProductsFavorites/GetUPFavouriteByUserId`)
      .subscribe({
        next: (response) => {
          const list = Array.isArray(response?.result) ? response.result : [];
          this.favorites.set(list);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load favorites:', err);
          this.error.set(err?.message || 'تعذر تحميل قائمة المفضلة');
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Toggles favorite status for a given product with optimistic UI update.
   */
  toggleFavorite(productId: number, fallbackItem?: any): void {
    if (!this.userDataService.getToken()) {
      this.toastService.warning('يجب تسجيل الدخول لإضافة العناصر إلى المفضلة');
      return;
    }

    const isFav = this.isFavorite(productId);
    const previousFavorites = this.favorites();

    // 1. Optimistic Update
    if (isFav) {
      this.favorites.update((list) => list.filter((item) => item.id !== productId));
    } else {
      const newItem: FavoriteProduct = {
        menuProductFavoriteId: Date.now(),
        rowNo: 0,
        userId: this.userDataService.getUserId() ?? 0,
        productName: fallbackItem?.productName || fallbackItem?.name || '',
        productName_En: fallbackItem?.productName_En || fallbackItem?.name_En || null,
        id: productId,
        menuId: fallbackItem?.menuId || 0,
        serial: fallbackItem?.serial || '',
        haveMoreInfo: !!fallbackItem?.haveMoreInfo,
        clientName: fallbackItem?.clientName || '',
        clientName_En: fallbackItem?.clientName_En || null,
        price: fallbackItem?.price ?? null,
        oldPrice: fallbackItem?.oldPrice ?? null,
        isOffer: !!fallbackItem?.isOffer,
        discountPercentage: fallbackItem?.discountPercentage ?? null,
        description: fallbackItem?.description || null,
        description_En: fallbackItem?.description_En || null,
        photoURL: fallbackItem?.photoURL || null,
        isFavorite: true,
        details: fallbackItem?.details || [],
      };
      this.favorites.update((list) => [newItem, ...list]);
    }

    // 2. HTTP Request
    const payload: ToggleFavoriteDto = { menuProductId: productId };
    this.http.post(`${this.apiUrl}/MenuProductFavorites`, payload).subscribe({
      next: () => {
        if (isFav) {
          this.toastService.success('تمت إزالة العنصر من المفضلة');
        } else {
          this.toastService.success('تمت إضافة العنصر إلى المفضلة');
        }
        // Refresh to sync backend-generated IDs
        this.loadFavorites(true);
      },
      error: (err) => {
        // Rollback optimistic update
        this.favorites.set(previousFavorites);
        this.toastService.error('تعذر تحديث المفضلة، يرجى المحاولة مرة أخرى');
        console.error('Error toggling favorite:', err);
      },
    });
  }
}
