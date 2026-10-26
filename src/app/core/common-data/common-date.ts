import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface DropdownItem {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommonDateService {
  private readonly _HttpClient = inject(HttpClient);

  getGovernments(): Observable<DropdownItem[]> {
    return this._HttpClient.get<DropdownItem[]>(`${environment.apiUrl}/CommonData/FillGovernmentsDropdown`);
  }

  getCitiesByGovernmentId(governmentId: number): Observable<DropdownItem[]> {
    return this._HttpClient.get<DropdownItem[]>(`${environment.apiUrl}/CommonData/FillCitiesDropdown/${governmentId}`);
  }

  getOrderStatuses(): Observable<DropdownItem[]> {
    return this._HttpClient.get<DropdownItem[]>(`${environment.apiUrl}/CommonData/FillOrderStatusDropdown`);
  }
}
