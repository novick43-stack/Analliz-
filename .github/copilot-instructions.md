## Quick context for AI assistants

This repository is a Next.js (app router) project (Next 16) written in TypeScript and using React 19 and Tailwind CSS. There are two package.json manifests (root and `analliz/`) with the same dev scripts; use the root when running commands from workspace root.

Key integrations:
- Auth0 via `@auth0/nextjs-auth0` (`src/lib/auth0.ts`). Auth flows are mounted under `/auth/*` and the app delegates auth handling to the Auth0 SDK via `middleware.ts`.
- Serverless Postgres via Neon using `@neondatabase/serverless` (`src/lib/db.ts`) and the `sql` template tag.

Primary patterns to follow (discoverable in the code):
- App router + server components: pages under `src/app/*` are often server components (async allowed). Example: `src/app/admin/dashboard/page.tsx` calls `await auth0.getSession()` directly.
- Centralized libs: import `auth0` from `src/lib/auth0` and `sql` from `src/lib/db` rather than re-instantiating clients.
- Middleware runs on the edge: `middleware.ts` sets `export const runtime = 'edge'` and delegates to `auth0.middleware(request)`; do not change this runtime unless you know the implications.

Common developer flows / commands
- Run dev server: `npm run dev` (root). The project uses Next's app router so hot reload is available.
- Build: `npm run build` then `npm run start` for production.
- Lint: `npm run lint`.

Environment & deployment notes (explicitly discoverable or reasonable inference):
- `src/lib/db.ts` expects `DATABASE_URL` in the environment (see warning in code). Set this in `.env.local` for local dev.
- Auth0 requires its environment variables to work (not committed). Assume standard `@auth0/nextjs-auth0` vars: `AUTH0_SECRET`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`. If missing, the middleware/auth calls will fail.

Concrete examples from the codebase
- Session check in a server component (see `src/app/admin/dashboard/page.tsx`):

  - Uses the shared `auth0` client:

    ```ts
    const session = await auth0.getSession();
    if (!session || !session.user) redirect('/admin/login');
    ```

  - After authentication, the page syncs the user to the Neon DB using `sql`:

    ```ts
    await sql`INSERT INTO users (auth0_id, email, name) VALUES (${user.sub}, ${user.email}, ${user.name}) ON CONFLICT (auth0_id) DO UPDATE SET last_login = CURRENT_TIMESTAMP`;
    ```

- Middleware delegates to Auth0 and is Edge-runtime sensitive (`middleware.ts`): do not convert to node runtime lightly.

What to watch for / edge cases
- Missing env vars: `DATABASE_URL` and Auth0 config cause runtime failures—tests and local dev will be blocked until set.
- DB schema is created lazily on the dashboard route (see `CREATE TABLE IF NOT EXISTS users ...`): be mindful that running the dashboard can mutate DB schema.
- Avoid duplicating client instances; use exports from `src/lib/*`.

Files to read first (high signal):
- `middleware.ts` — edge runtime and auth delegation
- `src/lib/auth0.ts` — Auth0 client entry
- `src/lib/db.ts` — Neon DB client and env expectation
- `src/app/admin/dashboard/page.tsx` — example of server-component auth + DB sync
- `src/app/*` — app router entry points and layouts

If you need more context
- Ask for the current `.env.local` template or the intended Auth0 application settings.
- If editing runtime/hosting (edge vs node), explain why and include the expected hosting target (Vercel, etc.).

If you modify anything related to auth or DB, include a short test plan in your PR: how you started the dev server, env values you used, and a minimal reproduction (e.g., login via `/auth/login` and visit `/admin/dashboard`).

If this should be merged into an existing agent guidance file, tell me which file to merge with and I'll perform an intelligent merge that preserves existing content.

---
Please review these notes and tell me if you'd like more detail in any section (env var names, example .env template, or a short developer checklist for onboarding).
