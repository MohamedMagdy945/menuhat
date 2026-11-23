import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { finalize, map, Observable } from 'rxjs';
import { environment } from '../../core/environments/environment';
import { USE_GLOBAL_LOADING } from '../../core/loading/loading-context';
import { MenuItem } from './models/menu-item.model';
import { MenuItemsResponse } from './models/menu-items-response.model';
import { MenuProductResponse } from './models/menu-product-response.model';
import { MenuProductsResponse } from '../dashboard/menus/models/menu-products-response.model';
import { PageData } from '../../shared/models/pagination/page-data.model';
import { SearchResultItem } from '../search/models/search-result-item.model';

@Injectable({
  providedIn: 'root',
})
export class MenuItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly mostRequested = signal<MenuItem[]>([]);
  readonly items = this.mostRequested;

  readonly isLoadingMostRequested = signal(false);
  readonly isLoading = this.isLoadingMostRequested;

  readonly error = signal<string | null>(null);

  /**
   * Fetches product details and sizes from /api/MenuProducts/:id
   */
  getProductById(id: number): Observable<MenuProductResponse> {
    return this.http.get<MenuProductResponse>(`${this.apiUrl}/MenuProducts/${id}`);
  }

  /**
   * Paged product search: GET /api/MenuProducts?SearchValue=&PageNumber=&PageSize=
   */
  searchProducts(
    searchValue: string,
    pageNumber: number,
    pageSize: number,
  ): Observable<PageData<SearchResultItem>> {
    return this.http
      .get<MenuProductsResponse>(`${this.apiUrl}/MenuProducts`, {
        params: {
          SortField: 'RowNo',
          SearchValue: searchValue,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })
      .pipe(
        map((res) => {
          const items = Array.isArray(res?.listWithDetails) ? res.listWithDetails : [];
          return {
            result: items.map((product): SearchResultItem => ({
              id: Number(product.id),
              title: (product.productName ?? '').trim(),
              subtitle: (product.clientName ?? '').trim(),
              imagePath: product.photoURL ?? null,
              fallbackImage: '/images/default-meal.png',
              price: product.price ?? product.details?.[0]?.price ?? null,
              link: ['/menu-items', product.id],
            })),
            itemsCount: res?.itemsCount ?? items.length,
            totalPages: res?.totalPages ?? 1,
          };
        }),
      );
  }

  loadMostRequested({
    globalLoading = true,
  }: {
    globalLoading?: boolean;
  } = {}): void {
    if (this.isLoadingMostRequested()) {
      return;
    }

    this.isLoadingMostRequested.set(true);
    this.error.set(null);

    const context = new HttpContext().set(USE_GLOBAL_LOADING, globalLoading);

    this.http
      .get<MenuItemsResponse>(`${this.apiUrl}/EMHome/Mostrequested`, {
        params: {
          SortField: 'RowNo',
        },
        context,
      })
      .pipe(
        finalize(() => {
          this.isLoadingMostRequested.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          const items = Array.isArray(response?.items) ? response.items : [];
          this.mostRequested.set(items);
        },
        error: (err) => {
          console.error('Failed to load most requested menu items:', err);
          this.error.set(err?.message || 'Failed to load items');
        },
      });
  }
}
