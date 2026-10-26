import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { AppNotification, NotificationsApiResponse } from '../models/notification.model';
import { environment } from '../../../core/environments/environment';
import { UserDataService } from '../../../core/services/userData.service';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly userDataService = inject(UserDataService);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = environment.apiUrl;

  readonly notifications = signal<AppNotification[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /** Computed count of unread notifications */
  readonly unreadCount = computed(() => {
    return this.notifications().filter((n) => n.isReaded === false || n.isRead === false).length;
  });

  /** Total count of notifications */
  readonly totalCount = computed(() => this.notifications().length);

  constructor() {
    if (this.userDataService.getToken()) {
      this.loadNotifications();
    }
  }

  /**
   * Loads notifications from the backend API (/api/notifications).
   */
  loadNotifications(force = false): void {
    if (this.isLoading() && !force) {
      return;
    }

    if (!this.userDataService.getToken()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('PageNumber', '1')
      .set('PageSize', '50')
      .set('SortField', 'Id')
      .set('SortDirection', 'desc');

    const userId = this.userDataService.getUserId();
    if (userId) {
      params = params.set('UserId', userId.toString());
    }

    // Call GET /api/notifications
    this.http
      .get<NotificationsApiResponse | any>(`${this.apiUrl}/notifications`, { params })
      .pipe(
        catchError((err) => {
          console.warn('GET /api/notifications with params failed, trying fallback...', err);
          return this.http.get<any>(`${this.apiUrl}/notifications/GetAllNotifications`);
        }),
        catchError((err) => {
          console.error('All notifications endpoints failed:', err);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          const items = this.extractItems(response);
          // Sort items by date/id descending so the newest notifications are on top
          items.sort((a, b) => {
            const timeA = new Date(a.date || a.createdDate || a.createDate || 0).getTime();
            const timeB = new Date(b.date || b.createdDate || b.createDate || 0).getTime();
            if (timeB !== timeA) return timeB - timeA;
            return (b.id || 0) - (a.id || 0);
          });

          this.notifications.set(items);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load notifications:', err);
          this.error.set('تعذر تحميل الإشعارات');
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Marks all notifications as read.
   */
  markAllAsRead(): void {
    const current = this.notifications();
    if (current.length === 0) return;

    // Optimistic UI update
    this.notifications.set(
      current.map((item) => ({
        ...item,
        isRead: true,
        isReaded: true,
      }))
    );

    if (this.userDataService.getToken()) {
      this.http
        .post(`${this.apiUrl}/notifications/MarkAllNotificationAsRead`, {})
        .pipe(
          catchError((err) => {
            console.warn('Backend markAllAsRead failed or not supported:', err);
            return of(null);
          })
        )
        .subscribe();
    }
  }

  /**
   * Marks a single notification as read.
   */
  markAsRead(id: number): void {
    this.notifications.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isRead: true, isReaded: true } : item
      )
    );
  }

  /**
   * Deletes a notification by its ID.
   */
  deleteNotification(id: number): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));

    if (this.userDataService.getToken()) {
      this.http
        .delete(`${this.apiUrl}/notifications/${id}`)
        .pipe(
          catchError((err) => {
            console.warn('Backend delete notification failed:', err);
            return of(null);
          })
        )
        .subscribe();
    }
  }

  /**
   * Clears all notifications.
   */
  clearAll(): void {
    this.notifications.set([]);

    if (this.userDataService.getToken()) {
      this.http
        .delete(`${this.apiUrl}/notifications/DeleteAllNotifications`)
        .pipe(
          catchError((err) => {
            console.warn('Backend clear all notifications failed:', err);
            return of(null);
          })
        )
        .subscribe();
    }
  }

  /**
   * Extracts notification items array from any response format.
   */
  private extractItems(res: any): AppNotification[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.result)) return res.result;
    if (Array.isArray(res.result?.items)) return res.result.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  }
}
