import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../../core/environments/environment';
import { DASHBOARD_API_ENDPOINTS } from '../../../../../core/constants/dashboard-api.constants';
import { MenuSubCategory } from '../../models/menu-sub-category.model';

export interface CreateSubCategoryDto {
  id?: number;
  name: string;
  name_En?: string;
  menuCategoryId: number;
  description?: string;
  description_En?: string;
  catOrder?: number;
  photoURL?: {
    base64String: string;
  } | null;
  photoBase64?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class MenuSubCategoriesService {
  private readonly http = inject(HttpClient);

  readonly subCategories = signal<MenuSubCategory[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedCategoryId = signal<number | null>(null);

  // =========================================================================
  // Image URL Resolver
  // =========================================================================
  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const baseOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

    // Default Images (e.g. /DefaultImages/شاورما.png)
    if (url.startsWith('/DefaultImages') || url.startsWith('DefaultImages')) {
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${baseOrigin}${path}`;
    }

    // Uploaded Media (e.g. /MenuSubCategories/cd2ce632-...png)
    const cleanPath = url.replace(/^\//, '');
    return `${environment.filesUrl}/${cleanPath}`;
  }

  // =========================================================================
  // GET: /api/MenuSubCategories/GetAll?menuCategoryId=1
  // =========================================================================
  getAllSubCategories(menuCategoryId?: number | null): Observable<MenuSubCategory[]> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const targetId = Number(menuCategoryId || 1);
    this.selectedCategoryId.set(targetId);

    const params = new HttpParams()
      .set('menuCategoryId', targetId.toString())
      .set('MenuCategoryId', targetId.toString());

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.menuSubCategoriesGetAll, { params }).pipe(
      map((res) => {
        const raw = res?.data ?? res?.result ?? (Array.isArray(res) ? res : []);
        const list = Array.isArray(raw) ? raw : [];

        return list.map((item: any): MenuSubCategory => {
          const subName = (item.menuSubCategoryName ?? item.name ?? '').trim();
          const subNameEn = (item.menuSubCategoryName_En ?? item.name_En ?? '').trim();
          const parentName = (item.menuCategoryName ?? item.mainCategoryName ?? '').trim();

          return {
            ...item,
            id: Number(item.id ?? 0),
            menuSubCategoryName: subName,
            menuSubCategoryName_En: subNameEn,
            name: subName,
            name_En: subNameEn,
            menuCategoryName: parentName,
            mainCategoryName: parentName,
            menuCategoryId: Number(item.menuCategoryId ?? item.menuMainCategoryId ?? 0),
            photoURL: item.photoURL ?? null,
          };
        });
      }),
      tap({
        next: (items) => {
          this.subCategories.set(items);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || err?.message || 'فشل في تحميل الأقسام الفرعية');
        },
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of([]);
      })
    );
  }

  // =========================================================================
  // POST: /api/MenuSubCategories
  // =========================================================================
  createSubCategory(payload: CreateSubCategoryDto): Observable<any> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const body: Record<string, any> = {
      id: 0,
      name: payload.name.trim(),
      name_En: payload.name_En?.trim() || '',
      menuCategoryId: Number(payload.menuCategoryId),
      description: payload.description || '',
      description_En: payload.description_En || '',
      catOrder: payload.catOrder ?? 0,
    };

    if (payload.photoBase64) {
      body['photoURL'] = {
        base64String: payload.photoBase64,
      };
    } else if (payload.photoURL) {
      body['photoURL'] = payload.photoURL;
    } else {
      body['photoURL'] = null;
    }

    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.menuSubCategories, body).pipe(
      tap({
        next: () => {
          this.isSaving.set(false);
          this.getAllSubCategories(this.selectedCategoryId()).subscribe();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || err?.message || 'فشل في إضافة القسم الفرعي');
        },
      })
    );
  }

  // =========================================================================
  // PUT: /api/MenuSubCategories/{id}
  // =========================================================================
  updateSubCategory(id: number, payload: Partial<CreateSubCategoryDto>): Observable<any> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const body: Record<string, any> = {
      id,
      name: (payload.name || '').trim(),
      name_En: (payload.name_En || '').trim(),
      menuCategoryId: Number(payload.menuCategoryId || 0),
      description: payload.description || '',
      description_En: payload.description_En || '',
      catOrder: payload.catOrder ?? 0,
    };

    if (payload.photoBase64) {
      body['photoURL'] = {
        base64String: payload.photoBase64,
      };
    } else if (payload.photoURL) {
      body['photoURL'] = payload.photoURL;
    }

    return this.http.put<any>(`${DASHBOARD_API_ENDPOINTS.menuSubCategories}/${id}`, body).pipe(
      tap({
        next: () => {
          this.isSaving.set(false);
          this.getAllSubCategories(this.selectedCategoryId()).subscribe();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || err?.message || 'فشل في تعديل القسم الفرعي');
        },
      })
    );
  }

  // =========================================================================
  // DELETE: /api/MenuSubCategories/{id}
  // =========================================================================
  deleteSubCategory(id: number): Observable<any> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    return this.http.delete<any>(`${DASHBOARD_API_ENDPOINTS.menuSubCategories}/${id}`).pipe(
      tap({
        next: () => {
          this.isSaving.set(false);
          this.getAllSubCategories(this.selectedCategoryId()).subscribe();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || err?.message || 'فشل في حذف القسم الفرعي');
        },
      })
    );
  }
}
