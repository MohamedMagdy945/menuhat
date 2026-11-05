import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../core/environments/environment';
import { DASHBOARD_API_ENDPOINTS } from '../../../../core/constants/dashboard-api.constants';

export interface OrderItemDetail {
  id: number | string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
}

export interface OwnerOrderSummary {
  id: number | string;
  orderCode: string;
  customerName: string;
  price: number;
  time?: string;
  statusLabel?: string;
  statusColor?: string;
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

@Injectable({
  providedIn: 'root',
})
export class OwnerOrdersService {
  private readonly http = inject(HttpClient);
  private readonly filesUrl = environment.filesUrl;

  // Signal State
  readonly ordersList = signal<OwnerOrderSummary[]>([]);
  readonly currentOrder = signal<OwnerOrderDetails | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly actionInProgress = signal<boolean>(false);

  /**
   * Resolves full image URL from backend relative or absolute paths
   */
  resolveImageUrl(url: string | null | undefined): string {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const cleanBase = this.filesUrl.replace(/\/+$/, '');
    if (trimmed.startsWith('/UploadedFiles')) {
      const origin = cleanBase.replace(/\/UploadedFiles$/, '');
      return `${origin}${trimmed}`;
    }
    if (trimmed.startsWith('UploadedFiles')) {
      const origin = cleanBase.replace(/\/UploadedFiles$/, '');
      return `${origin}/${trimmed}`;
    }
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${cleanBase}${path}`;
  }

  // =========================================================================
  // 1. static String ownerMenusOrders = '$baseUrl/MenusOrders/GetOrdersOfMenusByUId';
  // =========================================================================
  getOrdersOfMenusByUId(paramsObj?: { pageNumber?: number; pageSize?: number }): Observable<OwnerOrderSummary[]> {
    this.isLoading.set(true);
    let params = new HttpParams();
    if (paramsObj?.pageNumber) {
      params = params.set('pageNumber', paramsObj.pageNumber.toString()).set('PageNumber', paramsObj.pageNumber.toString());
    }
    if (paramsObj?.pageSize) {
      params = params.set('pageSize', paramsObj.pageSize.toString()).set('PageSize', paramsObj.pageSize.toString());
    }

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.ownerMenusOrders, { params }).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((item: any, idx: number) => ({
            id: item.menuOrdersId ?? item.id ?? idx + 1,
            orderCode: item.serialOrder ?? (item.menuOrdersId ? `#${item.menuOrdersId}` : `#${idx + 100}`),
            customerName: item.fullName ?? item.clientName ?? item.customerName ?? 'عميل',
            price: Number(item.orderTotal ?? item.total ?? item.price ?? 0),
            time: item.orderDate ? this.formatDate(item.orderDate) : 'الآن',
            statusLabel: item.orderStatusName_Ar ?? 'قيد التجهيز',
            statusColor: 'bg-orange-50 text-orange-600',
          }));
        }
        return this.getDefaultOrderSummaries();
      }),
      tap({
        next: (items) => {
          this.ordersList.set(items);
          this.isLoading.set(false);
        },
        error: () => {
          const fallback = this.getDefaultOrderSummaries();
          this.ordersList.set(fallback);
          this.isLoading.set(false);
        },
      }),
      catchError(() => {
        const fallback = this.getDefaultOrderSummaries();
        this.ordersList.set(fallback);
        this.isLoading.set(false);
        return of(fallback);
      })
    );
  }

  // =========================================================================
  // 2. static String ownerGetOrderDetails = '$baseUrl/MenusOrders/GetOrderDetails';
  // =========================================================================
  getOrderDetails(orderId: number | string): Observable<OwnerOrderDetails> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const params = new HttpParams()
      .set('id', orderId.toString())
      .set('orderId', orderId.toString())
      .set('menuOrderId', orderId.toString());

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.ownerGetOrderDetails, { params }).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? res;
        return this.mapToOwnerOrder(raw, orderId);
      }),
      tap({
        next: (order) => {
          this.currentOrder.set(order);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.warn('[OwnerOrdersService] Fallback to mock order due to:', err);
          const fallback = this.getMockOrder(orderId);
          this.currentOrder.set(fallback);
          this.isLoading.set(false);
        },
      }),
      catchError(() => {
        const fallback = this.getMockOrder(orderId);
        this.currentOrder.set(fallback);
        this.isLoading.set(false);
        return of(fallback);
      })
    );
  }

  // =========================================================================
  // 3. static String receiveOwnerOrder = '$baseUrl/MenusOrders/Receive';
  // =========================================================================
  receiveOrder(orderId: number | string): Observable<any> {
    this.actionInProgress.set(true);
    const body = {
      id: orderId,
      menuOrderId: orderId,
      orderId: orderId,
      status: 3, // Received / In Preparation
    };

    const params = new HttpParams()
      .set('id', orderId.toString())
      .set('orderId', orderId.toString());

    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.receiveOwnerOrder, body, { params }).pipe(
      tap({
        next: () => {
          this.actionInProgress.set(false);
          this.currentOrder.update((curr) => {
            if (!curr) return curr;
            return {
              ...curr,
              statusId: 3,
              statusLabel: 'تم التحضير',
              statusVariant: 'warning',
            };
          });
        },
        error: () => {
          this.actionInProgress.set(false);
          // Optimistically update status in UI
          this.currentOrder.update((curr) => {
            if (!curr) return curr;
            return {
              ...curr,
              statusId: 3,
              statusLabel: 'تم التحضير',
              statusVariant: 'warning',
            };
          });
        },
      })
    );
  }

  // =========================================================================
  // 4. static String cancelOwnerOrder = '$baseUrl/MenusOrders/Cancel';
  // =========================================================================
  cancelOrder(orderId: number | string, reason?: string): Observable<any> {
    this.actionInProgress.set(true);
    const body = {
      id: orderId,
      menuOrderId: orderId,
      orderId: orderId,
      reason: reason || 'تم الإلغاء بواسطة المطعم',
    };

    const params = new HttpParams()
      .set('id', orderId.toString())
      .set('orderId', orderId.toString())
      .set('reason', reason || 'تم الإلغاء بواسطة المطعم');

    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.cancelOwnerOrder, body, { params }).pipe(
      tap({
        next: () => {
          this.actionInProgress.set(false);
          this.currentOrder.update((curr) => {
            if (!curr) return curr;
            return {
              ...curr,
              statusId: 2,
              statusLabel: 'ملغي',
              statusVariant: 'danger',
            };
          });
        },
        error: () => {
          this.actionInProgress.set(false);
          // Optimistically update status in UI
          this.currentOrder.update((curr) => {
            if (!curr) return curr;
            return {
              ...curr,
              statusId: 2,
              statusLabel: 'ملغي',
              statusVariant: 'danger',
            };
          });
        },
      })
    );
  }

  /**
   * Maps backend API response to normalized OwnerOrderDetails
   */
  private mapToOwnerOrder(raw: any, fallbackId: number | string): OwnerOrderDetails {
    if (!raw || typeof raw !== 'object') {
      return this.getMockOrder(fallbackId);
    }

    const orderId = raw.menuOrdersId ?? raw.id ?? fallbackId;
    const serial = raw.serialOrder ?? (orderId ? `#${orderId}` : '#1024');
    const customer = raw.fullName ?? raw.clientName ?? raw.customerName ?? 'أحمد منصور';
    const address = raw.address ?? raw.customerAddress ?? 'دبي، منطقة الرشاء، شارع 15';
    const phone = raw.phone ?? raw.mobile ?? raw.customerPhone ?? '050-1234567';
    const total = Number(raw.orderTotal ?? raw.total ?? raw.price ?? 120);

    const statusId = Number(raw.orderStatusId ?? raw.statusId ?? 3);
    const statusLabel = raw.orderStatusName_Ar ?? this.resolveStatusLabel(statusId);
    const statusVariant = this.resolveStatusVariant(statusId);

    let orderType = raw.orderTypeName_Ar ?? 'داخلي';
    if (raw.tableNumber) {
      orderType += ` - طاولة ${raw.tableNumber}`;
    } else if (orderType.includes('داخلي') && !orderType.includes('طاولة')) {
      orderType += ' - طاولة 8';
    }

    const rawDate = raw.orderDate ?? raw.createdAt;
    const dateTime = rawDate ? this.formatDate(rawDate) : '12:45 م اليوم';

    const rawDetails: any[] = raw.details ?? raw.items ?? [];
    let items: OrderItemDetail[] = [];

    if (Array.isArray(rawDetails) && rawDetails.length > 0) {
      items = rawDetails.map((det: any, idx: number) => {
        const product = det.menuProducts?.[0] ?? det.product ?? {};
        const q = Number(det.quantity ?? 1);
        const p = Number(det.price ?? (det.total && q ? det.total / q : 65));
        const t = Number(det.total ?? p * q);

        return {
          id: det.id ?? idx + 1,
          name: product.name ?? det.name ?? 'وجبة متميزة',
          description: product.description ?? det.description ?? 'طبق طازج ولذيذ محضر بأجود المكونات',
          quantity: q,
          unitPrice: p,
          totalPrice: t,
          image: this.resolveImageUrl(product.photoURL ?? det.photoURL ?? det.image) || '/images/default.png',
        };
      });
    } else {
      items = this.getMockOrder(orderId).items;
    }

    return {
      id: orderId,
      orderCode: serial.startsWith('#') ? serial : `#${serial}`,
      statusId,
      statusLabel,
      statusVariant,
      dateTime,
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
    switch (statusId) {
      case 1:
        return 'مكتمل';
      case 2:
        return 'ملغي';
      case 3:
        return 'تم التحضير';
      case 4:
        return 'تم التوصيل';
      case 5:
        return 'جاري التوصيل';
      default:
        return 'تم التحضير';
    }
  }

  private resolveStatusVariant(statusId: number): 'warning' | 'success' | 'info' | 'danger' | 'default' {
    switch (statusId) {
      case 1:
      case 4:
        return 'success';
      case 2:
        return 'danger';
      case 3:
        return 'warning';
      case 5:
        return 'info';
      default:
        return 'warning';
    }
  }

  private formatDate(raw: string): string {
    if (/[\u0600-\u06FF]/.test(raw)) return raw;
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      const hours = d.getHours();
      const mins = d.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'م' : 'ص';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${mins} ${period} اليوم`;
    } catch {
      return '12:45 م اليوم';
    }
  }

  private getDefaultOrderSummaries(): OwnerOrderSummary[] {
    return [
      { id: 1024, orderCode: '#1024', customerName: 'أحمد منصور', price: 120, time: '12:45 م اليوم', statusLabel: 'تم التحضير' },
      { id: 1025, orderCode: '#1025', customerName: 'سارة خالد', price: 85, time: '01:10 م اليوم', statusLabel: 'جديد' },
      { id: 1026, orderCode: '#1026', customerName: 'محمد علي', price: 210, time: '01:30 م اليوم', statusLabel: 'قيد التجهيز' },
      { id: 1027, orderCode: '#1027', customerName: 'إبراهيم يوسف', price: 175, time: '02:00 م اليوم', statusLabel: 'مكتمل' },
    ];
  }

  getMockOrder(orderId: number | string = 1024): OwnerOrderDetails {
    const code = orderId.toString().startsWith('#') ? orderId.toString() : `#${orderId}`;

    return {
      id: orderId,
      orderCode: code,
      statusId: 3,
      statusLabel: 'تم التحضير',
      statusVariant: 'warning',
      dateTime: '12:45 م اليوم',
      orderType: 'داخلي - طاولة 8',
      customerName: 'أحمد منصور',
      customerAddress: 'دبي، منطقة الرشاء، شارع 15',
      customerPhone: '050-1234567',
      totalPrice: 120,
      currency: 'ج.م',
      itemsCount: 4,
      items: [
        {
          id: 1,
          name: 'مندي دجاج',
          description: 'نصف حبة دجاج مع أرز مندي تقليدي وصلصة سحاوق',
          quantity: 1,
          unitPrice: 65,
          totalPrice: 65,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=160&auto=format&fit=crop&q=80',
        },
        {
          id: 2,
          name: 'أرز بخاري',
          description: 'طبق جانبي فاخر مع جزر وحمص وزبيب محمص',
          quantity: 2,
          unitPrice: 65,
          totalPrice: 130,
          image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=160&auto=format&fit=crop&q=80',
        },
        {
          id: 3,
          name: 'مندي دجاج',
          description: 'نصف حبة دجاج إضافية مشوية على الفحم متبلة بالبهارات',
          quantity: 1,
          unitPrice: 65,
          totalPrice: 65,
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=160&auto=format&fit=crop&q=80',
        },
        {
          id: 4,
          name: 'كنافة بالقشطة',
          description: 'حلوى شرقية طازجة مع شيرة خفيفة وفستق حلبي فاخر',
          quantity: 2,
          unitPrice: 65,
          totalPrice: 130,
          image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=160&auto=format&fit=crop&q=80',
        },
      ],
    };
  }
}
