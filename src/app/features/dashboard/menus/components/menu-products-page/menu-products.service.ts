import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../../core/environments/environment';
import { DASHBOARD_API_ENDPOINTS } from '../../../../../core/constants/dashboard-api.constants';
import { MenuProduct, MenuProductsResponse } from '../../models/menu-product.model';

@Injectable({
  providedIn: 'root',
})
export class MenuProductsService {
  private readonly http = inject(HttpClient);

  readonly products = signal<MenuProduct[]>([]);
  readonly itemsCount = signal<number>(0);
  readonly totalPages = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly currentMenuCategoryId = signal<number>(1);
  readonly currentMenuSubCategoryId = signal<number>(1);

  // =========================================================================
  // Image URL Resolver
  // =========================================================================
  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const baseOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

    // Default Images (e.g. /DefaultImages/سندوتشات.png)
    if (url.startsWith('/DefaultImages') || url.startsWith('DefaultImages')) {
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${baseOrigin}${path}`;
    }

    // Uploaded Media (e.g. /MenuProducts/..., /UploadedFiles/...)
    const cleanPath = url.replace(/^\//, '');
    return `${environment.filesUrl}/${cleanPath}`;
  }

  // =========================================================================
  // GET: /api/MenuProducts?SortField=RowNo&MenuCategoryId=1&MenuSubCategoryId=1
  // =========================================================================
  getProducts(
    menuCategoryId: number = 1,
    menuSubCategoryId: number = 1,
    sortField: string = 'RowNo'
  ): Observable<MenuProduct[]> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.currentMenuCategoryId.set(menuCategoryId);
    this.currentMenuSubCategoryId.set(menuSubCategoryId);

    // Support both PascalCase and camelCase query parameters for safety
    const params = new HttpParams()
      .set('SortField', sortField)
      .set('MenuCategoryId', menuCategoryId.toString())
      .set('MenuSubCategoryId', menuSubCategoryId.toString())
      .set('menuCategoryId', menuCategoryId.toString())
      .set('menuSubCategoryId', menuSubCategoryId.toString());

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.menuProducts, { params }).pipe(
      map((res) => {
        // Backend returns: { listWithDetails: MenuProduct[], itemsCount: number, totalPages: number }
        const rawList = res?.listWithDetails ?? res?.data ?? (Array.isArray(res) ? res : []);
        const list: MenuProduct[] = Array.isArray(rawList) ? rawList : [];

        this.itemsCount.set(res?.itemsCount ?? list.length);
        this.totalPages.set(res?.totalPages ?? 1);

        return list.map((item: any): MenuProduct => ({
          ...item,
          id: Number(item.id ?? 0),
          productName: (item.productName ?? '').trim(),
          productName_En: item.productName_En ? String(item.productName_En).trim() : null,
          menuCategoryName: (item.menuCategoryName ?? '').trim(),
          menuSubCategoryName: (item.menuSubCategoryName ?? '').trim(),
          price: Number(item.price ?? 0),
          oldPrice: item.oldPrice !== null && item.oldPrice !== undefined ? Number(item.oldPrice) : null,
          details: Array.isArray(item.details)
            ? item.details.map((d: any) => ({
                ...d,
                id: Number(d.id ?? 0),
                menuProductId: Number(d.menuProductId ?? item.id ?? 0),
                title: (d.title ?? '').trim(),
                title_En: d.title_En ? String(d.title_En).trim() : null,
                price: Number(d.price ?? 0),
                oldPrice: d.oldPrice !== null && d.oldPrice !== undefined ? Number(d.oldPrice) : null,
                isOffer: Boolean(d.isOffer),
                discountPercentage: Number(d.discountPercentage ?? 0),
              }))
            : [],
        }));
      }),
      tap({
        next: (items) => {
          this.products.set(items);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err?.error?.message || err?.message || 'فشل في تحميل المنتجات'
          );
        },
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of([]);
      })
    );
  }
}
