import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoginUserData } from '../../features/auth/models';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private readonly platformId = inject(PLATFORM_ID);

  // Reactive signals for state management
  readonly currentUser = signal<LoginUserData | null>(null);
  readonly token = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.loadUserData();
  }

  /**
   * Reads user data and token from localStorage and initializes the reactive signals.
   */
  loadUserData(): LoginUserData | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const savedToken = localStorage.getItem('usertoken');
      this.token.set(savedToken);

      const savedUser = localStorage.getItem('userData');
      if (savedUser) {
        const parsedUser: LoginUserData = JSON.parse(savedUser);
        this.currentUser.set(parsedUser);
        return parsedUser;
      }
    } catch (error) {
      console.error('Error reading user data from localStorage:', error);
      this.currentUser.set(null);
    }

    return null;
  }

  /**
   * Saves user data and optional token into localStorage and updates signals.
   */
  setUserData(userData: LoginUserData, token?: string): void {
    this.currentUser.set(userData);

    if (token !== undefined) {
      this.token.set(token);
    }

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('userData', JSON.stringify(userData));
        if (token) {
          localStorage.setItem('usertoken', token);
        }
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
      }
    }
  }

  /**
   * Synchronously returns current user data.
   */
  getUserData(): LoginUserData | null {
    if (!this.currentUser()) {
      return this.loadUserData();
    }
    return this.currentUser();
  }

  /**
   * Gets user full name.
   */
  getUserFullName(): string {
    const user = this.getUserData();
    return user?.fullName || '';
  }

  /**
   * Gets user ID.
   */
  getUserId(): number | null {
    const user = this.getUserData();
    return user ? user.id : null;
  }

  /**
   * Gets authentication token.
   */
  getToken(): string | null {
    if (this.token()) {
      return this.token();
    }
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('usertoken');
    }
    return null;
  }

  /**
   * Clears user data and token from storage and resets signals (logout).
   */
  clearUserData(): void {
    this.currentUser.set(null);
    this.token.set(null);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('userData');
        localStorage.removeItem('usertoken');
      } catch (error) {
        console.error('Error clearing user data from localStorage:', error);
      }
    }
  }
}