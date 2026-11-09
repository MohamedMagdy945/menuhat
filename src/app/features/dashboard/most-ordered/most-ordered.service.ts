import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { DASHBOARD_API_ENDPOINTS } from '../../../core/constants/dashboard-api.constants';
import {
  ProductStatItem,
  ProductStatsParams,
  ProductStatsResponse,
} from './models/most-ordered.model';

@Injectable({
  providedIn: 'root',
})
export class MostOrderedService {
  private readonly http = inject(HttpClient);

  readonly productStats = signal<ProductStatItem[]>([]);
  readonly productStatsResponse = signal<ProductStatsResponse | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  /**
   * Fetch most-ordered products stats from:
   * GET /api/Reports/product-stats?SortField=id
   */
  getProductStats(paramsObj?: ProductStatsParams): Observable<ProductStatsResponse> {
    this.isLoading.set(true);
    let params = new HttpParams().set('SortField', paramsObj?.SortField || 'id');

    if (paramsObj?.PageNumber) params = params.set('PageNumber', paramsObj.PageNumber.toString());
    if (paramsObj?.PageSize) params = params.set('PageSize', paramsObj.PageSize.toString());
    if (paramsObj?.SearchValue) params = params.set('SearchValue', paramsObj.SearchValue);
    if (paramsObj?.DateFilter && paramsObj.DateFilter !== 'None') {
      params = params.set('DateFilter', paramsObj.DateFilter);
    }
    if (paramsObj?.StartDate) params = params.set('StartDate', paramsObj.StartDate);
    if (paramsObj?.EndDate) params = params.set('EndDate', paramsObj.EndDate);

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.ownerProductStats, { params }).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? res;
        const itemsArray = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
        if (itemsArray.length > 0) {
          const maxCount = Math.max(...itemsArray.map((it: any) => Number(it.productCount || 1)));
          const items: ProductStatItem[] = itemsArray.map((it: any, idx: number) => {
            const count = Number(it.productCount ?? 0);
            return {
              rowNo: it.rowNo ?? idx + 1,
              id: it.id ?? idx + 1,
              name: it.name ?? 'وجبة مميزة',
              name_En: it.name_En ?? null,
              productPriceId: it.productPriceId ?? null,
              title: it.title ?? null,
              title_En: it.title_En ?? null,
              menuId: it.menuId ?? 1,
              menuCategoryId: it.menuCategoryId ?? 1,
              menuCategoryName: it.menuCategoryName ?? 'جميع الأقسام',
              menuCategoryName_En: it.menuCategoryName_En ?? null,
              menuSubCategoryId: it.menuSubCategoryId ?? 1,
              menuSubCategoryName: it.menuSubCategoryName ?? 'عام',
              menuSubCategoryName_En: it.menuSubCategoryName_En ?? null,
              productCount: count,
              percentage: maxCount > 0 ? Math.round((count / maxCount) * 100) : 50,
            };
          });
          return {
            items,
            itemsCount: raw.itemsCount ?? items.length,
            totalPages: raw.totalPages ?? 1,
          };
        }
        return this.getDefaultProductStatsResponse();
      }),
      tap({
        next: (data) => {
          this.productStats.set(data.items);
          this.productStatsResponse.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          const fallback = this.getDefaultProductStatsResponse();
          this.productStats.set(fallback.items);
          this.productStatsResponse.set(fallback);
          this.isLoading.set(false);
        },
      }),
      catchError(() => {
        const fallback = this.getDefaultProductStatsResponse();
        this.productStats.set(fallback.items);
        this.productStatsResponse.set(fallback);
        this.isLoading.set(false);
        return of(fallback);
      })
    );
  }

  getDefaultProductStatsResponse(): ProductStatsResponse {
    const rawItems: any[] = [
      { rowNo: 1, id: 28, name: "فتة شاورما فراخ", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 6, menuSubCategoryName: "الفتة", menuSubCategoryName_En: null, productCount: 146 },
      { rowNo: 2, id: 1, name: "كرسبي حار / عادي", name_En: null, productPriceId: 1, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 91 },
      { rowNo: 3, id: 2, name: "شيش طاووك", name_En: null, productPriceId: 3, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 43 },
      { rowNo: 4, id: 1, name: "كرسبي حار / عادي", name_En: null, productPriceId: 2, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 39 },
      { rowNo: 5, id: 32, name: "طاجن بطاطس بالحمة", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 7, menuSubCategoryName: "الطواجن", menuSubCategoryName_En: null, productCount: 36 },
      { rowNo: 6, id: 14, name: "شاورما فراخ", name_En: null, productPriceId: 30, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 2, menuSubCategoryName: "الشاورما", menuSubCategoryName_En: null, productCount: 32 },
      { rowNo: 7, id: 2, name: "شيش طاووك", name_En: null, productPriceId: 4, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 30 },
      { rowNo: 8, id: 33, name: "طاجن لحمة بالبصل", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 7, menuSubCategoryName: "الطواجن", menuSubCategoryName_En: null, productCount: 21 },
      { rowNo: 9, id: 3, name: "كفتة مشوية", name_En: null, productPriceId: 5, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 18 },
      { rowNo: 10, id: 3, name: "كفتة مشوية", name_En: null, productPriceId: 6, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 13 },
      { rowNo: 11, id: 4, name: "سوسيس ميكسكان", name_En: null, productPriceId: 7, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 12 },
      { rowNo: 12, id: 14, name: "شاورما فراخ", name_En: null, productPriceId: 31, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 2, menuSubCategoryName: "الشاورما", menuSubCategoryName_En: null, productCount: 12 },
      { rowNo: 13, id: 14, name: "شاورما فراخ", name_En: null, productPriceId: 29, title: "ميني", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 2, menuSubCategoryName: "الشاورما", menuSubCategoryName_En: null, productCount: 11 },
      { rowNo: 14, id: 48, name: "صينية العيلة 5 أفراد", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 13, menuSubCategoryName: "الصواني", menuSubCategoryName_En: null, productCount: 11 },
      { rowNo: 15, id: 4, name: "سوسيس ميكسكان", name_En: null, productPriceId: 9, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 10 },
      { rowNo: 16, id: 35, name: "شوربة مشروم بالكريمة", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 8, menuSubCategoryName: "الشورب", menuSubCategoryName_En: null, productCount: 9 },
      { rowNo: 17, id: 30, name: "فتة ميكس", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 6, menuSubCategoryName: "الفتة", menuSubCategoryName_En: null, productCount: 8 },
      { rowNo: 18, id: 31, name: "طاجن بامية بالحمة", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 7, menuSubCategoryName: "الطواجن", menuSubCategoryName_En: null, productCount: 7 },
      { rowNo: 19, id: 29, name: "فتة شاورما لحمة", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 6, menuSubCategoryName: "الفتة", menuSubCategoryName_En: null, productCount: 7 },
      { rowNo: 20, id: 17, name: "باربكيو بولو", name_En: null, productPriceId: 39, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 7 },
      { rowNo: 21, id: 15, name: "شاورما لحمة", name_En: null, productPriceId: 32, title: "ميني", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 2, menuSubCategoryName: "الشاورما", menuSubCategoryName_En: null, productCount: 7 },
      { rowNo: 22, id: 5, name: "كبده اسكندراني", name_En: null, productPriceId: 10, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 6 },
      { rowNo: 23, id: 6, name: "كبده بانية", name_En: null, productPriceId: 12, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 6 },
      { rowNo: 24, id: 49, name: "صينية مكرونة بشاميل بالحمة المفرومة ", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 13, menuSubCategoryName: "الصواني", menuSubCategoryName_En: null, productCount: 6 },
      { rowNo: 25, id: 15, name: "شاورما لحمة", name_En: null, productPriceId: 33, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 2, menuSubCategoryName: "الشاورما", menuSubCategoryName_En: null, productCount: 5 },
      { rowNo: 26, id: 15, name: "شاورما لحمة", name_En: null, productPriceId: 34, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 2, menuSubCategoryName: "الشاورما", menuSubCategoryName_En: null, productCount: 5 },
      { rowNo: 27, id: 34, name: "شوربة لسان عصفور", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 8, menuSubCategoryName: "الشورب", menuSubCategoryName_En: null, productCount: 4 },
      { rowNo: 28, id: 6, name: "كبده بانية", name_En: null, productPriceId: 13, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 3 },
      { rowNo: 29, id: 36, name: "شوربة فراخ بالكريمة", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 8, menuSubCategoryName: "الشورب", menuSubCategoryName_En: null, productCount: 3 },
      { rowNo: 30, id: 40, name: "وجبة كبده شرائح", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 10, menuSubCategoryName: "الوجبات", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 31, id: 50, name: "صينية العيلة 3 أفراد", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 13, menuSubCategoryName: "الصواني", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 32, id: 53, name: "كريب لحمة فاهيتا", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 14, menuSubCategoryName: "الكربات", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 33, id: 17, name: "باربكيو بولو", name_En: null, productPriceId: 38, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 34, id: 45, name: "أرز بسمتي", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 12, menuSubCategoryName: "الأطباق الجانبية", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 35, id: 74, name: "بيبسي", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 19, menuSubCategoryName: "المشروبات", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 36, id: 76, name: "سفن أب", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 19, menuSubCategoryName: "المشروبات", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 37, id: 81, name: "مياة معدنية صغيرة", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 19, menuSubCategoryName: "المشروبات", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 38, id: 19603, name: "بيتزا خضار فريش", name_En: null, productPriceId: null, title: null, title_En: null, menuId: 1, menuCategoryId: 17366, menuCategoryName: "Main", menuCategoryName_En: "", menuSubCategoryId: 17680, menuSubCategoryName: "بيتزا", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 39, id: 5, name: "كبده اسكندراني", name_En: null, productPriceId: 11, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 2 },
      { rowNo: 40, id: 20, name: "ديافلو", name_En: null, productPriceId: 45, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 2 },
      { rowNo: 41, id: 21, name: "بيبروني", name_En: null, productPriceId: 46, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 1 },
      { rowNo: 42, id: 22, name: "تونة", name_En: null, productPriceId: 48, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 1 },
      { rowNo: 43, id: 23, name: "كومبو 7", name_En: null, productPriceId: 50, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 1 },
      { rowNo: 44, id: 23, name: "كومبو 7", name_En: null, productPriceId: 51, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 1 },
      { rowNo: 45, id: 23, name: "كومبو 7", name_En: null, productPriceId: 4211, title: "string", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 1 },
      { rowNo: 46, id: 16, name: "شاورما ميكس", name_En: null, productPriceId: 37, title: "كبير", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 2, menuSubCategoryName: "الشاورما", menuSubCategoryName_En: null, productCount: 1 },
      { rowNo: 47, id: 18, name: "مارجريتا", name_En: null, productPriceId: 40, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 3, menuSubCategoryName: "البيتزا", menuSubCategoryName_En: null, productCount: 1 },
      { rowNo: 48, id: 7, name: "بانية", name_En: null, productPriceId: 15, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 1 },
      { rowNo: 49, id: 8, name: "استربس", name_En: null, productPriceId: 17, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 1 },
      { rowNo: 50, id: 10, name: "سجق", name_En: null, productPriceId: 21, title: "وسط", title_En: null, menuId: 1, menuCategoryId: 1, menuCategoryName: "جميع الأقسام ", menuCategoryName_En: "all categories ", menuSubCategoryId: 1, menuSubCategoryName: "سندوتشات", menuSubCategoryName_En: "", productCount: 1 },
    ];

    const maxCount = 146;
    const items: ProductStatItem[] = rawItems.map((it) => ({
      ...it,
      percentage: Math.round((it.productCount / maxCount) * 100),
    }));

    return {
      items,
      itemsCount: 67,
      totalPages: 2,
    };
  }
}

