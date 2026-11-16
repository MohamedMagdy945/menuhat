import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { DASHBOARD_API_ENDPOINTS } from '../../../core/constants/dashboard-api.constants';
import { MenuMainCategory } from './models/menu-main-category.model';
import { MenuSubCategory } from './models/menu-sub-category.model';



@Injectable({
    providedIn: 'root',
})
export class MenusService {
    private readonly http = inject(HttpClient);

    // Categories signals
    readonly mainCategories = signal<MenuMainCategory[]>([]);
    readonly subCategories = signal<MenuSubCategory[]>([]);
    readonly isLoading = signal<boolean>(false);
    readonly isSaving = signal<boolean>(false);
    readonly errorMessage = signal<string | null>(null);

    readonly mainCategoriesCount = computed(() => this.mainCategories().length);
    readonly subCategoriesCount = computed(() => this.subCategories().length);

    // =========================================================================
    // Image URL Helper
    // =========================================================================
    resolveImageUrl(url: string | null | undefined): string {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;

        const baseOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

        // Default system images (e.g. /DefaultImages/بيتزا.png) are hosted on root origin
        if (url.startsWith('/DefaultImages') || url.startsWith('DefaultImages')) {
            const path = url.startsWith('/') ? url : `/${url}`;
            return `${baseOrigin}${path}`;
        }

        // Uploaded user media files
        const cleanPath = url.replace(/^\//, '');
        return `${environment.filesUrl}/${cleanPath}`;
    }

    // =========================================================================
    // Main Categories: GET, POST, PUT, DELETE
    // Endpoint: /api/MenuMainCategories/GetAll
    // =========================================================================

    getAllMainCategories(): Observable<MenuMainCategory[]> {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        return this.http.get<any>(DASHBOARD_API_ENDPOINTS.menuMainCategoriesGetAll).pipe(
            map((res) => {
                const raw = res?.data ?? res?.result ?? (Array.isArray(res) ? res : []);
                const list = Array.isArray(raw) ? raw : [];

                // Normalize item fields so both menuMainCategoryName & name are always populated
                return list.map((item: any): MenuMainCategory => {
                    const catName = (item.menuMainCategoryName ?? item.name ?? '').trim();
                    const catNameEn = (item.menuMainCategoryName_En ?? item.name_En ?? '').trim();

                    return {
                        ...item,
                        id: Number(item.id ?? 0),
                        menuMainCategoryName: catName,
                        menuMainCategoryName_En: catNameEn,
                        name: catName,
                        name_En: catNameEn,
                        photoURL: item.photoURL ?? null,
                    };
                });
            }),
            tap({
                next: (items) => {
                    this.mainCategories.set(items);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(err?.error?.message || err?.message || 'فشل في تحميل الأقسام الرئيسية');
                },
            }),
            catchError(() => {
                this.isLoading.set(false);
                return of([]);
            })
        );
    }

    createMainCategory(payload: {
        name?: string;
        menuMainCategoryName?: string;
        name_En?: string;
        menuMainCategoryName_En?: string;
        photoURL?: string | null;
        menuId?: number;
        [key: string]: any;
    }): Observable<any> {
        this.isSaving.set(true);
        this.errorMessage.set(null);

        const arabicName = (payload.menuMainCategoryName || payload.name || '').trim();
        const englishName = (payload.menuMainCategoryName_En || payload.name_En || '').trim();

        const body = {
            ...payload,
            menuMainCategoryName: arabicName,
            menuMainCategoryName_En: englishName,
            name: arabicName,
            name_En: englishName,
            photoURL: payload.photoURL ?? null,
            menuId: payload.menuId ?? 1,
        };

        return this.http.post<any>(DASHBOARD_API_ENDPOINTS.menuMainCategories, body).pipe(
            tap({
                next: () => {
                    this.isSaving.set(false);
                    this.getAllMainCategories().subscribe();
                },
                error: (err) => {
                    this.isSaving.set(false);
                    this.errorMessage.set(err?.error?.message || err?.message || 'فشل في إضافة القسم');
                },
            })
        );
    }

    updateMainCategory(
        id: number,
        payload: {
            name?: string;
            menuMainCategoryName?: string;
            name_En?: string;
            menuMainCategoryName_En?: string;
            photoURL?: string | null;
            [key: string]: any;
        }
    ): Observable<any> {
        this.isSaving.set(true);
        this.errorMessage.set(null);

        const arabicName = (payload.menuMainCategoryName || payload.name || '').trim();
        const englishName = (payload.menuMainCategoryName_En || payload.name_En || '').trim();

        const body = {
            ...payload,
            id,
            menuMainCategoryName: arabicName,
            menuMainCategoryName_En: englishName,
            name: arabicName,
            name_En: englishName,
            photoURL: payload.photoURL ?? null,
        };

        return this.http.put<any>(`${DASHBOARD_API_ENDPOINTS.menuMainCategories}/${id}`, body).pipe(
            tap({
                next: () => {
                    this.isSaving.set(false);
                    this.getAllMainCategories().subscribe();
                },
                error: (err) => {
                    this.isSaving.set(false);
                    this.errorMessage.set(err?.error?.message || err?.message || 'فشل في تعديل القسم');
                },
            })
        );
    }

    deleteMainCategory(id: number): Observable<any> {
        this.isSaving.set(true);
        this.errorMessage.set(null);

        return this.http.delete<any>(`${DASHBOARD_API_ENDPOINTS.menuMainCategories}/${id}`).pipe(
            tap({
                next: () => {
                    this.isSaving.set(false);
                    this.getAllMainCategories().subscribe();
                },
                error: (err) => {
                    this.isSaving.set(false);
                    this.errorMessage.set(err?.error?.message || err?.message || 'فشل في حذف القسم');
                },
            })
        );
    }

    // =========================================================================
    // Sub Categories: GET, POST, PUT, DELETE
    // Endpoint: /api/MenuSubCategories/GetAll
    // =========================================================================

    getAllSubCategories(menuCategoryId?: number | null): Observable<MenuSubCategory[]> {
        this.isLoading.set(true);
        const targetId = Number(menuCategoryId || 1);
        const params = new HttpParams().set('menuCategoryId', targetId.toString());

        return this.http.get<any>(DASHBOARD_API_ENDPOINTS.menuSubCategoriesGetAll, { params }).pipe(
            map((res) => {
                const raw = res?.data ?? res?.result ?? (Array.isArray(res) ? res : []);
                const list = Array.isArray(raw) ? raw : [];

                return list.map((item: any): MenuSubCategory => ({
                    ...item,
                    id: Number(item.id ?? 0),
                    name: (item.menuSubCategoryName ?? item.name ?? '').trim(),
                    name_En: (item.menuSubCategoryName_En ?? item.name_En ?? '').trim(),
                    menuSubCategoryName: (item.menuSubCategoryName ?? item.name ?? '').trim(),
                    menuSubCategoryName_En: (item.menuSubCategoryName_En ?? item.name_En ?? '').trim(),
                    menuCategoryId: Number(item.menuCategoryId ?? targetId),
                    menuMainCategoryId: Number(item.menuMainCategoryId ?? item.menuCategoryId ?? targetId),
                }));
            }),
            tap({
                next: (items) => {
                    this.subCategories.set(items);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.isLoading.set(false);
                },
            }),
            catchError(() => of([]))
        );
    }

    createSubCategory(payload: {
        name: string;
        menuMainCategoryId: number;
        name_En?: string;
        [key: string]: any;
    }): Observable<any> {
        this.isSaving.set(true);
        const body = {
            ...payload,
            menuSubCategoryName: payload.name.trim(),
            name: payload.name.trim(),
            menuMainCategoryId: payload.menuMainCategoryId,
            menuSubCategoryName_En: payload.name_En?.trim() || '',
            name_En: payload.name_En?.trim() || '',
        };

        return this.http.post<any>(DASHBOARD_API_ENDPOINTS.menuSubCategories, body).pipe(
            tap({
                next: () => {
                    this.isSaving.set(false);
                    this.getAllSubCategories().subscribe();
                },
                error: () => {
                    this.isSaving.set(false);
                },
            })
        );
    }

    deleteSubCategory(id: number): Observable<any> {
        this.isSaving.set(true);
        return this.http.delete<any>(`${DASHBOARD_API_ENDPOINTS.menuSubCategories}/${id}`).pipe(
            tap({
                next: () => {
                    this.isSaving.set(false);
                    this.getAllSubCategories().subscribe();
                },
                error: () => {
                    this.isSaving.set(false);
                },
            })
        );
    }
}
