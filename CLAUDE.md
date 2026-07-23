# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Two apps in one repo, run together:

- **Backend API** (repo root) — Express + TypeScript + Prisma + PostgreSQL. Serves `/api/v1`, dev port **3000**. Sports facility domain: court booking (padel/tennis), pool tickets, memberships, abonemen, events, and a **dummy payment gateway** (no real charges).
- **Frontend** (`web/`) — Next.js 14 App Router, dev port **3001**. Talks to the API via `NEXT_PUBLIC_API_URL` (default `http://localhost:3000/api/v1`). Both must be running.

## Commands

### Backend (run from repo root)
```bash
npm run dev              # API on :3000 (ts-node-dev --respawn, hot-reloads on save)
npm run build            # tsc -> dist/
npm start                # run built dist/server.js
npm test                 # Jest UNIT tests (Prisma mocked), runInBand
npm run test:integration # Jest INTEGRATION tests — needs a real Postgres (pushes schema via globalSetup)
npx tsc -p tsconfig.json --noEmit   # type-check only

# single unit test:
npx jest tests/booking.service.test.ts
npx jest -t "membership"            # by test-name pattern

# Prisma / data
npm run prisma:generate  # regenerate client
npm run prisma:pull      # re-introspect DB into prisma/schema.prisma
node prisma/seed.js      # base seed; other seeders: seed-admin.js, seed-events.js,
                         # seed-pool.js, seed-padel-courts.js, seed-tennis-courts.js,
                         # seed-abonemen-packages.js, seed-sport-prices.js, apply-pricing.js
```
Unit vs integration split lives in `jest.config.js` (ignores `tests/integration/`) and `jest.integration.config.js`; both compile via `tsconfig.jest.json`.

### Frontend (run from `web/`)
```bash
cd web
npm run dev              # Next.js on :3001
npm run build
npm run lint             # eslint (next lint)
npx tsc --noEmit -p tsconfig.json   # type-check (no dedicated script)
```

## Environment & database

- Backend needs a root `.env` (see `.env.example`): `DATABASE_URL` (Postgres, requires the `uuid-ossp` extension), `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, etc. Env is validated by Zod in `src/config/env.ts` and the process **exits on invalid config**.
- **JWT secrets have NO defaults** (strict fail-fast). Both are required, must be ≥32 chars (**≥48 in production**), must differ from each other, and cannot be a known placeholder — otherwise the process exits at boot. Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Consequence: a fresh clone (and CI) **must** provide these env vars before `npm run dev`/`npm test` will run; there's no jest env-setup file, so unit tests read them from `.env` via dotenv.
- **CORS is a whitelist** (`CORS_ORIGINS`, comma-separated) built in `src/app.ts`. Empty → dev falls back to `http://localhost:3001`; in **production an empty list blocks all cross-origin** (set it). Requests without an `Origin` header (curl, server-to-server) are always allowed.
- **Rate limiting** (`src/middlewares/rateLimit.ts`, express-rate-limit v8): `globalLimiter` on the whole `/api/v1` mount (`RATE_LIMIT_MAX`, default 300/15m) + a strict `authLimiter` on login/register/refresh (`AUTH_RATE_LIMIT_MAX`, default 20/15m). 429s use the `{ success, message }` envelope. Uses in-memory store — per-instance, so horizontal scaling needs a shared store (Redis). In **production only**, `app.set('trust proxy', 1)` so the limiter and session `ip_address` see the real client IP behind a reverse proxy.
- **Prisma is introspection-first** (`prisma db pull`). `prisma/schema.prisma` is a hand-maintained **subset** that grounds the code — the real DB has ~45 tables. The database is the source of truth; model names = table names and fields are `snake_case`. Do not assume the schema file is complete.
- API docs (Swagger) served at `/api/docs`; a Postman collection lives in `docs/`.

## Backend architecture

Strict per-module layering — each domain (booking, membership, pool, ticket, event, promo, payment, …) has the same slices:

```
routes/ -> controllers/ -> services/ -> repositories/ -> Prisma
           validators/ (Zod)   types/   middlewares/  utils/  config/
```

Conventions that span files:

