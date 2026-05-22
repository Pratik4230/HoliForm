# Form Builder SaaS — Product Tracker

> **Hackathon:** Typeform-style form builder on Turborepo starter  
> **UI direction:** **Holi theme** — vibrant Indian festival colors (gulal powders: magenta, cyan, saffron, green, indigo), gradients, playful motion, festive but readable SaaS UI  
> **Last updated:** 2026-05-21

---

## What we're building (short)

A **production-style form builder SaaS** — like **Typeform** — where **creators** sign up, build dynamic forms, publish shareable links, and review responses; **respondents** fill and submit forms **without logging in**.

| Who | What they do |
|-----|----------------|
| **Creators** (authenticated) | Create/edit forms, add fields (text, email, number, select, etc.) with validation and required/optional rules, pick themes, publish or unpublish, set **public** or **unlisted** visibility, copy share links, view responses and analytics, get email notifications |
| **Respondents** (anonymous) | Open a published form via link, answer step-by-step (or full form), submit, see a thank-you screen |
| **Visitors / judges** | Landing + pricing pages, explore public forms, live demo with seeded data and demo login, Scalar API docs |

**Visibility**

- **Public** — published; listed on explore/templates; anyone can submit  
- **Unlisted** — published; hidden from explore; only direct link works  
- **Unpublished / invalid** — no submissions; friendly error pages  

**Stack (required):** Turborepo monorepo · `apps/web` (Next.js) + `apps/api` (Express) · tRPC · Zod · Drizzle ORM · Scalar API docs · shared packages (`database`, `trpc`, `services`, etc.)  

**UI:** Full product wrapped in a **Holi festival** design — colorful, energetic, Indian gulal-inspired gradients across landing, dashboard, builder, and public fill flows (still clean and readable).

**Demo deliverables:** Deployed app · ≥3 themed sample forms with responses · analytics sample data · README with setup, demo credentials, and API doc link · rate limiting on public submit.

**Starting point:** This repo already has auth (email/password + JWT cookie), Drizzle models for forms/fields/responses, and Scalar/OpenAPI on the API — we extend it into the full product tracked below.

**Zod convention (`@repo/validators` — single source):**

| Layer | Location | Role |
|-------|----------|------|
| **Shared** | `packages/validators/forms/{form,formField,public}.ts`, `auth.ts` | Zod: `*InputModel` / `*OutputModel`; types inferred |
| **Services** | `packages/services/forms/{form,formField,mappers,ownership,slug}.ts` | Plain functions; thin `FormService` facade in `index.ts` |
| **Service** | `packages/services/<feature>/` | Imports validators; business logic only |
| **tRPC** | `packages/trpc/server/routes/<feature>/route.ts` | Imports validators for `.input()` / `.output()` |
| **Web** | `@repo/validators/*` + `@repo/trpc/client` | `zodResolver` / client parse; API types from `RouterInputs` / `RouterOutputs` |

---

## How to use this file

| Status | Meaning |
|--------|---------|
| `not_started` | Not begun |
| `in_progress` | Actively building |
| `done` | Complete and verified |
| `blocked` | Waiting on dependency / decision |
| `skipped` | Out of scope for this hackathon |

**Update the `Status` column as you work.** Link PRs or commits in Notes if helpful.

**Priority key**

| Priority | Meaning |
|----------|---------|
| **P0** | Judge/demo blockers — ship first |
| **P1** | Required by rubric, after P0 core loop works |
| **P2** | Required polish & reliability |
| **BONUS** | Extra points / delight — only after P0–P2 |

---

## Progress snapshot

| Priority | Total | Done | In progress | Not started |
|----------|-------|------|-------------|-------------|
| P0 | 42 | 0 | 0 | 42 |
| P1 | 28 | 0 | 0 | 28 |
| P2 | 18 | 0 | 0 | 18 |
| BONUS | 24 | 0 | 0 | 24 |

*Update counts manually when statuses change.*

---

# P0 — MVP (judge-ready core loop)

