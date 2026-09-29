import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { jwtDecode } from 'jwt-decode';

@Service()
export class LoginService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly _Router = inject(Router);
  userData: any = null;

  SetLoginForm(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.apiUrl}/Auth/login`, data);
  }

  // SaveUserData(): void {
  //   if (localStorage.getItem('usertoken') !== null) {
  //     this.userData = jwtDecode(localStorage.getItem('usertoken')!);
  //   }
  // }

  SaveUserData(data?: any): void {
    if (data) {
      this.userData = data;
    } else if (localStorage.getItem('userData')) {
      this.userData = JSON.parse(localStorage.getItem('userData')!);
    }
  }

  logOut(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    this.userData = null;
    this._Router.navigate(['/login']);  
  }
  //    SetEmailVerify(data:object):Observable<any> {
  //     return this._HttpClient.post(`${environment.apiUrl}/api/v1/auth/forgotPasswords`, data);
  //   }

  //   SetCodeVerify(data:object):Observable<any> {
  //     return this._HttpClient.post(`${environment.apiUrl}/api/v1/auth/verifyResetCode`, data);
  //   }

  //   ResetPass(data:object):Observable<any> {
  //     return this._HttpClient.put(`${environment.apiUrl}/api/v1/auth/resetPassword`, data);
  //   }
}
