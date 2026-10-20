import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../core/environments/environment';
import { AddCartItem, AddCartResponse, CartMenuItem, CartMenuResponse } from './models/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly _HttpClient = inject(HttpClient);

  readonly cartData = signal<CartMenuResponse | null>(null);
  readonly cartItems = signal<CartMenuItem[]>([]);
  readonly cartCount = signal<number>(0);
  readonly cartTotalPrice = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  GetCartsByUserId(): Observable<CartMenuResponse> {
    this.isLoading.set(true);
    return this._HttpClient.get<CartMenuResponse>(
      `${environment.apiUrl}/CartMenus/GetCartsByUserId`
    ).pipe(
      tap({
        next: (res) => {
          console.log('res', res);
          this.cartData.set(res);
          this.cartItems.set(res?.result || []);
          this.cartCount.set(res?.totalCount || 0);
          this.cartTotalPrice.set(res?.totalPrice || 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }


  AddItemsToCart(items: AddCartItem[]): Observable<AddCartResponse> {
    return this._HttpClient
      .post<AddCartResponse>(`${environment.apiUrl}/CartMenus/AddItemsToCart`, items);
  }

  AddItemsAndRefreshCart(items: AddCartItem[]): Observable<CartMenuResponse> {
    return this.AddItemsToCart(items).pipe(
      switchMap(() => this.GetCartsByUserId())
    );
  }

  GetUserCart(): Observable<any> {
    return this._HttpClient.get(
      `${environment.apiUrl}/EMHome/GetMyOrders?SortField=id`
    );
  }
}