## M0 — Foundation & monorepo hygiene

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M0-01 | Fix broken `apps/web` home page (`chaicode` procedure) | `not_started` | Replace with real entry / redirect |
| P0-M0-02 | Align Drizzle migrations with TS models (`users` salt/password, forms tables) | `done` | Applied locally |
| P0-M0-03 | Zod in `@repo/validators` (forms, auth; extend per feature) | `done` | `packages/validators/`; no duplicate route/service `model.ts` |
| P0-M0-04 | Wire `protectedProcedure` + auth middleware on tRPC | `done` | `packages/trpc/server/trpc.ts` |
| P0-M0-05 | Standardize API error shapes + visibility error codes | `not_started` | Unpublished / invalid / forbidden |
| P0-M0-06 | Env docs: `JWT_SECRET`, `DATABASE_URL`, API URL, email keys | `not_started` | Root + app `.env.example` |

## M1 — Database (Drizzle)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M1-01 | Extend `forms`: `userId`, `slug`, `status` (draft/published), `visibility` (public/unlisted), `themeId`, timestamps | `done` | `packages/database/models/form.ts` |
| P0-M1-02 | Extend `form_fields`: options JSON (select/checkbox), validation rules JSON, `rating` type if needed | `done` | + `multiselect`; fractional `numeric` index |
| P0-M1-03 | Add `form_responses` table (id, formId, submittedAt, metadata) | `done` | `models/formResponse.ts`; `respondentIp` + `metadata` |
| P0-M1-04 | Add `form_response_answers` table (responseId, fieldId, value JSON/text) | `done` | `models/formResponse.ts` |
| P0-M1-05 | Add `form_themes` table or theme preset config | `done` | `models/formTheme.ts` |
| P0-M1-06 | Indexes: slug per user, fields by formId | `done` | `(userId, slug)` unique; `(formId, labelKey)` unique; no global slug |
| P0-M1-07 | Generate & apply migrations | `done` | |

## M2 — Auth (creators)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M2-01 | Sign-up / sign-in pages (Holi-styled) | `not_started` | Uses existing tRPC auth |
| P0-M2-02 | `signOut` mutation + clear cookie | `done` | `auth.signOut` |
| P0-M2-03 | Auth guard for creator layout (redirect if logged out) | `not_started` | Web app — later with dashboard |
| P0-M2-04 | `getLoggedInUserInfo` via protected procedure | `done` | Uses `ctx.user` |

## M3 — Form builder API (tRPC + Zod)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M3-01 | `forms.createForm` — draft form for current user | `done` | `forms.createForm` |
| P0-M3-02 | `forms.updateForm` — title, description, theme, slug, thank-you | `done` | PATCH; partial update |
| P0-M3-03 | `forms.listForms` — creator's forms | `done` | Newest first |
| P0-M3-04 | `forms.getFormById` — owner-only with fields | `done` | Returns `form` + `fields` |
| P0-M3-05 | `forms.deleteForm` | `done` | Cascade deletes fields/responses |
| P0-M3-06 | `forms.publishForm` / `forms.unpublishForm` | `done` | |
| P0-M3-07 | `forms.setFormVisibility` — public \| unlisted | `done` | |
| P0-M3-08 | `forms.upsertFormField` | `done` | Create or update by `fieldId` |
| P0-M3-09 | `forms.deleteFormField` | `done` | |
| P0-M3-10 | `forms.reorderFormField` | `done` | Fractional `index` |
| P0-M3-11 | Zod: dynamic field schema builder from form definition | `done` | `buildSubmissionSchemaFromFields` |
| P0-M3-12 | OpenAPI metadata for form routes (Scalar) | `done` | All M3 routes have `.meta` |
| P0-M3-13 | `forms.setFormAcceptingResponses` | `done` | Replaces close/reopen; sets `closedAt` |

## M4 — Public form fill & submission (no login)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M4-01 | `forms.getPublicBySlug` — published only, respect visibility | `not_started` | No auth |
| P0-M4-02 | Build Zod submission schema from stored fields | `not_started` | Same dynamic builder as P0-M3-11; input in `routes/responses/model.ts` |
| P0-M4-03 | `responses.submit` — validate + persist answers | `not_started` | Public procedure |
| P0-M4-04 | Reject submission if draft/unpublished | `not_started` | |
| P0-M4-05 | Thank-you / confirmation payload or redirect URL | `not_started` | |
| P0-M4-06 | Public fill page `/f/[slug]` — one question or full form UX | `not_started` | Typeform-like step flow minimal |

## M5 — Visibility & access rules

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M5-01 | Unlisted: accessible by direct link only | `not_started` | |
| P0-M5-02 | Unpublished: 404 or friendly “not available” page | `not_started` | |
| P0-M5-03 | Invalid slug: graceful error page | `not_started` | |
| P0-M5-04 | Owner can copy share link (public + unlisted) | `not_started` | |

