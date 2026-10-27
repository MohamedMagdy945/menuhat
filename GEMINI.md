# Project Guidelines & User Preferences

## UI & Styling Rules (Strict Requirements):
1. **No Hover Color Changes**: Do NOT change background colors or text colors on `:hover`. Colors must remain stable and consistent without distracting shifts.
2. **No Scale or Transform Movements**:
   - Do NOT use scaling animations (e.g., `hover:scale-105`, `active:scale-95`, `hover:scale-*`, `active:scale-*`).
   - Do NOT use `transform: translateY(...)`, `translateX(...)`, or any floating/bouncing transform effects on hover.
   - Elements must stay in place without jumping, moving, or resizing when hovered or clicked.

## Design System & Style Guidelines:
- **Card Containers**:
  - Background: `bg-white`
  - Corners: `rounded-xl` or `rounded-2xl`
  - Elevation: Clean and subtle `shadow-sm`
  - Borders: Neutral and minimal, e.g. `border border-gray-100` or `border-b border-gray-100` (avoid loud/colored borders).
  - Spacing: Consistent padding (e.g., `p-3` to `p-5` with `gap-4`).
- **Typography**:
  - Headings & Names: `font-semibold text-slate-800` or `font-bold text-slate-900`
  - Subtitles & Details: `text-sm text-slate-400` (clean, readable, relaxed)
  - Prices & Highlights: `font-bold text-orange-500` or `text-slate-800`
- **Actions & Buttons**:
  - Primary Button: `bg-orange-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer`
  - Secondary/Outlined Button: `bg-white border border-gray-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-xl cursor-pointer`
  - Danger/Delete Icon Button: `bg-red-50 text-red-500 rounded-full w-8 h-8`
  - Quantity Pills: `rounded-full border border-slate-200 px-2.5 py-1 bg-white` with clean +/- buttons
- **Component Architecture**:
  - Angular 18+ standalone components
  - Reactive Signals (`signal`, `computed`, `input`, `output`)
  - `ChangeDetectionStrategy.OnPush`
