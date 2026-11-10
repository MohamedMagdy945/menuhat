import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { UserDataService } from '../../auth/services/user-storage.service';
import { DASHBOARD_API_ENDPOINTS } from '../../../core/constants/dashboard-api.constants';
import { environment } from '../../../core/environments/environment';

export interface DashboardRestaurant {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  isOpen: boolean;
  isVisible: boolean;
  profileUrl: string;
  coverUrl: string;
  pdfUrl: string;
  qrCodeUrl: string | null;
  visitsCount: number;
  backgroundColor?: string | null;
  bgColor?: string | null;
}

export interface DashboardStatistics {
  totalOrders: number;
  newOrders: number;
  preparingOrders: number;
  completedOrders: number;
  totalSales: number;
  salesGrowthPercentage: number;
}

export interface DashboardOrder {
  orderId?: number | string;
  id?: string | number;
  orderNumber?: string;
  customerName?: string;
  totalAmount?: number;
  price?: number;
  orderStatusId?: number;
  orderStatusName?: string;
  createdAt?: string;
  time?: string;
  status?: string;
  statusLabel?: string;
  statusColor?: string;
  [key: string]: any;
}

export interface OrderCardData {
  id: string | number;
  orderNumber: string;
  customerName: string;
  time: string;
  price: number;
  formattedPrice: string;
  status: string;
  statusId?: number;
  statusLabel: string;
  statusColor: string;
  isPending?: boolean;
  phone?: string;
  createdAt?: string;
}

export interface OrderItemDetail {
  id: number | string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
}

export interface OwnerOrderDetails {
  id: number | string;
  orderCode: string;
  statusId: number;
  statusLabel: string;
  statusVariant: 'warning' | 'success' | 'info' | 'danger' | 'default';
  dateTime: string;
  orderType: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  totalPrice: number;
  currency: string;
  itemsCount: number;
  items: OrderItemDetail[];
}

export interface DashboardResponse {
  restaurant: DashboardRestaurant;
  statistics: DashboardStatistics;
  currentOrders: DashboardOrder[];
}

