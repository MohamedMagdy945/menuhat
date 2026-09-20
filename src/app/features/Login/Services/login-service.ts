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
   userData:any = null;

   SetLoginForm(data:object):Observable<any>
   {
    return this._HttpClient.post(`${environment.apiUrl}/Auth/login`, data);
   }
      
   SaveUserData():void
   {
    if(localStorage.getItem('userToken') !== null) 
      {
        this.userData = jwtDecode(localStorage.getItem('userToken') !);
      }
   } 

//    logOut():void{
//     localStorage.removeItem('usertoken');
//     this.userData = null;
//     this._Router.navigate(['/login']);
//    }

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