## M6 — Themes (form + Holi app chrome)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M6-01 | **Holi design tokens** in Tailwind/CSS variables (gulal palette, gradients) | `not_started` | App-wide |
| P0-M6-02 | Holi-themed layout shell (nav, cards, buttons, inputs) | `not_started` | shadcn overrides |
| P0-M6-03 | ≥3 seeded **form themes** (movie / anime / game etc.) | `not_started` | Rubric minimum |
| P0-M6-04 | Apply selected theme on public fill page | `not_started` | |

## M11 — Frontend: creator dashboard (minimal)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M11-01 | Dashboard layout + sidebar (Holi UI) | `not_started` | |
| P0-M11-02 | Forms list page (draft / published badges) | `not_started` | TanStack Query v5 |
| P0-M11-03 | Create form flow | `not_started` | |
| P0-M11-04 | Form editor: metadata + field list | `not_started` | |
| P0-M11-05 | Field type picker: text, textarea, email, number, select, multi-select | `not_started` | Required types |
| P0-M11-06 | Required toggle + basic validation UI per field | `not_started` | |
| P0-M11-07 | Publish / unpublish + visibility toggle | `not_started` | |
| P0-M11-08 | Share link display (copy button) | `not_started` | |
| P0-M11-09 | Loading + error states on all mutations | `not_started` | |

## M12 — Frontend: marketing (minimal)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M12-01 | Landing page — hero, features, CTA (Holi festive UI) | `not_started` | |
| P0-M12-02 | Pricing page — tiers, no real payment | `not_started` | |
| P0-M12-03 | Link landing → sign-up → dashboard | `not_started` | |

## M17 — Seeding & demo

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M17-01 | Seed script: demo user(s) + credentials | `not_started` | README |
| P0-M17-02 | Seed ≥3 published **public** themed forms with fields | `not_started` | |
| P0-M17-03 | Seed sample responses per form (analytics demo) | `not_started` | |
| P0-M17-04 | One **unlisted** form example in seed data | `not_started` | |

## M18 — Deployment & README

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M18-01 | Deploy API + web (demo URL) | `not_started` | Judge-friendly |
| P0-M18-02 | README: setup, demo URL, **demo credentials**, Scalar link | `not_started` | |
| P0-M18-03 | Production env vars documented | `not_started` | |

## M10 — API docs (Scalar) — P0 minimum

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-M10-01 | Document auth + form + public submit routes in OpenAPI | `not_started` | `/docs` already exists |
| P0-M10-02 | Verify Scalar UI loads on deployed API | `not_started` | |

---

# P1 — Required rubric (full product, not just MVP)

## M7 — Responses & analytics (creators)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-M7-01 | `responses.listByForm` — owner-only, paginated | `not_started` | |
| P1-M7-02 | `responses.getById` — single response detail | `not_started` | |
| P1-M7-03 | Analytics summary: total responses, per-field breakdown | `not_started` | |
| P1-M7-04 | Creator UI: responses table per form | `not_started` | |
| P1-M7-05 | Creator UI: simple analytics view (counts, recent) | `not_started` | |

## M8 — Email notifications

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-M8-01 | Email provider integration (Resend / Nodemailer / etc.) | `not_started` | |
| P1-M8-02 | Notify creator on new response | `not_started` | |
| P1-M8-03 | Optional thank-you email to respondent (if email field) | `not_started` | |
| P1-M8-04 | Email templates (Holi-branded HTML optional) | `not_started` | |

## M9 — Rate limiting & spam

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-M9-01 | Rate limit `responses.submit` by IP | `not_started` | express-rate-limit or Redis |
| P1-M9-02 | Basic honeypot or timing check on public form | `not_started` | |
| P1-M9-03 | Return 429 with clear message | `not_started` | |

## M3 — Field types (complete set)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-M3-13 | Support **checkbox** field type | `not_started` | |
| P1-M3-14 | Support **rating** field type | `not_started` | |
| P1-M3-15 | Support **date** field type | `not_started` | |
| P1-M3-16 | Support **dropdown** (if distinct from select) | `not_started` | |
| P1-M3-17 | Multi-select: options + validation | `not_started` | |

