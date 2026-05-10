# Project Structure Reference

## Canonical Folder Layout

```
my-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group — auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Route group — protected pages
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx                # Root layout — providers live here
│   │   └── page.tsx                  # Home / landing
│   │
│   ├── components/
│   │   ├── ui/                       # Reusable, dumb UI atoms
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form-field.tsx        # RHF-aware wrapper
│   │   │   ├── spinner.tsx
│   │   │   ├── modal.tsx
│   │   │   └── data-table.tsx
│   │   └── layout/                   # Structural layout pieces
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       └── page-wrapper.tsx
│   │
│   ├── modules/                      # Feature modules (vertical slices)
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── auth.types.ts     # Request + Response interfaces
│   │   │   │   ├── auth.api.ts       # Raw fetch functions
│   │   │   │   └── use-auth.ts       # TanStack Query hooks
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── store/
│   │   │   │   └── auth.store.ts     # Zustand store
│   │   │   └── schemas/
│   │   │       └── auth.schema.ts    # Zod schemas
│   │   │
│   │   └── users/
│   │       ├── api/
│   │       │   ├── users.types.ts
│   │       │   ├── users.api.ts
│   │       │   └── use-users.ts
│   │       ├── components/
│   │       │   ├── user-list.tsx
│   │       │   ├── user-card.tsx
│   │       │   └── user-form.tsx
│   │       ├── store/
│   │       │   └── users.store.ts
│   │       └── schemas/
│   │           └── users.schema.ts
│   │
│   ├── lib/
│   │   ├── api-client.ts             # Base fetch wrapper (auth headers, error handling)
│   │   ├── query-client.ts           # TanStack QueryClient singleton
│   │   └── utils.ts                  # cn(), formatDate(), etc.
│   │
│   ├── providers/
│   │   ├── query-provider.tsx        # TanStack Query Provider
│   │   ├── theme-provider.tsx        # (optional) dark mode
│   │   └── index.tsx                 # Composes all providers
│   │
│   ├── hooks/                        # App-wide custom hooks
│   │   └── use-debounce.ts
│   │
│   └── types/
│       ├── api.ts                    # Shared API primitives (PaginatedResponse, etc.)
│       └── common.ts                 # Shared domain types
│
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Bootstrap Commands

```bash
# 1. Create the app
npx create-next-app@latest my-app \
  --typescript --tailwind --eslint --app \
  --src-dir --import-alias "@/*"

cd my-app

# 2. Install the stack
npm install \
  zustand \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  react-hook-form \
  zod \
  @hookform/resolvers \
  sonner

# 3. (Optional) shadcn/ui for base components
npx shadcn@latest init
```

---

## tsconfig.json (required settings)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "skipLibCheck": true
  }
}
```

---

## Root Layout with All Providers

```tsx
// src/app/layout.tsx  — Server Component (no "use client")
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My App",
  description: "...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```tsx
// src/providers/index.tsx
"use client";

import { QueryProvider } from "./query-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}
```

```tsx
// src/providers/query-provider.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## Shared API Types (`src/types/api.ts`)

```ts
// All API responses wrap data in this shape
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Access via `process.env.NEXT_PUBLIC_API_URL` — never hardcode base URLs.
