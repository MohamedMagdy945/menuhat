import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';

@Service()
export class SupportService {
    private readonly _HttpClient = inject(HttpClient);

      sendComplaints(data: object): Observable<any> {
        return this._HttpClient.post(`${environment.apiUrl}/SupportComplaints`, data);
      }
}
