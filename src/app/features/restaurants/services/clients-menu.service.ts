import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { CreateRestaurantRequest } from '../models/create-restaurant-request.model';
@Injectable({
  providedIn: 'root'
})
export class ClientsMenuService {
  private readonly _http = inject(HttpClient);

  createRestaurant(payload: CreateRestaurantRequest): Observable<any> {
    return this._http.post<any>(`${environment.apiUrl}/ClientsMenus`, payload);
  }
}
