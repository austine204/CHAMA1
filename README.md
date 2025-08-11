# SACCO ERP — Next.js (App Router, TypeScript)

A modular, full‑stack ERP targeting SACCOs, MFIs, and chamas. Built with Next.js App Router, TypeScript, Tailwind, Prisma (PostgreSQL), and a job worker for automations. Designed for iterative delivery, robust business rules, and secure workflows.

Core approach:
- Next.js App Router for UI and backend routes with server components and route handlers. [^1][^2]
- Prisma as the database schema source of truth (PostgreSQL).
- Modular features: Members, Contributions, Loans, Collections, Accounting, Dividends, Reports, Mobile Money integrations.
- CI-first with tests and linting; production hardening later (Sentry, rate limiting).

Getting started
1) Prerequisites
- Node.js 18+ (recommend Node 20 LTS)
- pnpm (recommended) or npm
- PostgreSQL database
- Optional: Redis (BullMQ) and S3-compatible object storage (later tasks)

2) Install dependencies
# If you plan to run locally after exporting the code
pnpm install

3) Environment variables
Copy `.env.example` to `.env` and fill in values (Postgres URL, NextAuth secret, provider keys, etc.). Do not commit secrets.

4) Prisma
- Initialize the client:
  pnpm prisma generate
- After Task A2 (when models are added), run:
  pnpm prisma migrate dev --name init

4.1 Database setup, migration, and seeding

1) Ensure DATABASE_URL is set in .env
2) Create initial migration and generate Prisma Client:
   pnpm prisma migrate dev --name init
3) Seed initial data (admin user + 10 members):
   pnpm ts-node prisma/seed.ts
   - If you prefer Node ESM with tsx:
     pnpm tsx prisma/seed.ts
4) Validate the seed:
   pnpm tsx scripts/validate-seed.ts

Notes:
- Models are defined in prisma/schema.prisma and will evolve with subsequent tasks.
- We use Next.js App Router conventions for API route handlers and server components. [^1][^2]

5) Develop
pnpm dev

7) Demo credentials
- Email: admin@sacco.local
- Password: admin123

Feature status (demo, in-memory):
- Auth: NextAuth credentials provider
- Members: List, create, profile, contributions
- Loans: Apply, approve, disburse, repay, schedule
- Payments: M-Pesa STK mock, webhook, reconciliation
- Accounting: Double-entry postings for contributions, disbursement, repayments
- Reports: Balance Sheet, Profit & Loss JSON endpoints
- OpenAPI: /openapi.yaml

Note: Replace in-memory repo with Prisma in production. Follow App Router conventions for route handlers and server components. [^1][^2]

6) Build and test
pnpm build
pnpm test

Project structure (high-level)
- app/             Next.js App Router pages & route handlers [^1][^2]
- prisma/          Prisma schema and migrations
- .github/         CI workflows
- components/      UI components (shadcn/ui available)
- src/             Optional colocated libraries (lib, services, jobs), if needed

Planned modules (phases)
- Members: CRUD, KYC, onboarding
- Contributions: manual + webhook (M-Pesa), allocation rules, audit trail
- Loans: products, applications, approvals, amortization, disbursement, repayments
- Collections: schedules, delinquency, batch processing
- Accounting: COA, JournalEntries, TB, BS, P&L
- Dividends: allocations and postings
- Regulatory Reports: templates, exports, schedulers
- Payments: PaymentGateway abstraction (M-Pesa Daraja), idempotency, reconciliation
- Observability & Ops: Sentry, structured logs, rate limiting

Workflow and tasks (PR-sized)
Follow the incremental task plan; each task is small, testable, and CI-friendly.

- Task A1 — Repo bootstrap (this PR)
  - Initialize Next.js TS app, Tailwind (pre-wired here), Prisma scaffolding, CI stub.
  - Validation: build without errors; prisma generate succeeds.

- Task A2 — Prisma schema & seed
  - Add core models: User, Member, Loan, Repayment, Contribution, PaymentTransaction, JournalEntry.
  - Migrate + seed.

- Task B1 — Auth & RBAC
  - NextAuth credentials provider, role-based session claims, route protection.

- Task C1 — Members CRUD + UI
  - REST endpoints for members; list/profile pages with zod validation.

- Task C2 — Contributions (webhook + manual)
  - M-Pesa webhook + manual contributions; idempotency and audit.

- Task D1 — Loan product & application workflow
  - Application, approval, amortization schedule generator.

- Task D2 — Disbursement & Repayment posting
  - Journal entries for disburse/repay, interest-first allocation.

- Task E1 — Accounting core & reports
  - COA, JournalEntry, trial balance, BS/P&L endpoints.

- Task F1 — M-Pesa Adapter & Sandbox integration
  - PaymentGateway interface and Daraja sandbox adapter + tests.

- Task G1 — Reconciliation & Reports
  - Scheduled job to match payments; UI to resolve ambiguities.

- Task H1 — CI/CD and smoke tests
  - Full CI pipeline and deploy to staging.

- Task I1 — Observability & hardening
  - Sentry, rate limiter, structured logs.

- Task J1 — Acceptance tests & Release
  - End-to-end acceptance flows and release checklist.

Notes
- We default to App Router patterns (layouts, route handlers, server components) for routing/data fetching. [^1][^2]
- AI SDK will be used if/when AI features are added (assistants, report generation). [^3]
- Tailwind and shadcn/ui are available out-of-the-box; prefer accessible, responsive UI.

Licensing & Compliance
- Configure audit trails and access control early. Use RBAC claims in sessions.
- For M-Pesa and regulated workflows, ensure proper logging, idempotency keys, and signature validation.
