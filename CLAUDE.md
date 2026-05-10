# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

Frontend for a school management system. The companion backend lives at `../school-management-backend` and is a NestJS API with JWT auth, RBAC (roles + permissions), and Swagger docs.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** + **shadcn/ui** (Radix-based, base-ui primitives)
- **Zustand** for client/UI state (auth token kept in-memory only)
- **TanStack Query v5** for server state, cache, and mutations
- **React Hook Form + Zod** for forms (via `@hookform/resolvers`)
- **Sonner** for toast notifications
- **pnpm** as package manager

## Commands

```bash
pnpm dev        # next dev (turbopack)
pnpm build      # production build
pnpm start      # run built app
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
```

## Architecture

```
src/
├── app/                    # App Router routes
│   ├── (auth)/             # Login / register (public)
│   └── (dashboard)/        # Protected pages
├── components/ui/          # Reusable UI atoms (shadcn + custom)
├── modules/                # Feature modules (vertical slices)
│   └── auth/
│       ├── api/            # *.types.ts, *.api.ts, use-*.ts, *.keys.ts
│       ├── components/     # Feature-specific components
│       ├── schemas/        # Zod schemas
│       └── store/          # Zustand store
├── lib/                    # api-client, query-client, utils
├── providers/              # QueryProvider + Toaster composition
└── types/                  # Shared API primitives
```

### Module pattern (per feature)

Every module's `api/` folder follows the **three-file rule**:
- `<m>.types.ts` — Request/Response interfaces (typed against `ApiResponse<T>`)
- `<m>.api.ts` — Pure async functions calling `http` from `lib/api-client.ts`
- `use-<m>.ts` — TanStack Query hooks; mutations toast via Sonner on success/error

### Auth flow

- Access token lives **in memory only** (Zustand `useAuthStore`, no `persist`).
- Refresh token is expected in an **httpOnly cookie** — `apiClient` sends `credentials: "include"`.
- `(dashboard)` layout client-side guards on `isAuthenticated` and redirects to `/login`.
- On reload the access token is gone; a `/auth/refresh` flow needs to be wired into the api-client (TODO).

## Backend Contract

The backend exposes a REST API with:
- Auth: JWT access + refresh tokens
- RBAC: User → Role → Permission (action:resource pairs, e.g. `users:read`)
- Response envelope: `{ success, data, message, timestamp }`
- All mutations are audit-logged on the backend

The frontend should store the JWT access token in memory (not localStorage) and the refresh token in an httpOnly cookie where possible.
