import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { IOrder } from '../../../cart/models/i-order.model';
import { OrderDetailsLine } from '../../models/order-details-line.model';
import { OrderTypeInfo } from '../../models/order-type-info.model';
import { StatusConfig } from '../../models/status-config.model';
import { canCancelOrder, getOrderStatusConfig } from '../../utils/order-status';
import { formatOrderDate } from '../../utils/order-date';
import { resolveOrderImageUrl } from '../../utils/order-image-url';
import { getOrderTypeInfo } from '../../utils/order-type';

/** Full details of one customer order, shown as a bottom sheet (centered dialog on desktop). */
@Component({
  selector: 'app-order-details',
  imports: [NgClass, DecimalPipe],
  templateUrl: './order-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent {
  /** The order to show; null keeps the sheet closed. */
  readonly order = input<IOrder | null>(null);

  readonly closed = output<void>();
  readonly cancelOrder = output<number>();

  readonly statusConfig = computed<StatusConfig>(() =>
    getOrderStatusConfig(this.order()?.orderStatusId),
  );
  readonly statusLabel = computed(
    () => this.order()?.orderStatusName_Ar || this.statusConfig().label,
  );
  readonly formattedDate = computed(() => formatOrderDate(this.order()?.orderDate));
  readonly canCancel = computed(() => canCancelOrder(this.order()?.orderStatusId));
  readonly isCancelled = computed(() => this.order()?.orderStatusId === 2);

  readonly logoUrl = computed(() =>
    resolveOrderImageUrl(this.order()?.logoURL, '/images/default-restaurant.png'),
  );

  readonly orderType = computed<OrderTypeInfo | null>(() =>
    getOrderTypeInfo(this.order()?.orderTypeId),
  );

  readonly lines = computed<OrderDetailsLine[]>(() =>
    (this.order()?.details ?? []).map((detail, index) => {
      const product = detail.menuProducts?.[0];
      const quantity = Number(detail.quantity ?? 0);
      const price = Number(detail.price ?? product?.price ?? 0);
      return {
        id: detail.id ?? index,
        name: product?.name?.trim() || `صنف #${index + 1}`,
        size: (detail.title as string | null)?.trim() || null,
        quantity,
        price,
        total: Number(detail.total ?? price * quantity),
        imageUrl: resolveOrderImageUrl(product?.photoURL, '/images/default-meal.png'),
      };
    }),
  );

  readonly itemsCount = computed(() => this.lines().reduce((sum, line) => sum + line.quantity, 0));

  /** Backend total, falling back to the sum of the lines. */
  readonly total = computed(
    () => this.order()?.orderTotal || this.lines().reduce((sum, line) => sum + line.total, 0),
  );

  close(): void {
    this.closed.emit();
  }

  onCancel(): void {
    const order = this.order();
    if (order) {
      this.cancelOrder.emit(order.menuOrdersId);
    }
  }

  onImageError(event: Event, fallback: string): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(fallback)) {
      img.src = fallback;
    }
  }
}
