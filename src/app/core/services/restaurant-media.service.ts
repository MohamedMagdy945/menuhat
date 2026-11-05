import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DASHBOARD_API_ENDPOINTS } from '../constants/dashboard-api.constants';

export interface AlbumItem {
  id: number;
  menuId?: number;
  title?: string;
  imageURL: string;
  isCover?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantMediaService {
  private readonly http = inject(HttpClient);

  readonly albums = signal<AlbumItem[]>([]);
  readonly isLoading = signal<boolean>(false);

  // =========================================================================
  // 1. static String ownerProfileMenu = '$baseUrl/Profile/menu';
  // =========================================================================
  getProfileMenu(): Observable<any> {
    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.ownerProfileMenu);
  }

  updateProfileMenu(payload: any): Observable<any> {
    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.ownerProfileMenu, payload);
  }

  // =========================================================================
  // 2. static String albums = '$baseUrl/Albums/menu';
  // =========================================================================
  getMenuAlbums(): Observable<any> {
    this.isLoading.set(true);
    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.albums).pipe(
      tap({
        next: (res) => {
          const list = res?.result ?? res?.data ?? (Array.isArray(res) ? res : []);
          this.albums.set(Array.isArray(list) ? list : []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      })
    );
  }

  // =========================================================================
  // 3. static String baseAlbums = '$baseUrl/Albums';
  // =========================================================================
  createAlbum(payload: any): Observable<any> {
    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.baseAlbums, payload).pipe(
      tap(() => this.getMenuAlbums().subscribe())
    );
  }

  deleteAlbum(id: number): Observable<any> {
    return this.http.delete<any>(`${DASHBOARD_API_ENDPOINTS.baseAlbums}/${id}`).pipe(
      tap(() => this.getMenuAlbums().subscribe())
    );
  }

  // =========================================================================
  // 4. static String selectProfilePicture = '$baseUrl/ClientsMenus/profile/select';
  // =========================================================================
  selectProfilePicture(photoUrlOrId: string | number): Observable<any> {
    const payload = typeof photoUrlOrId === 'number' ? { photoId: photoUrlOrId } : { photoUrl: photoUrlOrId };
    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.selectProfilePicture, payload);
  }

  // =========================================================================
  // 5. static String selectCoverPicture = '$baseUrl/ClientsMenus/cover/select';
  // =========================================================================
  selectCoverPicture(photoUrlOrId: string | number): Observable<any> {
    const payload = typeof photoUrlOrId === 'number' ? { photoId: photoUrlOrId } : { photoUrl: photoUrlOrId };
    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.selectCoverPicture, payload);
  }
}

