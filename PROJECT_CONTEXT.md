# PROJECT_CONTEXT.md — Menuhat Architecture Map

Reference map of the **Menuhat** frontend as it is implemented. Rules for changing it are in `AGENTS.md`.

---

## 1. Product

Menuhat is an Arabic (RTL) food-ordering web app with two audiences in one Angular app:

1. **Customers** — browse restaurants and meals, manage a cart, favorites, orders, notifications, profile and delivery location.
2. **Restaurant owners** — a back-office dashboard to build menus (categories → sub-categories → products), process orders, view reports and contact support.

---

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | Angular 22 (`@angular/*` ^22.1), standalone components, **zoneless** (no `zone.js`) |
| Build | `@angular/build:application` (esbuild); dev server `@angular/build:dev-server` |
| Language | TypeScript ~6.0 (`strict` is **not** enabled; `noImplicitReturns`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature` are) |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss` (`.postcssrc.json`), tokens in `src/styles.css` `@theme` |
| Font / icons | Cairo (`@fontsource/cairo`), Material Symbols Sharp (`material-symbols`) |
| Carousels | Swiper Elements (`swiper`) |
| Reactivity | Angular signals + RxJS 7.8 (HTTP) |
| Other | `@angular/cdk` (BreakpointObserver in `ResponsiveService`), Prettier |
| Tests | **None configured** — no `test` target, no specs, Vitest not installed |

There is no SSR. Guards and `UserDataService` still check `isPlatformBrowser` before touching `localStorage`.

---

## 3. Bootstrap

- `src/main.ts` → `bootstrapApplication(App, appConfig)`.
- `src/app/app.config.ts`: `provideBrowserGlobalErrorListeners()`, `provideAppInitializer(() => UserDataService.loadUserData())`, `provideRouter(routes)`, `provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor]))`.
- `App` (`app.ts`/`app.html`) renders `<router-outlet>`, the global `<app-loading>` overlay and `<app-toast-container>`.

---

## 4. Directory layout

```
src/
├── styles.css                     Tailwind import, @theme tokens, global/autofill styles
├── main.ts
└── app/
    ├── app.ts | app.html | app.config.ts | app.routes.ts
    ├── core/                      app-wide singletons
    │   ├── common-data/           CommonDateService – governments / cities / order-status… dropdown APIs
    │   ├── constants/             dashboard-api.constants.ts (DASHBOARD_API_ENDPOINTS), files.constants.ts (FILES_ORIGIN), app.constants.ts (APP_ID = 2), admin-api.constants.ts (ADMIN_API_ENDPOINTS)
    │   ├── environments/          environment.ts (apiUrl, filesUrl) – the only environment file
    │   ├── guards/                auth.guard.ts, loged.guard.ts
    │   ├── interceptors/          auth-interceptor.ts, loading.interceptor.ts
    │   ├── loading/               LoadingComponent, LoadingService, USE_GLOBAL_LOADING context token
    │   ├── models/                core-level models (one per file)
    │   └── services/              UserDataService, ToastService, DropdownStateService, ResponsiveService,
    │                              LocationService, MenuCategoriesService*, RestaurantMediaService*
    ├── layouts/
    │   ├── auth-layout/           minimal shell for auth pages
    │   ├── main-layout/           customer shell: desktop-navbar, mobile-navbar, footer
    │   ├── dashboard-layout/      owner shell: dashboard-sidebar, dashboard-header*; models/
│   └── admin-panel-layout/    platform-admin shell: admin-sidebar (same design as dashboard-sidebar)
    ├── shared/
    │   ├── components/            form-input, form-select, loading-button, location-selector,
    │   │                          toast-container, carousel, side-drawer*
    │   ├── skeleton/              menu-item-, rating-, horizontal-card-skeleton*
    │   └── models/                cross-feature models (FormSelectOption, DateFilterType, ResponsiveItems/Cols, pagination/PageData)
    └── features/
        ├── auth/                  pages/ (login, register, send-otp, validate-otp, send-mobile-verification), services/, models/
        ├── home/                  landing page + sections, home cards, account-dropdown
        ├── restaurants/           directory, restaurant details (categories, products, ratings, add-rating modal), services/
        ├── menu-items/            product lists (most ordered) and product details page
        ├── cart/                  cart page, cart-dropdown, cart-item-card, order-checkout, CartService, MenuOrdersService (POST /MenusOrders = whole cart, /MenusOrders/Order/{menuId} = one restaurant); CheckoutContactService (addresses GET /Profile/GetAddressByUserId, POST /UsersAddress, DELETE /Profile/DeleteAddress/{id}; verified phones GET /PhoneVerifications/GetAllNumbersForUser/{APP_ID}); address-picker bottom sheet, address-form (add/edit, PUT /Profile/PutAddress/{id}; also used by profile), add-phone-dialog (also used by profile)
        ├── favorites/             favorites page, favorite-dropdown, FavoritesService
        ├── search/                app-search-bar (navbar + mobile home) + result cards (search-restaurant-card, search-menu-item-card), utils/search-image-url
        ├── my-orders/             customer order history, order-item-card, order-details sheet (from the list data), utils/ (status, date, image url)
        ├── notifications/         notifications page + dropdown, NotificationsService
        ├── offers/                pages/offers
        ├── profile/               profile (info, verified phones, addresses via CheckoutContactService), password, ProfileService
        ├── admin-panel/           platform admin pages: dashboard/ (GET /Admin/GetDashboardStats, stat tiles), restaurants/ (GET /Admin/GetAllMenu: search, government/city filters via shared app-form-select, pagination; components/restaurant-card; modals/confirm-modal (`app-confirm-modal`, replaces `confirm()` for restaurant and logo/PDF deletes); components/restaurant-details = read-only details **page** (`:id` → GET /Admin/GetMenu/{id}, 404 when missing; lookup names via CommonDateService); delete → DELETE /Admin/SoftDeleteMenu/{id}; components/restaurant-form = add & edit **pages** (no modal): `new` → GET /Admin/PreparedForInsertMenu + POST /Admin/PostMenu (userId = owner without a menu; logo/PDF in body), `:serial/edit` → GET /Admin/GetMenus/{serial} + GET /Admin/GetMenu/{id} → PUT /Admin/PutMenu/{id}, logo/PDF saved immediately via PUT UpdateLogoURLMenu / UpdatePdfURMenuL and DELETE DeleteLogoURLMenu / DeletePdfURLMenu; components/restaurant-media-field. Uploads must send full data URLs — raw base64 returns 200 but stores an empty path. GetMenu/GetMenus don't return `address`, so the list passes it in router state), categories/ (main categories: GET /Admin/GetAllMainCategory — `SortField=Id`, `SearchValue` matches Arabic name/description/restaurant, `MenuId` filter; components/category-table = table shared by main & sub categories (AdminCategoryTile rows, optional openLink); clicking a main category opens components/sub-categories (GET /Admin/GetAllSubCategory?MenuCategoryId={id}; delete → DELETE DeleteSubCategory/{id}); components/sub-category-form = add/edit sub pages (`new` → GetMainCategory → GetMenu/{menuId} for the serial + PreparedForInsertSubCategory → POST PostSubCategory/{serial}; the backend does NOT validate that menuCategoryId belongs to that restaurant, so the serial must come from the main category; `:subId/edit` → GET GetSubCategory/{subId} → PUT PutSubCategory/{subId}, photo via UpdatePhotoSubCategory / DeletePhotoSubCategory); components/category-form = add & edit **pages**: `new` → pick restaurant (GetAllMenu search) + GET PreparedForInsertMainCategory + POST PostMainCategory/{menuSerial} (name required — null → 500), `:id/edit` → GET GetMainCategory/{id} → PUT PutMainCategory/{id}, photo via PUT UpdatePhotoMainCategory / DELETE DeletePhotoMainCategory (data URL required); delete → DELETE DeleteMainCategory/{id}; reuses restaurants media-field + confirm-modal; each sub-category row links to its products), products/ (GET /Admin/GetAllProducts → `listWithDetails` mapped to `items`, newest first (`SortField=Id&SortDirection=desc`), `SearchValue` matches the Arabic product name only; scoped by `?subCategoryId=` > `?categoryId=` > `?menuId=` (sent as MenuSubCategoryId / MenuCategoryId / MenuId) with a breadcrumb loaded from GetSubCategory / GetMainCategory / GetMenu; components/product-table; delete → DELETE DeleteProduct/{id}; components/product-form = add & edit **pages**: `new` → restaurant picker → main category select (GetAllMainCategory?MenuId) → sub category select (GetAllSubCategory?MenuCategoryId), the scope query params preselect it; PreparedForInsertProduct + POST AddMenuProduct/{serial} with sizes in `details` and the photo as a data URL; `:id/edit` → GET GetProduct/{id} (`result` is an array of one, no restaurant info → GetSubCategory for the restaurant) → PUT UpdateMenuProduct/{id} (restaurant fixed, category can move inside it); sizes added/removed live via POST AddMenuProductPrice?MenuProductId= / DELETE DeleteProductPrice/{detailId}; photo via PUT UpdatePhotoProduct / DELETE DeletePhotoProduct; utils/admin-product-price), utils/ (file url, time)
        └── dashboard/             owner back-office, one folder per sub-feature:
            ├── dashboard/         overview (DashboardService – restaurant, stats, current orders, sidebar nav)
            ├── menus/             menu details, categories, sub-categories, products, add-item, system-images modal
            ├── orders/            order list/details, accept/reject modals, OrdersService
            ├── most-ordered/      product stats
            ├── reports/           sales reports (OwnerReportsService)
            ├── support/           complaints form + tracking (SupportService)
            └── restaurant/        create-restaurants (onboarding form, uses ClientsMenuService)
```

`*` = implemented but not referenced anywhere yet (kept as work in progress): `MenuCategoriesService`, `RestaurantMediaService`, `DashboardHeaderComponent`, `SideDrawerComponent`, `HorizontalCardSkeletonComponent`, `features/dashboard/menus/components/menu-details` (`MenuDetailsComponent`), `CreateProductPayload` / `RestaurantRequest` models.

Every feature keeps its types in `models/` — one `*.model.ts` per interface/type, no barrels (see `AGENTS.md` §3).

---

## 5. Routing (`src/app/app.routes.ts`)

All pages are lazy (`loadComponent`). Many legacy aliases redirect to the canonical paths (e.g. `sendOtp`, `send-email` → `send-otp`; `verify-otp` → `validate-otp`; `register-owner` → `register`; `menus` → `menu`). Unknown paths redirect to `''`.

### 5.1 `AuthLayoutComponent`
`/login`, `/send-otp`, `/validate-otp`, `/register`, `/send-mobile-verification`, `/create-restaurant`.

Sign-up flow: `send-otp?role=` (email) → `validate-otp?email&role` → `register?email&userTypeId&role` (stores session via `UserDataService`) → `send-mobile-verification?phone&role` → owner: `/create-restaurant`, customer: `/home`.
Login (user types in `core/constants/user-types.constants.ts`): platform admins (`userTypeId === 2`, assumed) go to `/admin`; owners (`userTypeId === 1` or `businessOwner`) go to `/dashboard` (or `/create-restaurant` when they have no restaurant yet); customers go to `/home`.

### 5.2 `MainLayoutComponent` (customer)
`/` and `/home`, `/cart`, `/favorites`, `/profile`, `/offers`, `/restaurants`, `/restaurants/:serial`, `/most-ordered` (menu-items list), `/most-visited` and `/top-rated` (restaurants list with route `data`; `/trending` → `/most-visited`), `/menu-items/:id` (`/menu-items` → `/most-ordered`), `/my-orders`, `/notifications`.

### 5.3 `DashboardLayoutComponent` (owner) — `canActivate: [authGuard]`
`/dashboard`, `/dashboard/menu`, `/dashboard/menu/details[/:id]`, `/dashboard/menu/categories[/:id]`, `/dashboard/menu/subcategories[/:id]`, `/dashboard/menu/subcategories/:id/products`, `/dashboard/menu/products`, `/dashboard/menu/add-item`, `/dashboard/orders`, `/dashboard/orders/:id`, `/dashboard/most-ordered`, `/dashboard/reports`, `/dashboard/support`.

### 5.4 `AdminPanelLayoutComponent` (platform admin) — `canActivate: [authGuard]`
`/admin`, `/admin/restaurants`, `/admin/restaurants/new`, `/admin/restaurants/:id` (details), `/admin/restaurants/:serial/edit`, `/admin/categories` (`?menuId=` filter), `/admin/categories/new` (`?menuId=` preselects the restaurant), `/admin/categories/:id/edit`, `/admin/categories/:id/subcategories` (+ `/new`, `/:subId/edit`), `/admin/products` (`?menuId=` / `?categoryId=` / `?subCategoryId=` scope), `/admin/products/new` (same params preselect), `/admin/products/:id/edit`, `/admin/users`, `/admin/orders`, `/admin/reports`, `/admin/settings`. `/admin` renders `features/admin-panel/dashboard` (platform stats), `/admin/restaurants` renders `features/admin-panel/restaurants`; the others still render `features/admin/admin-placeholder` (title from route `data.title`); replace each `loadComponent` as real pages are built. The layout owns the mobile-drawer signal and passes it to `AdminSidebarComponent` via `input`/`output`; nav items live in the sidebar and reuse `SidebarNavItem` from `dashboard-layout/models`.

---

## 6. Cross-cutting services

| Service / piece | Location | Responsibility |
|---|---|---|
| `UserDataService` | `core/services/userData.service.ts` | Session owner. Signals `currentUser`, `token`, `isAuthenticated`; `loadUserData`, `setUserData`, `getUserData`, `getUserId`, `getUserFullName`, `getToken`, `clearUserData`. Persists `localStorage['usertoken']` and `['userData']`. |
| `authInterceptor` | `core/interceptors/auth-interceptor.ts` | Adds `Authorization: Bearer <usertoken>` (when present) and `Accept-Language: ar`. |
| `loadingInterceptor` + `LoadingService` | `core/interceptors/`, `core/loading/` | Counts requests flagged with `USE_GLOBAL_LOADING` and shows the global overlay. |
| `authGuard` / `logedGuard` | `core/guards/` | Token required (→ `/login`) / guests only (→ `/home`). Only `authGuard` is applied (dashboard, admin). |
| `ToastService` | `core/services/toast.service.ts` | Signal list of toasts; `success`/`error`/`warning`/`info` (+ legacy `showToast`/`showAlert`), auto-dismiss. |
| `DropdownStateService` | `core/services/dropdown-state.service.ts` | Single `activeDropdown` signal; `open`/`toggle`/`close`/`closeAll`/`isOpen`; closes all on `NavigationEnd`. |
| `ResponsiveService` | `core/services/responsive.service.ts` | `isMobile` signal (CDK BreakpointObserver). |
| `LocationService` | `core/services/location.service.ts` | Customer location (geolocation + OpenStreetMap Nominatim reverse geocoding), persisted in `localStorage`; `currentLocation`, `displayAddress`, `displayShortAddress`, `hasLocation`, `getSmartLocation()`. |
| `CommonDateService` | `core/common-data/common-date.ts` | Lookup dropdowns (governments, cities, order status/types, fields, order conditions). |
| `DashboardService` | `features/dashboard/dashboard/dashboard.service.ts` | Owner dashboard data, restaurant info, current orders mapping, sidebar navigation model; used by most dashboard pages and the dashboard layout. |

Feature services (`CartService`, `MenuOrdersService`, `FavoritesService`, `MenuItemService`, `RestaurantsService`, `ResuaurantProfileService`, `ClientsMenuService`, `NotificationsService`, `ProfileService`, `OrdersService`, `MenusService`, `MenuProductsService`, `MenuSubCategoriesService`, `AddMenuItemService`, `MostOrderedService`, `OwnerReportsService`, `SupportService`, `LoginService`, `RegisterService`, `PhoneVerificationService`) are `providedIn: 'root'` and keep their state in signals.

---

## 7. Shared UI components

| Component | Selector | Notes |
|---|---|---|
| `FormInputComponent` | `app-form-input` | ControlValueAccessor; label, icon slots, password toggle, Arabic error resolution (`customErrors`, `errorMessage`). Listens to `control.events` so OnPush errors update on submit. |
| `FormSelectComponent` | `app-form-select` | ControlValueAccessor select with `FormSelectOption[]`; same error/refresh behavior. |
| `SearchInputComponent` | `app-search-input` | Search field: `[(value)]`, `placeholder`, `loading` (spinner instead of the icon), clear button + Esc. Parent debounces. Used by the admin restaurants / categories / sub-categories lists. |
| `LoadingButtonComponent` | `app-loading-button` | Submit button with spinner (`loading`, `text`, `loadingText`, `disabled`). |
| `LocationSelectorComponent` | `app-location-selector` | Shows/refreshes the customer location via `LocationService`. |
| `ToastContainerComponent` | `app-toast-container` | Renders `ToastService.toasts()` (mounted once in `App`). |
| `CarouselComponent` | `app-carousel` / `app-horizontal-scroll` | Horizontal scroller with responsive column config (`ResponsiveItems`). |
| Skeletons | `app-menu-item-skeleton`, `app-rating-skeleton` | Loading placeholders. |

Header dropdowns: `CartDropdownComponent`, `FavoriteDropdownComponent`, `NotificationDropdownComponent`, `AccountDropdownComponent` (all coordinated by `DropdownStateService`).

Search: `SearchBarComponent` (`features/search/components/search-bar`, `app-search-bar`, `variant` `desktop`/`mobile`) is used in the desktop navbar and the mobile home hero. A type menu switches between restaurants (`ClientsMenuService.searchRestaurants` → `GET /ClientsMenus`) and products (`MenuItemService.searchProducts` → `GET /MenuProducts`); both send `SearchValue`/`PageNumber`/`PageSize` and return `PageData<SearchResultItem>`. Input is debounced (350 ms); the results list loads the next page on scroll. Its type menu and results panel are `DropdownStateService` ids `search-type-<variant>` / `search-results-<variant>`.

---

## 8. Backend integration

- **Environment** (`core/environments/environment.ts`): `apiUrl = http://192.168.1.150:500/api`, `filesUrl = http://192.168.1.150:500/UploadedFiles` (production values `https://api.zahran4it.com/...` are kept commented out). Swagger: `http://192.168.1.150:500/swagger/index.html`.
- **Endpoints:** owner/dashboard endpoints in `DASHBOARD_API_ENDPOINTS`; customer/auth services compose `` `${environment.apiUrl}/…` `` internally.
- **Responses** are loosely typed; services typically unwrap `res.data ?? res.result ?? res` and map backend field names (`name`/`name_En`, `photoURL`, `menuMainCategoryName`, …) into the models.
- **Images:**
  ```ts
  if (!path) return fallback;                                   // e.g. '/images/default-meal.png'
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.startsWith('/UploadedFiles') || clean.startsWith('/DefaultImages'))
    return `${FILES_ORIGIN}${clean}`;                           // file-server origin
  return `${environment.filesUrl}${clean}`;
  ```
  This resolver currently exists as small per-feature helpers (`getItemImageUrl` / `resolveImageUrl`) with minor variations; all derive hosts from `filesUrl` / `FILES_ORIGIN`, never `apiUrl`.
- **App id:** auth/verification payloads send `appId: 2`.

---

## 9. Conventions snapshot

Zoneless + `OnPush` everywhere; signals for async-rendered state; `input()`/`output()`; `inject()`; one model per `*.model.ts` file without barrels; no hover/active visual changes; toasts instead of `alert()`; session only via `UserDataService`. Full rules: `AGENTS.md`.

---

## 10. Known gaps

- No unit-test setup (no `test` target / specs / Vitest).
- Production build warns that the initial bundle (~713 kB) exceeds the 500 kB budget.
- TypeScript `strict` mode is off; many API responses are typed `any`.
- Image URL helpers are duplicated across features (behavior is consistent, code is not shared).
- Some older pages still use the native `confirm()`; new code uses the shared `ConfirmModalComponent` (`app-confirm-modal`).
- Placeholders not yet implemented: Google login (`LoginComponent.loginWithGoogle`), cancel order / view order details in `my-orders`.
- Backend (products): Swagger documents no response bodies, and PUT UpdateMenuProduct / AddMenuProductPrice / UpdatePhotoProduct were not exercised against the API yet. The edit page sends the current sizes (with their ids) in `details` and `photoURL: null` / `additions: null` on PUT; it re-fetches GetProduct after adding a size or uploading a photo instead of relying on the response.
- Backend: `PUT /Admin/PutMenu/{id}` ignores `address` (it is not saved); `GetMenu` / `GetMenus/{serial}` don't return it. The admin add page asks for the owner's numeric user id (no owner picker yet).
- `logedGuard` is defined but intentionally not applied (see `AGENTS.md` §5).
