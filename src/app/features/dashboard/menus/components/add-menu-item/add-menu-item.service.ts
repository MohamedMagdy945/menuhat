import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../../core/environments/environment';
import { DASHBOARD_API_ENDPOINTS } from '../../../../../core/constants/dashboard-api.constants';
import { SystemImageSuggestion } from '../../models/system-image-suggestion.model';
import { AddMenuProductPayload } from '../../models/add-menu-product-payload.model';
import { AddMenuProductResponse } from '../../models/add-menu-product-response.model';

@Injectable({
  providedIn: 'root',
})
export class AddMenuItemService {
  private readonly http = inject(HttpClient);

  readonly suggestedImages = signal<SystemImageSuggestion[]>([]);
  readonly isLoadingSuggestions = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  /**
   * Resolves the full URL to display images in the frontend using environment.filesUrl
   */
  resolveImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    const cleanPath = imageUrl.replace(/^\//, '');
    return `${environment.filesUrl}/${cleanPath}`;
  }

  /**
   * Fetches suggested system default images based on the item name keyword
   * GET: /api/Products/SuggestSystemImages?keyword=...
   * If keyword is empty, fetches the initial default system images.
   */
  suggestSystemImages(keyword: string = ''): Observable<SystemImageSuggestion[]> {
    const term = (keyword ?? '').trim();

    this.isLoadingSuggestions.set(true);
    const params = new HttpParams().set('keyword', term);

    return this.http
      .get<any>(DASHBOARD_API_ENDPOINTS.suggestSystemImages, { params })
      .pipe(
        map((res) => {
          const raw = res?.data ?? res?.result ?? (Array.isArray(res) ? res : []);
          const list = Array.isArray(raw) ? raw : [];
          return list.map((item: any): SystemImageSuggestion => ({
            id: Number(item.id ?? 0),
            imageUrl: String(item.imageUrl ?? ''),
            nameAr: String(item.nameAr ?? item.name ?? '').trim(),
            nameEn: String(item.nameEn ?? item.name_En ?? '').trim(),
            score: item.score !== undefined ? Number(item.score) : undefined,
          }));
        }),
        tap({
          next: (items) => {
            this.suggestedImages.set(items);
            this.isLoadingSuggestions.set(false);
          },
          error: (err) => {
            this.isLoadingSuggestions.set(false);
            this.errorMessage.set(
              err?.error?.message || err?.message || 'فشل في جلب الصور المقترحة'
            );
          },
        }),
        catchError(() => {
          this.isLoadingSuggestions.set(false);
          return of([]);
        })
      );
  }

  /**
   * Upload / Add new menu product
   * POST: /api/MenuProducts/AddMenuProduct
   */
  addMenuProduct(payload: AddMenuProductPayload): Observable<AddMenuProductResponse> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    return this.http
      .post<AddMenuProductResponse>(DASHBOARD_API_ENDPOINTS.addMenuProduct, payload)
      .pipe(
        tap({
          next: () => {
            this.isSubmitting.set(false);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(
              err?.error?.message || err?.message || 'حدث خطأ أثناء حفظ الصنف'
            );
          },
        })
      );
  }

  /**
   * Alias for addMenuProduct
   */
  createProduct(payload: AddMenuProductPayload): Observable<AddMenuProductResponse> {
    return this.addMenuProduct(payload);
  }
}
