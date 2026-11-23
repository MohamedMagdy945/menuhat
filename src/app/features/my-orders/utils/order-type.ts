import { OrderTypeInfo } from '../models/order-type-info.model';

/** Label + Material icon for an order type id (null when unknown). */
export function getOrderTypeInfo(orderTypeId: number | null | undefined): OrderTypeInfo | null {
  switch (orderTypeId) {
    case 1:
      return { label: 'دليفري', icon: 'moped' };
    case 2:
      return { label: 'داخل السيارة', icon: 'directions_car' };
    case 3:
      return { label: 'تيك أواي', icon: 'shopping_bag' };
    case 4:
      return { label: 'داخل المطعم', icon: 'restaurant' };
    default:
      return null;
  }
}
