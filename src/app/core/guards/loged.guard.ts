import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Allows the route only for guests; logged-in users are redirected to /home. */
export const logedGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (isPlatformBrowser(inject(PLATFORM_ID)) && localStorage.getItem('usertoken') !== null) {
    return router.createUrlTree(['/home']);
  }
  return true;
};