export interface NavBadge {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: NavBadge;
  external?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  items: NavItem[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly _http = inject(HttpClient);
  private readonly _userDataService = inject(UserDataService);

  readonly dashboardData = signal<DashboardResponse | null>(null);
  readonly isLoadingDashboard = signal<boolean>(false);
  readonly dashboardError = signal<string | null>(null);

  // Orders State
  readonly currentOrder = signal<OwnerOrderDetails | null>(null);
  readonly isLoadingOrder = signal<boolean>(false);
  readonly orderActionInProgress = signal<boolean>(false);

  /**
   * Computed orders list matching the exact Dashboard API response
   */
  readonly orders = computed<OrderCardData[]>(() => {
    const data = this.dashboardData();
    const list = data?.currentOrders ?? [];
    const mapped: OrderCardData[] = list.map((order: any, index: number): OrderCardData => {
      // 1. Order ID (orderId from API: e.g. 25952, 23956)
      const id = order.orderId ?? order.id ?? order.menuOrdersId ?? (index + 1);

      // 2. Order Number / Code (orderNumber from API: e.g. "axttu5521" -> "axttu5521#")
      let code = (order.orderNumber ?? order.serialOrder ?? order.serial ?? order.number ?? id).toString().trim();
      if (code && !code.endsWith('#') && !code.startsWith('#')) {
        code = `${code}#`;
      }

      // 3. Customer Name (customerName from API: e.g. "Abd-Elrahman", "Abdo ")
      let rawName = (order.customerName ?? order.clientName ?? order.fullName ?? order.name ?? 'عميل').trim();

      // Clean customer name if it still has code prefixed
      const match = rawName.match(/^([a-zA-Z0-9_\-]+)\s+(.+)$/);
      if (match && code.includes(match[1])) {
        rawName = match[2].trim();
      }

      // 4. Date & Time (createdAt from API: e.g. "2026-11-03T14:42:59.9")
      const rawDate = order.createdAt ?? order.time ?? order.orderDate ?? order.date;
      const formattedDate = this.formatOrderCardDate(rawDate);

      // 5. Price (totalAmount from API: e.g. 0, 71.25, 110.5, 729)
      const rawPrice =
        order.totalAmount ??
        order.orderTotal ??
        order.totalPrice ??
        order.total ??
        order.price ??
        order.orderPrice ??
        order.netTotal ??
        order.grandTotal ??
        order.amount ??
        0;

      const numPrice = Number(rawPrice) || 0;
      const formattedPrice = numPrice % 1 === 0 ? `${numPrice}.0` : numPrice.toString();

      // 6. Status Label & Color (orderStatusId & orderStatusName from API)
      const rawStatus = order.orderStatusName ?? order.orderStatusName_Ar ?? order.statusLabel ?? order.status;
      const statusInfo = this.resolveOrderStatus(order.orderStatusId, rawStatus);

      return {
        id,
        orderNumber: code,
        customerName: rawName,
        time: formattedDate,
        price: numPrice,
        formattedPrice,
        status: order.orderStatusName ?? 'Pending approval',
        statusId: Number(order.orderStatusId ?? 1),
        statusLabel: statusInfo.label,
        statusColor: statusInfo.color,
        isPending: order.orderStatusId === 1 || statusInfo.label.includes('انتظار'),
        phone: order.customerPhone ?? order.phone ?? order.mobile ?? '',
        createdAt: rawDate,
      };
    });
    return mapped.sort((a: OrderCardData, b: OrderCardData) => this.compareOrdersDesc(a, b));
  });

  /**
   * Computed orders list matching the Orders page mobile screen (image 6)
   */
  readonly ordersForList = computed<OrderCardData[]>(() => {
    const data = this.dashboardData();
    const list = data?.currentOrders ?? [];
    const mapped: OrderCardData[] = list.map((order: any, index: number): OrderCardData => {
      // 1. Order ID (orderId from API: e.g. 25952, 23956)
      const id = order.orderId ?? order.id ?? order.menuOrdersId ?? (index + 1);

      // 2. Order Code on Orders Page: "#25952"
      const code = `#${order.orderId ?? id}`;

      // 3. Customer Name
      let rawName = (order.customerName ?? order.clientName ?? order.fullName ?? order.name ?? 'عميل').trim();
      const match = rawName.match(/^([a-zA-Z0-9_\-]+)\s+(.+)$/);
      if (match && code.includes(match[1])) {
        rawName = match[2].trim();
      }

      // 4. Time format: "14:42 م" (Matching image 6)
      const rawDate = order.createdAt ?? order.time ?? order.orderDate ?? order.date;
      const formattedTime = this.formatOrderTime(rawDate);

      // 5. Price
      const rawPrice =
        order.totalAmount ??
        order.orderTotal ??
        order.totalPrice ??
        order.total ??
        order.price ??
        0;
      const numPrice = Number(rawPrice) || 0;
      const formattedPrice = numPrice % 1 === 0 ? `${numPrice}.0` : numPrice.toString();

      // 6. Status on Orders Page (قيد الانتظار in green badge, etc.)
      const statusId = Number(order.orderStatusId ?? order.statusId ?? 1);
      const rawStatus = order.orderStatusName ?? order.orderStatusName_Ar ?? order.statusLabel ?? '';
      const statusInfo = this.resolveOrdersPageStatus(statusId, rawStatus);

      return {
        id,
        orderNumber: code,
        customerName: rawName,
        time: formattedTime,
        price: numPrice,
        formattedPrice,
        status: rawStatus || 'Pending approval',
        statusId,
        statusLabel: statusInfo.label,
        statusColor: statusInfo.color,
        isPending: statusId === 1 || statusInfo.label.includes('انتظار'),
        phone: order.customerPhone ?? order.phone ?? order.mobile ?? '',
        createdAt: rawDate,
      };
    });
    return mapped.sort((a: OrderCardData, b: OrderCardData) => this.compareOrdersDesc(a, b));
  });

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

  private formatOrderTime(raw: string | undefined): string {
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

  private resolveOrdersPageStatus(statusId?: number, statusName?: string): { label: string; color: string } {
    const nameLower = (statusName || '').toLowerCase().trim();

    // 1. Pending approval ("قيد الانتظار" with green badge)
    if (statusId === 1 || nameLower.includes('pending') || nameLower.includes('انتظار')) {
      return {
        label: 'قيد الانتظار',
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-100/70',
      };
    }

    // On the road / Out for delivery ("في الطريق" with blue badge)
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

    // 5. Rejected ("مرفوض")
    if (statusId === 5 || nameLower.includes('reject') || nameLower.includes('مرفوض') || nameLower.includes('ملغي')) {
      return {
        label: 'مرفوض',
        color: 'bg-rose-50 text-rose-500 border border-rose-100/70',
      };
    }

    // 3 or 4: Completed ("مكتمل")
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

  private formatOrderCardDate(raw: string | undefined): string {
    if (!raw) return 'الآن';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const hours = d.getHours();
      const mins = d.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'م' : 'ص';
      const h = (hours % 12 || 12).toString().padStart(2, '0');
      return `${year}/${month}/${day} ، ${h}:${mins} ${period}`;
    } catch {
      return raw;
    }
  }

  private resolveOrderStatus(statusId?: number, statusName?: string): { label: string; color: string } {
    const nameLower = (statusName || '').toLowerCase().trim();

    // 1. Pending approval (orderStatusId: 1)
    if (statusId === 1 || nameLower.includes('pending') || nameLower.includes('انتظار')) {
      return {
        label: 'في انتظار القبول',
        color: 'bg-orange-50 text-orange-600 border border-orange-100/60',
      };
    }

    // 2. Approved and being prepared (orderStatusId: 2)
    if (
      statusId === 2 ||
      nameLower.includes('approved') ||
      nameLower.includes('preparing') ||
      nameLower.includes('تجهيز') ||
      nameLower.includes('قبول')
    ) {
      return {
        label: 'تم القبول وجاري التجهيز',
        color: 'bg-sky-50 text-sky-600 border border-sky-100/60',
      };
    }

    // 5. Rejected (orderStatusId: 5)
    if (
      statusId === 5 ||
      nameLower.includes('reject') ||
      nameLower.includes('مرفوض') ||
      nameLower.includes('ملغي')
    ) {
      return {
        label: 'مرفوض',
        color: 'bg-red-50 text-red-500 border border-red-100/60',
      };
    }

    // 3. Prepared
    if (statusId === 3 || nameLower.includes('prepared') || nameLower.includes('تحضير')) {
      return {
        label: 'تم التحضير',
        color: 'bg-amber-50 text-amber-600 border border-amber-100/60',
      };
    }

    // 4. Completed / Delivered
    if (
      statusId === 4 ||
      nameLower.includes('completed') ||
      nameLower.includes('delivered') ||
      nameLower.includes('مكتمل')
    ) {
      return {
        label: 'مكتمل',
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-100/60',
      };
    }

    return {
      label: statusName || 'في انتظار القبول',
      color: 'bg-orange-50 text-orange-600 border border-orange-100/60',
    };
  }

  // =========================================================================
  // Image Helper
  // =========================================================================
  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${environment.filesUrl}${path}`;
  }

  // =========================================================================
  // Dashboard API
  // =========================================================================
  getDashboard(): Observable<any> {
    return this._http.get<any>(DASHBOARD_API_ENDPOINTS.ownerDashboard).pipe(
      tap({
        next: (res) => {
          const data: DashboardResponse = res?.data ?? res;
          this.dashboardData.set(data);
          if (data?.restaurant?.isOpen !== undefined) {
            this.isRestaurantOpen.set(data.restaurant.isOpen);
          }
        },
        error: (err) => {
          this.dashboardError.set(err?.error?.message || err?.message || 'فشل في تحميل بيانات لوحة التحكم');
        },
      })
    );
  }

  loadDashboard(): void {
    this.isLoadingDashboard.set(true);
    this.dashboardError.set(null);
    this.getDashboard().subscribe({
      next: () => {
        this.isLoadingDashboard.set(false);
      },
      error: () => {
        this.isLoadingDashboard.set(false);
      },
    });
  }

  /**
   * static String ownerMenusOrders = '$baseUrl/MenusOrders/GetOrdersOfMenusByUId';
   * Fetches orders for authenticated owner (No parameters - works with Auth Bearer token only)
   */
  getOrdersOfMenusByUId(): Observable<any> {
    return this._http.get<any>(DASHBOARD_API_ENDPOINTS.ownerMenusOrders).pipe(
      tap({
        next: (res) => {
          const raw =
            res?.result ??
            res?.data ??
            res?.orders ??
            res?.currentOrders ??
            res?.items ??
            res?.value ??
            (Array.isArray(res) ? res : []);

          if (Array.isArray(raw) && raw.length > 0) {
            this.dashboardData.update((prev) => {
              if (!prev) {
                return {
                  restaurant: {} as any,
                  statistics: {} as any,
                  currentOrders: raw,
                };
              }
              return {
                ...prev,
                currentOrders: raw,
              };
            });
          }
        },
      }),
      catchError((err) => {
        console.warn('Could not fetch GetOrdersOfMenusByUId:', err);
        return of(null);
      })
    );
  }

  // =========================================================================
  // Orders API Operations (Unified Service)
  // =========================================================================
  getOrderDetails(orderId: number | string): Observable<OwnerOrderDetails | null> {
    this.isLoadingOrder.set(true);
    const cleanId = orderId.toString().replace(/^#/, '').trim();

    const params = new HttpParams()
      .set('id', cleanId)
      .set('Id', cleanId)
      .set('orderId', cleanId)
      .set('OrderId', cleanId)
      .set('menuOrderId', cleanId)
      .set('MenuOrderId', cleanId)
      .set('menuOrdersId', cleanId);

    return this._http.get<any>(DASHBOARD_API_ENDPOINTS.ownerGetOrderDetails, { params }).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? res?.value ?? res;
        return this.mapToOwnerOrder(raw, cleanId);
      }),
      tap({
        next: (order) => {
          this.currentOrder.set(order);
          this.isLoadingOrder.set(false);
        },
        error: () => {
          this.isLoadingOrder.set(false);
        },
      }),
      catchError(() => {
        this.isLoadingOrder.set(false);
        return of(null);
      })
    );
  }

  receiveOrder(orderId: number | string): Observable<any> {
    this.orderActionInProgress.set(true);
    const cleanId = orderId.toString().replace(/^#/, '').trim();
    const body = { id: cleanId, menuOrderId: cleanId, orderId: cleanId };

    return this._http.post<any>(DASHBOARD_API_ENDPOINTS.receiveOwnerOrder, body).pipe(
      tap({
        next: () => {
          this.orderActionInProgress.set(false);
          // 1. Update currentOrder if open in details
          this.currentOrder.update((curr) =>
            curr ? { ...curr, statusId: 2, statusLabel: 'تم القبول وجاري التجهيز', statusVariant: 'info' } : curr
          );
          // 2. Optimistically update dashboardData orders
          this.dashboardData.update((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              currentOrders: (prev.currentOrders || []).map((o: any) => {
                const oid = (o.orderId ?? o.id ?? o.menuOrdersId ?? '').toString();
                if (oid === cleanId) {
                  return {
                    ...o,
                    orderStatusId: 2,
                    orderStatusName: 'Approved and being prepared',
                  };
                }
                return o;
              }),
            };
          });
        },
        error: () => {
          this.orderActionInProgress.set(false);
        },
      })
    );
  }

  cancelOrder(orderId: number | string, reason = 'تم الإلغاء بواسطة مدير المطعم'): Observable<any> {
    this.orderActionInProgress.set(true);
    const cleanId = orderId.toString().replace(/^#/, '').trim();
    const body = { id: cleanId, menuOrderId: cleanId, orderId: cleanId, reason };

    return this._http.post<any>(DASHBOARD_API_ENDPOINTS.cancelOwnerOrder, body).pipe(
      tap({
        next: () => {
          this.orderActionInProgress.set(false);
          // 1. Update currentOrder if open in details
          this.currentOrder.update((curr) =>
            curr ? { ...curr, statusId: 5, statusLabel: 'مرفوض', statusVariant: 'danger' } : curr
          );
          // 2. Optimistically update dashboardData orders
          this.dashboardData.update((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              currentOrders: (prev.currentOrders || []).map((o: any) => {
                const oid = (o.orderId ?? o.id ?? o.menuOrdersId ?? '').toString();
                if (oid === cleanId) {
                  return {
                    ...o,
                    orderStatusId: 5,
                    orderStatusName: 'Rejected',
                  };
                }
                return o;
              }),
            };
          });
        },
        error: () => {
          this.orderActionInProgress.set(false);
        },
      })
    );
  }

  private mapToOwnerOrder(raw: any, fallbackId: number | string): OwnerOrderDetails {
    const orderId = raw?.menuOrdersId ?? raw?.menuOrderId ?? raw?.orderId ?? raw?.id ?? fallbackId;
    const serial = raw?.serialOrder ?? raw?.serial ?? raw?.orderCode ?? raw?.orderNumber ?? orderId;
    const statusId = Number(raw?.orderStatusId ?? raw?.statusId ?? raw?.status ?? 0);

    let orderType = raw?.orderTypeName_Ar ?? raw?.orderType ?? 'داخلي';
    if (raw?.tableNumber) {
      orderType += ` - طاولة ${raw.tableNumber}`;
    }

    const rawDetails: any[] =
      raw?.details ??
      raw?.items ??
      raw?.menuOrderDetails ??
      raw?.orderDetails ??
      raw?.products ??
      [];

    const items: OrderItemDetail[] = rawDetails.map((det: any, idx: number) => {
      const product = det.menuProducts?.[0] ?? det.product ?? det.menuProduct ?? {};
      const q = Number(det.quantity ?? det.count ?? 1);
      const p = Number(det.price ?? det.unitPrice ?? (det.total && q ? det.total / q : 0));
      const t = Number(det.total ?? det.totalPrice ?? p * q);
      return {
        id: det.id ?? det.menuOrderDetailsId ?? idx + 1,
        name: product.name ?? det.productName ?? det.name ?? 'صنف',
        description: product.description ?? det.description ?? '',
        quantity: q,
        unitPrice: p,
        totalPrice: t,
        image: this.resolveImageUrl(product.photoURL ?? det.photoURL ?? det.image),
      };
    });

    const customer =
      raw?.fullName ??
      raw?.clientName ??
      raw?.customerName ??
      raw?.client?.name ??
      raw?.customer?.name ??
      'عميل';

    const address =
      raw?.address ??
      raw?.customerAddress ??
      raw?.clientAddress ??
      '';

    const phone =
      raw?.phone ??
      raw?.mobile ??
      raw?.customerPhone ??
      raw?.clientPhone ??
      '';

    const total = Number(
      raw?.orderTotal ??
      raw?.totalPrice ??
      raw?.total ??
      raw?.price ??
      raw?.amount ??
      0
    );

    return {
      id: orderId,
      orderCode: serial.toString().startsWith('#') ? serial : `#${serial}`,
      statusId,
      statusLabel: raw?.orderStatusName_Ar ?? raw?.statusLabel ?? this.resolveStatusLabel(statusId),
      statusVariant: this.resolveStatusVariant(statusId),
      dateTime: raw?.orderDate ? this.formatDate(raw.orderDate) : '',
      orderType,
      customerName: customer,
      customerAddress: address,
      customerPhone: phone,
      totalPrice: total,
      currency: 'ج.م',
      itemsCount: items.length,
      items,
    };
  }

