import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ADMIN_API_ENDPOINTS } from '../../../core/constants/admin-api.constants';
import { AdminMenusQuery } from './models/admin-menus-query.model';
import { AdminMenusResponse } from './models/admin-menus-response.model';
import { AdminMenuDetails } from './models/admin-menu-details.model';
import { AdminMenuUpdateRequest } from './models/admin-menu-update-request.model';
import { AdminMenuBySerial } from './models/admin-menu-by-serial.model';
import { AdminMenuPreparedInsert } from './models/admin-menu-prepared-insert.model';
import { AdminMenuCreateRequest } from './models/admin-menu-create-request.model';
import { AdminMenuFilePayload } from './models/admin-menu-file-payload.model';
import { AdminMenuRecord } from './models/admin-menu-record.model';

@Injectable({
  providedIn: 'root',
})
export class AdminRestaurantsService {
  private readonly _http = inject(HttpClient);

  /** GET /Admin/GetAllMenu?SortField=RowNo&PageNumber=&PageSize=&SearchValue=&GovernmentId=&CityId= */
  getMenus(query: AdminMenusQuery): Observable<AdminMenusResponse> {
    let params = new HttpParams()
      .set('SortField', 'RowNo')
      .set('PageNumber', query.pageNumber)
      .set('PageSize', query.pageSize);

    const search = query.searchValue?.trim();
    if (search) params = params.set('SearchValue', search);
    if (query.governmentId) params = params.set('GovernmentId', query.governmentId);
    if (query.cityId) params = params.set('CityId', query.cityId);

    return this._http.get<AdminMenusResponse>(ADMIN_API_ENDPOINTS.allMenus, { params }).pipe(
      map((res) => ({
        items: Array.isArray(res?.items) ? res.items : [],
        itemsCount: res?.itemsCount ?? 0,
        totalPages: res?.totalPages ?? 1,
      })),
    );
  }

  /** GET /Admin/GetMenu/{id} — unwraps `data` / `result` if the backend wraps it. */
  getMenu(id: number): Observable<AdminMenuDetails> {
    return this._http.get<unknown>(`${ADMIN_API_ENDPOINTS.menuById}/${id}`).pipe(
      map((res) => {
        const body = res as { data?: AdminMenuDetails; result?: AdminMenuDetails } | null;
        return (body?.data ?? body?.result ?? res ?? {}) as AdminMenuDetails;
      }),
    );
  }

  /** GET /Admin/GetMenus/{serial} — `null` when the serial does not exist (backend answers 204). */
  getMenuBySerial(serial: string): Observable<AdminMenuBySerial | null> {
    return this._http
      .get<AdminMenuBySerial | null>(
        `${ADMIN_API_ENDPOINTS.menuBySerial}/${encodeURIComponent(serial)}`,
      )
      .pipe(map((res) => (res?.main ? res : null)));
  }

  /** GET /Admin/PreparedForInsertMenu — the number the next menu will get. */
  getPreparedInsert(): Observable<AdminMenuPreparedInsert> {
    return this._http.get<AdminMenuPreparedInsert>(ADMIN_API_ENDPOINTS.preparedForInsertMenu);
  }

  /** POST /Admin/PostMenu */
  createMenu(request: AdminMenuCreateRequest): Observable<unknown> {
    return this._http.post(ADMIN_API_ENDPOINTS.createMenu, request);
  }

  /** PUT /Admin/PutMenu/{id} */
  updateMenu(request: AdminMenuUpdateRequest): Observable<unknown> {
    return this._http.put(`${ADMIN_API_ENDPOINTS.updateMenu}/${request.id}`, request);
  }

  /** PUT /Admin/UpdateLogoURLMenu/{id} — `dataUrl` must keep its `data:…;base64,` prefix. */
  updateLogo(id: number, dataUrl: string): Observable<AdminMenuRecord> {
    const body: AdminMenuFilePayload = { base64String: dataUrl };
    return this._http.put<AdminMenuRecord>(`${ADMIN_API_ENDPOINTS.updateMenuLogo}/${id}`, body);
  }

  /** PUT /Admin/UpdatePdfURMenuL/{id} — PDF or image, as a data URL. */
  updatePdf(id: number, dataUrl: string): Observable<AdminMenuRecord> {
    const body: AdminMenuFilePayload = { base64String: dataUrl };
    return this._http.put<AdminMenuRecord>(`${ADMIN_API_ENDPOINTS.updateMenuPdf}/${id}`, body);
  }

  /** DELETE /Admin/DeleteLogoURLMenu/{id} */
  deleteLogo(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteMenuLogo}/${id}`);
  }

  /** DELETE /Admin/DeletePdfURLMenu/{id} */
  deletePdf(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteMenuPdf}/${id}`);
  }

  /** DELETE /Admin/SoftDeleteMenu/{id} — can be restored later (RestoreMenu). */
  softDeleteMenu(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.softDeleteMenu}/${id}`);
  }
}
