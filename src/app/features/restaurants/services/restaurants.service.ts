import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { finalize } from 'rxjs';

import { environment } from '../../../core/environments/environment';
import { USE_GLOBAL_LOADING } from '../../../core/loading/loading-context';
import { Restaurant } from '../models/restaurant';
import { RestaurantQueryParams } from '../models/restaurant-query-params';
import { RestaurantResponse } from '../models/restaurant-response';

@Injectable({
  providedIn: 'root',
})
export class RestaurantsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  // ============================================
  // Top Visits
  // ============================================

  readonly topVisits = signal<Restaurant[]>([]);
  readonly topVisitsPage = signal(1);
  readonly topVisitsHasNext = signal(true);
  readonly isLoadingTopVisits = signal(false);

  loadTopVisits({
    globalLoading = true,
    extraParams = {},
  }: {
    globalLoading?: boolean;
    extraParams?: Partial<RestaurantQueryParams>;
  } = {}): void {
    // Don't request if there are no more pages
    // or if another request is already running.
    if (!this.topVisitsHasNext() || this.isLoadingTopVisits()) {
      return;
    }

    this.isLoadingTopVisits.set(true);

    const params: Record<string, string | number | boolean> = {
      SortField: 'rowNo',
      PageNumber: this.topVisitsPage(),
      PageSize: 10,

      ...(extraParams as Record<string, string | number | boolean>),
    };

    const context = new HttpContext().set(USE_GLOBAL_LOADING, globalLoading);

    this.http
      .get<RestaurantResponse>(`${this.apiUrl}/EMHomeApp/GetTopVisits`, {
        params,
        context,
      })
      .pipe(
        finalize(() => {
          this.isLoadingTopVisits.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          const items = Array.isArray(response.result) ? response.result : [];

          // No more data
          if (!items.length) {
            this.topVisitsHasNext.set(false);
            return;
          }

          // Append new restaurants
          this.topVisits.update((current) => [...current, ...items]);

          // Move to next page
          this.topVisitsPage.update((page) => page + 1);

          // If API returned less than page size,
          // there is probably no next page.
          if (items.length < 10) {
            this.topVisitsHasNext.set(false);
          }

          // You can also use totalPages if you prefer
          // instead of checking items.length.
        },

        error: (error) => {
          console.error('Failed to load top visits restaurants:', error);
        },
      });
  }
  // ============================================
  // Nearest Restaurants
  // ============================================

  readonly nearestRestaurants = signal<Restaurant[]>([]);
  readonly nearestRestaurantsPage = signal(1);
  readonly nearestRestaurantsHasNext = signal(true);
  readonly isLoadingNearestRestaurants = signal(false);

  loadNearestRestaurants({
    globalLoading = true,
    extraParams = {},
  }: {
    globalLoading?: boolean;
    extraParams?: Partial<RestaurantQueryParams>;
  } = {}): void {
    if (!this.nearestRestaurantsHasNext() || this.isLoadingNearestRestaurants()) {
      return;
    }

    this.isLoadingNearestRestaurants.set(true);

    const params: Record<string, string | number | boolean> = {
      SortField: 'rowNo',
      PageNumber: this.nearestRestaurantsPage(),
      PageSize: 10,

      ...(extraParams as Record<string, string | number | boolean>),
    };

    const context = new HttpContext().set(USE_GLOBAL_LOADING, globalLoading);

    this.http
      .get<RestaurantResponse>(`${this.apiUrl}/EMHomeApp/GetNearest`, {
        params,
        context,
      })
      .pipe(
        finalize(() => {
          this.isLoadingNearestRestaurants.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          const items = Array.isArray(response.result) ? response.result : [];

          if (!items.length) {
            this.nearestRestaurantsHasNext.set(false);
            return;
          }

          this.nearestRestaurants.update((current) => [...current, ...items]);

          this.nearestRestaurantsPage.update((page) => page + 1);

          if (items.length < 10) {
            this.nearestRestaurantsHasNext.set(false);
          }
        },

        error: (error) => {
          console.error('Failed to load nearest restaurants:', error);
        },
      });
  }
  // ============================================
// Top Rates
// ============================================

readonly topRates = signal<Restaurant[]>([]);
readonly topRatesPage = signal(1);
readonly topRatesHasNext = signal(true);
readonly isLoadingTopRates = signal(false);

loadTopRates({
  globalLoading = true,
  extraParams = {},
}: {
  globalLoading?: boolean;
  extraParams?: Partial<RestaurantQueryParams>;
} = {}): void {
  // Don't request if there are no more pages
  // or if another request is already running.
  if (!this.topRatesHasNext() || this.isLoadingTopRates()) {
    return;
  }

  this.isLoadingTopRates.set(true);

  const params: Record<string, string | number | boolean> = {
    SortField: 'rowNo',
    PageNumber: this.topRatesPage(),
    PageSize: 10,

    ...(extraParams as Record<string, string | number | boolean>),
  };

  const context = new HttpContext().set(
    USE_GLOBAL_LOADING,
    globalLoading,
  );

  this.http
    .get<RestaurantResponse>(
      `${this.apiUrl}/EMHomeApp/GetTopRates`,
      {
        params,
        context,
      },
    )
    .pipe(
      finalize(() => {
        this.isLoadingTopRates.set(false);
      }),
    )
    .subscribe({
      next: (response) => {
        const items = Array.isArray(response.result)
          ? response.result
          : [];

        // No more data
        if (!items.length) {
          this.topRatesHasNext.set(false);
          return;
        }

        // Append new restaurants
        this.topRates.update((current) => [
          ...current,
          ...items,
        ]);

        // Move to next page
        this.topRatesPage.update((page) => page + 1);

        // If API returned less than page size,
        // there is probably no next page.
        if (items.length < 10) {
          this.topRatesHasNext.set(false);
        }
      },

      error: (error) => {
        console.error(
          'Failed to load top rates restaurants:',
          error,
        );
      },
    });
}
}

