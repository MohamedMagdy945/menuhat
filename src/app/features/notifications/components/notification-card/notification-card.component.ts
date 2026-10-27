import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { AppNotification } from '../../models/notification.model';
import { environment } from '../../../../core/environments/environment';

export interface NotificationStatusConfig {
  bg: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  label: string;
}

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCardComponent {
  readonly item = input.required<AppNotification>();

  readonly markAsRead = output<AppNotification>();
  readonly deleteNotification = output<AppNotification>();
  readonly viewDetails = output<AppNotification>();

  private readonly filesUrl = environment.filesUrl;

  readonly isUnread = computed(() => {
    const it = this.item();
    return it.isReaded === false || it.isRead === false;
  });

  readonly title = computed(() => {
    const it = this.item();
    return it.title_Ar || it.title || it.title_En || 'إشعار جديد';
  });

  readonly description = computed(() => {
    const it = this.item();
    return (
      it.description_Ar ||
      it.description ||
      it.message ||
      it.body ||
      it.description_En ||
      ''
    );
  });

  readonly photoUrl = computed(() => {
    const photo = this.item().photo;
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    return `${this.filesUrl}${photo}`;
  });

  readonly icon = computed(() => {
    const it = this.item();
    if (it.icon) return it.icon;

    const t = (it.title_Ar || it.title || '').toLowerCase();
    const name = it.name?.toLowerCase() || '';

    if (t.includes('رفض') || t.includes('could not')) return 'cancel';
    if (t.includes('توصيل') || t.includes('progress')) return 'delivery_dining';
    if (t.includes('قبول') || t.includes('اكتمال') || t.includes('accepted') || t.includes('completed')) {
      return 'check_circle';
    }
    if (it.screenId === 4 || it.orderId || name === 'myorders' || t.includes('طلب')) {
      return 'receipt_long';
    }
    if (it.screenId === 1 || name === 'clientmenus' || t.includes('قائمة') || t.includes('menu')) {
      return 'restaurant_menu';
    }
    return 'notifications';
  });

  readonly statusConfig = computed<NotificationStatusConfig>(() => {
    const it = this.item();
    const t = (it.title_Ar || it.title || '').toLowerCase();
    const name = it.name?.toLowerCase() || '';

    if (t.includes('رفض') || t.includes('could not') || t.includes('ملغي')) {
      return {
        bg: 'bg-rose-50 text-rose-600',
        text: 'text-rose-600',
        badgeBg: 'bg-rose-50 text-rose-700',
        badgeText: '',
        label: 'طلب مرفوض',
      };
    }
    if (t.includes('توصيل') || t.includes('progress')) {
      return {
        bg: 'bg-blue-50 text-blue-600',
        text: 'text-blue-600',
        badgeBg: 'bg-blue-50 text-blue-700',
        badgeText: '',
        label: 'جاري التوصيل',
      };
    }
    if (t.includes('قبول') || t.includes('accepted')) {
      return {
        bg: 'bg-emerald-50 text-emerald-600',
        text: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700',
        badgeText: '',
        label: 'تم القبول',
      };
    }
    if (t.includes('اكتمال') || t.includes('completed')) {
      return {
        bg: 'bg-emerald-50 text-emerald-600',
        text: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700',
        badgeText: '',
        label: 'مكتمل',
      };
    }
    if (it.screenId === 4 || it.orderId || name === 'myorders' || t.includes('طلب')) {
      return {
        bg: 'bg-gray-100 text-gray-500',
        text: 'text-gray-500',
        badgeBg: 'bg-amber-50 text-amber-700',
        badgeText: '',
        label: 'تحديث طلب',
      };
    }
    if (it.screenId === 1 || name === 'clientmenus' || t.includes('قائمة') || t.includes('menu')) {
      return {
        bg: 'bg-orange-50 text-orange-600',
        text: 'text-orange-600',
        badgeBg: 'bg-orange-50 text-orange-700',
        badgeText: '',
        label: 'قائمة جديدة',
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-600',
      text: 'text-slate-600',
      badgeBg: 'bg-slate-100 text-slate-700',
      badgeText: '',
      label: 'إشعار',
    };
  });

  readonly timeAgo = computed(() => {
    const it = this.item();
    const dateStr = it.date || it.createdDate || it.createDate;
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
  });

  onCardClick(): void {
    this.viewDetails.emit(this.item());
  }

  onMarkRead(event: Event): void {
    event.stopPropagation();
    this.markAsRead.emit(this.item());
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.deleteNotification.emit(this.item());
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(this.item());
  }
}
