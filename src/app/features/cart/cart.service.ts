import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, switchMap, tap, finalize } from 'rxjs';
import { environment } from '../../core/environments/environment';
import { AddCartItem } from './models/add-cart-item.model';
import { AddCartResponse } from './models/add-cart-response.model';
import { CartMenuItem } from './models/cart-menu-item.model';
import { CartMenuResponse } from './models/cart-menu-response.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly _http = inject(HttpClient);

  // Reactive state management
  readonly cartData = signal<CartMenuResponse | null>(null);
  readonly cartItems = computed<CartMenuItem[]>(() => this.cartData()?.result ?? []);
  readonly cartCount = computed<number>(() => this.cartData()?.totalCount ?? 0);
  readonly cartTotalPrice = computed<number>(() => this.cartData()?.totalPrice ?? 0);
  readonly isLoading = signal<boolean>(false);

  /**
   * Fetches user cart from the server.
   * Authentication is handled automatically via JWT Bearer interceptor.
   */
  GetCartsByUserId(): Observable<CartMenuResponse> {
    this.isLoading.set(true);
    return this._http
      .get<CartMenuResponse>(`${environment.apiUrl}/CartMenus/GetCartsByUserId`)
      .pipe(
        tap({
          next: (res) => this.cartData.set(res),
          error: (err) => console.error('Error fetching cart:', err),
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  AddItemsToCart(items: AddCartItem[]): Observable<AddCartResponse> {
    const sanitizedItems = items.map((it) => ({
      ...it,
      price: it.price ?? 0,
      productPriceId: it.productPriceId ?? null,
      serial: it.serial ?? '',
    }));
    return this._http.post<AddCartResponse>(
      `${environment.apiUrl}/CartMenus/AddItemsToCart`,
      sanitizedItems
    );
  }

  AddItemsAndRefreshCart(items: AddCartItem[]): Observable<CartMenuResponse> {
    return this.AddItemsToCart(items).pipe(
      switchMap(() => this.GetCartsByUserId())
    );
  }

  addItem(newItem: AddCartItem): Observable<CartMenuResponse> {
    const currentItems = this.cartItems();
    if (currentItems.length === 0 && !this.cartData()) {
      return this.GetCartsByUserId().pipe(
        switchMap((res) => {
          const fresh = res?.result || [];
          const payload = this._mergeItemIntoPayload(fresh, newItem);
          return this.AddItemsAndRefreshCart(payload);
        })
      );
    }

    const payload = this._mergeItemIntoPayload(currentItems, newItem);
    return this.AddItemsAndRefreshCart(payload);
  }

  /**
   * Deletes a single cart item by its cart-item id (DELETE /CartMenus/{id}),
   * then refreshes the cart state.
   */
  removeItem(cartItemId: number): Observable<CartMenuResponse> {
    return this._http
      .delete(`${environment.apiUrl}/CartMenus/${cartItemId}`)
      .pipe(switchMap(() => this.GetCartsByUserId()));
  }

  private _mergeItemIntoPayload(existing: CartMenuItem[], newItem: AddCartItem): AddCartItem[] {
    const isMatching = (it: CartMenuItem) =>
      it.productId === newItem.productId &&
      ((!it.productPriceId && !newItem.productPriceId) || it.productPriceId === newItem.productPriceId);

    const alreadyInCart = existing.some(isMatching);

    return [
      ...existing.map((it) => ({
        productId: it.productId,
        productPriceId: it.productPriceId ?? null,
        quantity: isMatching(it) ? it.quantity + (newItem.quantity || 1) : it.quantity,
        serial: it.serial ?? '',
        price: it.price ?? 0,
      })),
      ...(!alreadyInCart ? [{
        productId: newItem.productId,
        productPriceId: newItem.productPriceId ?? null,
        quantity: newItem.quantity || 1,
        serial: newItem.serial ?? '',
        price: newItem.price ?? 0,
      }] : []),
    ];
  }

  GetUserCart(): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}/EMHome/GetMyOrders?SortField=id`
    );
  }

}
