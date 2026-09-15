import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { Home } from './pages/home/home';


export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,

        children: [
            {
                path: '',
                component: Home
            }
        ]
    }
];