import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { RegisterRequest } from '../models';

@Service()
export class RegisterService {
  private readonly _HttpClient = inject(HttpClient);

  sendemail(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.apiUrl}/Auth/SendOtp`, data);
  }

  ValidateOtp(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.apiUrl}/Auth/ValidateOtp`, data);
  }

  SetRegister(data: RegisterRequest | object): Observable<any> {
    return this._HttpClient.post(`${environment.apiUrl}/Auth/register`, data);
  }

  recievePhoneVerification(data: { appId?: number; phone: string }): Observable<any> {
    const payload = { appId: data.appId ?? 2, phone: data.phone };
    return this._HttpClient.post(`${environment.apiUrl}/PhoneVerifications/RecievePhoneVerification`, payload);
  }

  checkPhoneVerified(data: { appId?: number; phone: string; otp: string }): Observable<any> {
    const payload = { appId: data.appId ?? 2, phone: data.phone, otp: data.otp };
    return this._HttpClient.post(`${environment.apiUrl}/PhoneVerifications/CheckVerified`, payload);
  }

}