- **Class + singleton per layer.** Every service/repository/controller exports a class *and* a default singleton (e.g. `export const bookingService = new BookingService()`). Services take collaborators via **constructor DI with singleton defaults**, so unit tests instantiate with mocks (`new BookingService(mockRepo, ...)`).
- **`DbClient` for transaction-safety.** Repository methods take an optional last arg `db: DbClient = prisma` (`DbClient = PrismaClient | Prisma.TransactionClient`, see `src/config/prisma.ts`). The same repo method works inside or outside a `prisma.$transaction`.
- **Errors & control flow.** Controllers wrap handlers in `catchAsync` and throw `AppError` (`AppError.notFound/unprocessable/conflict/badRequest`). `middlewares/errorHandler.ts` formats every response as `{ success, message, ... }`; success responses are `{ success: true, data }`.
- **Auth.** `requireAuth` reads `Authorization: Bearer <jwt>` and sets `req.userId` / `req.userRole`; `requireRole(...roles)` gates by role. All routes are mounted under `/api/v1` in `src/routes/index.ts`.
- **Anti-oversell.** Booking / pool / event / waiting-list services serialize contended slots with `pg_advisory_xact_lock` inside `Serializable` transactions.

### Payments + Fulfillment Registry (the key cross-cutting design)

Payments are **polymorphic**: one `payments` row holds many items, each tagged with an `item_type` enum (`booking`, `membership`, `pool_ticket`, `ticket`, `event`, …). Flow:

1. A module creates a PENDING payment via `PaymentService.createPayment` (idempotent when an `Idempotency-Key` is supplied).
2. The dummy gateway simulates success/failure (`POST /payments/:id/simulate/success|failure`).
3. On settle, `PaymentService` looks up `fulfillmentRegistry.get(item_type)` and calls that handler's `onPaid` / `onFailed`.

**To add a new paid module: implement a `FulfillmentHandler` (`src/services/fulfillment/*.handler.ts`) and register it in `src/services/fulfillment/registry.ts`. `PaymentService` does not change.**

## Frontend architecture (`web/`)

Next.js App Router + Tailwind + TanStack Query + axios; GSAP for animation, React Three Fiber for the homepage hero, Recharts (dynamic `ssr:false`) for admin charts.

- **`src/lib/api.ts`** — single axios instance. `apiGet/apiPost/apiPatch/apiPut/apiDelete` unwrap the backend `{ success, data }` envelope. Access/refresh tokens in `localStorage`; a response interceptor refreshes on 401 (single-flight).
- **`src/lib/queries.ts`** — the central data layer: all TanStack Query hooks and shared TS types live here.
- **`src/lib/auth-context.tsx`** — auth provider (`login`/`register`/`logout`, `user`, `loading`). `getErrorMessage` in `src/lib/error.ts` pulls the backend message out of any error.
- **Checkout** — one generic `components/booking/CheckoutPanel` drives every paid flow. Each module supplies a retry-safe **runner** closure (`makeCourtRunner`, `makePoolTicketRunner`, `makeMembershipRunner`, `makeEventRunner`) that registers/creates then calls `settlePayment(paymentId, outcome)`.
- **Admin** — config-driven generic CRUD: `AdminResource<T>` + `AdminForm` + `AdminTable`. A resource page is mostly a config object (columns, fields, `list/create/update` fns).
- **Client-side auth gating.** `RequireAuth` / `RequireRole` render `Memuat…` while `loading` then redirect. Consequence: content of gated pages (`/dashboard`, `/admin/*`) is **not in the SSR HTML** — verifying such pages via `curl` shows the loader, not the content. Verify them logged-in in a browser.

## Conventions & gotchas

- **Commit messages: no `Co-Authored-By` trailer** (repo runs with `includeCoAuthoredBy: false`).
- Never stage `.env`, `node_modules`, `.next`, or `dist/`.
- Zod boolean coercion trap: `z.coerce.boolean()` makes `"false"` truthy — use `z.enum(['true','false']).transform(...)` for boolean query params.
- Primary shell is PowerShell on Windows; a Bash tool is also available. `LF will be replaced by CRLF` git warnings are benign.
- After large backend changes, confirm new routes are actually live (ts-node-dev usually respawns, but verify).
