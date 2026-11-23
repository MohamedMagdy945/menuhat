import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { ADMIN_API_ENDPOINTS } from '../../../core/constants/admin-api.constants';
import { AdminDashboardStats } from './models/admin-dashboard-stats.model';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private readonly _http = inject(HttpClient);

  readonly stats = signal<AdminDashboardStats | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  /** GET /Admin/GetDashboardStats */
  loadStats(): Observable<AdminDashboardStats> {
    this.isLoading.set(true);
    this.error.set(null);

    return this._http.get<AdminDashboardStats>(ADMIN_API_ENDPOINTS.dashboardStats).pipe(
      tap({
        next: (stats) => this.stats.set(stats),
        error: (err) => {
          console.error('Failed to load admin dashboard stats:', err);
          this.error.set('تعذر تحميل إحصائيات لوحة التحكم');
        },
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }
}
