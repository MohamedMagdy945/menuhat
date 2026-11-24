import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ADMIN_API_ENDPOINTS } from '../../../core/constants/admin-api.constants';
import { AdminMenuFilePayload } from '../restaurants/models/admin-menu-file-payload.model';
import { AdminMenuPreparedInsert } from '../restaurants/models/admin-menu-prepared-insert.model';
import { AdminCategoriesQuery } from './models/admin-categories-query.model';
import { AdminCategoriesResponse } from './models/admin-categories-response.model';
import { AdminCategory } from './models/admin-category.model';
import { AdminCategoryCreateRequest } from './models/admin-category-create-request.model';
import { AdminCategoryRecord } from './models/admin-category-record.model';
import { AdminCategoryUpdateRequest } from './models/admin-category-update-request.model';
import { AdminSubCategoriesQuery } from './models/admin-sub-categories-query.model';
import { AdminSubCategoriesResponse } from './models/admin-sub-categories-response.model';
import { AdminSubCategory } from './models/admin-sub-category.model';
import { AdminSubCategoryCreateRequest } from './models/admin-sub-category-create-request.model';
import { AdminSubCategoryRecord } from './models/admin-sub-category-record.model';
import { AdminSubCategoryUpdateRequest } from './models/admin-sub-category-update-request.model';

/** Platform-admin main categories (Admin/*MainCategory endpoints). */
@Injectable({
  providedIn: 'root',
})
export class AdminCategoriesService {
  private readonly _http = inject(HttpClient);

  /** GET /Admin/GetAllMainCategory?SortField=Id&PageNumber=&PageSize=&SearchValue=&MenuId= */
  getCategories(query: AdminCategoriesQuery): Observable<AdminCategoriesResponse> {
    let params = new HttpParams()
      .set('SortField', 'Id')
      .set('PageNumber', query.pageNumber)
      .set('PageSize', query.pageSize);

    const search = query.searchValue?.trim();
    if (search) params = params.set('SearchValue', search);
    if (query.menuId) params = params.set('MenuId', query.menuId);

    return this._http
      .get<AdminCategoriesResponse>(ADMIN_API_ENDPOINTS.allMainCategories, { params })
      .pipe(
        map((res) => ({
          items: Array.isArray(res?.items) ? res.items : [],
          itemsCount: res?.itemsCount ?? 0,
          totalPages: res?.totalPages ?? 1,
        })),
      );
  }

  /** GET /Admin/GetMainCategory/{id} — unwraps `result`. */
  getCategory(id: number): Observable<AdminCategory> {
    return this._http
      .get<{ result: AdminCategory }>(`${ADMIN_API_ENDPOINTS.mainCategoryById}/${id}`)
      .pipe(map((res) => res.result));
  }

  /** GET /Admin/PreparedForInsertMainCategory */
  getPreparedInsert(): Observable<AdminMenuPreparedInsert> {
    return this._http.get<AdminMenuPreparedInsert>(
      ADMIN_API_ENDPOINTS.preparedForInsertMainCategory,
    );
  }

  /** POST /Admin/PostMainCategory/{menuSerial} */
  createCategory(menuSerial: string, request: AdminCategoryCreateRequest): Observable<unknown> {
    return this._http.post(
      `${ADMIN_API_ENDPOINTS.createMainCategory}/${encodeURIComponent(menuSerial)}`,
      request,
    );
  }

  /** PUT /Admin/PutMainCategory/{id} */
  updateCategory(request: AdminCategoryUpdateRequest): Observable<unknown> {
    return this._http.put(`${ADMIN_API_ENDPOINTS.updateMainCategory}/${request.id}`, request);
  }

  /** PUT /Admin/UpdatePhotoMainCategory/{id} — `dataUrl` must keep its `data:…;base64,` prefix. */
  updatePhoto(id: number, dataUrl: string): Observable<AdminCategoryRecord | null> {
    const body: AdminMenuFilePayload = { base64String: dataUrl };
    return this._http
      .put<{ result?: AdminCategoryRecord }>(
        `${ADMIN_API_ENDPOINTS.updateMainCategoryPhoto}/${id}`,
        body,
      )
      .pipe(map((res) => res?.result ?? null));
  }

  /** DELETE /Admin/DeletePhotoMainCategory/{id} */
  deletePhoto(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteMainCategoryPhoto}/${id}`);
  }

  /** DELETE /Admin/DeleteMainCategory/{id} */
  deleteCategory(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteMainCategory}/${id}`);
  }

  // ---------- Sub categories ----------

  /** GET /Admin/GetAllSubCategory?SortField=Id&...&MenuCategoryId= */
  getSubCategories(query: AdminSubCategoriesQuery): Observable<AdminSubCategoriesResponse> {
    let params = new HttpParams()
      .set('SortField', 'Id')
      .set('PageNumber', query.pageNumber)
      .set('PageSize', query.pageSize)
      .set('MenuCategoryId', query.menuCategoryId);

    const search = query.searchValue?.trim();
    if (search) params = params.set('SearchValue', search);

    return this._http
      .get<AdminSubCategoriesResponse>(ADMIN_API_ENDPOINTS.allSubCategories, { params })
      .pipe(
        map((res) => ({
          items: Array.isArray(res?.items) ? res.items : [],
          itemsCount: res?.itemsCount ?? 0,
          totalPages: res?.totalPages ?? 1,
        })),
      );
  }

  /** GET /Admin/GetSubCategory/{subId} — unwraps `result`. */
  getSubCategory(id: number): Observable<AdminSubCategory> {
    return this._http
      .get<{ result: AdminSubCategory }>(`${ADMIN_API_ENDPOINTS.subCategoryById}/${id}`)
      .pipe(map((res) => res.result));
  }

  /** GET /Admin/PreparedForInsertSubCategory */
  getSubPreparedInsert(): Observable<AdminMenuPreparedInsert> {
    return this._http.get<AdminMenuPreparedInsert>(
      ADMIN_API_ENDPOINTS.preparedForInsertSubCategory,
    );
  }

  /** POST /Admin/PostSubCategory/{menuSerial} — serial of the main category's own restaurant. */
  createSubCategory(
    menuSerial: string,
    request: AdminSubCategoryCreateRequest,
  ): Observable<unknown> {
    return this._http.post(
      `${ADMIN_API_ENDPOINTS.createSubCategory}/${encodeURIComponent(menuSerial)}`,
      request,
    );
  }

  /** PUT /Admin/PutSubCategory/{id} */
  updateSubCategory(request: AdminSubCategoryUpdateRequest): Observable<unknown> {
    return this._http.put(`${ADMIN_API_ENDPOINTS.updateSubCategory}/${request.id}`, request);
  }

  /** PUT /Admin/UpdatePhotoSubCategory/{id} — data URL. */
  updateSubPhoto(id: number, dataUrl: string): Observable<AdminSubCategoryRecord | null> {
    const body: AdminMenuFilePayload = { base64String: dataUrl };
    return this._http
      .put<{ result?: AdminSubCategoryRecord }>(
        `${ADMIN_API_ENDPOINTS.updateSubCategoryPhoto}/${id}`,
        body,
      )
      .pipe(map((res) => res?.result ?? null));
  }

  /** DELETE /Admin/DeletePhotoSubCategory/{id} */
  deleteSubPhoto(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteSubCategoryPhoto}/${id}`);
  }

  /** DELETE /Admin/DeleteSubCategory/{id} */
  deleteSubCategory(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteSubCategory}/${id}`);
  }
}
