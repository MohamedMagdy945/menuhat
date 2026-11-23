import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ADMIN_API_ENDPOINTS } from '../../../core/constants/admin-api.constants';
import { AdminMenusQuery } from './models/admin-menus-query.model';
import { AdminMenusResponse } from './models/admin-menus-response.model';
import { AdminMenuDetails } from './models/admin-menu-details.model';
import { AdminMenuUpdateRequest } from './models/admin-menu-update-request.model';

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

  /** PUT /Admin/PutMenu/{id} */
  updateMenu(request: AdminMenuUpdateRequest): Observable<unknown> {
    return this._http.put(`${ADMIN_API_ENDPOINTS.updateMenu}/${request.id}`, request);
  }

  /** DELETE /Admin/SoftDeleteMenu/{id} — can be restored later (RestoreMenu). */
  softDeleteMenu(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.softDeleteMenu}/${id}`);
  }
}
