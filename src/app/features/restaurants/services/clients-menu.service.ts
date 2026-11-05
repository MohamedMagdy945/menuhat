import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';

export interface Base64FilePayload {
  base64String: string;
}

export interface CreateRestaurantRequest {
  clientName: string;
  clientName_En?: string;
  governmentId: number;
  cityId: number;
  address: string;
  address_En?: string;
  fieldId: number;
  orderConditionId: number;
  latitude: number;
  longitude: number;
  pdfURL?: Base64FilePayload | null;
  logoURL?: Base64FilePayload | null;
  coverURL?: Base64FilePayload | null;
  fromTime?: string | null;
  toTime?: string | null;
  notes?: string;
  isVisable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsMenuService {
  private readonly _http = inject(HttpClient);

  createRestaurant(payload: CreateRestaurantRequest): Observable<any> {
    return this._http.post<any>(`${environment.apiUrl}/ClientsMenus`, payload);
  }
}
