# PROJECT_CONTEXT.md – Menuhat Architecture & Implementation Map

## 1. Project Overview

**Menuhat** is a modern, responsive web application for online food ordering and restaurant management. It serves two primary audiences within a unified frontend:
1. **End Consumers / Diners:** Browse restaurants, discover categories and meals, add items to cart, manage favorites, view orders, and track notifications in Arabic (RTL).
2. **Restaurant Owners & Admins:** Access a comprehensive dashboard to configure digital menus, categories, subcategories, products, manage incoming orders, track sales reports, and contact support.

---

## 2. Technology Stack & Key Dependencies

- **Framework:** Angular 19+ (`@angular/core: ^22.1.0` / modern standalone architecture)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss: ^4.3.3`)
- **Typography:** Cairo font family (`@fontsource/cairo: ^5.3.0`)
- **Icons:** Material Symbols Sharp (`material-symbols: ^0.47.6`) and inline SVGs
- **Carousel & Sliders:** Swiper Elements (`swiper: ^14.2.0`)
- **Reactive Programming:** RxJS `~7.8.0` + Angular Signals (`signal`, `computed`, `input`, `output`)
- **Change Detection:** `ChangeDetectionStrategy.OnPush` across all components

---

## 3. Directory Structure & Responsibilities

```
e:/projects/menuhat/
├── public/                     # Static assets (icons, default images)
│   ├── icons/
│   └── images/
├── src/
│   ├── app/
│   │   ├── core/               # App-wide singleton services, interceptors, guards, constants
│   │   │   ├── constants/      # API endpoints (e.g., dashboard-api.constants.ts)
│   │   │   ├── environments/   # Environment configurations (apiUrl, filesUrl)
│   │   │   ├── guards/         # Route protection (auth.guard.ts)
│   │   │   ├── interceptors/   # HTTP interceptors (auth, loading)
│   │   │   └── services/       # Global services (auth, toast, dropdown, location, responsive)
│   │   ├── layouts/            # Page shell layouts
│   │   │   ├── auth-layout/    # Minimal layout for login, register, OTP
│   │   │   ├── main-layout/    # Consumer layout (desktop navbar, mobile navbar, footer)
│   │   │   └── dashboard-layout/ # Admin/restaurant management layout (sidebar, header)
│   │   ├── shared/             # Reusable UI components & pipes
│   │   │   ├── components/     # FormInput, FormSelect, LoadingButton, ToastContainer, etc.
│   │   │   └── pipes/
│   │   └── features/           # Domain feature modules
│   │       ├── auth/           # Login, Register, OTP verification, Mobile verification
│   │       ├── cart/           # Cart page, CartDropdownComponent, CartService
│   │       ├── dashboard/      # Restaurant dashboard: menus, orders, reports, support
│   │       ├── favorites/      # Favorites page, FavoriteDropdownComponent, FavoritesService
│   │       ├── home/           # Landing page, banners, popular items, restaurant sliders
│   │       ├── menu-items/     # Product details page, meal customizations
│   │       ├── my-orders/      # Order history and order status tracking
│   │       ├── notifications/  # Notification dropdown and notifications center
│   │       ├── offers/         # Special discounts and promotional meals
│   │       ├── profile/        # User profile management and delivery addresses
│   │       └── restaurants/    # Restaurant directory and restaurant menu view
│   ├── styles.css              # Global styles, Tailwind v4 imports, @theme design tokens
│   ├── main.ts                 # Bootstrap application entry point
│   └── app/app.config.ts       # Application providers, routes, HTTP interceptors
├── AGENTS.md                   # Permanent agent instructions and UI guidelines
├── PROJECT_CONTEXT.md          # Architecture & project reference document (this file)
└── GEMINI.md                   # Core project guidelines and user rules
```

---

## 4. Key Layouts & Routing Architecture

Routes are defined in `src/app/app.routes.ts` and leverage lazy loading (`loadComponent`):

### 4.1 Auth Layout (`AuthLayoutComponent`)
- `/login` – User authentication
- `/send-otp` / `/validate-otp` – OTP verification workflows
- `/register` – New account creation
- `/send-mobile-verification` – Phone number confirmation
- `/create-restaurant` – Onboarding flow for restaurant partners

### 4.2 Main Consumer Layout (`MainLayoutComponent`)
- Wraps the customer-facing experience with:
  - `DesktopNavbar` on desktop screens (`md:flex`)
  - `MobileNavbar` + Mobile Header on small screens (`md:hidden`)
  - `FooterComponent` at the bottom
- Routes:
  - `/` or `/home` – Main storefront
  - `/cart` – Full shopping cart page
  - `/favorites` – User's saved meals
  - `/profile` – User account settings
  - `/offers` – Restaurant offers and deals
  - `/restaurants` & `/restaurants/:serial` – Restaurant listings and menu pages
  - `/menu-items/:id` – Individual product page
  - `/my-orders` – Customer order history
  - `/notifications` – Customer notifications view

### 4.3 Dashboard Layout (`DashboardLayoutComponent`)
- Back-office administration for restaurant owners and staff:
  - `/dashboard` – Operational overview metrics
  - `/dashboard/menu` – Menu management
  - `/dashboard/menu/details/:id` – Detailed menu configuration
  - `/dashboard/menu/categories` & `/dashboard/menu/subcategories` – Category hierarchies
  - `/dashboard/menu/add-item` – New product wizard with system image selector
  - `/dashboard/orders` & `/dashboard/orders/:id` – Live order processing
  - `/dashboard/most-ordered` – Top-selling items analytics
  - `/dashboard/reports` – Sales and performance reports
  - `/dashboard/support` – Technical support tickets

---

## 5. Core Services & Cross-Cutting Architecture

| Service | File Path | Responsibility |
|---|---|---|
| `UserDataService` | `core/services/userData.service.ts` | Manages auth token in `localStorage` (`'usertoken'`), decodes user payload, user state signal. |
| `DropdownStateService` | `core/services/dropdown-state.service.ts` | Coordinates header dropdowns (Cart, Favorites, Notifications) so only one is active at a time. |
| `ToastService` | `core/services/toast.service.ts` | Reactive signals-based toast dispatcher (`success`, `error`, `warning`, `info`). |
| `ResponsiveService` | `core/services/responsive.service.ts` | Screen size signals (`isMobile()`, `isDesktop()`) for responsive layout switching. |
| `LocationService` | `core/services/location.service.ts` | Manages customer delivery location, address selection, and geographic coordinates. |
| `AuthInterceptor` | `core/interceptors/auth-interceptor.ts` | Injects `Authorization: Bearer <token>` and `Accept-Language: ar` to all HTTP requests. |
| `LoadingInterceptor` | `core/interceptors/loading.interceptor.ts` | Tracks pending HTTP requests for global loading states. |

---

## 6. Shared Component Library

Reusable components live in `src/app/shared/components/`:
- **`FormInputComponent`** (`form-input/`): Clean floating or bordered input with validation states and icon slots.
- **`FormSelectComponent`** (`form-select/`): Standardized dropdown selector matching project design standards.
- **`LoadingButtonComponent`** (`loading-button/`): Action button displaying a spinner when asynchronous actions run.
- **`LocationSelectorComponent`** (`location-selector/`): Delivery address modal and map picker.
- **`ToastContainerComponent`** (`toast-container/`): Floating viewport alert container rendering toasts from `ToastService`.

---

## 7. Backend & API Integration Protocols

- **Environment Config:** `src/environments/environment.ts`
  - `apiUrl`: `http://192.168.1.150:500/api`
  - `filesUrl`: `http://192.168.1.150:500/UploadedFiles`
- **Constants File:** `src/app/core/constants/dashboard-api.constants.ts` defines all backend route endpoints.
- **Image URL Handling Protocol:**
  - When backend returns relative paths (e.g. `/SuggestImages/default-product.png` or `ProductImages/...`):
    ```typescript
    getItemImageUrl(photoURL: string | null): string {
      if (!photoURL) return '/images/default-meal.png';
      if (photoURL.startsWith('http')) return photoURL;
      const clean = photoURL.startsWith('/') ? photoURL : `/${photoURL}`;
      return `${environment.filesUrl}${clean}`;
    }
    ```
  - **Never use `environment.apiUrl` for image/asset loading.**

---

## 8. Permanent Model Conventions

- Every model interface resides in its own isolated file in `models/` (e.g. `cart-item.model.ts`, `favorite-product.model.ts`).
- **No barrel `index.ts` files** are allowed in `models/`.
- Import directly from each file to prevent circular dependencies and broken compiler paths.