## M5 — Public explore & listings

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-M5-05 | `forms.listPublic` — only published + visibility=public | `not_started` | |
| P1-M5-06 | Explore / templates page showing public forms | `not_started` | Holi UI |
| P1-M5-07 | Featured / gallery section on landing or explore | `not_started` | |
| P1-M5-08 | Ensure unlisted forms never appear in explore queries | `not_started` | Test |

## M11 — Creator UX (polish)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-M11-10 | Form settings page (theme picker, thank-you message) | `not_started` | |
| P1-M11-11 | Field options editor for select / multi-select / checkbox | `not_started` | |
| P1-M11-12 | Drag-and-drop or up/down field reorder | `not_started` | |
| P1-M11-13 | Empty states (no forms, no responses) | `not_started` | |

## M4 — Public fill UX

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-M4-07 | Step-by-step (one question per screen) fill experience | `not_started` | Typeform-like |
| P1-M4-08 | Progress indicator on multi-step form | `not_started` | |
| P1-M4-09 | Mobile-responsive public form | `not_started` | |
| P1-M4-10 | Dedicated thank-you page `/f/[slug]/thank-you` | `not_started` | |

## M6 — Theme gallery

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-M6-05 | Theme gallery UI in builder (preview swatches) | `not_started` | |
| P1-M6-06 | More presets: startups, tech, OS, events, communities | `not_started` | |
| P1-M6-07 | Subtle Holi animations (confetti / color burst on submit) | `not_started` | Performance-safe |

---

# P2 — Reliability, NFRs & demo excellence

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P2-01 | E2E smoke: register → create form → publish → submit as anonymous | `not_started` | |
| P2-02 | Test visibility matrix (public / unlisted / draft) | `not_started` | |
| P2-03 | Test Zod validation errors on bad submissions | `not_started` | |
| P2-04 | Responsive Holi UI on mobile (landing, dashboard, fill) | `not_started` | |
| P2-05 | Accessible contrast on Holi gradients (WCAG-ish) | `not_started` | |
| P2-06 | API client package or shared hooks patterns documented | `not_started` | |
| P2-07 | Structured logging for submit + auth failures | `not_started` | `@repo/logger` |
| P2-08 | DB connection pooling / serverless notes in README | `not_started` | |
| P2-09 | Health check includes DB connectivity | `not_started` | |
| P2-10 | Turbo pipeline: build web + api in CI | `not_started` | |
| P2-11 | Remove stale README references (`chaicode`, missing packages) | `not_started` | |
| P2-12 | `signOut` + session edge cases (expired JWT) | `not_started` | |
| P2-13 | Optimistic updates or query invalidation patterns on mutations | `not_started` | TanStack Query |
| P2-14 | Public form SEO/meta tags for share previews | `not_started` | |
| P2-15 | Cookie / CORS config verified on deployed demo | `not_started` | |
| P2-16 | Seed idempotent (re-runnable) | `not_started` | |
| P2-17 | Demo account cannot be easily broken by judges | `not_started` | Read-only flag optional |
| P2-18 | Performance: list forms & responses < 200ms locally | `not_started` | |

---

# BONUS — Extra hackathon points

## Product features

| ID | Task | Status | Notes |
|----|------|--------|-------|
| B-01 | Form **preview** before publishing | `not_started` | |
| B-02 | **Conditional logic** between questions | `not_started` | |
| B-03 | Form **expiry** date or **response limit** | `not_started` | |
| B-04 | **CSV export** for responses | `not_started` | |
| B-05 | **Charts** dashboard (bar/pie for select fields) | `not_started` | |
| B-06 | **Custom slugs** for forms | `not_started` | |
| B-07 | **QR code** generation for share links | `not_started` | |
| B-08 | **Password-protected** forms | `not_started` | |
| B-09 | **Form templates** gallery (duplicate template → new form) | `not_started` | |
| B-10 | **Clone** form | `not_started` | |
| B-11 | **Archive** form (soft delete) | `not_started` | |
| B-12 | Response **filtering** + **pagination** UI | `not_started` | |
| B-13 | **Multi-page** form (sections) | `not_started` | |
| B-14 | **Admin dashboard** (all users/forms) | `not_started` | |
| B-15 | Webhook on new response | `not_started` | |
| B-16 | Respondent **save progress** (localStorage) | `not_started` | |
| B-17 | **File upload** field type | `not_started` | |
| B-18 | **Embed** widget script for forms | `not_started` | |
| B-19 | Form **versioning** (publish snapshot) | `not_started` | |
| B-20 | **Keyboard navigation** on step form | `not_started` | |

