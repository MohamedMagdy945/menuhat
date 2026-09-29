import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../core/environments/environment';

@Service()
export class ResuaurantProfileService {
    private readonly _HttpClient = inject(HttpClient);

    GetRestaurantDetails(serial: string, lat?: number | null, long?: number | null): Observable<any> {
        let params = new HttpParams().set('serial', serial);
  
        if (lat !== undefined && lat !== null) {
            params = params.set('lat', lat.toString());
        }
        if (long !== undefined && long !== null) {
            params = params.set('long', long.toString());
        }

        return this._HttpClient.get(`${environment.apiUrl}/ClientsMenus/GetMenus`, { params });
    }
}
