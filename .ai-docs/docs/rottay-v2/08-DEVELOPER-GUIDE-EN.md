# Rottay — Developer Guide (Platform + Verticals)

**Last updated:** 2026-02-10  
**Audience:** engineers building on Rottay (internal team, partners, or licensed adopters).  
**Ground truth:** `.ai-docs/ARCHITECTURE.md`, `ACCESS-CONTROL-ARCHITECTURE.md`, and the repo inventory in [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md).

---

## 0) The point of this guide

Rottay is strict on purpose.

Those constraints are the difference between:
- a one‑off app that becomes unmaintainable
- a modular platform that can power multiple products and be sold in bundles

If you follow the rules, you get:
- consistent modules
- safer multi‑tenancy
- enforceable plans (features + quotas)
- a codebase that can scale to more verticals without imploding

---

## 1) Repo mental model (how the system is shaped)

Rottay is a monorepo with three layers:

```text
Rottay workspace
|
|-- platform/                  # publishable platform packages
|    |-- packages/core         # @rottay/core
|    |-- packages/platform/*   # @rottay/auth, @rottay/tenancy, ...
|
|-- dm-*/                      # publishable domain modules (business engines)
|    |-- dm-recruiter          # @rottay/recruiter
|    |-- dm-events             # @rottay/events
|    |-- ...
|
|-- app-*/                     # Next.js apps (composition layers)
|    |-- app-platform          # admin + platform operations
|    |-- app-bithire           # BitHire vertical
|    |-- app-evnto             # Evnto vertical
|
|-- ui-design-system/          # @rottay/design-system (shared UI)
|-- ext-bithire/               # Chrome extension (BitHire)
|-- .ai-docs/                  # generated + curated use-case documentation
```

Apps compose modules; modules own business logic; `@rottay/core` owns shared primitives and rules.

---

## 2) Quick start (local dev)

### Requirements

- Node.js `>= 20`
- pnpm `9.15.4`

### Install

```bash
pnpm install
```

### Run apps (recommended entrypoints)

```bash
pnpm dev:app-platform
pnpm dev:bithire
pnpm dev:evnto
pnpm dev:design-system
```

Note:
- some internal package naming is imperfect (e.g., `app-platform/package.json` name is `bithire`). Use the root scripts above to avoid confusion.

### Environment variables

- workspace notes: `ENV-VARS.md`
- app examples:
  - `app-bithire/.env.example`
  - `app-evnto/.env.example`
  - `app-platform/.env.example` (if present)

---

## 3) Non‑negotiable architecture rules

These are mandatory constraints documented in `.ai-docs/ARCHITECTURE.md`.

### 3.1 Hexagonal Architecture + DDD + CQRS

Every module follows this shape:

```text
domain/        # pure business logic (no DB, no HTTP)
application/   # use cases + ports (interfaces)
adapters/      # implementations (DB, HTTP, external providers)
config/di/     # factories / dependency injection
tests/         # tests
```

### 3.2 Result Pattern (no business throws)

Business errors must return typed results, not thrown exceptions.

```ts
import { createSuccessResult, createErrorResult } from '@rottay/core';

return createSuccessResult(data);
return createErrorResult('MODULE/ERROR_CODE', 'Human message', { details: '...' });
```

Practical rule:
- if it’s a business outcome, return a Result (success/error)
- reserve thrown errors for true infrastructure faults (and still prefer typed wrappers when possible)

### 3.3 Tenant-first scoping (multi-tenancy is mandatory)

All reads/writes must be tenant-scoped:

```ts
.where(and(
  eq(table.tenantId, context.tenantId),
  eq(table.isActive, true),
))
```

### 3.4 Soft delete + auditability

Entities are expected to keep:
- `isActive` (soft delete)
- `createdAt/updatedAt`
- `createdBy/updatedBy`

This is the foundation for audit trails, retention workflows, and compliance tooling.

---

## 4) Plan enforcement (selling SaaS tiers safely)

Rottay’s enforcement model combines three layers (see `ACCESS-CONTROL-ARCHITECTURE.md`):

1) **RBAC permissions** — user-level authorization  
2) **Feature flags** — tenant/plan capability gating  
3) **Quotas** — tenant/plan usage limits  

ASCII flow:

