import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../core/environments/environment';

@Service()
export class RegisterService {
  private readonly _HttpClient = inject(HttpClient);

sendemail(data: object): Observable<any> {
  return this._HttpClient.post(`${environment.apiUrl}/Auth/SendOtp`, data);
}

ValidateOtp(data: object): Observable<any> {
  return this._HttpClient.post(`${environment.apiUrl}/Auth/ValidateOtp`, data);
}
}