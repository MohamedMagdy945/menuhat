import {
  Component,
  inject,
  signal,
  ElementRef,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { AppNotification } from '../../models/notification.model';
import { UserDataService } from '../../../../core/services/userData.service';
import { environment } from '../../../../core/environments/environment';
import { SideDrawerComponent } from '../../../../shared/components/side-drawer/side-drawer.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, SideDrawerComponent],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.css',
})
export class NotificationDropdownComponent implements OnInit {
  private readonly _notificationsService = inject(NotificationsService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _router = inject(Router);
  private readonly _elementRef = inject(ElementRef);

  readonly filesUrl = environment.filesUrl;

  readonly isOpen = signal<boolean>(false);
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

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.isUserLoggedIn()) {
      this.isDrawerOpen.set(false);
      this._router.navigate(['/login']);
      return;
    }

    const nextState = !this.isDrawerOpen();
    this.isDrawerOpen.set(nextState);

    if (nextState && this.notifications().length === 0) {
      this._notificationsService.loadNotifications(true);
    }
  }

  closeDropdown(): void {
    this.isDrawerOpen.set(false);
  }

  goToNotifications(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isDrawerOpen.set(false);
    this._router.navigate(['/notifications']);
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

    // Mark as read immediately
    this._notificationsService.markAsRead(item.id);
    this.isDrawerOpen.set(false);

    // Contextual navigation based on screenId or name
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

  getItemIcon(item: AppNotification): string {
    if (item.icon) return item.icon;

    const title = (item.title_Ar || item.title || '').toLowerCase();
    const name = item.name?.toLowerCase() || '';

    if (title.includes('رفض') || title.includes('could not')) {
      return 'cancel';
    }
    if (title.includes('توصيل') || title.includes('progress')) {
      return 'delivery_dining';
    }
    if (title.includes('قبول') || title.includes('اكتمال') || title.includes('accepted') || title.includes('completed')) {
      return 'check_circle';
    }
    if (item.screenId === 4 || item.orderId || name === 'myorders' || title.includes('طلب')) {
      return 'receipt_long';
    }
    if (item.screenId === 1 || name === 'clientmenus' || title.includes('قائمة') || title.includes('menu')) {
      return 'restaurant_menu';
    }
    return 'notifications';
  }

  getItemIconClass(item: AppNotification): { bg: string; text: string } {
    const title = (item.title_Ar || item.title || '').toLowerCase();
    const name = item.name?.toLowerCase() || '';

    if (title.includes('رفض') || title.includes('could not') || title.includes('ملغي')) {
      return { bg: 'bg-red-50', text: 'text-red-500' };
    }
    if (title.includes('توصيل') || title.includes('progress')) {
      return { bg: 'bg-blue-50', text: 'text-blue-600' };
    }
    if (title.includes('قبول') || title.includes('اكتمال') || title.includes('accepted') || title.includes('completed')) {
      return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
    }
    if (item.screenId === 4 || item.orderId || name === 'myorders' || title.includes('طلب')) {
      return { bg: 'bg-gray-100', text: 'text-gray-500' };
    }
    if (item.screenId === 1 || name === 'clientmenus' || title.includes('قائمة') || title.includes('menu')) {
      return { bg: 'bg-orange-50', text: 'text-orange-500' };
    }
    return { bg: 'bg-slate-100', text: 'text-slate-600' };
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }
}
