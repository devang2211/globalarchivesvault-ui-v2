# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Type-check (tsc -b) then Vite build → dist/
npm run lint       # ESLint across entire project
npm run preview    # Serve the dist/ build locally
```

No test framework is configured. There is no test command.

When adding new routes, TanStack Router's file-based route codegen runs automatically via `@tanstack/router-cli` — `routeTree.gen.ts` must not be edited by hand.

## Architecture

### Route → Layout wiring

Routes use a two-file pattern. A `route.tsx` mounts `AppLayout` as its component (which renders an `<Outlet>`); an adjacent `index.tsx` (or named file) renders the actual page component into that outlet:

```
src/routes/
  __root.tsx                  ← auth guard (beforeLoad) + root error boundary
  index.tsx                   ← redirects / to /dashboard
  sign-in.tsx
  dashboard/
    route.tsx                 ← mounts AppLayout
    index.tsx                 ← mounts DashboardPage
  client-management/
    route.tsx                 ← mounts AppLayout
    index.tsx                 ← mounts ClientManagementPage
    onboarding.tsx            ← mounts ClientOnboardingPage (create)
    update/$id.tsx            ← mounts ClientOnboardingPage (edit)
  pricing-tier/
    route.tsx / configure.tsx
  errors/
    route.tsx / forbidden.tsx / not-found.tsx
```

`__root.tsx` validates the JWT on every navigation via `isTokenValid()`. Unauthenticated requests redirect to `/sign-in`; 403 responses redirect to `/errors/forbidden`.

### Feature module structure

Each feature under `src/features/<name>/` owns:
- `api/` — raw Axios calls, typed DTOs
- `hooks/` — React Query wrappers (`useQuery` / `useMutation`) over the api layer
- `components/` — feature-scoped UI pieces
- `pages/` — full page components mounted by routes
- `schema/` — Zod schemas and inferred form types
- `types/` — feature-local TypeScript types

### API client (`src/shared/api/client.ts`)

Single Axios instance with:
- `baseURL: "http://mypersonalrims.tryasp.net/"` (hardcoded — no `.env`)
- Request interceptor: injects `Authorization: Bearer <token>` from localStorage and calls `startApiProgress()`
- Response interceptor: extracts `error.response.data.error.message` for toast display; on 401 clears auth + redirects to `/sign-in`; on 403 redirects to `/errors/forbidden`

All API responses follow: `{ success: boolean, data: T, traceId?: string, error?: { code, message } }`

### Auth (`src/shared/lib/auth.ts`)

JWT stored under `localStorage["auth"]` as `{ token, expiresAt, userId, name, email, userType }`. `isTokenValid()` checks expiry client-side. Three roles: `SuperAdmin`, `ClientAdmin`, `ClientUser`. Use `hasRole([...])`, `isSuperAdmin()`, `isClientAdmin()`, `isClientUser()` for role checks.

### State persistence

| What | Where |
|---|---|
| Auth token | `localStorage["auth"]` |
| User preferences (theme, font, sidebar, layout, direction) | `localStorage["preferences"]` |
| Sidebar collapsed state | `localStorage["sidebar-collapsed"]` |
| Data table state (page, pageSize, sort, search, filters) | `sessionStorage[<storageKey>]` via `useDataTableState(key)` |

### Preferences system

`PreferencesProvider` (wraps entire app) reads/writes `localStorage["preferences"]`. `main.tsx` applies theme + font to `document.documentElement` synchronously before React mounts to prevent FOUC. Live OS-theme changes are handled by the provider's `useEffect`. Access via `usePreferences()` hook.

### Progress bar (`src/lib/progress.ts`)

Dual-track NProgress with two independent counters:
- **Route progress** (`startRouteProgress` / `stopRouteProgress`): starts immediately on navigation
- **API progress** (`startApiProgress` / `stopApiProgress`): debounced 80 ms to avoid flicker on fast calls; minimum display 300 ms

The Axios client calls `startApiProgress` / `stopApiProgress` automatically.

### Data table pattern (`src/shared/components/data-table/`)

Generic `DataTable<T>` + `DataTablePagination` built on TanStack Table v8 with `manualPagination: true` and `manualSorting: true`. Pages use `useDataTableState(key)` for persisted state and pass `total={total}` to `DataTablePagination` for the "Showing X–Y of Z results" display.

### Styling conventions

- Utility helper: `cn(...classes)` from `src/lib/utils.ts` (`clsx` + `tailwind-merge`)
- Component variants: `class-variance-authority` (CVA)
- Dark mode: class-based (`.dark` on `<html>`) — all colors must use CSS token classes (`text-foreground`, `bg-background`, `border-border`, `text-muted-foreground`, etc.)
- Tailwind v4 — use canonical class names; avoid arbitrary values when a standard scale class exists (linter enforces `suggestCanonicalClasses`)
- shadcn/ui components live in `src/components/ui/` and must not be modified unless intentionally customising the design system
