import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';

@Service()
export class CartService {
  private readonly _HttpClient = inject(HttpClient);

  GetUserCart(): Observable<any> {
    return this._HttpClient.get(
        `${environment.apiUrl}EMHome/GetMyOrders?SortField=id`
    );
}
}
