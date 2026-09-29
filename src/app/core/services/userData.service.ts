import { Injectable, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserDataService {
   getUserData(): any {
    const user = localStorage.getItem('userData');
    return user ? JSON.parse(user) : null;
  }

  // Maqaa guutuu qofa argachuuf
  getUserFullName(): string {
    const user = this.getUserData();
    return user ? user.fullName : '';
  }

  // ID fayyadamaa argachuuf
  getUserId(): number | null {
    const user = this.getUserData();
    return user ? user.id : null;
  }
}