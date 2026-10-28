import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { AppNotification } from '../../models/notification.model';
import { UserDataService } from '../../../../core/services/userData.service';
import { environment } from '../../../../core/environments/environment';
import { SideDrawerComponent } from '../../../../shared/components/side-drawer/side-drawer.component';

@Component({
  selector: 'app-notification-side-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, SideDrawerComponent],
  templateUrl: './notification-side-drawer.component.html',
  styleUrl: './notification-side-drawer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationSideDrawerComponent implements OnInit {
  private readonly _notificationsService = inject(NotificationsService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _router = inject(Router);

  readonly filesUrl = environment.filesUrl;

  readonly isDrawerOpen = signal<boolean>(false);
  readonly notifications = this._notificationsService.notifications;
  readonly unreadCount = this._notificationsService.unreadCount;
  readonly totalCount = this._notificationsService.totalCount;
  readonly isLoading = this._notificationsService.isLoading;

  ngOnInit(): void {
    if (this.isUserLoggedIn() && this.notifications().length === 0) {
      this._notificationsService.loadNotifications();
    }
  }

  isUserLoggedIn(): boolean {
    return !!(this._userDataService.isAuthenticated() || this._userDataService.getToken());
  }

  open(): void {
    this.isDrawerOpen.set(true);
    if (this.notifications().length === 0) {
      this._notificationsService.loadNotifications(true);
    }
  }

  close(): void {
    this.closeDrawer();
  }

  toggleDrawer(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const nextState = !this.isDrawerOpen();
    this.isDrawerOpen.set(nextState);

    if (nextState && this.notifications().length === 0) {
      this._notificationsService.loadNotifications(true);
    }
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  markAllAsRead(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this._notificationsService.markAllAsRead();
  }

  markAsRead(item: AppNotification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this._notificationsService.markAsRead(item.id);
  }

  deleteItem(item: AppNotification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this._notificationsService.deleteNotification(item.id);
  }

  clearAll(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this._notificationsService.clearAll();
  }

  handleItemClick(item: AppNotification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this._notificationsService.markAsRead(item.id);
    this.isDrawerOpen.set(false);

    if (item.screenId === 4 || item.orderId || item.orderSerial || item.name === 'MyOrders') {
      this._router.navigate(['/my-orders']);
    } else if (item.screenId === 1 || item.name === 'ClientMenus' || item.serial) {
      this._router.navigate(['/restaurants']);
    }
  }

  getItemTitle(item: AppNotification): string {
    return item.title_Ar || item.title || item.title_En || 'إشعار جديد';
  }

  getItemDescription(item: AppNotification): string {
    return (
      item.description_Ar ||
      item.description ||
      item.message ||
      item.body ||
      item.description_En ||
      ''
    );
  }

  getItemPhotoUrl(item: AppNotification): string | null {
    if (!item.photo) {
      return null;
    }
    if (item.photo.startsWith('http')) {
      return item.photo;
    }
    return `${this.filesUrl}${item.photo}`;
  }

  getTimeAgo(dateStr?: string): string {
    if (!dateStr) return 'الآن';
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 1) return 'الآن';
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      if (diffHours === 1) return 'منذ ساعة';
      if (diffHours === 2) return 'منذ ساعتين';
      if (diffHours < 24) return `منذ ${diffHours} ساعات`;
      if (diffDays === 1) return 'أمس';
      if (diffDays === 2) return 'منذ يومين';
      if (diffDays < 7) return `منذ ${diffDays} أيام`;
      if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
      if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`;
      return past.toLocaleDateString('ar-EG');
    } catch {
      return 'مؤخراً';
    }
  }
}
