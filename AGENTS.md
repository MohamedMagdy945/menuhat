# AGENTS.md — Menuhat Developer & Agent Rules

Binding rules for anyone (human or AI agent) changing the **Menuhat** Angular frontend.
`PROJECT_CONTEXT.md` describes *what exists*; this file describes *how you must work*.

> **Every session**
> 1. Read this file and `PROJECT_CONTEXT.md` before starting.
> 2. Inspect only the files relevant to the task — do not scan the whole project without need.
> 3. Follow the existing conventions; never introduce a competing pattern.
> 4. Keep changes minimal and on-task. No unsolicited refactors of unrelated code.
> 5. Update both documents when you change architecture, conventions, routes, shared services or shared components.
> 6. Finish with `npm run build` (see §8) — it must succeed with no new errors or warnings.

---

## 1. UI rules (zero tolerance)

### 1.1 No hover/active visual changes
- Do **not** use any `hover:*`, `group-hover:*` or `active:*` Tailwind variant (`hover:bg-*`, `hover:text-*`, `hover:border-*`, `hover:opacity-*`, `hover:underline`, `hover:shadow-*`, `active:scale-*`, …), including stacked forms such as `disabled:hover:*` or `hover:not(:disabled):*`.
- Do **not** write `:hover` / `:active` rules in component CSS or `styles.css`.
  (Only exception: the `input:-webkit-autofill:hover` resets that keep autofill colors *stable*.)
- Colors, borders and opacity stay identical when the pointer is over or presses an element.

### 1.2 No scale or movement
- No `scale-*` / `translate-*` reactions to interaction, no floating or bouncing effects.
- Allowed: static positioning transforms (e.g. a centered caret `translateX(-50%) rotate(45deg)`, a state-driven chevron `rotate-180`) and the existing **entrance** keyframes for dropdowns, toasts and the side drawer. Do not add new animations without being asked.

### 1.3 Focus states
- `focus:` styles on form fields (`focus:border-orange-500`, `focus:bg-white`, `focus:ring-*`) are allowed — they are keyboard/accessibility feedback, not hover effects. Keep them consistent with existing inputs.

### 1.4 Design system
- **Tailwind CSS v4.** Tokens live in the `@theme` block of `src/styles.css` (`--color-primary: #F97316`, background, surface, border, text). Prefer existing Tailwind colors/tokens over new hex values.
- **Direction & font:** Arabic, RTL by default (`dir="rtl"`), Cairo (`@fontsource/cairo`). Mind RTL when spacing/aligning (`pr-`/`pl-`, `start`/`end`, `right`/`left`).
- **Icons:** Material Symbols Sharp — `<span class="material-symbols-sharp">name</span>`.
- **Card containers:** `bg-white`, `rounded-xl`/`rounded-2xl` (modals may use `rounded-3xl`), `shadow-sm` (dropdowns/modals `shadow-xl`), neutral border `border border-gray-100`, padding `p-3`–`p-5`, `gap-4`.
- **Typography:** headings/names `font-semibold text-slate-800` or `font-bold text-slate-900`; hints/subtitles `text-sm text-slate-400`; prices/highlights `font-bold text-orange-500` (or `text-slate-800`).
- **Buttons:**
  - Primary: `bg-orange-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer`
  - Secondary: `bg-white border border-gray-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-xl cursor-pointer`
  - Danger icon: `bg-red-50 text-red-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer`
  - Quantity pill: `rounded-full border border-slate-200 px-2.5 py-1 bg-white` with plain `+` / `-` buttons
  - Async submit buttons: use `<app-loading-button>` (shared) instead of hand-rolled spinners.
- **Forms:** use `<app-form-input>` / `<app-form-select>` (ControlValueAccessors with built-in Arabic error messages; pass `customErrors` for field-specific text).

---

## 2. Angular component rules

- **Standalone only** — no NgModules. (`standalone: true` is the default in Angular 22; existing files may still state it explicitly.)
- **`changeDetection: ChangeDetectionStrategy.OnPush` on every component.** The app is **zoneless** (no `zone.js`), so the view only refreshes when a signal it reads changes, an input changes, a template event fires, or `markForCheck()` is called:
  - Any state that is rendered and changes asynchronously (HTTP callbacks, timers, `setTimeout`, FileReader, geolocation) **must be a signal**. Plain fields mutated in callbacks will not re-render.
  - A component that renders state owned by a *parent's* form control (as the form controls do) must listen to `control.events` and call `markForCheck()` — see `FormInputComponent`.
- **Signals:** `signal()`, `computed()`, `effect()` for local state; `input()`, `input.required()`, `output()` for component APIs. Do **not** use `@Input()` / `@Output()` / `EventEmitter`.
- **DI:** `inject()` only — no constructor parameter injection:
  ```ts
  private readonly _http = inject(HttpClient);
  private readonly _toast = inject(ToastService);
  ```
- **Subscriptions:** one-shot HTTP calls may be subscribed directly. Anything long-lived (`router.events`, `interval`/`timer`, `fromEvent`, service streams, `control.events`) must end with `takeUntilDestroyed()` (or be unsubscribed in `ngOnDestroy`). `ActivatedRoute` observables are completed by the router and are safe.
- **Routes** are lazy (`loadComponent`) and declared only in `src/app/app.routes.ts`. Keep the existing legacy redirect aliases.

---

## 3. Models (types & interfaces)

