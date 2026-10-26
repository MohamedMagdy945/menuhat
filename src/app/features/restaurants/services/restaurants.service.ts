import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { finalize } from 'rxjs';

import { environment } from '../../../core/environments/environment';
import { USE_GLOBAL_LOADING } from '../../../core/loading/loading-context';
import { Restaurant } from '../models/restaurant';
import { RestaurantQueryParams } from '../models/restaurant-query-params';
import { RestaurantResponse } from '../models/restaurant-response';

export interface LoadRestaurantsParams {
  pageNumber?: number;
  pageSize?: number;
  PageNumber?: number;
  PageSize?: number;
  globalLoading?: boolean;
  extraParams?: Partial<RestaurantQueryParams>;
}

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
  readonly topVisitsHasNext = signal(true);
  readonly isLoadingTopVisits = signal(false);

  loadTopVisits(
    pageNumber: number,
    pageSize: number,
    options?: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> },
  ): void;
  loadTopVisits(params?: LoadRestaurantsParams): void;
  loadTopVisits(
    pageOrParams: number | LoadRestaurantsParams = 1,
    pageSizeArg: number = 10,
    optionsArg: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> } = {},
  ): void {
    const { pageNumber, pageSize, globalLoading, extraParams } = this.resolveParams(
      pageOrParams,
      pageSizeArg,
      optionsArg,
    );

    this.fetchRestaurants({
      endpoint: '/EMHomeApp/GetTopVisits',
      pageNumber,
      pageSize,
      globalLoading,
      extraParams,
      itemsSignal: this.topVisits,
      hasNextSignal: this.topVisitsHasNext,
      isLoadingSignal: this.isLoadingTopVisits,
    });
  }

  // ============================================
  // Nearest Restaurants
  // ============================================
  readonly nearestRestaurants = signal<Restaurant[]>([]);
  readonly nearestRestaurantsHasNext = signal(true);
  readonly isLoadingNearestRestaurants = signal(false);

  loadNearestRestaurants(
    pageNumber: number,
    pageSize: number,
    options?: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> },
  ): void;
  loadNearestRestaurants(params?: LoadRestaurantsParams): void;
  loadNearestRestaurants(
    pageOrParams: number | LoadRestaurantsParams = 1,
    pageSizeArg: number = 10,
    optionsArg: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> } = {},
  ): void {
    const { pageNumber, pageSize, globalLoading, extraParams } = this.resolveParams(
      pageOrParams,
      pageSizeArg,
      optionsArg,
    );

    this.fetchRestaurants({
      endpoint: '/EMHomeApp/GetNearest',
      pageNumber,
      pageSize,
      globalLoading,
      extraParams,
      itemsSignal: this.nearestRestaurants,
      hasNextSignal: this.nearestRestaurantsHasNext,
      isLoadingSignal: this.isLoadingNearestRestaurants,
    });
  }

  // ============================================
  // Top Rates
  // ============================================
  readonly topRates = signal<Restaurant[]>([]);
  readonly topRatesHasNext = signal(true);
  readonly isLoadingTopRates = signal(false);

  loadTopRates(
    pageNumber: number,
    pageSize: number,
    options?: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> },
  ): void;
  loadTopRates(params?: LoadRestaurantsParams): void;
  loadTopRates(
    pageOrParams: number | LoadRestaurantsParams = 1,
    pageSizeArg: number = 10,
    optionsArg: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> } = {},
  ): void {
    const { pageNumber, pageSize, globalLoading, extraParams } = this.resolveParams(
      pageOrParams,
      pageSizeArg,
      optionsArg,
    );

    this.fetchRestaurants({
      endpoint: '/EMHomeApp/GetTopRates',
      pageNumber,
      pageSize,
      globalLoading,
      extraParams,
      itemsSignal: this.topRates,
      hasNextSignal: this.topRatesHasNext,
      isLoadingSignal: this.isLoadingTopRates,
    });
  }

  // ============================================
  // Trends (رائج الآن)
  // ============================================
  readonly trends = signal<Restaurant[]>([]);
  readonly trendsHasNext = signal(true);
  readonly isLoadingTrends = signal(false);

  loadTrends(
    pageNumber: number,
    pageSize: number,
    options?: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> },
  ): void;
  loadTrends(params?: LoadRestaurantsParams): void;
  loadTrends(
    pageOrParams: number | LoadRestaurantsParams = 1,
    pageSizeArg: number = 10,
    optionsArg: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> } = {},
  ): void {
    const { pageNumber, pageSize, globalLoading, extraParams } = this.resolveParams(
      pageOrParams,
      pageSizeArg,
      optionsArg,
    );

    this.fetchRestaurants({
      endpoint: '/EMHomeApp/GetTrends',
      pageNumber,
      pageSize,
      globalLoading,
      extraParams,
      itemsSignal: this.trends,
      hasNextSignal: this.trendsHasNext,
      isLoadingSignal: this.isLoadingTrends,
    });
  }

  // ============================================
  // Helper Methods
  // ============================================
  private resolveParams(
    pageOrParams: number | LoadRestaurantsParams,
    pageSizeArg: number,
    optionsArg: { globalLoading?: boolean; extraParams?: Partial<RestaurantQueryParams> },
  ): {
    pageNumber: number;
    pageSize: number;
    globalLoading: boolean;
    extraParams: Partial<RestaurantQueryParams>;
  } {
    if (typeof pageOrParams === 'number') {
      return {
        pageNumber: pageOrParams,
        pageSize: pageSizeArg ?? 10,
        globalLoading: optionsArg.globalLoading ?? true,
        extraParams: optionsArg.extraParams ?? {},
      };
    }

    const pageNumber =
      pageOrParams?.pageNumber ??
      pageOrParams?.PageNumber ??
      1;

    const pageSize =
      pageOrParams?.pageSize ??
      pageOrParams?.PageSize ??
      pageSizeArg ??
      10;

    return {
      pageNumber,
      pageSize,
      globalLoading: pageOrParams?.globalLoading ?? true,
      extraParams: pageOrParams?.extraParams ?? {},
    };
  }

  private fetchRestaurants({
    endpoint,
    pageNumber,
    pageSize,
    globalLoading,
    extraParams,
    itemsSignal,
    hasNextSignal,
    isLoadingSignal,
  }: {
    endpoint: string;
    pageNumber: number;
    pageSize: number;
    globalLoading: boolean;
    extraParams: Partial<RestaurantQueryParams>;
    itemsSignal: WritableSignal<Restaurant[]>;
    hasNextSignal: WritableSignal<boolean>;
    isLoadingSignal: WritableSignal<boolean>;
  }): void {
    if (isLoadingSignal()) {
      return;
    }

    isLoadingSignal.set(true);

    const params: Record<string, string | number | boolean> = {
      SortField: 'rowNo',
      ...(extraParams as Record<string, string | number | boolean>),
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    console.log(`[RestaurantsService] GET ${endpoint} - Query Params:`, params);

    const context = new HttpContext().set(USE_GLOBAL_LOADING, globalLoading);

    this.http
      .get<RestaurantResponse>(`${this.apiUrl}${endpoint}`, {
        params,
        context,
      })
      .pipe(
        finalize(() => {
          isLoadingSignal.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          const items = Array.isArray(response.result) ? response.result : [];

          if (pageNumber === 1) {
            itemsSignal.set(items);
          } else {
            itemsSignal.update((current) => [...current, ...items]);
          }

          hasNextSignal.set(items.length >= pageSize);
        },
        error: (error) => {
          console.error(`Failed to load restaurants from ${endpoint}:`, error);
          if (pageNumber === 1) {
            hasNextSignal.set(false);
          }
        },
      });
  }
}
