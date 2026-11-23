import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { IOrder } from '../../../cart/models/i-order.model';
import { StatusConfig } from '../../models/status-config.model';
import { OrderTypeInfo } from '../../models/order-type-info.model';
import { canCancelOrder, getOrderStatusConfig } from '../../utils/order-status';
import { formatOrderDate } from '../../utils/order-date';
import { resolveOrderImageUrl } from '../../utils/order-image-url';
import { getOrderTypeInfo } from '../../utils/order-type';

@Component({
  selector: 'app-order-item-card',
  imports: [NgClass, DecimalPipe],
  templateUrl: './order-item-card.component.html',
  styleUrl: './order-item-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemCardComponent {
  readonly order = input.required<IOrder>();
  readonly cancelOrder = output<number>();
  readonly viewDetails = output<number>();

  readonly logoUrl = computed(() =>
    resolveOrderImageUrl(this.order()?.logoURL, '/images/default-restaurant.png'),
  );

  readonly statusConfig = computed<StatusConfig>(() =>
    getOrderStatusConfig(this.order()?.orderStatusId),
  );

  readonly statusLabel = computed(
    () => this.order()?.orderStatusName_Ar || this.statusConfig().label,
  );

  readonly formattedDate = computed(() => formatOrderDate(this.order()?.orderDate));

  readonly orderType = computed<OrderTypeInfo | null>(() =>
    getOrderTypeInfo(this.order()?.orderTypeId),
  );

  /** Total quantity of all products in the order. */
  readonly itemsCount = computed(() =>
    (this.order()?.details ?? []).reduce((sum, d) => sum + Number(d.quantity ?? 0), 0),
  );

  readonly canCancel = computed(() => canCancelOrder(this.order()?.orderStatusId));

  onCancel(): void {
    this.cancelOrder.emit(this.order().menuOrdersId);
  }

  onView(): void {
    this.viewDetails.emit(this.order().menuOrdersId);
  }
}
