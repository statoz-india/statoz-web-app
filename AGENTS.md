# StatOz web app

Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript strict, Tailwind 4, zod 4, Zustand.
Full folder guide: docs/technical/folder-structure.md

## Commands

- `npm run dev`: dev server. The port is in `.next/dev/lock`.
- `npx tsc --noEmit`: type-check.
- `npm run lint`: ESLint.
- `npm run build`: production build. Run it before calling a change done.

The first `next dev` or `next build` can exit 1 because of the security-advisory reminder. Run it again.

## Next.js

- Read the guide in `node_modules/next/dist/docs/` before using a Next.js API. Don't rely on memory.
- Server Components are the default. Add `"use client"` only to files that need state, effects or browser APIs, and keep it as low in the tree as possible.
- `cacheComponents` is on. Wrap anything that reads request data (`searchParams`, `cookies()`, `headers()`) in `<Suspense>`.
- `params` and `searchParams` are Promises in pages and layouts. Await them.
- Use `next/link` for internal links, `next/image` for images and `next/font` for fonts.
- Don't edit anything in `.next/`. If its generated types go stale after a route is deleted, remove `.next/dev/types`.
- Don't change the route structure (moving pages, adding route groups or layouts) unless asked. The nav shell lives in `src/app/layout.tsx`.

## Folders

Imports flow one way: `app → features → lib / hooks / core → config / styles / utils`.

- `src/app/`: routes only. Pages are thin and render a screen from a feature.
- `src/features/<name>/`: one feature's screens, components and `adapters.ts`. Its API hooks go in `data/<name>.data.ts`. A feature never imports from another feature.
- `src/core/`: the API layer (`core/api`), API models (`core/models`) and env. Import it from `@/core`.
- `src/lib/`: shared UI (`ui/`, `layout/`, `screens/`, `icons/`). It must not import from `features`.
- `src/hooks/`: shared hooks, including `useResource`.
- `src/config/`: app constants (sports, image paths). `src/styles/`: design tokens. `src/utils/`: pure helpers.

Use the `@/` alias for imports across folders, and relative imports inside a feature.

## API and data

- Every endpoint path lives in `core/api/endpoints.ts`.
- Every call goes through `unauthenticatedFetch` or `authenticatedFetch` (`core/api/client.ts`) with a zod schema, and returns the API's response as-is (`ApiResult`). Nothing else calls `fetch` against the API.
- Models are written schema first: `export const xSchema = z.object(...)` and `export type X = z.infer<typeof xSchema>`. Use `listOf()` for lists.
- The public API allows 60 requests per minute per IP. Don't poll it or call it in loops while testing.
- Call the API from the browser, per visitor, and cache the result with `useResource` so it's loaded once and reused. Don't fetch API data on the server or use `"use cache"` for it.

## Code style

- Files and folders are kebab-case. Components are PascalCase named exports. No default exports, except where Next.js requires them (`page`, `layout` and similar).
- Use Tailwind classes. Use a CSS module only when Tailwind can't express it. Take colours, spacing and type from `src/styles` tokens, never hard-coded values.
- Image paths come from `@/config/images`, never as string literals. ESLint enforces this.
- No `any`. Use `unknown` and narrow it.
- Keep comments short and explain why, not what.
- Don't read or print `.env` files.
- Never edit docs/technical/folder-structure.md. Read it, but leave changes to it to the user.
- Whatever is asked to do, just do that, never take decisions on your own and always ask whenever you are in a confusion.
- Always give the best suggestions whenever I ask something, don't just agree to me blindly.
- Never edit this file `.claude/CLAUDE.md` & `AGENTS.md` without asking first.
- Don't touch any file unnecessarily for making any changes that is not related to the given instructions

## Before finishing a change

1. `npx tsc --noEmit` passes.
2. `npm run lint` shows no errors.
3. `npm run build` passes for structural changes.
