import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../core/environments/environment';
import { CartService } from './cart.service';
import { MenuOrderDTO } from './models/menu-order-dto.model';
import { MenuOrderResponse } from './models/menu-order-response.model';

@Injectable({
  providedIn: 'root',
})
export class MenuOrdersService {
  private readonly _http = inject(HttpClient);
  private readonly _cartService = inject(CartService);
  private readonly _baseUrl = `${environment.apiUrl}/MenusOrders`;

  /**
   * Places an order and then refreshes the cart.
   * - `menuId` omitted → POST /MenusOrders (every restaurant in the cart)
   * - `menuId` given   → POST /MenusOrders/Order/{menuId} (only that restaurant's items)
   */
  createOrder(order: MenuOrderDTO, menuId?: number | null): Observable<MenuOrderResponse> {
    const url = menuId ? `${this._baseUrl}/Order/${menuId}` : this._baseUrl;

    return this._http.post<MenuOrderResponse>(url, order).pipe(
      switchMap((res) =>
        this._cartService.GetCartsByUserId().pipe(
          map(() => res),
          // A failed refresh must not turn a placed order into an error.
          catchError(() => of(res)),
        ),
      ),
    );
  }

  /** Builds an Arabic, user-facing message from a failed order response / HTTP error. */
  getErrorMessage(err: unknown): string {
    const body = (err as { error?: Partial<MenuOrderResponse> & { title?: string } })?.error;
    const parts: string[] = [];

    if (body?.message) {
      parts.push(body.message);
    }

    const invalidMenus = (body?.invalidMenus ?? []).filter(Boolean);
    if (invalidMenus.length > 0) {
      parts.push(`مطاعم غير متاحة حالياً: ${invalidMenus.join('، ')}`);
    }

    if (parts.length === 0 && body?.title) {
      parts.push(body.title);
    }

    return parts.length > 0
      ? parts.join(' — ')
      : 'تعذر إتمام الطلب حالياً، يرجى التحقق من البيانات وإعادة المحاولة.';
  }

  /** True when a 2xx response still reports menus that could not be ordered. */
  hasInvalidMenus(res: MenuOrderResponse | null | undefined): boolean {
    return (res?.invalidMenus?.length ?? 0) > 0 || (res?.invalidSerials?.length ?? 0) > 0;
  }
}
