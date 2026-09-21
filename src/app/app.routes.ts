import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/main-layout/main-layout.component.';
import { Home } from './features/home/pages/home.component';
import { Favorites } from './features/favorites/pages/favorites/favorites';
import { Offers } from './features/offers/pages/offers/offers';
import { Profile } from './features/profile/pages/profile/profile';
import { Cart } from './features/cart/Components/cart';
import { SendEmail } from './features/auth/pages/Register/components/SendEmail/send-email/send-email.component';


export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./features/auth/pages/login/components/login/login.component').then(m => m.Login) }, //canActivate: [logedGuard]
    { path: 'sendEmail', loadComponent: () => import('./features/auth/pages/Register/components/SendEmail/send-email/send-email.component').then(m => m.SendEmail) },
    { path: 'ValidateOtp', loadComponent: () => import('./features/auth/pages/Register/components/ValidateOtp/validate-otp/validate-otp.component').then(m => m.ValidateOtp) },
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