```text
Login
  |
  v
Session is built (plan + overrides resolved)
  |
  +--> Frontend gates (UX only)
  |      - hide/show features
  |      - upsell prompts and warnings
  |
  +--> Backend enforcement (security)
         - permission checks
         - RequireFeature checks
         - EnforceQuota checks
              |
              v
           Allow / Deny
```

Rule:
- frontend checks improve UX
- backend checks enforce truth

---

## 5) How apps compose modules

Apps are composition layers: UI + wiring.
Modules are logic layers: use cases + ports + adapters.

```text
Next.js UI (server + client)
   |
   v
Server actions / API routes
   |
   v
Use cases (mutations + queries)
   |
   +--> Ports (interfaces)
   |       |
   |       v
   |    Adapters (DB, providers, queues)
   |
   +--> @rottay/core primitives (Result, errors, tenant context)
```

Rule of thumb:
- if it changes business state, it belongs in a module use case
- the app should orchestrate and present, not “be the domain”

---

## 6) How to add a feature correctly (checklist)

### Step 1 — Identify the owning module

Ask:
- is this platform-fundamental (auth/tenancy/perms/flags/notifs)? → platform module  
- is this business-domain (recruiting/events/payments)? → domain module  
- is this purely UI? → app layer (but keep logic thin)

### Step 2 — Start from the use case (not the UI)

In the owning module:

1) add a mutation/query use case under `application/use-cases/`  
2) define or reuse types under `domain/types/` (module convention)  
3) add/reuse ports (interfaces) for persistence/external deps  
4) implement adapters (DB/providers)  
5) wire DI in `config/di/`  
6) add tests  

Only then:
- expose it from the app via a server action or route

### Step 3 — Enforce tenant scope and auditability

- ensure `tenantId` is required in context
- enforce tenant scoping in repositories
- ensure audit fields and soft delete rules are followed

### Step 4 — If it’s monetizable, wire enforcement early

- feature gate (`RequireFeature`) if it’s a tiered capability
- enforce quota (`EnforceQuota`) if it’s usage-based
- keep frontend gates as UX hints only

---

## 7) Docs-first navigation (how to find “what already exists”)

Rottay’s internal catalog is under `.ai-docs/`:

- platform use cases: `.ai-docs/platform/*/USE-CASES.md`
- domain module use cases: `.ai-docs/domain-modules/*/USE-CASES.md`
- app scopes: `.ai-docs/apps/*/README.md`
- index: `.ai-docs/CATALOG.md`

Golden habit:
1) find the use case in docs  
2) find the implementation pattern in code  
3) only then add new helpers/types (check `@rottay/core` first)

---

## 8) Creating a new vertical (repeatable workflow)

1) define the vertical boundary (modules used, tenant data model)  
2) wire platform fundamentals first (auth/tenancy/perms)  
3) wire plan enforcement early (features/quotas)  
4) compose domain modules and keep vertical code thin  
5) enforce UI consistency via `@rottay/design-system`  

Design system rules:
- `.ai-docs/design-system/COMPONENTS.md`

---

## 9) Publishing / distribution (what exists vs what’s evolving)

### What exists today

- platform and domain modules are packaged as `@rottay/*`
- most packages are configured for GitHub Packages (private registry)

### What’s evolving (commercial product surface)

Rottay’s strategy includes selling module access via subscriptions and disabling features when unpaid.

Technically, the building blocks already exist:
- tenancy plans + overrides (features/quotas)
- backend enforcement patterns

The external licensing model (keys/tokens for third parties) is product work:
- provisioning
- key lifecycle and revocation
- metering
- grace/offline behavior

---

## 10) Event-driven architecture (platform compounding, in progress)

There is a detailed implementation plan in:
- `EVENTBUS_ARCHITECTURE.md`

Treat it as a roadmap until it’s fully rolled out.

---

## 11) Tests (practical approach)

Testing exists at multiple levels:
- module tests (Jest/Vitest depending on package)
- app-platform flow tests (see scripts in `app-platform/package.json`)

Recommended workflow:
1) run the smallest relevant module test suite  
2) run app flows when behavior crosses modules  

---

## 12) Naming drift (docs and DX)

`MODULES-DEFINITION.md` includes planned “final naming” (example: `recruiter → talent`).

Current reality:
- shipping package names are `@rottay/recruiter`, `@rottay/scoring`, `@rottay/ia-chat`, etc.

Rule for external docs:
- use shipping package names
- mention renames only as planned migration work
