import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Allows the route only when a session token exists; otherwise redirects to /login. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (isPlatformBrowser(inject(PLATFORM_ID)) && localStorage.getItem('usertoken') !== null) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