- **One interface or type per file**, named `<kebab-case-type-name>.model.ts` (e.g. `FavoriteProduct` → `favorite-product.model.ts`).
- Files live in the `models/` folder of the owner:
  - feature: `features/<feature>/models/` — dashboard sub-features: `features/dashboard/<sub-feature>/models/`
  - layout: `layouts/<layout>/models/`
  - app-wide: `core/models/` (core services) or `shared/models/` (shared components / cross-feature types such as `DateFilterType`, `PageData<T>`)
- **Never** declare interfaces/types inside components, services or constants files — not even private ones.
- **No barrel files** (`index.ts`, `export *`) anywhere. Import each model from its own file:
  ```ts
  import { FavoriteProduct } from '../../models/favorite-product.model'; // correct
  import { FavoriteProduct } from '../../models';                        // forbidden
  ```
- Before adding a model, search for an existing one with the same shape and reuse it rather than duplicating it.

---

## 4. Backend, files & environment

- **Config:** `src/app/core/environments/environment.ts` (the only environment file; there are no file replacements). `apiUrl` = REST base (`…/api`), `filesUrl` = uploaded files base (`…/UploadedFiles`). Switch backends by editing this file.
- **Endpoints:** dashboard/owner endpoints are centralized in `core/constants/dashboard-api.constants.ts` (`DASHBOARD_API_ENDPOINTS`). Add new dashboard endpoints there and reuse them. Customer-side services build URLs from `environment.apiUrl` in the service itself — never in components.
- **Images — never use `apiUrl`:**
  - Absolute `http(s)://` URLs are used as-is.
  - Paths starting with `/UploadedFiles` or `/DefaultImages` are served from the file-server origin → `FILES_ORIGIN` (`core/constants/files.constants.ts`).
  - Any other relative path → `` `${environment.filesUrl}/${path}` `` (normalize the leading slash).
  - Fallback images: `/images/default-meal.png`, `/images/default-restaurant.png`, `/images/default-avatar.svg`, `/images/default.png` (in `public/`).
  - Name component fields that hold `environment.filesUrl` `filesUrl` — never `apiUrl`.
- **Auth headers:** `authInterceptor` adds `Authorization: Bearer <usertoken>` and `Accept-Language: ar` to every request. Do not set these manually.
- **Global loader:** opt-in per request via `context: new HttpContext().set(USE_GLOBAL_LOADING, true)` (`core/loading/loading-context.ts`). Prefer local skeletons/spinners for partial loads.

---

## 5. Session, state & cross-component services

- **Session:** read and write the user/token only through `UserDataService` (`core/services/userData.service.ts`: `setUserData`, `getUserData`, `currentUser`, `isAuthenticated`, `clearUserData`). Never touch `localStorage['usertoken' | 'userData']` directly from features. (Only the interceptor and the guards read the token directly.)
- **Guards:** `authGuard` (requires a token → otherwise `/login`) protects `/dashboard/**`. `logedGuard` (guests only → otherwise `/home`) exists for auth pages but is not applied, because the register → phone-verification → create-restaurant flow runs with a fresh token.
- **Header dropdowns** (cart, favorites, notifications, account): only one may be open. Always use `DropdownStateService` — `open(id)`, `toggle(id)`, `close(id?)`, `closeAll()`, `isOpen(id)` (or read the `activeDropdown` signal). It also closes everything on navigation.
- **User feedback:** use `ToastService` (`success`, `error`, `warning`, `info`) — never `alert()`. The single `<app-toast-container />` is in `App`. Destructive confirmations use `<app-confirm-modal>` (`features/admin-panel/restaurants/modals/confirm-modal`; move it to `shared/` once another feature needs it: `open`, `title`, `message`, `confirmText`, `icon`, `variant`, `loading` → `confirmed` / `cancelled`), kept in the template and driven by `[open]` so its enter/leave animation plays — never the native `confirm()`. (Some older pages still call `confirm()`; migrate them when you touch them.)
- **Responsive switches:** use the `ResponsiveService.isMobile` signal rather than ad-hoc `window` checks.

---

## 6. Code hygiene

- No `console.log` debugging in committed code; never log tokens or user data. `console.error` in error handlers is acceptable.
- User-facing text is Arabic.
- Formatting: Prettier (`.prettierrc`: `printWidth: 100`, single quotes, Angular parser for HTML). Run it on files you touch.
- File naming: `<name>.component.ts|html|css`, `<name>.service.ts`, `<name>.model.ts`, `<name>.guard.ts`.

---

## 7. Workflow for a task

1. Read the target component/service, its template/styles, and the models it uses.
2. Check §1–§5 before writing code; reuse shared components and services.
3. Make the smallest change that solves the task.
4. Verify: no hover/active variants, OnPush + signals for async state, RTL-correct layout, models in their own files.
5. Run the checks in §8.
6. Update `PROJECT_CONTEXT.md` / this file if you changed structure or conventions.

---

## 8. Commands & checks

```bash
npm start                                  # ng serve → http://localhost:4200 (needs the LAN backend)
npm run build                              # production build — MUST pass
npx tsc -p tsconfig.app.json --noEmit      # fast type-check (templates are only checked by the build)
npx prettier --write <files>
```

- The only accepted build warning today is the existing **initial bundle budget** warning (~713 kB vs the 500 kB budget). Do not add new warnings.
- **There is no test runner:** `angular.json` has no `test` target, there are no `*.spec.ts` files and Vitest is not installed (`npm test` fails). Don't claim tests were run.
