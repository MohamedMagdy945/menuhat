import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { CreateRestaurantRequest } from '../models/create-restaurant-request.model';
import { ClientsMenusResponse } from '../models/clients-menus-response.model';
import { PageData } from '../../../shared/models/pagination/page-data.model';
import { SearchResultItem } from '../../search/models/search-result-item.model';

@Injectable({
  providedIn: 'root',
})
export class ClientsMenuService {
  private readonly _http = inject(HttpClient);

  createRestaurant(payload: CreateRestaurantRequest): Observable<any> {
    return this._http.post<any>(`${environment.apiUrl}/ClientsMenus`, payload);
  }

  /**
   * Paged restaurant search: GET /api/ClientsMenus?SearchValue=&PageNumber=&PageSize=
   */
  searchRestaurants(
    searchValue: string,
    pageNumber: number,
    pageSize: number,
  ): Observable<PageData<SearchResultItem>> {
    return this._http
      .get<ClientsMenusResponse>(`${environment.apiUrl}/ClientsMenus`, {
        params: {
          SortField: 'RowNo',
          SearchValue: searchValue,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })
      .pipe(
        map((res) => {
          const items = Array.isArray(res?.data?.items) ? res.data.items : [];
          return {
            result: items.map((restaurant): SearchResultItem => ({
              id: restaurant.id,
              title: (restaurant.clientName ?? '').trim(),
              subtitle: (restaurant.city_Ar || restaurant.government_Ar || '').trim(),
              imagePath: restaurant.logoURL,
              fallbackImage: '/images/default-restaurant.png',
              price: null,
              link: ['/restaurants', restaurant.serial],
            })),
            itemsCount: res?.data?.totalCount ?? items.length,
            totalPages: res?.data?.totalPages ?? 1,
          };
        }),
      );
  }
}
