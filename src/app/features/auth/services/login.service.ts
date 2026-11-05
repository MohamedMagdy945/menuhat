import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { LoginRequest, LoginResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
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

  /**
   * Fetches the owner dashboard data.
   * If the owner has an active restaurant/dashboard, this returns 200 OK with dashboard data.
   * If the owner has no restaurant yet, the API returns an error.
   */
  getOwnerDashboard(token?: string): Observable<any> {
    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return this._HttpClient.get<any>(`${environment.apiUrl}/Dashboard`, { headers });
  }
}

