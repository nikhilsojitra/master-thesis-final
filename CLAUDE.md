# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> This is the actual working code for the "ShopHub" e-commerce app referenced by the thesis one level up (`../../CLAUDE.md`). Read that file too if you're doing thesis-related work — it explains why this code exists and what it needs to end up matching. This file only documents what's *actually in this repo*.

## Repo identity

- Separate git repo (`origin` → `github.com/nikhilsojitra/shophub`), nested inside the thesis folder — commits/pushes here are independent of the thesis document repo (which has no git repo at all).
- Three independent Node apps in one repo, each with its own `package.json`/`node_modules`: `backend/`, `frontend/`, `admin-panel/`. The root `package.json` only orchestrates them via `concurrently`.

## Commands

Run from repo root unless noted.

```bash
npm run install-all   # installs root + backend + frontend + admin-panel deps
npm run dev            # backend (5003) + frontend (3000)
npm run dev-admin      # backend (5003) + admin-panel (3001)
npm run dev-all        # backend + frontend + admin-panel together
```

Backend (`cd backend`):
```bash
npm run dev            # nodemon server.js
npm start               # node server.js
npm run db:generate     # prisma generate
npm run db:push         # prisma db push (no migration files — schema is pushed directly)
npm run db:studio       # prisma studio
npm run prisma-all      # format + generate + db push in one step
```

Frontend / admin-panel (`cd frontend` or `cd admin-panel`) — both are Create React App:
```bash
npm start                                    # dev server
npm run build                                # production build
npm test                                     # CRA/Jest watch mode
CI=true npm test -- --testPathPattern=Foo    # single test file, non-interactive
```

**No lint command, no Dockerfile, no docker-compose, no `.github/` CI workflow, and no backend test suite exist in this repo yet.** `admin-panel/src/App.test.js` is the only test file present and is the unmodified CRA placeholder. This matters if you're doing thesis implementation work — see `../../CLAUDE.md` §9 for what's supposed to be added (Docker, GitHub Actions pipeline, Vitest/Jest/Cypress tiers) before Chapter 4 can honestly describe this code.

## Architecture

**Backend** (`backend/server.js`, port `5003` via `PORT` env, default fallback `5000` in code but `.env.example` sets 5000 — actual default in use is 5003): Express app wiring `helmet`, CORS (allowing `FRONTEND_URL` and `localhost:3001` for the admin panel), JSON body parsing, and six route modules mounted under `/api/*`:
- `routes/auth.js` — register/login/me/profile/change-password
- `routes/products.js` — public listing + admin CRUD
- `routes/orders.js` — user order history/create/cancel
- `routes/users.js`
- `routes/admin.js` — analytics/user/order management (admin-only)
- `routes/payments.js` — Stripe PaymentIntent creation, confirmation, webhook

Auth is JWT-based (`middleware/auth.js`): `auth` verifies the bearer token and loads the user via Prisma; `adminAuth` wraps `auth` and additionally requires `role === 'ADMIN'`. Apply these as route middleware, not ad hoc checks in handlers.

**Data layer**: Prisma ORM (`backend/prisma/schema.prisma`) against **MySQL** (`datasource db { provider = "mysql" }`) — note this contradicts the thesis's stated PostgreSQL stack; if reconciling code with the thesis, this is one of the gaps to resolve, not just the testing pyramid. Four models: `User`, `Product`, `Order`, `OrderItem`, mapped to snake_case tables (`@@map`). No migrations directory — schema changes go via `db:push`, not `prisma migrate`.

**Two separate frontends, not one**:
- `frontend/` — the customer-facing store (React 18 + CRA + TailwindCSS + Stripe Elements + React Router). Also contains its *own* embedded admin surface under `src/pages/Admin/*`, gated by `src/components/Auth/AdminRoute.js`.
- `admin-panel/` — a **second, standalone** React 19 CRA app (no Tailwind, plain CSS) with its own `AuthContext` and its own login/dashboard/product/order/user management components, running on port 3001.

  Both admin UIs talk to the same backend admin routes — there is no shared component library between them. When changing admin-facing API contracts, check both `frontend/src/pages/Admin/*` and `admin-panel/src/components/*`.

State/context pattern in both frontend apps: React Context for cross-cutting concerns (`AuthContext` for the JWT/current user, `CartContext` in `frontend/` only for the shopping cart) — no Redux/Zustand.

## Environment

Each app needs its own `.env`, keyed off the checked-in `.env.example` (`backend/.env.example`, `frontend/.env.example`). Key backend vars: `DATABASE_URL` (MySQL connection string), `JWT_SECRET`, `JWT_EXPIRES_IN`, `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY`/`STRIPE_WEBHOOK_SECRET`, `PORT`, `FRONTEND_URL`. Frontend needs `REACT_APP_STRIPE_PUBLISHABLE_KEY`. **Do not read or print the actual `backend/.env` or `frontend/.env` files** — they contain live-looking Stripe test keys; treat them the same as any other secret file.

Stripe test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline), `4000 0025 0000 3155` (3DS challenge).
