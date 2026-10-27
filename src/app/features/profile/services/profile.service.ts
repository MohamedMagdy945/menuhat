import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize, catchError, of } from 'rxjs';
import { environment } from '../../../core/environments/environment';
import { UserDataService } from '../../../core/services/userData.service';
import {
  UserProfile,
  UpdateProfileRequest,
  UserAddress,
  ChangePasswordRequest,
} from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly userDataService = inject(UserDataService);
  private readonly apiUrl = environment.apiUrl;

  readonly profile = signal<UserProfile | null>(null);
  readonly addresses = signal<UserAddress[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Fetches profile data from /api/Profile/GetProfileByUserId
   */
  loadProfile(): Observable<UserProfile | null> {
    if (!this.userDataService.getToken()) {
      this.profile.set(null);
      return of(null);
    }

    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<UserProfile>(`${this.apiUrl}/Profile/GetProfileByUserId`).pipe(
      tap((data) => {
        this.profile.set(data);
      }),
      catchError((err) => {
        console.error('Error loading user profile:', err);
        this.error.set('تعذر تحميل بيانات الملف الشخصي');
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }

  /**
   * Updates basic profile info (fullName, defaultLang) via /api/Profile/PutProfile
   */
  updateProfile(data: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Profile/PutProfile`, data).pipe(
      tap(() => {
        this.profile.update((p) => (p ? { ...p, fullName: data.fullName, defaultLang: data.defaultLang } : p));
        // Update user data in storage if applicable
        const current = this.userDataService.currentUser();
        if (current) {
          this.userDataService.setUserData({ ...current, fullName: data.fullName, defaultLang: data.defaultLang });
        }
      }),
    );
  }

  /**
   * Updates user avatar via /api/Profile/UpdatePhoto
   */
  updatePhoto(base64String: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/Profile/UpdatePhoto`, {
        base64String,
        photoTitle: 'avatar.png',
        photoDiscription: 'User Profile Photo',
      })
      .pipe(
        tap(() => {
          this.profile.update((p) =>
            p
              ? {
                ...p,
                photo: {
                  base64String,
                  photoTitle: 'avatar.png',
                  photoDiscription: 'User Profile Photo',
                },
              }
              : p,
          );
        }),
      );
  }

  /**
   * Deletes avatar photo via /api/Profile/DeletePhoto
   */
  deletePhoto(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Profile/DeletePhoto`).pipe(
      tap(() => {
        this.profile.update((p) => (p ? { ...p, photo: null } : p));
      }),
    );
  }

  /**
   * Loads user addresses from /api/Profile/GetAddressByUserId
   */
  loadAddresses(): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(`${this.apiUrl}/Profile/GetAddressByUserId`).pipe(
      tap((addresses) => {
        this.addresses.set(addresses || []);
      }),
      catchError((err) => {
        console.error('Error loading addresses:', err);
        return of([]);
      }),
    );
  }

  /**
   * Changes account password via /api/Auth/changePassword
   */
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/changePassword`, data);
  }

  /**
   * Deletes user account via /api/Profile/DeleteAccount
   */
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Profile/DeleteAccount`).pipe(
      tap(() => {
        this.userDataService.clearUserData();
      }),
    );
  }
}
