import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';

import { environment } from '../../core/environments/environment';
import { Restaurant } from './models/restaurant';
import { PageData } from '../../shared/models/pagination/page-data';
import { MenuQueryParams } from './models/menu-query-params';
import { USE_GLOBAL_LOADING } from '../../core/loading/loading-context';

interface SectionState {
  data: WritableSignal<Restaurant[]>;
  page: WritableSignal<number>;
  loading: WritableSignal<boolean>;
  hasNext: WritableSignal<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // ============================================
  // 1. Trending
  // ============================================

  readonly trending = signal<Restaurant[]>([]);
  readonly trendingPage = signal(1);
  readonly trendingLoading = signal(false);
  readonly trendingHasNext = signal(true);

  loadTrending(extraParams: Partial<MenuQueryParams> = {}): void {
    this.loadSection(
      {
        data: this.trending,
        page: this.trendingPage,
        loading: this.trendingLoading,
        hasNext: this.trendingHasNext,
      },
      `${this.apiUrl}/EMHomeApp/GetAllMenus`,
      (page) => ({
        SortField: '1',
        PageNumber: page,
        PageSize: 10,
        ...extraParams,
      }),
    );
  }

  // ============================================
  // 2. Nearest
  // ============================================

  readonly nearst = signal<Restaurant[]>([]);
  readonly nearstPage = signal(1);
  readonly nearstLoading = signal(false);
  readonly nearstHasNext = signal(true);

  loadNearst(lat?: number, lon?: number, extraParams: Partial<MenuQueryParams> = {}): void {
    this.loadSection(
      {
        data: this.nearst,
        page: this.nearstPage,
        loading: this.nearstLoading,
        hasNext: this.nearstHasNext,
      },
      `${this.apiUrl}/EMHomeApp/GetAllMenus`,
      (page) => ({
        SortField: '1',
        PageNumber: page,
        PageSize: 10,
        ...(lat !== undefined && lon !== undefined ? { lat, lon } : {}),
        ...extraParams,
      }),
    );
  }

  // ============================================
  // 3. Most Visited
  // ============================================

  readonly mostVisited = signal<Restaurant[]>([]);
  readonly mostVisitedPage = signal(1);
  readonly mostVisitedLoading = signal(false);
  readonly mostVisitedHasNext = signal(true);

  loadMostVisited(extraParams: Partial<MenuQueryParams> = {}): void {
    this.loadSection(
      {
        data: this.mostVisited,
        page: this.mostVisitedPage,
        loading: this.mostVisitedLoading,
        hasNext: this.mostVisitedHasNext,
      },
      `${this.apiUrl}/EMHomeApp/GetTopVisits`,
      (page) => ({
        SortField: 'id',
        PageNumber: page,
        PageSize: 10,
        ...extraParams,
      }),
    );
  }

  // ============================================
  // Generic Pagination
  // ============================================

  private loadSection(
    section: SectionState,
    endpoint: string,
    paramsBuilder: (page: number) => MenuQueryParams,
  ): void {
    if (section.loading() || !section.hasNext()) {
      return;
    }

    const isFirstPage = section.page() === 1;

    section.loading.set(true);

    const params = this.cleanParams(paramsBuilder(section.page()));

    const context = new HttpContext().set(USE_GLOBAL_LOADING, isFirstPage);

    this.http
      .get<PageData<Restaurant>>(endpoint, {
        params,
        context,
      })
      .subscribe({
        next: (response) => {
          section.data.update((current) => [...current, ...response.result]);

          if (section.page() >= response.totalPages) {
            section.hasNext.set(false);
          } else {
            section.page.update((page) => page + 1);
          }

          section.loading.set(false);
        },

        error: (error) => {
          console.error('Failed to load restaurants:', error);

          section.loading.set(false);
        },
      });
  }

  // ============================================
  // Clean Query Parameters
  // ============================================

  private cleanParams(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};

    Object.keys(params).forEach((key) => {
      const value = params[key];

      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    return cleaned;
  }
}
