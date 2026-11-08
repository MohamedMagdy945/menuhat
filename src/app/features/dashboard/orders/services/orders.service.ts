import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../core/environments/environment';
import { DASHBOARD_API_ENDPOINTS } from '../../../../core/constants/dashboard-api.constants';
import {
  OrderCardData,
  OwnerOrderDetails,
  OrderItemDetail,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly filesUrl = environment.filesUrl;

  readonly orders = signal<OrderCardData[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly currentOrder = signal<OwnerOrderDetails | null>(null);
  readonly isLoadingOrder = signal<boolean>(false);
  readonly actionInProgress = signal<boolean>(false);

  // =========================================================================
  // 1. GET /MenusOrders/GetOrdersOfMenusByUId (No Params - Uses Bearer Token)
  // =========================================================================
  getOrdersOfMenusByUId(): Observable<OrderCardData[]> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.ownerMenusOrders).pipe(
      map((res) => {
        let list: any[] = [];
        const raw = res?.result ?? res?.data ?? res;

        if (Array.isArray(raw)) {
          // Flatten details from grouped response e.g. [{ main: {...}, details: [...] }]
          for (const entry of raw) {
            if (Array.isArray(entry?.details)) {
              list.push(...entry.details);
            } else if (entry) {
              list.push(entry);
            }
          }
        } else if (raw && Array.isArray(raw.details)) {
          list = raw.details;
        } else if (raw && Array.isArray(raw.orders)) {
          list = raw.orders;
        } else if (raw && Array.isArray(raw.currentOrders)) {
          list = raw.currentOrders;
        }

        if (list.length === 0) {
          return [];
        }

        const mapped: OrderCardData[] = list.map((item: any, idx: number): OrderCardData => {
          const orderId = item.id ?? item.orderId ?? item.menuOrdersId ?? (idx + 1);
          const code = `#${orderId}`;

          const rawName = (item.userName ?? item.customerName ?? item.fullName ?? item.clientName ?? item.name ?? 'عميل').trim();

          const rawDate = item.orderDate ?? item.createdAt ?? item.time ?? item.date;
          const time = this.formatOrderTime(rawDate);

          const rawPrice =
            item.orderTotal ??
            item.totalAmount ??
            item.totalPrice ??
            item.price ??
            item.total ??
            0;
          const numPrice = Number(rawPrice) || 0;
          const formattedPrice = numPrice % 1 === 0 ? `${numPrice}.0` : numPrice.toString();

          const statusId = Number(item.orderStatusId ?? item.statusId ?? 1);
          const rawStatusName = item.orderStatusName ?? item.orderStatusName_Ar ?? item.statusLabel ?? '';
          const statusInfo = this.resolveOrderStatus(statusId, rawStatusName);

          return {
            id: orderId,
            orderNumber: code,
            customerName: rawName,
            time,
            price: numPrice,
            formattedPrice,
            status: rawStatusName || 'Pending approval',
            statusId,
            statusLabel: statusInfo.label,
            statusColor: statusInfo.color,
            isPending: statusId === 1 || statusInfo.label.includes('انتظار'),
            phone: item.mobile ?? item.mobile2 ?? item.customerPhone ?? item.phone ?? '',
            createdAt: rawDate,
          };
        });

        return mapped.sort((a: OrderCardData, b: OrderCardData) => this.compareOrdersDesc(a, b));
      }),
      tap({
        next: (items) => {
          this.orders.set(items);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('[OrdersService] Error loading orders:', err);
          this.errorMessage.set('فشل في تحميل الطلبات من السيرفر');
          this.orders.set([]);
          this.isLoading.set(false);
        },
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of([]);
      })
    );
  }

  // =========================================================================
  // 2. GET /MenusOrders/GetOrderDetails/{id}
  // =========================================================================
  getOrderDetails(orderId: number | string): Observable<OwnerOrderDetails | null> {
    this.isLoadingOrder.set(true);
    this.errorMessage.set(null);
    this.currentOrder.set(null);

    const cleanId = orderId.toString().replace(/^#/, '').trim();
    const url = `${DASHBOARD_API_ENDPOINTS.ownerGetOrderDetails}/${cleanId}`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? res?.value ?? res;
        return this.mapToOwnerOrder(raw, cleanId);
      }),
      tap({
        next: (order) => {
          this.currentOrder.set(order);
          this.isLoadingOrder.set(false);
        },
        error: (err) => {
          console.error('[OrdersService] Error loading details:', err);
          this.errorMessage.set('تعذر تحميل تفاصيل الطلب');
          this.currentOrder.set(null);
          this.isLoadingOrder.set(false);
        },
      }),
      catchError(() => {
        this.isLoadingOrder.set(false);
        return of(null);
      })
    );
  }

  // =========================================================================
  // 3. POST /MenusOrders/Receive
  // =========================================================================
  receiveOrder(orderId: number | string): Observable<any> {
    this.actionInProgress.set(true);
    const cleanId = orderId.toString().replace(/^#/, '').trim();
    const body = { id: cleanId, menuOrderId: cleanId, orderId: cleanId };

    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.receiveOwnerOrder, body).pipe(
      tap({
        next: () => {
          this.actionInProgress.set(false);

          // 1. Update currentOrder if open
          this.currentOrder.update((curr) =>
            curr ? { ...curr, statusId: 2, statusLabel: 'جاري التجهيز', statusVariant: 'info' } : curr
          );

          // 2. Optimistically update list
          this.orders.update((list) =>
            list.map((o) =>
              o.id.toString() === cleanId
                ? {
                    ...o,
                    statusId: 2,
                    statusLabel: 'جاري التجهيز',
                    statusColor: 'bg-amber-50 text-amber-600 border border-amber-100/70',
                    isPending: false,
                  }
                : o
            )
          );
        },
        error: () => this.actionInProgress.set(false),
      })
    );
  }

  // =========================================================================
  // 4. POST /MenusOrders/Cancel
  // =========================================================================
  cancelOrder(orderId: number | string, reason = 'تم الرفض بواسطة المطعم'): Observable<any> {
    this.actionInProgress.set(true);
    const cleanId = orderId.toString().replace(/^#/, '').trim();
    const body = { id: cleanId, menuOrderId: cleanId, orderId: cleanId, reason };

    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.cancelOwnerOrder, body).pipe(
      tap({
        next: () => {
          this.actionInProgress.set(false);

          // 1. Update currentOrder if open
          this.currentOrder.update((curr) =>
            curr ? { ...curr, statusId: 5, statusLabel: 'مرفوض', statusVariant: 'danger' } : curr
          );

          // 2. Optimistically update list
          this.orders.update((list) =>
            list.map((o) =>
              o.id.toString() === cleanId
                ? {
                    ...o,
                    statusId: 5,
                    statusLabel: 'مرفوض',
                    statusColor: 'bg-rose-50 text-rose-500 border border-rose-100/70',
                    isPending: false,
                  }
                : o
            )
          );
        },
        error: () => this.actionInProgress.set(false),
      })
    );
  }

  // =========================================================================
  // Helpers
  // =========================================================================
  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${this.filesUrl}${path}`;
  }

  formatOrderTime(raw: string | undefined): string {
    if (!raw) return 'الآن';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      const today = new Date();
      const isToday =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();

      const hours = d.getHours();
      const mins = d.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'م' : 'ص';
      const h = (hours % 12 || 12).toString().padStart(2, '0');
      const timeStr = `${h}:${mins} ${period}`;

      if (isToday) {
        return `اليوم، ${timeStr}`;
      }
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${year}/${month}/${day} ، ${timeStr}`;
    } catch {
      return raw;
    }
  }

  resolveOrderStatus(statusId?: number, statusName?: string): { label: string; color: string } {
    const nameLower = (statusName || '').toLowerCase().trim();

    // 1. Pending approval ("قيد الانتظار" with green badge)
    if (statusId === 1 || nameLower.includes('pending') || nameLower.includes('انتظار')) {
      return {
        label: 'قيد الانتظار',
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-100/70',
      };
    }

    // On the road ("في الطريق" with blue badge)
    if (nameLower.includes('road') || nameLower.includes('way') || nameLower.includes('طريق') || nameLower.includes('توصيل')) {
      return {
        label: 'في الطريق',
        color: 'bg-sky-50 text-sky-600 border border-sky-100/70',
      };
    }

    // 2. Approved and being prepared ("جاري التجهيز" with amber badge)
    if (
      statusId === 2 ||
      nameLower.includes('approved') ||
      nameLower.includes('preparing') ||
      nameLower.includes('تجهيز') ||
      nameLower.includes('تحضير')
    ) {
      return {
        label: 'جاري التجهيز',
        color: 'bg-amber-50 text-amber-600 border border-amber-100/70',
      };
    }

    // 5. Rejected ("مرفوض" with rose badge)
    if (statusId === 5 || nameLower.includes('reject') || nameLower.includes('مرفوض') || nameLower.includes('ملغي')) {
      return {
        label: 'مرفوض',
        color: 'bg-rose-50 text-rose-500 border border-rose-100/70',
      };
    }

    // 3 or 4: Completed ("مكتمل" with emerald badge)
    if (
      statusId === 4 ||
      statusId === 3 ||
      nameLower.includes('completed') ||
      nameLower.includes('delivered') ||
      nameLower.includes('مكتمل')
    ) {
      return {
        label: 'مكتمل',
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-100/70',
      };
    }

    return {
      label: statusName || 'قيد الانتظار',
      color: 'bg-emerald-50 text-emerald-600 border border-emerald-100/70',
    };
  }

  private mapToOwnerOrder(raw: any, fallbackId: number | string): OwnerOrderDetails {
    let data = raw;
    if (Array.isArray(raw) && raw.length > 0) {
      data = raw[0];
    }

    const main = data?.main ?? data?.order ?? data ?? {};
    const orderId = main?.id ?? main?.orderId ?? main?.menuOrdersId ?? fallbackId;
    const serial = main?.serial ?? main?.serialOrder ?? main?.orderCode ?? main?.orderNumber ?? orderId;
    const statusId = Number(main?.orderStatusId ?? main?.statusId ?? 1);

    // Order type determination
    let orderType = 'طلب داخلي';
    if (main?.tableNumber) {
      orderType = `داخلي - طاولة ${main.tableNumber}`;
    } else if (main?.carNo) {
      orderType = `استلام سيارة - ${main.carType || ''} ${main.carNo}`.trim();
    } else if (main?.isDelivery || main?.address || main?.deliveryService) {
      orderType = 'طلب توصيل (دليفري)';
    }

    const statusInfo = this.resolveOrderStatus(statusId, main?.orderStatusName ?? main?.orderStatusName_Ar);
    let statusVariant: 'warning' | 'success' | 'info' | 'danger' | 'default' = 'warning';
    if (statusId === 1) statusVariant = 'warning';
    else if (statusId === 2) statusVariant = 'info';
    else if (statusId === 5) statusVariant = 'danger';
    else statusVariant = 'success';

    const rawDetails: any[] =
      data?.details ??
      data?.items ??
      data?.products ??
      data?.menuOrderDetails ??
      main?.details ??
      main?.items ??
      [];

    const items: OrderItemDetail[] = rawDetails.map((det: any, idx: number) => {
      const product = det.menuProducts?.[0] ?? det.product ?? det.menuProduct ?? {};
      const q = Number(det.quantity ?? det.count ?? det.qty ?? 1);
      const p = Number(det.price ?? det.unitPrice ?? product.price ?? (det.total && q ? det.total / q : 0));
      const t = Number(det.total ?? det.totalPrice ?? p * q);
      const name = product.name ?? product.productName ?? product.title ?? det.name ?? det.productName ?? `صنف #${idx + 1}`;
      const description = product.description ?? product.productDescription ?? det.description ?? '';
      const photo = product.photoURL ?? product.image ?? product.imageUrl ?? det.photoURL ?? det.image;

      return {
        id: det.id ?? idx + 1,
        name,
        description,
        quantity: q,
        unitPrice: p,
        totalPrice: t,
        image: this.resolveImageUrl(photo),
      };
    });

    const rawDate = main?.orderDate ?? main?.createdAt ?? main?.time;
    const dateTime = rawDate ? this.formatOrderTime(rawDate) : '';

    const customerName = (main?.userName ?? main?.fullName ?? main?.clientName ?? main?.customerName ?? 'عميل').trim();
    const customerAddress = (main?.address ?? main?.customerAddress ?? '').trim();
    const customerPhone = (main?.mobile ?? main?.mobile2 ?? main?.phone ?? main?.customerPhone ?? '').trim();
    const totalPrice = Number(main?.orderTotal ?? main?.totalAmount ?? main?.totalPrice ?? main?.price ?? main?.total ?? 0);

    return {
      id: orderId,
      orderCode: serial.toString().startsWith('#') ? serial : `#${serial}`,
      statusId,
      statusLabel: statusInfo.label,
      statusVariant,
      dateTime,
      orderType,
      customerName,
      customerAddress,
      customerPhone,
      totalPrice,
      currency: 'ج.م',
      itemsCount: items.length,
      items,
    };
  }

  private parseTimestamp(dateStr?: string): number {
    if (!dateStr) return 0;
    const direct = new Date(dateStr).getTime();
    if (!isNaN(direct) && direct > 0) return direct;
    const withT = new Date(dateStr.replace(' ', 'T')).getTime();
    if (!isNaN(withT) && withT > 0) return withT;
    return 0;
  }

  private compareOrdersDesc(a: OrderCardData, b: OrderCardData): number {
    const timeA = this.parseTimestamp(a.createdAt);
    const timeB = this.parseTimestamp(b.createdAt);
    if (timeA && timeB && timeA !== timeB) {
      return timeB - timeA;
    }
    const idA = Number(a.id);
    const idB = Number(b.id);
    if (!isNaN(idA) && !isNaN(idB)) {
      return idB - idA;
    }
    return 0;
  }
}

