import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestaurantDetails } from '../models/restaurant-details';
import { environment } from '../../../core/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ResuaurantProfileService {
    private readonly _HttpClient = inject(HttpClient);

    GetRestaurantDetails(serial: string): Observable<RestaurantDetails> {
        return this._HttpClient.get<RestaurantDetails>(
            `${environment.apiUrl}/ClientsMenus/GetMenus/${serial}`,
            { params: { IsFromQRCode: false } },
        );
    }
}
