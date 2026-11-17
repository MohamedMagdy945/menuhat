import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../../core/environments/environment';
import { DASHBOARD_API_ENDPOINTS } from '../../../../../core/constants/dashboard-api.constants';
import { SystemImageSuggestion } from '../../models/system-image-suggestion.model';
import { CreateProductPayload } from '../../models/create-product-payload.model';

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
   * Resolves the full URL to display system images in the frontend
   */
  resolveImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    const baseOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

    // Already formatted path
    if (imageUrl.startsWith('/DefaultImages') || imageUrl.startsWith('DefaultImages')) {
      const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `${baseOrigin}${path}`;
    }

    if (imageUrl.startsWith('/')) {
      return `${baseOrigin}${imageUrl}`;
    }

    // System images filename (e.g. "123ساندوتش كفتة" or "123كفتة مشوية.png")
    const hasExtension = /\.(png|jpe?g|webp|gif|svg)$/i.test(imageUrl);
    const fileName = hasExtension ? imageUrl : `${imageUrl}.png`;
    return `${baseOrigin}/DefaultImages/${fileName}`;
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
   * Upload / Create new product
   * POST: /api/Products
   */
  createProduct(payload: CreateProductPayload): Observable<any> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.products, payload).pipe(
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
}
