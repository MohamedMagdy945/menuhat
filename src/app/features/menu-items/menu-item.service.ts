import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../core/environments/environment';
import { USE_GLOBAL_LOADING } from '../../core/loading/loading-context';
import { MenuItem, MenuItemsResponse } from './models';

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
