import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AdminPanelLayoutComponent } from './layouts/admin-panel-layout/admin-panel-layout.component';
import { authGuard } from './core/guards/auth.guard';

/** Placeholder for admin sections until their real pages are built. */
const loadAdminPlaceholder = () =>
    import('./features/admin/admin-placeholder/admin-placeholder.component')
        .then(m => m.AdminPlaceholderComponent);

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
                    import('./features/menu-items/menu-items.component')
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
        canActivate: [authGuard],
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
                path: 'menu/details',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/menu-details-page/menu-details-page.component')
                        .then(m => m.MenuDetailsPageComponent)
            },
            {
                path: 'menu/details/:id',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/menu-details-page/menu-details-page.component')
                        .then(m => m.MenuDetailsPageComponent)
            },
            {
                path: 'menu/categories',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/menu-categories-page/menu-categories-page.component')
                        .then(m => m.MenuCategoriesPageComponent)
            },
            {
                path: 'menu/categories/:id',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/menu-categories-page/menu-categories-page.component')
                        .then(m => m.MenuCategoriesPageComponent)
            },
            {
                path: 'menu/subcategories',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/menu-sub-categories-page/menu-sub-categories-page.component')
                        .then(m => m.MenuSubCategoriesPageComponent)
            },
            {
                path: 'menu/subcategories/:id',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/menu-sub-categories-page/menu-sub-categories-page.component')
                        .then(m => m.MenuSubCategoriesPageComponent)
            },
            {
                path: 'menu/subcategories/:id/products',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/menu-products-page/menu-products-page.component')
                        .then(m => m.MenuProductsPageComponent)
            },
            {
                path: 'menu/products',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/menu-products-page/menu-products-page.component')
                        .then(m => m.MenuProductsPageComponent)
            },
            {
                path: 'menu/sub-categories',
                redirectTo: 'menu/subcategories',
                pathMatch: 'full'
            },
            {
                path: 'menu/add-item',
                loadComponent: () =>
                    import('./features/dashboard/menus/components/add-menu-item/add-menu-item.component')
                        .then(m => m.AddMenuItemComponent)
            },
            {
                path: 'menus',
                redirectTo: 'menu',
                pathMatch: 'full'
            },
            {
                path: 'add-item',
                redirectTo: 'menu/add-item',
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
            },
            {
                path: 'support',
                loadComponent: () =>
                    import('./features/dashboard/support/support.component')
                        .then(m => m.SupportComponent)
            },
            {
                path: 'technical-support',
                redirectTo: 'support',
                pathMatch: 'full'
            }
        ]
    },

    // =====================================================
    // Admin Panel Layout (platform administration)
    // =====================================================

    {
        path: 'admin',
        component: AdminPanelLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                data: { title: 'الرئيسية' },
                loadComponent: () =>
                    import('./features/admin-panel/dashboard/admin-dashboard.component').then(
                        (m) => m.AdminDashboardComponent,
                    ),
            },
            {
                path: 'restaurants',
                data: { title: 'المطاعم' },
                loadComponent: () =>
                    import('./features/admin-panel/restaurants/admin-restaurants.component').then(
                        (m) => m.AdminRestaurantsComponent,
                    ),
            },
            {
                path: 'restaurants/new',
                data: { title: 'إضافة مطعم' },
                loadComponent: () =>
                    import('./features/admin-panel/restaurants/components/restaurant-form/restaurant-form.component').then(
                        (m) => m.AdminRestaurantFormComponent,
                    ),
            },
            {
                path: 'restaurants/:id',
                data: { title: 'تفاصيل المطعم' },
                loadComponent: () =>
                    import('./features/admin-panel/restaurants/components/restaurant-details/restaurant-details.component').then(
                        (m) => m.AdminRestaurantDetailsComponent,
                    ),
            },
            {
                path: 'restaurants/:serial/edit',
                data: { title: 'تعديل المطعم' },
                loadComponent: () =>
                    import('./features/admin-panel/restaurants/components/restaurant-form/restaurant-form.component').then(
                        (m) => m.AdminRestaurantFormComponent,
                    ),
            },
            {
                path: 'categories',
                data: { title: 'الأقسام' },
                loadComponent: () =>
                    import('./features/admin-panel/categories/admin-categories.component').then(
                        (m) => m.AdminCategoriesComponent,
                    ),
            },
            {
                path: 'categories/new',
                data: { title: 'إضافة قسم' },
                loadComponent: () =>
                    import('./features/admin-panel/categories/components/category-form/category-form.component').then(
                        (m) => m.AdminCategoryFormComponent,
                    ),
            },
            {
                path: 'categories/:id/edit',
                data: { title: 'تعديل القسم' },
                loadComponent: () =>
                    import('./features/admin-panel/categories/components/category-form/category-form.component').then(
                        (m) => m.AdminCategoryFormComponent,
                    ),
            },
            {
                path: 'categories/:id/subcategories',
                data: { title: 'الأقسام الفرعية' },
                loadComponent: () =>
                    import('./features/admin-panel/categories/components/sub-categories/sub-categories.component').then(
                        (m) => m.AdminSubCategoriesComponent,
                    ),
            },
            {
                path: 'categories/:id/subcategories/new',
                data: { title: 'إضافة قسم فرعي' },
                loadComponent: () =>
                    import('./features/admin-panel/categories/components/sub-category-form/sub-category-form.component').then(
                        (m) => m.AdminSubCategoryFormComponent,
                    ),
            },
            {
                path: 'categories/:id/subcategories/:subId/edit',
                data: { title: 'تعديل قسم فرعي' },
                loadComponent: () =>
                    import('./features/admin-panel/categories/components/sub-category-form/sub-category-form.component').then(
                        (m) => m.AdminSubCategoryFormComponent,
                    ),
            },
            {
                path: 'products',
                data: { title: 'المنتجات' },
                loadComponent: () =>
                    import('./features/admin-panel/products/admin-products.component').then(
                        (m) => m.AdminProductsComponent,
                    ),
            },
            {
                path: 'products/new',
                data: { title: 'إضافة منتج' },
                loadComponent: () =>
                    import('./features/admin-panel/products/components/product-form/product-form.component').then(
                        (m) => m.AdminProductFormComponent,
                    ),
            },
            {
                path: 'products/:id/edit',
                data: { title: 'تعديل المنتج' },
                loadComponent: () =>
                    import('./features/admin-panel/products/components/product-form/product-form.component').then(
                        (m) => m.AdminProductFormComponent,
                    ),
            },
            { path: 'users', data: { title: 'المستخدمين' }, loadComponent: loadAdminPlaceholder },
            { path: 'orders', data: { title: 'الطلبات' }, loadComponent: loadAdminPlaceholder },
            { path: 'reports', data: { title: 'التقارير' }, loadComponent: loadAdminPlaceholder },
            { path: 'settings', data: { title: 'الإعدادات' }, loadComponent: loadAdminPlaceholder }
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
