import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../core/environments/environment';
import { APP_ID } from '../../core/constants/app.constants';
import { CheckoutAddress } from './models/checkout-address.model';
import { CheckoutAddressesResponse } from './models/checkout-addresses-response.model';
import { UserPhonesResponse } from './models/user-phones-response.model';
import { AddUserAddressRequest } from './models/add-user-address-request.model';

/** Delivery addresses and verified phone numbers the customer can pick at checkout. */
@Injectable({
  providedIn: 'root',
})
export class CheckoutContactService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  readonly addresses = signal<CheckoutAddress[]>([]);
  readonly isLoadingAddresses = signal(false);

  readonly phones = signal<string[]>([]);
  readonly isLoadingPhones = signal(false);

  /** GET /Profile/GetAddressByUserId */
  loadAddresses(): Observable<CheckoutAddress[]> {
    this.isLoadingAddresses.set(true);
    return this._http
      .get<CheckoutAddressesResponse | CheckoutAddress[]>(
        `${this._apiUrl}/Profile/GetAddressByUserId`,
      )
      .pipe(
        map((res) => (Array.isArray(res) ? res : Array.isArray(res?.result) ? res.result : [])),
        tap((list) => this.addresses.set(list)),
        finalize(() => this.isLoadingAddresses.set(false)),
      );
  }

  /** POST /UsersAddress, then reloads the list (the response does not return the new id). */
  addAddress(request: AddUserAddressRequest): Observable<CheckoutAddress[]> {
    return this._http
      .post(`${this._apiUrl}/UsersAddress`, request)
      .pipe(switchMap(() => this.loadAddresses()));
  }

  /** PUT /Profile/PutAddress/{id}, then reloads the list. */
  updateAddress(id: number, request: AddUserAddressRequest): Observable<CheckoutAddress[]> {
    return this._http
      .put(`${this._apiUrl}/Profile/PutAddress/${id}`, request)
      .pipe(switchMap(() => this.loadAddresses()));
  }

  /** DELETE /Profile/DeleteAddress/{id} */
  deleteAddress(id: number): Observable<unknown> {
    return this._http
      .delete(`${this._apiUrl}/Profile/DeleteAddress/${id}`)
      .pipe(tap(() => this.addresses.update((list) => list.filter((a) => a.id !== id))));
  }

  /** GET /PhoneVerifications/GetAllNumbersForUser/{appId} — the user's verified numbers. */
  loadPhones(): Observable<string[]> {
    this.isLoadingPhones.set(true);
    return this._http
      .get<UserPhonesResponse>(`${this._apiUrl}/PhoneVerifications/GetAllNumbersForUser/${APP_ID}`)
      .pipe(
        map((res) => (Array.isArray(res?.result) ? res.result.filter(Boolean) : [])),
        tap((list) => this.phones.set(list)),
        finalize(() => this.isLoadingPhones.set(false)),
      );
  }
}