## Holi / UX delight (bonus polish)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| B-H01 | Animated gulal burst on landing hero | `not_started` | |
| B-H02 | Festival-themed empty state illustrations | `not_started` | |
| B-H03 | Dark mode variant with neon Holi colors | `not_started` | |
| B-H04 | Sound-free celebration micro-interactions | `not_started` | prefers-reduced-motion |

## Technical bonus

| ID | Task | Status | Notes |
|----|------|--------|-------|
| B-T01 | REST examples in Scalar for public submit | `not_started` | trpc-to-openapi |
| B-T02 | Redis caching for public form definition | `not_started` | |
| B-T03 | Background job queue for emails | `not_started` | |
| B-T04 | Playwright E2E in CI | `not_started` | |

---

# Module map (quick reference)

| Module | Scope |
|--------|--------|
| **M0** | Monorepo, migrations, `@repo/validators`, protected tRPC |
| **M1** | Drizzle schema: forms, fields, responses, themes |
| **M2** | Creator authentication |
| **M3** | Form CRUD, fields, publish, Zod builders |
| **M4** | Anonymous fill & submit |
| **M5** | Public / unlisted / unpublished rules + explore |
| **M6** | Form themes + **Holi app UI system** |
| **M7** | Responses & analytics |
| **M8** | Email flows |
| **M9** | Rate limiting & spam |
| **M10** | Scalar / OpenAPI docs |
| **M11** | Creator dashboard & builder (web) |
| **M12** | Landing & pricing (web) |
| **M17** | Seed data & demo credentials |
| **M18** | Deploy & README |

---

# Holi UI checklist (frontend — applies across M6, M11, M12)

- [ ] CSS variables: `--holi-pink`, `--holi-cyan`, `--holi-yellow`, `--holi-green`, `--holi-purple`, `--holi-orange`
- [ ] Background: soft gradient meshes / color splashes (not cluttering text)
- [ ] Primary buttons: gradient borders or gulal hover states
- [ ] Cards: white/neutral surface + colorful accent border or corner splash
- [ ] Typography: readable on vibrant backgrounds (contrast)
- [ ] Icons/illustrations: festival feel without stereotype overload
- [ ] Motion: `prefers-reduced-motion` respected
- [ ] Public form fill: theme presets complement Holi shell (not clash)
- [ ] Celebration moment on successful submit (confetti / color pulse)

---

# Suggested build order

1. **M0 → M1 → M2** — foundation, DB (done), auth hardening (`protectedProcedure` next)  
2. **M3 → M4 → M5** — APIs; add schemas in `packages/validators/` per feature  
3. **M6 + M11 (P0)** — Holi shell + minimal dashboard/editor  
4. **M4 public page + M12** — fill flow + landing/pricing  
5. **M17 → M18** — seed, deploy, README  
6. **P1:** M7, M8, M9, explore, extra field types  
7. **P2** — tests & NFR polish  
8. **BONUS** — pick 3–5 highest-impact items (preview, CSV, charts, slug, explore polish)

---

# Requirements coverage matrix

| Requirement | P0 IDs | P1+ IDs |
|-------------|--------|---------|
| Turborepo + separate web/api | M0 | — |
| tRPC + Zod + Drizzle + Scalar | M0 (`@repo/validators`), M3, M4, M10 | — |
| Creator auth + dashboard | M2, M11 | — |
| Create/edit/publish/unpublish forms | M3, M11 | — |
| Dynamic fields + validation | M1, M3, M11 | P1 field types |
| Public vs unlisted visibility | M5 | P1 explore |
| Anonymous submit | M4 | P1 thank-you page |
| Unpublished/invalid handling | M5 | — |
| Responses + analytics | — | M7 |
| Email notifications | — | M8 |
| Rate limiting | — | M9 |
| Landing + pricing | M12 | — |
| ≥3 seeded themed forms + responses | M17 | — |
| Demo deploy + credentials + README | M18 | — |
| API documentation | M10 | B-T01 |
| **Holi-themed UI** | M6, M11, M12 | Holi checklist |

---

*This file is the single source of truth for hackathon delivery tracking. Update statuses as you ship.*
