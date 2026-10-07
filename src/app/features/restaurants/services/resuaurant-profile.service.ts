import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { RestaurantRatingResponse } from '../models/restaurant-rating';
import { RestaurantDetails } from '../models/restaurant-details';
import { USE_GLOBAL_LOADING } from '../../../core/loading/loading-context';

@Injectable({
    providedIn: 'root',
})
export class ResuaurantProfileService {
    private readonly _HttpClient = inject(HttpClient);

    GetRestaurantDetails(serial: string): Observable<RestaurantDetails> {
        return this._HttpClient.get<RestaurantDetails>(
            `${environment.apiUrl}/ClientsMenus/GetMenus/${serial}`,
            { 
              params: { IsFromQRCode: false },
              context: new HttpContext().set(USE_GLOBAL_LOADING, true)
            },
        );
    }

    GetTopFiveRates(serial: string): Observable<RestaurantRatingResponse> {
        return this._HttpClient.get<RestaurantRatingResponse>(
            `${environment.apiUrl}/ClientsMenus/GetTopFiveRates/${serial}`
        );
    }

    AddRate(payload: { serial: string; rate: number; comment: string }): Observable<any> {
        return this._HttpClient.post<any>(
            `${environment.apiUrl}/ClientsMenus/AddRate`,
            payload,
            { context: new HttpContext().set(USE_GLOBAL_LOADING, true) }
        );
    }
}
