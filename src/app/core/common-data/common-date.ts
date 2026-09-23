import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface DropdownItem {
  id: number;
  name: string;
}

@Service()
export class CommonDateService {
  private readonly _HttpClient = inject(HttpClient);

  // جلب المحافظات
  getGovernments(): Observable<DropdownItem[]> {
    return this._HttpClient.get<DropdownItem[]>(`${environment.apiUrl}/CommonData/FillGovernmentsDropdown`);
  }

  // جلب المدن بناءً على id المحافظة
  getCitiesByGovernmentId(governmentId: number): Observable<DropdownItem[]> {
    return this._HttpClient.get<DropdownItem[]>(`${environment.apiUrl}/CommonData/FillCitiesDropdown/${governmentId}`);
  }
}
