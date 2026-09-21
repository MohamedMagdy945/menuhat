import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/main-layout/main-layout.component.';
import { Home } from './features/home/pages/home.component';
import { Favorites } from './features/favorites/pages/favorites/favorites';
import { Offers } from './features/offers/pages/offers/offers';
import { Profile } from './features/profile/pages/profile/profile';
import { Cart } from './features/cart/components/cart';


export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./features/auth/pages/login/components/login/login.component').then(m => m.Login) }, //canActivate: [logedGuard]

    {
        path: '', component: PublicLayout,
        children: [{ path: '', component: Home },
        { path: 'home', component: Home },
        { path: 'cart', component: Cart },
        { path: 'favorites', component: Favorites },
        { path: 'offers', component: Offers },
        { path: 'profile', component: Profile }
        ]
    }
];