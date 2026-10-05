import { Routes } from '@angular/router';

import { Offers } from './features/offers/pages/offers/offers';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component.';
import { HomeComponent } from './features/home/home.component';
import { CartComponent } from './features/cart/cart.component';
import { FavoritesComponent } from './features/favorites/favorites.component';
import { TestLoadingComponent } from './features/testing/testing';

import { RestaurantsComponent } from './features/restaurants/restaurants.component';
import { RestaurantDetailsComponent } from './features/restaurants/components/restaurant-details/restaurant-details.component';

import { TechnicalSupportComponent } from './features/technical-support/components/technical-support/technical-support.component';

import { MealsComponent } from './features/menu-items/menu-item.component';


export const routes: Routes = [

    // =====================================================
    // Authentication
    // =====================================================

    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/pages/login/login.component')
                .then(m => m.Login)
    },

    {
        path: 'sendEmail',
        loadComponent: () =>
            import('./features/auth/pages/send-email/send-email.component')
                .then(m => m.SendEmail)
    },

    {
        path: 'ValidateOtp',
        loadComponent: () =>
            import('./features/auth/pages/validate-otp/validate-otp.component')
                .then(m => m.ValidateOtp)
    },

    {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/pages/register/register.component')
                .then(m => m.RegisterComponent)
    },


    // =====================================================
    // Main Application
    // =====================================================

    {
        path: '',
        component: MainLayoutComponent,

        children: [

            // =================================================
            // Home
            // =================================================

            {
                path: '',
                component: HomeComponent
            },

            {
                path: 'home',
                component: HomeComponent
            },


            // =================================================
            // User
            // =================================================

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
                path: 'restaurants',

                children: [

                    // /restaurants
                    {
                        path: '',
                        component: RestaurantsComponent
                    },

                    // /restaurants/:serial
                    {
                        path: ':serial',
                        component: RestaurantDetailsComponent
                    }
                ]
            },


            // =================================================
            // Restaurant Categories / Sections
            // =================================================

            {
                path: 'most-ordered',
                component: MealsComponent
            },

            {
                path: 'most-visited',
                component: RestaurantsComponent,
                data: {
                    filter: 'most-visited'
                }
            },

            {
                path: 'top-rated',
                component: RestaurantsComponent,
                data: {
                    filter: 'top-rated'
                }
            },

            {
                path: 'trending',
                redirectTo: 'most-visited',
                pathMatch: 'full'
            },


            // =================================================
            // Menu Items
            // =================================================

            {
                path: 'menu-items',

                children: [

                    // /menu-items
                    {
                        path: '',
                        component: MealsComponent
                    },

                    // // /menu-items/:id
                    // {
                    //     path: ':id',
                    //     component: MenuItemDetailsComponent
                    // }
                ]
            },


            // =================================================
            // Orders
            // =================================================

            {
                path: 'my-orders',
                component: CartComponent
            },


            // =================================================
            // Support
            // =================================================

            {
                path: 'support',
                component: TechnicalSupportComponent
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