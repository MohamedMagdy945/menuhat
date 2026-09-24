import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../loading/loading.service';
import { USE_GLOBAL_LOADING } from '../loading/loading-context';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const useGlobalLoading =
    req.context.get(USE_GLOBAL_LOADING);

  // Request doesn't need the global loader
  if (!useGlobalLoading) {
    return next(req);
  }

  // Start global loading
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Stop global loading
      loadingService.hide();
    })
  );
};
