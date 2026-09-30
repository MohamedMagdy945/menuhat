import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { MenuProduct } from '../models/menu.product.model';
import { MostRequestedQuery } from '../models/most-requested-query';
import { USE_GLOBAL_LOADING } from '../../../core/loading/loading-context';

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  readonly mostRequested = signal<MenuProduct[]>([]);
  readonly mostRequestedPage = signal(1);
  readonly mostRequestedHasNext = signal(true);
  readonly isLoadingMostRequested = signal(false);

  loadMostRequested({
    globalLoading = true,
    extraParams = {},
  }: {
    globalLoading?: boolean;
    extraParams?: Partial<MostRequestedQuery>;
  }): void {
    if (!this.mostRequestedHasNext() || this.isLoadingMostRequested()) {
      return;
    }

    this.isLoadingMostRequested.set(true);

    const params = {
      SortField: 'rowNo',
      PageNumber: this.mostRequestedPage(),
      PageSize: 10,
      ...extraParams,
    };

    const context = new HttpContext().set(USE_GLOBAL_LOADING, globalLoading);

    this.http
      .get<{ items?: MenuProduct[] }>(`${this.apiUrl}/EMHome/Mostrequested`, {
        params: params as any,
        context,
      })
      .pipe(
        finalize(() => {
          this.isLoadingMostRequested.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          const items = Array.isArray(response.items) ? response.items : [];

          if (!items.length) {
            this.mostRequestedHasNext.set(false);
            return;
          }

          this.mostRequested.update((current) => [...current, ...items]);

          this.mostRequestedPage.update((page) => page + 1);

          if (items.length < 10) {
            this.mostRequestedHasNext.set(false);
          }
        },

        error: (error) => {
          console.error('Failed to load most requested meals:', error);
        },
      });
  }
}
