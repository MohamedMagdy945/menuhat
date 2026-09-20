import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/Interceptor/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([ authInterceptor ]))

  ]
};
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes,withViewTransitions()),
//     provideClientHydration(),

//     provideHttpClient( withFetch(), withInterceptors([ headerInterceptor, errorsInterceptor, loadingInterceptor ])),

//     provideAnimations(),

//     provideToastr(),

//     importProvidersFrom( 
//       NgxSpinnerModule,
//       TranslateModule.forRoot({
//         defaultLanguage: 'en',
//         loader: provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' })
//       })
//     )
//   ]
// };