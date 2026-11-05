import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { DASHBOARD_API_ENDPOINTS } from '../constants/dashboard-api.constants';

export interface MenuMainCategory {
  id: number;
  name: string;
  name_En?: string;
  notes?: string;
  isActive?: boolean;
}

export interface MenuSubCategory {
  id: number;
  name: string;
  name_En?: string;
  menuMainCategoryId: number;
  mainCategoryName?: string;
  notes?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MenuCategoriesService {
  private readonly http = inject(HttpClient);

  readonly mainCategories = signal<MenuMainCategory[]>([]);
  readonly subCategories = signal<MenuSubCategory[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // =========================================================================
  // Main Categories: GET, GetAll, POST, PUT, DELETE
  // =========================================================================

  /**
   * static String menuMainCategoriesGetAll = '$baseUrl/MenuMainCategories/GetAll';
   */
  getAllMainCategories(): Observable<MenuMainCategory[]> {
    this.isLoading.set(true);
    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.menuMainCategoriesGetAll).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? (Array.isArray(res) ? res : []);
        return Array.isArray(raw) ? raw : [];
      }),
      tap({
        next: (items) => {
          this.mainCategories.set(items);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      }),
      catchError(() => of([]))
    );
  }

  /**
   * static String menuMainCategories = '$baseUrl/MenuMainCategories';
   */
  createMainCategory(payload: Partial<MenuMainCategory>): Observable<any> {
    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.menuMainCategories, payload).pipe(
      tap(() => this.getAllMainCategories().subscribe())
    );
  }

  updateMainCategory(id: number, payload: Partial<MenuMainCategory>): Observable<any> {
    return this.http.put<any>(`${DASHBOARD_API_ENDPOINTS.menuMainCategories}/${id}`, payload).pipe(
      tap(() => this.getAllMainCategories().subscribe())
    );
  }

  deleteMainCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${DASHBOARD_API_ENDPOINTS.menuMainCategories}/${id}`).pipe(
      tap(() => this.getAllMainCategories().subscribe())
    );
  }

  // =========================================================================
  // Sub Categories: GET, GetAll, POST, PUT, DELETE
  // =========================================================================

  /**
   * static String menuSubCategoriesGetAll = '$baseUrl/MenuSubCategories/GetAll';
   */
  getAllSubCategories(mainCategoryId?: number): Observable<MenuSubCategory[]> {
    this.isLoading.set(true);
    let params = new HttpParams();
    if (mainCategoryId) {
      params = params.set('menuMainCategoryId', mainCategoryId.toString());
    }

    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.menuSubCategoriesGetAll, { params }).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? (Array.isArray(res) ? res : []);
        return Array.isArray(raw) ? raw : [];
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

  /**
   * static String menuSubCategories = '$baseUrl/MenuSubCategories';
   */
  createSubCategory(payload: Partial<MenuSubCategory>): Observable<any> {
    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.menuSubCategories, payload).pipe(
      tap(() => this.getAllSubCategories().subscribe())
    );
  }

  updateSubCategory(id: number, payload: Partial<MenuSubCategory>): Observable<any> {
    return this.http.put<any>(`${DASHBOARD_API_ENDPOINTS.menuSubCategories}/${id}`, payload).pipe(
      tap(() => this.getAllSubCategories().subscribe())
    );
  }

  deleteSubCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${DASHBOARD_API_ENDPOINTS.menuSubCategories}/${id}`).pipe(
      tap(() => this.getAllSubCategories().subscribe())
    );
  }
}

