import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { DASHBOARD_API_ENDPOINTS } from '../constants/dashboard-api.constants';

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
  id: string | number;
  orderNumber?: string;
  customerName?: string;
  time?: string;
  price?: number;
  status?: string;
  statusLabel?: string;
  statusColor?: string;
  [key: string]: any;
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

  readonly dashboardData = signal<DashboardResponse | null>(null);
  readonly isLoadingDashboard = signal<boolean>(false);
  readonly dashboardError = signal<string | null>(null);

  /**
   * static String ownerDashboard = '$baseUrl/Dashboard';
   * Fetches dashboard data from the backend
   */
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
        }
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
      }
    });
  }

  // =========================================================================
  // Reports API Endpoints
  // =========================================================================

  /**
   * static String ownerProductStats = '$baseUrl/Reports/product-stats';
   */
  getProductStats(): Observable<any> {
    return this._http.get<any>(DASHBOARD_API_ENDPOINTS.ownerProductStats);
  }

  /**
   * static String ownerDailyMenuOrders = '$baseUrl/Reports/DailyMenuOrders';
   */
  getDailyMenuOrders(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this._http.get<any>(DASHBOARD_API_ENDPOINTS.ownerDailyMenuOrders, { params });
  }

  /**
   * static String ownerMenuOwnerReports = '$baseUrl/Reports/MenuOwnerReports';
   */
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

  /**
   * Tracks whether the sidebar is collapsed into mini icon rail mode on desktop
   */
  readonly isCollapsed = signal<boolean>(false);

  /**
   * Tracks whether the mobile drawer sidebar is visible
   */
  readonly isMobileOpen = signal<boolean>(false);

  /**
   * Restaurant live operational status (open/closed)
   */
  readonly isRestaurantOpen = signal<boolean>(true);

  /**
   * Toggles desktop sidebar collapsed state
   */
  toggleSidebar(): void {
    this.isCollapsed.update((val) => !val);
  }

  setCollapsed(collapsed: boolean): void {
    this.isCollapsed.set(collapsed);
  }

  /**
   * Toggles mobile drawer visibility
   */
  toggleMobile(): void {
    this.isMobileOpen.update((val) => !val);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  /**
   * Toggle restaurant status
   */
  toggleRestaurantStatus(): void {
    this.isRestaurantOpen.update((val) => !val);
  }
}
