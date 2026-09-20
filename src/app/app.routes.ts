import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { Home } from './pages/home/home';
import { Favorites } from './features/favorites/pages/favorites/favorites';
import { Offers } from './features/offers/pages/offers/offers';
import { Profile } from './features/profile/pages/profile/profile';


export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,

        children: [
            {
                path: '',
                component: Home
            },
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
            }
        ]
    }
];