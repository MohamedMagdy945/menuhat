import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, switchMap, tap, finalize, shareReplay } from 'rxjs';
import { environment } from '../../core/environments/environment';
import { AddCartItem, AddCartResponse, CartMenuItem, CartMenuResponse } from './models/cart-item';
import { MenuOrderDTO } from './models/order';

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

  private _cartRequest$: Observable<CartMenuResponse> | null = null;

  GetCartsByUserId(forceRefresh: boolean = false): Observable<CartMenuResponse> {
    if (!forceRefresh && this.cartData()) {
      return of(this.cartData()!);
    }

    if (!forceRefresh && this._cartRequest$) {
      return this._cartRequest$;
    }

    this.isLoading.set(true);
    this._cartRequest$ = this._HttpClient.get<CartMenuResponse>(
      `${environment.apiUrl}/CartMenus/GetCartsByUserId`
    ).pipe(
      tap({
        next: (res) => {
          const rawItems = res?.result || [];
          const dedupedItems = this._dedupeItems(rawItems);
          const computedTotal = dedupedItems.reduce((acc, it) => acc + (it.total || ((it.price || 0) * (it.quantity || 1)) || 0), 0);
          const computedCount = dedupedItems.reduce((acc, it) => acc + (it.quantity || 1), 0);

          const normalizedRes: CartMenuResponse = {
            ...res,
            result: dedupedItems,
            totalCount: computedCount,
            totalPrice: computedTotal,
          };

          this.cartData.set(normalizedRes);
          this.cartItems.set(dedupedItems);
          this.cartCount.set(computedCount);
          this.cartTotalPrice.set(computedTotal);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      finalize(() => {
        this._cartRequest$ = null;
      })
    );

    return this._cartRequest$;
  }

  private _dedupeItems(items: CartMenuItem[]): CartMenuItem[] {
    if (!items || items.length === 0) return [];
    const map = new Map<string, CartMenuItem>();

    for (const item of items) {
      const key = item.productId
        ? `${item.productId}_${item.productPriceId ?? 'default'}`
        : `${item.id}`;

      if (map.has(key)) {
        const existing = map.get(key)!;
        if (item.id && existing.id && item.id === existing.id) {
          continue;
        }
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        existing.total = (existing.total || 0) + (item.total || ((item.price || 0) * (item.quantity || 1)));
      } else {
        map.set(key, { ...item });
      }
    }
    return Array.from(map.values());
  }

  AddItemsToCart(items: AddCartItem[]): Observable<AddCartResponse> {
    return this._HttpClient
      .post<AddCartResponse>(`${environment.apiUrl}/CartMenus/AddItemsToCart`, items);
  }

  AddItemsAndRefreshCart(items: AddCartItem[]): Observable<CartMenuResponse> {
    return this.AddItemsToCart(items).pipe(
      switchMap(() => this.GetCartsByUserId(true))
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

  removeItem(item: { productId: number; productPriceId?: number | null; id?: number; serial?: string }): Observable<CartMenuResponse> {
    const currentItems = this.cartItems();
    let payload: AddCartItem[] = currentItems
      .filter((it) => {
        if (item.id && it.id && it.id === item.id) return false;
        if (it.productId === item.productId && it.productPriceId === item.productPriceId) return false;
        return true;
      })
      .map((it) => ({
        productId: it.productId,
        productPriceId: it.productPriceId,
        quantity: it.quantity,
        serial: it.serial,
      }));

    // If deleting the last item in the cart, send quantity: 0 so API accepts the payload
    if (payload.length === 0) {
      payload = [{
        productId: item.productId,
        productPriceId: item.productPriceId ?? null,
        quantity: 0,
        serial: item.serial ?? '',
      }];
    }

    return this.AddItemsAndRefreshCart(payload);
  }

  private _mergeItemIntoPayload(existing: CartMenuItem[], newItem: AddCartItem): AddCartItem[] {
    const alreadyInCart = existing.some((it) => it.productId === newItem.productId);
    return [
      ...existing.map((it) => ({
        productId: it.productId,
        productPriceId: it.productPriceId,
        quantity: it.productId === newItem.productId ? it.quantity + (newItem.quantity || 1) : it.quantity,
        serial: it.serial,
      })),
      ...(!alreadyInCart ? [{
        productId: newItem.productId,
        productPriceId: newItem.productPriceId ?? null,
        quantity: newItem.quantity || 1,
        serial: newItem.serial ?? '',
      }] : []),
    ];
  }

  GetUserCart(): Observable<any> {
    return this._HttpClient.get(
      `${environment.apiUrl}/EMHome/GetMyOrders?SortField=id`
    );
  }

  createMenuOrder(orderDto: MenuOrderDTO): Observable<any> {
    return this._HttpClient.post(`${environment.apiUrl}/MenusOrders`, orderDto).pipe(
      tap(() => {
        // Refresh cart state to empty after successful order
        this.GetCartsByUserId(true).subscribe({ error: () => {} });
      })
    );
  }

  getUserAddresses(): Observable<any[]> {
    return this._HttpClient.get<any[]>(`${environment.apiUrl}/Profile/GetAddressByUserId`);
  }
}
