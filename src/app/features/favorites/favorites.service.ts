import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { environment } from '../../core/environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { UserDataService } from '../../core/services/userData.service';
import { FavoritePreview } from './models/favorite-preview.model';
import { FavoriteProduct } from './models/favorite-product.model';
import { FavoritesResponse } from './models/favorites-response.model';
import { ToggleFavoriteDto } from './models/toggle-favorite-dto.model';

const FAVORITES_API = `${environment.apiUrl}/MenuProductsFavorites`;

const ENDPOINTS = {
  list: `${FAVORITES_API}/GetUPFavouriteByUserId`,
  add: FAVORITES_API,
  remove: (menuProductId: number) => `${FAVORITES_API}/${menuProductId}`,
} as const;

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly _http = inject(HttpClient);
  private readonly _userData = inject(UserDataService);
  private readonly _toast = inject(ToastService);

  /** Product ids with a toggle request in flight (prevents double submits). */
  private readonly _pending = signal<ReadonlySet<number>>(new Set());

  readonly favorites = signal<FavoriteProduct[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /** Favorite product ids for O(1) lookups. */
  readonly favoriteProductIds = computed(() => new Set(this.favorites().map((f) => f.id)));

  constructor() {
    // Load favorites when a user signs in, clear them when the session ends.
    effect(() => {
      const token = this._userData.token();
      untracked(() => (token ? this.loadFavorites() : this.favorites.set([])));
    });
  }

  isFavorite(productId: number | null | undefined): boolean {
    return productId != null && this.favoriteProductIds().has(productId);
  }

  isPending(productId: number): boolean {
    return this._pending().has(productId);
  }

  /** Loads the signed-in user's favorites. `force` reloads even if a request is running. */
  loadFavorites(force = false): void {
    if (!this._hasSession()) {
      this.favorites.set([]);
      return;
    }
    if (this.isLoading() && !force) return;

    this.isLoading.set(true);
    this.error.set(null);

    this._http
      .get<FavoritesResponse>(ENDPOINTS.list)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.favorites.set(Array.isArray(res?.result) ? res.result : []),
        error: (err) => {
          console.error('Failed to load favorites:', err);
          this.error.set('تعذر تحميل قائمة المفضلة');
        },
      });
  }

  /**
   * Adds or removes a product from favorites:
   * - add:    POST   /MenuProductsFavorites        { menuProductId }
   * - remove: DELETE /MenuProductsFavorites/{menuProductId}
   * The UI updates immediately and is rolled back if the request fails.
   */
  toggleFavorite(productId: number, preview?: FavoritePreview | null): void {
    if (!this._hasSession()) {
      this._toast.warning('يجب تسجيل الدخول لإضافة العناصر إلى المفضلة');
      return;
    }
    if (this.isPending(productId)) return;

    const wasFavorite = this.isFavorite(productId);
    const snapshot = this.favorites();

    this.favorites.set(
      wasFavorite
        ? snapshot.filter((f) => f.id !== productId)
        : [this._toFavorite(productId, preview), ...snapshot],
    );
    this._setPending(productId, true);

    const body: ToggleFavoriteDto = { menuProductId: productId };
    const request$ = wasFavorite
      ? this._http.delete(ENDPOINTS.remove(productId))
      : this._http.post(ENDPOINTS.add, body);

    request$
      .pipe(finalize(() => this._setPending(productId, false)))
      .subscribe({
        next: () => {
          this._toast.success(
            wasFavorite ? 'تمت إزالة العنصر من المفضلة' : 'تمت إضافة العنصر إلى المفضلة',
          );
          // Replace the optimistic entry with the server's data.
          this.loadFavorites(true);
        },
        error: (err) => {
          console.error('Failed to toggle favorite:', err);
          this.favorites.set(snapshot);
          this._toast.error('تعذر تحديث المفضلة، يرجى المحاولة مرة أخرى');
        },
      });
  }

  private _hasSession(): boolean {
    return !!this._userData.getToken();
  }

  private _setPending(productId: number, pending: boolean): void {
    this._pending.update((ids) => {
      const next = new Set(ids);
      if (pending) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }

  /** Builds a temporary favorite entry shown until the list is reloaded. */
  private _toFavorite(productId: number, p?: FavoritePreview | null): FavoriteProduct {
    return {
      menuProductFavoriteId: 0,
      rowNo: 0,
      userId: this._userData.getUserId() ?? 0,
      id: productId,
      productName: p?.productName ?? p?.name ?? '',
      productName_En: p?.productName_En ?? p?.name_En ?? null,
      menuId: p?.menuId ?? 0,
      serial: p?.serial ?? '',
      haveMoreInfo: !!p?.haveMoreInfo,
      clientName: p?.clientName ?? '',
      clientName_En: p?.clientName_En ?? null,
      price: p?.price ?? null,
      oldPrice: p?.oldPrice ?? null,
      isOffer: !!p?.isOffer,
      discountPercentage: p?.discountPercentage ?? null,
      description: p?.description ?? null,
      description_En: p?.description_En ?? null,
      photoURL: p?.photoURL ?? null,
      isFavorite: true,
      details: [],
    };
  }
}
