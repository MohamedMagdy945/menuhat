import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { IOrder } from '../../../cart/models/order';
import { environment } from '../../../../core/environments/environment';

export interface StatusConfig {
  label: string;
  classes: string;
}

@Component({
  selector: 'app-order-item-card',
  imports: [NgClass],
  templateUrl: './order-item-card.component.html',
  styleUrl: './order-item-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemCardComponent {
  readonly order = input.required<IOrder>();
  readonly cancelOrder = output<number>();
  readonly viewDetails = output<number>();

  private readonly filesUrl = environment.filesUrl;

  readonly logoUrl = computed(() => {
    const logo = this.order()?.logoURL;
    if (!logo) {
      return '/images/default.png';
    }
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    const cleanPath = logo.startsWith('/') ? logo : `/${logo}`;
    return `${this.filesUrl}${cleanPath}`;
  });

  readonly statusConfig = computed<StatusConfig>(() => {
    const statusId = this.order()?.orderStatusId;
    switch (statusId) {
      case 3: // قيد الانتظار
        return {
          label: 'قيد الانتظار',
          classes: 'bg-amber-50 text-amber-600',
        };
      case 5: // تم الشحن
        return {
          label: 'تم الشحن',
          classes: 'bg-orange-50 text-orange-500',
        };
      case 4: // تم التوصيل
        return {
          label: 'تم التوصيل',
          classes: 'bg-emerald-50 text-emerald-600',
        };
      case 1: // مكتمل
        return {
          label: 'مكتمل',
          classes: 'bg-emerald-50 text-emerald-600',
        };
      case 2: // ملغي
        return {
          label: 'ملغي',
          classes: 'bg-rose-50 text-rose-500',
        };
      default:
        return {
          label: 'قيد المتابعة',
          classes: 'bg-gray-50 text-gray-500',
        };
    }
  });

  readonly statusLabel = computed(() => {
    const statusName = this.order()?.orderStatusName_Ar;
    if (statusName) {
      return statusName;
    }
    return this.statusConfig().label;
  });

  readonly formattedDate = computed(() => {
    const raw = this.order()?.orderDate;
    if (!raw) return '';
    // If already contains Arabic text, return as is
    if (/[\u0600-\u06FF]/.test(raw)) {
      return raw;
    }
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const datePart = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d);

        const timePart = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(d);

        return `${datePart} • ${timePart}`;
      }
    } catch {
      // ignore
    }
    return raw;
  });

  readonly canCancel = computed(() => {
    const statusId = this.order()?.orderStatusId;
    return statusId === 3 || statusId === 0;
  });

  onCancel(): void {
    this.cancelOrder.emit(this.order().menuOrdersId);
  }

  onView(): void {
    this.viewDetails.emit(this.order().menuOrdersId);
  }
}
