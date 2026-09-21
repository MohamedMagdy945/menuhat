import { Routes } from '@angular/router';
import { Home } from './features/home/pages/home.component';
import { Favorites } from './features/favorites/pages/favorites/favorites';
import { Offers } from './features/offers/pages/offers/offers';
import { Profile } from './features/profile/pages/profile/profile';
import { Cart } from './features/cart/components/cart';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component.';
import { RestaurantAll } from './features/restaurants/components/restaurant-all/restaurant-all';


export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/components/login/login.component').then(m => m.Login)
    }, // canActivate: [logedGuard]

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

            // المسارات المضافة حديثاً لتوجيه الـ Navbar
            { path: 'most-ordered', component: RestaurantAll, data: { filter: 'most-ordered' } },
            { path: 'most-visited', component: RestaurantAll, data: { filter: 'most-visited' } },
            { path: 'trending', component: RestaurantAll, data: { filter: 'trending' } },
            { path: 'my-orders', component: Cart }, // أو المكون الخاص بطلباتي
        ]
    },

    // Wildcard Route للتحويل المباشر للرئيسية في حال كتابة مسار غير معروف
    { path: '**', redirectTo: '' }
];