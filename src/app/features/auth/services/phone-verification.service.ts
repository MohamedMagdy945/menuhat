import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';

export interface RecievePhoneVerificationPayload {
  appId: number;
  phone: string;
}

export interface CheckPhoneVerifiedPayload {
  appId: number;
  phone: string;
  otp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhoneVerificationService {
  private readonly _http = inject(HttpClient);

  recievePhoneVerification(phone: string, appId: number = 2): Observable<any> {
    const payload: RecievePhoneVerificationPayload = {
      appId,
      phone
    };
    return this._http.post(`${environment.apiUrl}/PhoneVerifications/RecievePhoneVerification`, payload);
  }

  checkVerified(phone: string, otp: string, appId: number = 2): Observable<any> {
    const payload: CheckPhoneVerifiedPayload = {
      appId,
      phone,
      otp
    };
    return this._http.post(`${environment.apiUrl}/PhoneVerifications/CheckVerified`, payload);
  }
}
