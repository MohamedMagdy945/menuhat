import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { LoginRequest, LoginResponse } from '../models';

@Service()
export class LoginService {
  private readonly _HttpClient = inject(HttpClient);

  login(data: LoginRequest | Omit<LoginRequest, 'appId'>): Observable<LoginResponse> {
    const payload: LoginRequest = {
      appId: 2,
      mobile: data.mobile,
      password: data.password
    };
    return this._HttpClient.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, payload);
  }

  SetLogin(data: LoginRequest | Omit<LoginRequest, 'appId'>): Observable<LoginResponse> {
    return this.login(data);
  }
}
