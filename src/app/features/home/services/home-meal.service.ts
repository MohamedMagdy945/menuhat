import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';

import { MostRequestedQuery } from '../models/most-requested-query';
import { USE_GLOBAL_LOADING } from '../../../core/loading/loading-context';
import { environment } from '../../../core/environments/environment';
import { MenuProduct } from '../models/menu.product.model';

@Injectable({
  providedIn: 'root',
})
export class HomeMealService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  readonly mostRequested = signal<MenuProduct[]>([]);
  readonly mostRequestedPage = signal(1);
  readonly mostRequestedHasNext = signal(true);

  loadMostRequested(extraParams: Partial<MostRequestedQuery> = {}): void {
    if (!this.mostRequestedHasNext()) {
      return;
    }

    const params = {
      SortField: 'rowNo',
      PageNumber: this.mostRequestedPage(),
      PageSize: 10,
      ...extraParams,
    };

    this.http
      .get<any>(`${this.apiUrl}/EMHome/Mostrequested`, {
        params: params as any,
        context: new HttpContext().set(USE_GLOBAL_LOADING, true),
      })
      .subscribe({
        next: (response) => {
          const items = Array.isArray(response?.items) ? response.items : [];

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
