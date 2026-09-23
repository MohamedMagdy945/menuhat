import { Routes } from '@angular/router';

import { Home } from './features/home/pages/home.component';
import { Favorites } from './features/favorites/pages/favorites/favorites';
import { Offers } from './features/offers/pages/offers/offers';
import { Profile } from './features/profile/pages/profile/profile';

import { RestaurantAll } from './features/restaurants/components/restaurant-all/restaurant-all';

import { Cart } from './features/cart/pages/cart';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component.';


export const routes: Routes = [

    // =====================================================
    // Authentication
    // =====================================================

    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/pages/login/components/login/login.component'
            ).then(m => m.Login)
    },

    {
        path: 'sendEmail',
        loadComponent: () =>
            import(
                './features/auth/pages/Register/components/send-email/send-email.component'
            ).then(m => m.SendEmail)
    },

    {
        path: 'ValidateOtp',
        loadComponent: () =>
            import(
                './features/auth/pages/Register/components/validate-otp/validate-otp.component'
            ).then(m => m.ValidateOtp)
    },

    {
        path: 'register',
        loadComponent: () =>
            import(
                './features/auth/pages/Register/components/register/register.component'
            ).then(m => m.Register)
    },


    // =====================================================
    // Main Application
    // =====================================================

    {
        path: '',
        component: MainLayoutComponent,

        children: [

            // Home
            {
                path: '',
                component: Home
            },

            {
                path: 'home',
                component: Home
            },


            // User
            {
                path: 'cart',
                component: Cart
            },

            {
                path: 'favorites',
                component: Favorites
            },

            {
                path: 'offers',
                component: Offers
            },

            {
                path: 'profile',
                component: Profile
            },


            // =================================================
            // Restaurants
            // =================================================

            {
                path: 'most-ordered',
                component: RestaurantAll,
                data: {
                    filter: 'most-ordered'
                }
            },

            {
                path: 'most-visited',
                component: RestaurantAll,
                data: {
                    filter: 'most-visited'
                }
            },

            {
                path: 'trending',
                component: RestaurantAll,
                data: {
                    filter: 'trending'
                }
            },


            // =================================================
            // Orders
            // =================================================

            {
                path: 'my-orders',
                component: Cart
            }

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