  private resolveStatusLabel(statusId: number): string {
    const map: Record<number, string> = { 1: 'مكتمل', 2: 'ملغي', 3: 'تم التحضير', 4: 'تم التوصيل', 5: 'جاري التوصيل' };
    return map[statusId] ?? 'جديد';
  }

  private resolveStatusVariant(statusId: number): 'warning' | 'success' | 'info' | 'danger' | 'default' {
    if (statusId === 1 || statusId === 4) return 'success';
    if (statusId === 2) return 'danger';
    if (statusId === 3) return 'warning';
    if (statusId === 5) return 'info';
    return 'default';
  }

  private formatDate(raw: string): string {
    if (!raw) return '';
    if (/[\u0600-\u06FF]/.test(raw)) return raw;
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      const hours = d.getHours();
      const mins = d.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'م' : 'ص';
      return `${hours % 12 || 12}:${mins} ${period}`;
    } catch {
      return raw;
    }
  }

  // =========================================================================
  // Reports API Endpoints
  // =========================================================================
  getProductStats(): Observable<any> {
    return this._http.get<any>(DASHBOARD_API_ENDPOINTS.ownerProductStats);
  }

  getDailyMenuOrders(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this._http.get<any>(DASHBOARD_API_ENDPOINTS.ownerDailyMenuOrders, { params });
  }

  getMenuOwnerReports(paramsObj?: Record<string, any>): Observable<any> {
    let params = new HttpParams();
    if (paramsObj) {
      Object.keys(paramsObj).forEach((k) => {
        if (paramsObj[k] !== undefined && paramsObj[k] !== null) {
          params = params.set(k, paramsObj[k].toString());
        }
      });
    }
    return this._http.get<any>(DASHBOARD_API_ENDPOINTS.ownerMenuOwnerReports, { params });
  }

  // =========================================================================
  // UI & Layout Signals
  // =========================================================================
  readonly isCollapsed = signal<boolean>(false);
  readonly isMobileOpen = signal<boolean>(false);
  readonly isRestaurantOpen = signal<boolean>(true);

  toggleSidebar(): void {
    this.isCollapsed.update((val) => !val);
  }

  setCollapsed(collapsed: boolean): void {
    this.isCollapsed.set(collapsed);
  }

  toggleMobile(): void {
    this.isMobileOpen.update((val) => !val);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  toggleRestaurantStatus(): void {
    this.isRestaurantOpen.update((val) => !val);
  }
}
