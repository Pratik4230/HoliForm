# HoliForm

Typeform-style form builder — creators sign up, build forms, publish shareable links, and review responses. Respondents fill forms **without logging in**.

**Live demo**

| App | URL |
| --- | --- |
| Web | https://holiform.vercel.app |
| API | https://holiform-api.onrender.com |
| API docs (Scalar) | https://holiform-api.onrender.com/docs |
| tRPC | https://holiform-api.onrender.com/trpc |

---

## Demo credentials (after seed)

Run `pnpm db:seed` against your database, then log in:

| Field | Value |
| --- | --- |
| Email | `demo@holiform.app` |
| Password | `DemoForm123!` |

**Seeded content**

- 3 **public** published forms (explore + home featured)
- 1 **unlisted** form (direct link only)
- Sample responses per form for analytics

**Example public link:** `/f/holiform_demo/holi-festival-feedback`

---

## Stack

- **Monorepo:** Turborepo + pnpm
- **Web:** Next.js 16 (`apps/web`) — TanStack Query v5, shadcn/ui
- **API:** Express 5 (`apps/api`) — tRPC, OpenAPI → Scalar
- **DB:** PostgreSQL + Drizzle (`packages/database`)
- **Jobs:** Inngest (OTP + response emails)
- **Email:** Resend

---

## Local development

### Prerequisites

- Node 18+
- pnpm 9
- PostgreSQL (or [Neon](https://neon.tech) URL in `.env`)

### 1. Install

```bash
pnpm install
```

### 2. Environment

Copy `.env.example` to `.env` at the repo root and fill in:

- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — long random string
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`
- `WEB_APP_URL=http://localhost:3000`
- `INNGEST_DEV=1` for local Inngest dev server

For the web app (optional in `.env` or Vercel):

- `NEXT_PUBLIC_API_URL=http://localhost:8000/trpc`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### 3. Database

You run migrations yourself:

```bash
pnpm db:migrate
```

Optional demo data:

```bash
pnpm db:seed
```

### 4. Run

Terminal 1 — API + web:

```bash
pnpm dev
```

Terminal 2 — Inngest (emails / OTP locally):

```bash
pnpm dev:inngest
```

- Web: http://localhost:3000  
- API: http://localhost:8000  
- Scalar: http://localhost:8000/docs  

---

## Production deployment (summary)

**API (Render / Railway)** — root directory = repo root:

```bash
pnpm install --frozen-lockfile && pnpm --filter @repo/api build
pnpm --filter @repo/api start
```

Health check: `/health` · Inngest: `/api/inngest`

**Web (Vercel)** — project `apps/web` or monorepo with filter:

- `NEXT_PUBLIC_API_URL=https://<api-host>/trpc`
- `NEXT_PUBLIC_SITE_URL=https://<vercel-host>`

**API env (prod):** `NODE_ENV=prod`, `BASE_URL`, `WEB_APP_URL`, `DATABASE_URL`, `JWT_SECRET`, Resend keys, `INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY` (do **not** set `INNGEST_DEV`).

**Neon:** Prefer the **pooled** connection string for the API; direct URL is fine for migrations.

---

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Web + API (turbo) |
| `pnpm dev:inngest` | Inngest dev server → `http://localhost:8000/api/inngest` |
| `pnpm build` | Build all |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:seed` | Demo user + forms + responses (idempotent) |
| `pnpm db:generate` | Generate migrations (you run when schema changes) |

---

## Project layout

```
apps/
  api/          Express + tRPC + Inngest serve
  web/          Next.js dashboard + public fill
packages/
  database/     Drizzle schema + migrations + seed
  trpc/         Routers + context
  services/     Business logic
  validators/   Zod models (single source of truth)
  inngest/      Background functions
  email/        Resend templates
```

---

## License

Private / hackathon project.
