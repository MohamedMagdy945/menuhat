import { StatusConfig } from '../models/status-config.model';

/** Label + pill classes for a customer order status id. */
export function getOrderStatusConfig(statusId: number | null | undefined): StatusConfig {
  switch (statusId) {
    case 3: // قيد الانتظار / في انتظار القبول
      return { label: 'في انتظار القبول', classes: 'bg-amber-50 text-amber-600' };
    case 5: // تم الشحن / جاري التوصيل
      return { label: 'جاري التوصيل', classes: 'bg-blue-50 text-blue-600' };
    case 4: // تم التوصيل
      return { label: 'تم التوصيل', classes: 'bg-emerald-50 text-emerald-600' };
    case 1: // مكتمل
      return { label: 'مكتمل', classes: 'bg-emerald-50 text-emerald-600' };
    case 2: // ملغي / مرفوض
      return { label: 'ملغي', classes: 'bg-rose-50 text-rose-500' };
    default:
      return { label: 'قيد المتابعة', classes: 'bg-slate-100 text-slate-600' };
  }
}

/** Only orders that are still waiting for the restaurant can be cancelled. */
export function canCancelOrder(statusId: number | null | undefined): boolean {
  return statusId === 3 || statusId === 0;
}
