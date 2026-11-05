import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component.';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [

    // =====================================================
    // Authentication Layout & Routes
    // =====================================================

    {
        path: 'login',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/auth/pages/login/login.component')
                        .then(m => m.LoginComponent ?? m.Login)
            }
        ]
    },

    {
        path: 'send-otp',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/auth/pages/send-otp/send-otp.component')
                        .then(m => m.SendOtpComponent ?? m.SendOtp)
            }
        ]
    },
    {
        path: 'sendOtp',
        redirectTo: 'send-otp',
        pathMatch: 'full'
    },
    {
        path: 'send-email',
        redirectTo: 'send-otp',
        pathMatch: 'full'
    },
    {
        path: 'sendEmail',
        redirectTo: 'send-otp',
        pathMatch: 'full'
    },

    {
        path: 'validate-otp',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/auth/pages/validate-otp/validate-otp.component')
                        .then(m => m.ValidateOtpComponent ?? m.ValidateOtp)
            }
        ]
    },
    {
        path: 'ValidateOtp',
        redirectTo: 'validate-otp',
        pathMatch: 'full'
    },
    {
        path: 'verify-otp',
        redirectTo: 'validate-otp',
        pathMatch: 'full'
    },

    {
        path: 'register',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/auth/pages/register/register.component')
                        .then(m => m.RegisterComponent)
            }
        ]
    },

    {
        path: 'send-mobile-verification',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/auth/pages/send-mobile-verification/send-mobile-verification.component')
                        .then(m => m.SendMobileVerificationComponent)
            }
        ]
    },
    {
        path: 'verify-mobile',
        redirectTo: 'send-mobile-verification',
        pathMatch: 'full'
    },
    {
        path: 'mobile-verification',
        redirectTo: 'send-mobile-verification',
        pathMatch: 'full'
    },

    {
        path: 'create-restaurant',
        loadComponent: () =>
            import('./features/dashboard/restaurant/create-restaurants/create-restaurant.component')
                .then(m => m.CreateRestaurantComponent ?? m.CreateRestaurant)
    },
    {
        path: 'create-client',
        redirectTo: 'create-restaurant',
        pathMatch: 'full'
    },
    {
        path: 'dashboard/restaurant/create-restaurant',
        redirectTo: 'create-restaurant',
        pathMatch: 'full'
    },
    {
        path: 'dashboard/create-restaurant',
        redirectTo: 'create-restaurant',
        pathMatch: 'full'
    },

    {
        path: 'register/owner',
        redirectTo: 'register',
        pathMatch: 'full'
    },

    {
        path: 'register/customer',
        redirectTo: 'register',
        pathMatch: 'full'
    },

    {
        path: 'register-owner',
        redirectTo: 'register',
        pathMatch: 'full'
    },

    {
        path: 'register-customer',
        redirectTo: 'register',
        pathMatch: 'full'
    },


    {
        path: 'auth',
        redirectTo: 'login',
        pathMatch: 'full'
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
                loadComponent: () =>
                    import('./features/home/home.component')
                        .then(m => m.HomeComponent)
            },

            {
                path: 'home',
                loadComponent: () =>
                    import('./features/home/home.component')
                        .then(m => m.HomeComponent)
            },


            // =================================================
            // User
            // =================================================

            {
                path: 'cart',
                loadComponent: () =>
                    import('./features/cart/cart.component')
                        .then(m => m.CartComponent)
            },

            {
                path: 'favorites',
                loadComponent: () =>
                    import('./features/favorites/favorites.component')
                        .then(m => m.FavoritesComponent)
            },

            {
                path: 'profile',
                loadComponent: () =>
                    import('./features/profile/profile.component')
                        .then(m => m.ProfileComponent)
            },

            {
                path: 'offers',
                loadComponent: () =>
                    import('./features/offers/pages/offers/offers')
                        .then(m => m.Offers)
            },

            {
                path: 'test',
                loadComponent: () =>
                    import('./features/testing/testing')
                        .then(m => m.TestLoadingComponent)
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
                        loadComponent: () =>
                            import('./features/restaurants/restaurants.component')
                                .then(m => m.RestaurantsComponent)
                    },

                    // /restaurants/:serial
                    {
                        path: ':serial',
                        loadComponent: () =>
                            import('./features/restaurants/components/restaurant-details/restaurant-details.component')
                                .then(m => m.RestaurantDetailsComponent)
                    }
                ]
            },


            // =================================================
            // Restaurant Categories / Sections
            // =================================================

            {
                path: 'most-ordered',
                loadComponent: () =>
                    import('./features/menu-items/menu-item.component')
                        .then(m => m.MealsComponent)
            },

            {
                path: 'most-visited',
                loadComponent: () =>
                    import('./features/restaurants/restaurants.component')
                        .then(m => m.RestaurantsComponent),
                data: {
                    filter: 'most-visited'
                }
            },

            {
                path: 'top-rated',
                loadComponent: () =>
                    import('./features/restaurants/restaurants.component')
                        .then(m => m.RestaurantsComponent),
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
                    // /menu-items -> redirect to /most-ordered
                    {
                        path: '',
                        redirectTo: '/most-ordered',
                        pathMatch: 'full'
                    },

                    // /menu-items/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import('./features/menu-items/components/menu-item-details/menu-item-details.component')
                                .then(m => m.MenuItemDetailsComponent)
                    }
                ]
            },


            // =================================================
            // Orders
            // =================================================

            {
                path: 'my-orders',
                loadComponent: () =>
                    import('./features/my-orders/my-orders.component')
                        .then(m => m.MyOrdersComponent)
            },


            // =================================================
            // Support
            // =================================================

            {
                path: 'support',
                loadComponent: () =>
                    import('./features/technical-support/components/technical-support/technical-support.component')
                        .then(m => m.TechnicalSupportComponent)
            },


            // =================================================
            // Notifications
            // =================================================

            {
                path: 'notifications',
                loadComponent: () =>
                    import('./features/notifications/notifications.component')
                        .then(m => m.NotificationsComponent)
            }
        ]
    },


    // =====================================================
    // Admin / Restaurant Dashboard Layout
    // =====================================================

    {
        path: 'dashboard',
        component: DashboardLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/dashboard/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent)
            },
            {
                path: 'menu',
                loadComponent: () =>
                    import('./features/dashboard/menus/menus.component')
                        .then(m => m.MenusComponent)
            },
            {
                path: 'menus',
                redirectTo: 'menu',
                pathMatch: 'full'
            },
            {
                path: 'orders',
                loadComponent: () =>
                    import('./features/dashboard/orders/orders.component')
                        .then(m => m.OrdersComponent)
            },
            {
                path: 'orders/:id',
                loadComponent: () =>
                    import('./features/dashboard/orders/orders.component')
                        .then(m => m.OrdersComponent)
            },
            {
                path: 'most-ordered',
                loadComponent: () =>
                    import('./features/dashboard/most-ordered/most-ordered.component')
                        .then(m => m.MostOrderedComponent)
            },
            {
                path: 'reports',
                loadComponent: () =>
                    import('./features/dashboard/reports/reports.component')
                        .then(m => m.ReportsComponent)
            }
        ]
    },

    {
        path: 'admin',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },


    // =====================================================
    // Unknown Routes
    // =====================================================

    {
        path: '**',
        redirectTo: ''
    }
];
