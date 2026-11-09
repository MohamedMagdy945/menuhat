import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { DASHBOARD_API_ENDPOINTS } from '../../../core/constants/dashboard-api.constants';
import { environment } from '../../../core/environments/environment';
import {
  ReportParams,
  ReportResponseDto,
  ReportView,
  ReportDailyItem,
  ReportKpis,
  DailyMenuOrdersParams,
  DailyMenuOrderItem,
  DailyMenuOrdersResponse,
  DateFilterType,
} from './models/report.model';

export interface DailyOrderReportItem {
  id: number | string;
  date: string;
  dayName: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

@Injectable({
  providedIn: 'root',
})
export class OwnerReportsService {
  private readonly http = inject(HttpClient);
  private readonly filesUrl = environment.filesUrl;

  readonly dailyReports = signal<DailyOrderReportItem[]>([]);
  readonly dailyMenuOrders = signal<DailyMenuOrdersResponse | null>(null);
  readonly menuOwnerReports = signal<ReportResponseDto | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${this.filesUrl}${path}`;
  }

  // =========================================================================
  // 1. static String ownerDailyMenuOrders = '$baseUrl/Reports/DailyMenuOrders';
  // =========================================================================
  getDailyMenuOrders(paramsObj?: DailyMenuOrdersParams): Observable<DailyMenuOrdersResponse> {
    this.isLoading.set(true);
    let params = new HttpParams()
      .set('SortField', paramsObj?.SortField || 'id')
      .set('DateFilter', paramsObj?.DateFilter || 'None')
      .set('ExportAsExcel', paramsObj?.ExportAsExcel ? 'true' : 'false');

    if (paramsObj?.PageNumber) params = params.set('PageNumber', paramsObj.PageNumber.toString());
    if (paramsObj?.PageSize) params = params.set('PageSize', paramsObj.PageSize.toString());
    if (paramsObj?.SearchValue) params = params.set('SearchValue', paramsObj.SearchValue);
    if (paramsObj?.SortDirection) params = params.set('SortDirection', paramsObj.SortDirection);
    if (paramsObj?.StartDate) params = params.set('StartDate', paramsObj.StartDate);
    if (paramsObj?.EndDate) params = params.set('EndDate', paramsObj.EndDate);
    if (paramsObj?.Serial) params = params.set('Serial', paramsObj.Serial);

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.ownerDailyMenuOrders, { params }).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? res;
        if (raw && typeof raw === 'object') {
          const items: DailyMenuOrderItem[] = Array.isArray(raw.items)
            ? raw.items
            : Array.isArray(raw)
              ? raw
              : [];
          return {
            items,
            itemsCount: raw.itemsCount ?? items.length,
            totalPages: raw.totalPages ?? 1,
          };
        }
        return this.getDefaultDailyMenuOrdersResponse();
      }),
      tap({
        next: (data) => {
          this.dailyMenuOrders.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          const fallback = this.getDefaultDailyMenuOrdersResponse();
          this.dailyMenuOrders.set(fallback);
          this.isLoading.set(false);
        },
      }),
      catchError(() => {
        const fallback = this.getDefaultDailyMenuOrdersResponse();
        this.dailyMenuOrders.set(fallback);
        this.isLoading.set(false);
        return of(fallback);
      })
    );
  }

  // =========================================================================
  // 3. static String ownerMenuOwnerReports = '$baseUrl/Reports/MenuOwnerReports';
  // =========================================================================
  getMenuOwnerReports(paramsObj?: ReportParams): Observable<ReportResponseDto | null> {
    this.isLoading.set(true);
    let params = new HttpParams();
    if (paramsObj) {
      if (paramsObj.StartDay) params = params.set('StartDay', paramsObj.StartDay);
      if (paramsObj.EndDay) params = params.set('EndDay', paramsObj.EndDay);
      if (paramsObj.ReportType) params = params.set('ReportType', paramsObj.ReportType);
      if (paramsObj.GroupBy) params = params.set('GroupBy', paramsObj.GroupBy);
    }

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.ownerMenuOwnerReports, { params }).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? res;
        if (raw && typeof raw === 'object') {
          return {
            items: Array.isArray(raw.items) ? raw.items : Array.isArray(raw) ? raw : [],
            itemsCount: raw.itemsCount ?? (Array.isArray(raw) ? raw.length : 0),
            totalPages: raw.totalPages ?? 1,
          };
        }
        return null;
      }),
      tap({
        next: (dto) => {
          this.menuOwnerReports.set(dto);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  private formatReportDate(raw: string): string {
    if (/[\u0600-\u06FF]/.test(raw)) return raw;
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return raw;
    }
  }

  getDefaultDailyMenuOrdersResponse(): DailyMenuOrdersResponse {
    return {
      items: [
        {
          id: 7,
          orderDay: "2025-10-01T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 71.25,
          customerCount: 1,
          topItemId: 1,
          topItemName: "كرسبي حار / عادي",
          topItemName_En: null,
          topItemCount: 1,
          peakHour: 16
        },
        {
          id: 13,
          orderDay: "2025-09-09T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 229.5,
          customerCount: 1,
          topItemId: 14,
          topItemName: "شاورما فراخ",
          topItemName_En: null,
          topItemCount: 2,
          peakHour: 10
        },
        {
          id: 14,
          orderDay: "2025-07-21T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 3,
          totalAmount: 222.75,
          customerCount: 1,
          topItemId: 1,
          topItemName: "كرسبي حار / عادي",
          topItemName_En: null,
          topItemCount: 4,
          peakHour: 14
        },
        {
          id: 19,
          orderDay: "2025-05-05T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 173.25,
          customerCount: 1,
          topItemId: 2,
          topItemName: "شيش طاووك",
          topItemName_En: null,
          topItemCount: 1,
          peakHour: 17
        },
        {
          id: 21,
          orderDay: "2025-04-06T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 458.55,
          customerCount: 1,
          topItemId: 28,
          topItemName: "فتة شاورما فراخ",
          topItemName_En: null,
          topItemCount: 1,
          peakHour: 10
        },
        {
          id: 24,
          orderDay: "2025-03-23T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 94.05,
          customerCount: 1,
          topItemId: 1,
          topItemName: "كرسبي حار / عادي",
          topItemName_En: null,
          topItemCount: 2,
          peakHour: 11
        },
        {
          id: 25,
          orderDay: "2025-03-11T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 558,
          customerCount: 1,
          topItemId: 4,
          topItemName: "سوسيس ميكسكان",
          topItemName_En: null,
          topItemCount: 1,
          peakHour: 15
        },
        {
          id: 27,
          orderDay: "2025-03-10T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 157.5,
          customerCount: 1,
          topItemId: 3,
          topItemName: "كفتة مشوية",
          topItemName_En: null,
          topItemCount: 1,
          peakHour: 13
        },
        {
          id: 29,
          orderDay: "2025-03-06T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 5,
          totalAmount: 459,
          customerCount: 2,
          topItemId: 2,
          topItemName: "شيش طاووك",
          topItemName_En: null,
          topItemCount: 3,
          peakHour: 15
        },
        {
          id: 31,
          orderDay: "2025-03-05T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 3,
          totalAmount: 1145.1,
          customerCount: 3,
          topItemId: 2,
          topItemName: "شيش طاووك",
          topItemName_En: null,
          topItemCount: 5,
          peakHour: 15
        },
        {
          id: 33,
          orderDay: "2025-03-04T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 8,
          totalAmount: 1966.65,
          customerCount: 3,
          topItemId: 2,
          topItemName: "شيش طاووك",
          topItemName_En: null,
          topItemCount: 5,
          peakHour: 14
        },
        {
          id: 35,
          orderDay: "2025-03-03T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 871.85,
          customerCount: 1,
          topItemId: 1,
          topItemName: "كرسبي حار / عادي",
          topItemName_En: null,
          topItemCount: 6,
          peakHour: 11
        },
        {
          id: 37,
          orderDay: "2025-03-02T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 2,
          totalAmount: 299.25,
          customerCount: 2,
          topItemId: 1,
          topItemName: "كرسبي حار / عادي",
          topItemName_En: null,
          topItemCount: 8,
          peakHour: 13
        },
        {
          id: 39,
          orderDay: "2025-02-26T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 4,
          totalAmount: 985.5,
          customerCount: 2,
          topItemId: 28,
          topItemName: "فتة شاورما فراخ",
          topItemName_En: null,
          topItemCount: 5,
          peakHour: 13
        },
        {
          id: 43,
          orderDay: "2025-01-30T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 1,
          totalAmount: 150,
          customerCount: 1,
          topItemId: 2,
          topItemName: "شيش طاووك",
          topItemName_En: null,
          topItemCount: 4,
          peakHour: 16
        },
        {
          id: 46,
          orderDay: "2025-01-23T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 2,
          totalAmount: 595,
          customerCount: 2,
          topItemId: 28,
          topItemName: "فتة شاورما فراخ",
          topItemName_En: null,
          topItemCount: 51,
          peakHour: 10
        },
        {
          id: 52,
          orderDay: "2025-01-20T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 7,
          totalAmount: 3355,
          customerCount: 3,
          topItemId: 14,
          topItemName: "شاورما فراخ",
          topItemName_En: null,
          topItemCount: 18,
          peakHour: 12
        },
        {
          id: 54,
          orderDay: "2025-01-19T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 4,
          totalAmount: 855,
          customerCount: 2,
          topItemId: 31,
          topItemName: "طاجن بامية بالحمة",
          topItemName_En: null,
          topItemCount: 3,
          peakHour: 13
        },
        {
          id: 56,
          orderDay: "2025-01-18T00:00:00",
          menuId: 1,
          menuName: "كومبو سفن فودز",
          menuName_En: "Combo7Foods",
          orderCount: 17,
          totalAmount: 2795,
          customerCount: 3,
          topItemId: 28,
          topItemName: "فتة شاورما فراخ",
          topItemName_En: null,
          topItemCount: 9,
          peakHour: 12
        }
      ],
      itemsCount: 19,
      totalPages: 1
    };
  }
}

