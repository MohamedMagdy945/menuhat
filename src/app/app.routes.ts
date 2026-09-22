import { Routes } from '@angular/router';


import { Home } from './features/home/pages/home.component';
import { Favorites } from './features/favorites/pages/favorites/favorites';
import { Offers } from './features/offers/pages/offers/offers';
import { Profile } from './features/profile/pages/profile/profile';
import { Cart } from './features/cart/components/cart';
import { RestaurantAll } from './features/restaurants/components/restaurant-all/restaurant-all';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component.';


export const routes: Routes = [
    // Authentication
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/pages/login/components/login/login.component')
                .then(m => m.Login)
    },

    

    // Main application
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', component: Home },
            { path: 'home', component: Home },

            { path: 'cart', component: Cart },
            { path: 'favorites', component: Favorites },
            { path: 'offers', component: Offers },
            { path: 'profile', component: Profile },

            // Restaurants
            {
                path: 'most-ordered',
                component: RestaurantAll,
                data: { filter: 'most-ordered' }
            },
            {
                path: 'most-visited',
                component: RestaurantAll,
                data: { filter: 'most-visited' }
            },
            {
                path: 'trending',
                component: RestaurantAll,
                data: { filter: 'trending' }
            },

            // Orders
            {
                path: 'my-orders',
                component: Cart
            }
        ]
    },

    // Unknown routes
    {
        path: '**',
        redirectTo: ''
    }
];