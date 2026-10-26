import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationsService } from './services/notifications.service';
import { UserDataService } from '../../core/services/userData.service';
import { AppNotification } from './models/notification.model';
import { NotificationCardComponent } from './components/notification-card/notification-card.component';

export type NotificationTab = 'all' | 'unread' | 'orders' | 'menus';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NotificationCardComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {
  readonly notificationsService = inject(NotificationsService);
  readonly userDataService = inject(UserDataService);
  private readonly router = inject(Router);

  readonly activeTab = signal<NotificationTab>('all');
  readonly searchQuery = signal<string>('');

  readonly notifications = this.notificationsService.notifications;
  readonly isLoading = this.notificationsService.isLoading;
  readonly unreadCount = this.notificationsService.unreadCount;
  readonly allCount = computed(() => this.notifications().length);

  readonly ordersCount = computed(() => {
    return this.notifications().filter(
      (n) => n.screenId === 4 || n.orderId || n.name === 'MyOrders' || (n.title_Ar && n.title_Ar.includes('طلب'))
    ).length;
  });

  readonly menusCount = computed(() => {
    return this.notifications().filter(
      (n) => n.screenId === 1 || n.name === 'ClientMenus' || n.serial || (n.title_Ar && n.title_Ar.includes('قائمة'))
    ).length;
  });

  readonly filteredNotifications = computed(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.notifications();

    // Filter by tab
    if (tab === 'unread') {
      list = list.filter((n) => n.isReaded === false || n.isRead === false);
    } else if (tab === 'orders') {
      list = list.filter(
        (n) => n.screenId === 4 || n.orderId || n.name === 'MyOrders' || (n.title_Ar && n.title_Ar.includes('طلب'))
      );
    } else if (tab === 'menus') {
      list = list.filter(
        (n) => n.screenId === 1 || n.name === 'ClientMenus' || n.serial || (n.title_Ar && n.title_Ar.includes('قائمة'))
      );
    }

    // Filter by search query
    if (query) {
      list = list.filter((n) => {
        const titleAr = (n.title_Ar || '').toLowerCase();
        const titleEn = (n.title_En || '').toLowerCase();
        const descAr = (n.description_Ar || '').toLowerCase();
        const descEn = (n.description_En || '').toLowerCase();
        const serial = (n.orderSerial || n.serial || '').toLowerCase();
        return (
          titleAr.includes(query) ||
          titleEn.includes(query) ||
          descAr.includes(query) ||
          descEn.includes(query) ||
          serial.includes(query)
        );
      });
    }

    return list;
  });

  ngOnInit(): void {
    if (this.userDataService.getToken()) {
      this.notificationsService.loadNotifications();
    }
  }

  setTab(tab: NotificationTab): void {
    this.activeTab.set(tab);
  }

  refresh(): void {
    this.notificationsService.loadNotifications(true);
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }

  onMarkAsRead(item: AppNotification): void {
    this.notificationsService.markAsRead(item.id);
  }

  onDeleteNotification(item: AppNotification): void {
    this.notificationsService.deleteNotification(item.id);
  }

  onViewDetails(item: AppNotification): void {
    this.notificationsService.markAsRead(item.id);

    if (item.screenId === 4 || item.orderId || item.orderSerial || item.name === 'MyOrders') {
      this.router.navigate(['/my-orders']);
    } else if (item.screenId === 1 || item.name === 'ClientMenus' || item.serial) {
      this.router.navigate(['/restaurants']);
    }
  }

  clearAll(): void {
    if (confirm('هل أنت متأكد من مسح جميع الإشعارات؟')) {
      this.notificationsService.clearAll();
    }
  }
}
