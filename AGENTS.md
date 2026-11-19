# AGENTS.md – Permanent Developer & Agent Instructions

This document outlines the non-negotiable architectural rules, coding standards, design requirements, and workflows for developing and maintaining the **Menuhat** frontend application.

> **CRITICAL RULE FOR ALL SESSIONS:**
> 1. Read this file and `PROJECT_CONTEXT.md` before starting any task.
> 2. Do NOT scan the entire project unnecessarily. Inspect only files relevant to the active task.
> 3. Adhere strictly to the established conventions. Never introduce conflicting patterns.
> 4. Update both documentation files whenever major architectural or convention changes occur.
> 5. Do NOT modify unrelated source code or make unsolicited refactoring.

---

## 1. Strict UI & Styling Guidelines (Zero Tolerances)

These rules are enforced project-wide without exception:

### 1.1 No Hover Color Shifts
- **DO NOT** change `background-color`, `text-color`, or `border-color` on `:hover` (e.g., do not use `hover:bg-orange-600`, `hover:text-black`, etc.).
- Colors must remain rock-solid and stable on user interaction to maintain a clean, distraction-free UI.

### 1.2 No Scale or Transform Movements
- **DO NOT** use scale utilities: no `hover:scale-*`, no `active:scale-*` (e.g., `hover:scale-105`, `active:scale-95`).
- **DO NOT** use translation transforms on hover: no `transform: translateY(...)`, `translateX(...)`, or bouncing/floating hover animations.
- All interactive elements (cards, buttons, icons, pills) must stay firmly anchored in place without jumping or resizing.

### 1.3 Design System & Tailwind CSS Tokens
- **Framework:** Tailwind CSS v4 (`@theme` block in `src/styles.css`).
- **Font:** Cairo (`@fontsource/cairo`) with Arabic RTL layout by default (`dir="rtl"`).
- **Icons:** Material Symbols Sharp (`.material-symbols-sharp`).
- **Card Containers:**
  - Background: `bg-white`
  - Rounded corners: `rounded-xl` or `rounded-2xl` (modals can use `rounded-3xl`)
  - Shadows: Subtle elevation `shadow-sm` (dropdowns/modals use `shadow-xl`)
  - Borders: Neutral and clean, e.g. `border border-gray-100` (avoid bright or distracting border colors)
  - Padding: `p-3` to `p-5` with `gap-4`
- **Typography:**
  - Headings & Names: `font-semibold text-slate-800` or `font-bold text-slate-900`
  - Subtitles, Hints & Details: `text-sm text-slate-400`
  - Prices & Highlights: `font-bold text-orange-500` or `text-slate-800`
- **Buttons & Interactive Components:**
  - **Primary Button:** `bg-orange-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer`
  - **Secondary / Outlined Button:** `bg-white border border-gray-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-xl cursor-pointer`
  - **Danger / Delete Icon Button:** `bg-red-50 text-red-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer`
  - **Quantity Pills:** `rounded-full border border-slate-200 px-2.5 py-1 bg-white` with clean `+` / `-` buttons

---

## 2. Angular Architecture & Component Rules

- **Standalone Components Only:** All components must be `standalone: true` (Angular 19+ standard). No NgModules.
- **Change Detection:** Always use `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Reactive Signals:**
  - Use Angular signals for reactive state: `signal()`, `computed()`.
  - Component communication: use `input()`, `input.required()`, and `output()`.
  - Avoid unnecessary manual subscriptions. When subscribing to RxJS observables (e.g. HTTP calls), manage lifecycle safely or use `takeUntilDestroyed()`.
- **Dependency Injection:**
  - Prefer the `inject(...)` function over constructor injection:
    ```typescript
    private readonly _http = inject(HttpClient);
    private readonly _router = inject(Router);
    private readonly _toast = inject(ToastService);
    ```

---

## 3. Data Models & File Placement Rules

### 3.1 One Model per File
- **Every interface or type must be placed in its own individual file** under the appropriate `models/` folder.
- **NEVER** lump multiple models into one file or create barrel `index.ts` files inside `models/`.
- Always import directly from the specific model file:
  ```typescript
  // CORRECT
  import { FavoriteProduct } from '../../models/favorite-product.model';

  // WRONG - DO NOT DO THIS
  import { FavoriteProduct } from '../../models';
  ```

---

## 4. API Endpoints, Files, & Environment Configuration

### 4.1 Base URLs
- Defined in `src/environments/environment.ts`:
  - `apiUrl`: `http://192.168.1.150:500/api` (Backend REST API)
  - `filesUrl`: `http://192.168.1.150:500/UploadedFiles` (Static uploads and images)
- **CRITICAL - Image Serving:**
  - Uploaded product photos and system images are served through `environment.filesUrl` (or directly if an absolute URL `http...` is returned).
  - **NEVER** prefix image URLs with `apiUrl`.

### 4.2 API Endpoint Constants
- Centralized in `src/app/core/constants/dashboard-api.constants.ts`.
- When adding or calling dashboard/menu endpoints, check and reuse this file rather than hardcoding paths.

### 4.3 Authentication & Headers
- Handled by `src/app/core/interceptors/auth-interceptor.ts`.
- Automatically attaches `Authorization: Bearer <token>` from `localStorage.getItem('usertoken')`.
- Adds `Accept-Language: ar` to all outgoing requests.

---

## 5. UI State Management & Cross-Component Singletons

### 5.1 Mutual Exclusion for Header Dropdowns
- Only **one** dropdown (Cart, Favorites, Notifications) may be active at any given moment.
- Always use `DropdownStateService` (`src/app/core/services/dropdown-state.service.ts`):
  - Register with a unique identifier via `register(id)`.
  - Open via `open(id)`.
  - Close via `close(id)` or `closeAll()`.
  - Determine active state using `dropdownState.isActive(id)`.

### 5.2 Toast Notifications
- Always use `ToastService` (`src/app/core/services/toast.service.ts`):
  - `toast.success('...')`, `toast.error('...')`, `toast.warning('...')`, `toast.info('...')`.
- The global `<app-toast-container />` in `App` renders all notifications.

---

## 6. Development Workflow for Agents

1. **Check Requirements Against Existing Files:**
   - Inspect specific target components, their HTML/CSS, and their corresponding service and models.
2. **Apply Minimal & Clean Changes:**
   - Modify only what is necessary to accomplish the user's objective.
   - Do not alter working components outside the task scope.
3. **Verify Design Integrity:**
   - Ensure classes comply with the zero-hover-color/no-transform rules.
   - Ensure RTL alignment is respected (e.g. `pr-` vs `pl-`, `right` vs `left`, `flex-row-reverse` where applicable).
