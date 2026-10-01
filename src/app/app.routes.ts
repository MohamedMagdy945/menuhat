import { Routes } from '@angular/router';

import { Offers } from './features/offers/pages/offers/offers';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component.';
import { HomeComponent } from './features/home/home.component';
import { CartComponent } from './features/cart/cart.component';
import { FavoritesComponent } from './features/favorites/favorites.component';
import { TestLoadingComponent } from './features/testing/testing';
import { RestaurantsComponent } from './features/restaurants/restaurants.component';
import { RetauranProfileComponent } from './features/profile/restaurantProfile/components/retauran-profile/retauran-profile.component';
import { TechnicalSupportComponent } from './features/technical-support/components/technical-support/technical-support.component';


export const routes: Routes = [

    // =====================================================
    // Authentication
    // =====================================================

    {
        path: 'login',//, canActivate: [logedGuard],
        loadComponent: () =>
            import('./features/auth/pages/login/login.component'
            ).then(m => m.Login)
    },

    {
        path: 'sendEmail',
        loadComponent: () =>
            import(
                './features/auth/pages/send-email/send-email.component'
            ).then(m => m.SendEmail)
    },

    {
        path: 'ValidateOtp',
        loadComponent: () =>
            import(
                './features/auth/pages/validate-otp/validate-otp.component'
            ).then(m => m.ValidateOtp)
    },

    {
        path: 'register',
        loadComponent: () =>
            import(
                './features/auth/pages/register/register.component'
            ).then(m => m.RegisterComponent)
    },



    // =====================================================
    // Main Application
    // =====================================================

    {
        path: '',// canActivate: [authGuard],
        component: MainLayoutComponent,

        children: [

            // Home
            {
                path: '',
                component: HomeComponent
            },

            {
                path: 'home',
                component: HomeComponent
            },


            // User
            {
                path: 'cart',
                component: CartComponent
            },

            {
                path: 'favorites',
                component: FavoritesComponent
            },

            {
                path: 'offers',
                component: Offers
            },

            {
                path: 'test',
                component: TestLoadingComponent
            },

            // =================================================
            // Restaurants
            // =================================================

            {
                path: 'most-ordered',
                component: RestaurantsComponent,
                data: {
                    filter: 'most-ordered'
                }
            },

            {
                path: 'most-visited',
                component: RestaurantsComponent,
                data: {
                    filter: 'most-visited'
                }
            },

            {
                path: 'trending',
                component: RestaurantsComponent,
                data: {
                    filter: 'trending'
                }
            },


            // =================================================
            // Orders
            // =================================================

            {
                path: 'my-orders',
                component: CartComponent
            },

            {
                path: 'support',
                component: TechnicalSupportComponent
            },

           { path: 'restaurantProfile/:id', component: RetauranProfileComponent },
        ]
    },


    // =====================================================
    // Unknown Routes
    // =====================================================

    {
        path: '**',
        redirectTo: ''
    }

];