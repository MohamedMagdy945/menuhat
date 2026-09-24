import { Routes } from '@angular/router';

import { Offers } from './features/offers/pages/offers/offers';
import { Profile } from './features/profile/pages/profile/profile';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component.';
import { HomeComponent } from './features/home/home.component';
import { CartComponent } from './features/cart/cart.component';
import { FavoritesComponent } from './features/favorites/favorites.component';
import { TestLoadingComponent } from './features/testing/testing';
import { Test1Component } from './features/testing/test1/test1.component';
import { RestaurantsComponent } from './features/restaurants/restaurants.component';


export const routes: Routes = [

    // =====================================================
    // Authentication
    // =====================================================

    {
        path: 'login',
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
        path: '',
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
                path: 'profile',
                component: Profile
            },
            {
                path: 'test',
                component: Test1Component
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