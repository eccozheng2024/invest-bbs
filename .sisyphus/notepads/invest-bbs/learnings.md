## Wave 1 - Project Initialization

### Completed
- [x] Created package.json with Next.js 15 + Payload CMS v3 dependencies
- [x] Created payload.config.ts with PostgreSQL adapter and R2 storage
- [x] Created collection schemas: Users, Posts, Comments, Attachments
- [x] Created basic Next.js app structure (layout.tsx, page.tsx)
- [x] Created Vitest + Playwright test configuration
- [x] Created smoke tests for both unit and e2e
- [x] Created .env.example with all required environment variables

### Architecture Decisions
- Using Payload CMS v3 with Next.js App Router
- PostgreSQL for database (Neon/Supabase compatible)
- Cloudflare R2 for file storage (S3-compatible, zero egress fees)
- Two-level permission system: admin/user
- User status workflow: pending -> approved/rejected

### Next Steps
- Install dependencies with pnpm install
- Set up actual database and R2 bucket
- Run initial Payload migration
- Verify app boots successfully
- Proceed to Wave 2: User application flow, Posts/Comments UI, Search

## 2026-02-08 Wave 2/3 implementation
- Added application flow (`/apply`, `/api/apply`) and admin review page (`/admin/approve`) plus admin approve/reject APIs.
- Added BBS UI pages: list (`/`), new post (`/new`), post detail (`/post/[id]`) with comment list component.
- Added search API and UI (`/api/search`, `/search`) with title/content contains matching.
- Added AI ingestion one-shot script: `scripts/ai-ingest.ts` with URL dedup and optional LLM summary.
- Build now succeeds with `npx next build`.

## 2026-02-08 verification evidence
- `npx vitest run` -> passed (2 tests).
- `npx playwright test` -> passed (4 smoke tests, desktop + mobile chrome).
- `npx next build` -> passed (non-blocking warning about transitive `cli-color`).
- `npx tsx scripts/ai-ingest.ts` -> runs in fallback mode when DB/API env absent.

## 2026-02-08 additional hardening
- Added SQLite fallback DB (`@payloadcms/db-sqlite`) so local runtime can work without Postgres.
- Added conditional R2 plugin activation; when keys absent, app runs with local storage behavior.
- Added upload route `/api/upload` with 50MB + MIME validation and verified public file access under `/uploads/*`.
- Added ingest endpoint `/api/ingest/once` and verified dedup behavior via repeated calls.
- Added CI workflow `.github/workflows/ci.yml` for unit + e2e + build.

## 2026-02-08 final QA
- Full end-to-end workflow test added and passing: apply -> approve -> post (desktop + mobile).
- Smoke tests passing: homepage and apply page on desktop + mobile.
- Build passing cleanly after `rm -rf .next && npm run build`.
- Unit tests passing via `npm run test`.
