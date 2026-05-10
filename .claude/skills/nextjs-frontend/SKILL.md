---
name: nextjs-frontend
description: >
  Production-grade Next.js frontend scaffold and code generation skill. Use this skill whenever
  the user asks to build, scaffold, extend, or generate any Next.js application, page, component,
  API layer, form, or module. Triggers include: "create a Next.js app", "build a Next.js page",
  "add a form in Next.js", "set up Zustand store", "configure TanStack Query", "add React Hook Form
  with Zod", "scaffold a module", "create a reusable component", "type-safe API", "Next.js project
  structure", "Next.js boilerplate", or any request involving Next.js + state management, data
  fetching, forms, or toasts. Always use this skill for ANY Next.js frontend task — even partial
  ones like "add a Zustand slice" or "create a form component". This skill enforces: Next.js 15
  (App Router), Zustand, TanStack Query v5, React Hook Form + Zod, Sonner, full TypeScript safety,
  module-scoped API folders, and a strict reusable-component architecture.
---

# Next.js Frontend Skill

A production-grade code-generation skill for Next.js 15 applications. Every output must be
**fully type-safe**, **cleanly structured**, and **immediately runnable**.

---

## Core Stack (pinned versions)

| Library | Version | Purpose |
|---|---|---|
| `next` | **15.x (latest stable)** | Framework — App Router only |
| `react` / `react-dom` | 19.x | UI runtime |
| `typescript` | 5.x | Type safety — strict mode |
| `zustand` | 5.x | Client / UI state |
| `@tanstack/react-query` | 5.x | Server state + cache |
| `react-hook-form` | 7.x | Form state |
| `zod` | 3.x | Schema validation |
| `@hookform/resolvers` | 3.x | RHF ↔ Zod bridge |
| `sonner` | 1.x | Toast notifications |
| `tailwindcss` | 3.x | Utility-first CSS |
| `@tanstack/react-query-devtools` | 5.x | Dev DX |

---

## Non-Negotiable Rules

1. **TypeScript strict mode** — `tsconfig.json` must have `"strict": true`.
2. **Every API call has a typed Request and Response interface** — never use `any`.
3. **Each module owns its API folder** — `src/modules/<module>/api/`.
4. **Server state lives in TanStack Query** — no `useState` for fetched data.
5. **Client/UI state lives in Zustand** — no prop-drilling for shared UI state.
6. **All forms use React Hook Form + Zod** — no uncontrolled inputs, no manual validation.
7. **All user feedback uses Sonner** — never `alert()` or inline error states for toasts.
8. **Components are reusable and single-responsibility** — extract anything used ≥ 2 times.
9. **App Router only** — no `pages/` directory, no `getServerSideProps`.
10. **Named exports for components** — default exports only for `page.tsx` / `layout.tsx`.

---

## Reference Files

Read the relevant reference file before generating code for that concern:

| File | When to read |
|---|---|
| `references/project-structure.md` | Scaffolding a new project or explaining folder layout |
| `references/api-patterns.md` | Creating API functions, types, or query/mutation hooks |
| `references/component-patterns.md` | Building UI components, layouts, or Zustand stores |
| `references/form-patterns.md` | Creating any form with React Hook Form + Zod + Sonner |

---

## Quick Decision Tree

```
User request
├── New project / full scaffold?
│   └── Read ALL four reference files, then generate
├── New module (e.g., "add a Users module")?
│   └── Read project-structure.md + api-patterns.md + component-patterns.md
├── New form?
│   └── Read form-patterns.md + api-patterns.md
├── New component / store?
│   └── Read component-patterns.md
└── New API / endpoint type?
    └── Read api-patterns.md
```

---

## Output Quality Checklist

Before presenting any code, verify:

- [ ] All imports resolve (no missing packages)
- [ ] Zero `any` types — every value is explicitly typed
- [ ] API functions export `Request` and `Response` interfaces
- [ ] Forms have a Zod schema, RHF `useForm<SchemaType>`, and Sonner feedback
- [ ] TanStack Query hooks are in `<module>/api/use-<resource>.ts`
- [ ] Zustand stores are in `<module>/store/<module>.store.ts`
- [ ] Reusable UI lives in `src/components/ui/`
- [ ] Page components are thin — logic delegated to hooks and components
- [ ] `"use client"` directive present on every Client Component
- [ ] Server Components do NOT import Zustand or browser APIs
