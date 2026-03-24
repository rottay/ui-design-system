# Rottay (v2) — Verified Facts & Status

**As of:** 2026-02-10  
**Purpose:** This file is the “truth anchor” for the rest of the docs in this folder.

If something is not verifiable from the repo or explicitly marked as *planned*, do not present it as shipped.

---

## 1) What exists in this repo (high confidence)

### 1.1 Monorepo structure (top-level)

| Area | Path | Notes |
|---|---|---|
| Platform packages | `platform/` | Contains `@rottay/core` + `@rottay/*` platform modules |
| Platform app | `app-platform/` | Admin + platform operations; uses most platform modules |
| BitHire app | `app-bithire/` | Recruiting vertical app |
| Evnto app | `app-evnto/` | Events vertical app |
| Domain modules | `dm-*/` | Business domains (events, bar, recruiting, etc.) |
| Design system | `ui-design-system/` | `@rottay/design-system` package |
| Video tooling | `ui-remotion/` | Remotion templates/tooling |
| Chrome extension | `ext-bithire/` | LinkedIn recruiting extension (MV3) |
| Internal docs corpus | `.ai-docs/` | Use cases, architecture rules, marketing research |

### 1.2 Package inventory (names + versions)

> Extracted from `package.json` files in this workspace (not from marketing claims).

**Core**
- `@rottay/core` (`platform/packages/core/`) — v2.0.49

**Platform modules** (in `platform/packages/platform/`)
- `@rottay/auth` — v1.3.61
- `@rottay/identity` — v1.4.18
- `@rottay/tenancy` — v1.3.21
- `@rottay/permissions` — v1.4.28
- `@rottay/feature-flags` — v1.3.13
- `@rottay/navigation` — v1.3.18
- `@rottay/notifications` — v1.1.11
- `@rottay/compliance` — v1.3.22

**Domain modules** (in `dm-*/`)
- `@rottay/recruiter` — v1.0.27
- `@rottay/scoring` — v1.0.21
- `@rottay/ia-chat` — v1.0.24
- `@rottay/events` — v1.1.8
- `@rottay/bar` — v1.1.8
- `@rottay/staff` — v2.0.8
- `@rottay/payments` — v0.2.6
- `@rottay/web3` — v1.1.6
- `@rottay/template` — v1.0.2

**UI / tooling**
- `@rottay/design-system` (`ui-design-system/`) — v2.1.2
- `ui-remotion` (`ui-remotion/`) — v1.0.0
- `@rottay/ext-bithire` (`ext-bithire/`) — v1.0.0 (private)

### 1.3 Apps and what they depend on (repo-based)

This is derived from each app’s `package.json` dependencies.

**App: Platform** (`app-platform/`)
- Depends on: `@rottay/auth`, `@rottay/compliance`, `@rottay/feature-flags`, `@rottay/identity`, `@rottay/navigation`, `@rottay/notifications`, `@rottay/permissions`, `@rottay/tenancy`, and also `@rottay/payments`, `@rottay/web3`.

**App: BitHire** (`app-bithire/`)
- Depends on: `@rottay/auth`, `@rottay/identity`, `@rottay/tenancy`, `@rottay/permissions`, plus domain modules `@rottay/recruiter`, `@rottay/scoring`, `@rottay/ia-chat`.

**App: Evnto** (`app-evnto/`)
- Depends on: `@rottay/auth`, `@rottay/identity`, `@rottay/tenancy`, plus domain modules `@rottay/events`, `@rottay/bar`, `@rottay/staff`.
- Note: `@rottay/payments` and `@rottay/web3` exist in the repo, but are not listed as direct dependencies in `app-evnto/package.json` as of 2026-02-10.

---

## 2) Architecture rules that are explicitly documented

These are not “marketing positioning” — they are repo-doc’d engineering constraints.

### 2.1 Mandatory architecture patterns

From `.ai-docs/ARCHITECTURE.md`:
- Hexagonal Architecture (Ports & Adapters)
- DDD (Domain-Driven Design)
- CQRS (mutations vs queries)
- Result Pattern: avoid business `throw` (use typed results)
- Multi-tenancy: `tenantId` filtering is mandatory in queries
- Soft delete (`isActive`) + audit fields

### 2.2 Subscription control / feature gating is a first-class concept

From `ACCESS-CONTROL-ARCHITECTURE.md`:
- Three layers work together: **permissions (RBAC)**, **feature flags**, **quotas**
- Frontend checks are UX; backend checks are enforcement
- “Plan resolution” merges base plan config + tenant overrides into the user session
- Decorators like `@RequireFeature(...)` and `@EnforceQuota(...)` exist in `@rottay/core` (documented in the architecture file)

---

## 3) Rottay product model (what’s safe to say)

### 3.1 What “Rottay” refers to in these docs

- **Rottay (company/brand):** the umbrella.
- **Rottay Platform:** shared platform modules + admin app + patterns.
- **Verticals:** products built on the platform (currently: BitHire and Evnto in this repo).

### 3.2 What is *not* safe to claim as “certified”

Even if we implement controls:
- We are **not** claiming SOC 2 / ISO / HIPAA certifications unless we have completed and can prove them.
- We can say: “we provide tooling and implementation patterns that help teams meet requirements”, and we can list which technical controls exist (audit logs, tenancy isolation, etc.) **if they are implemented or documented**.

---

## 4) Known naming drift (handle carefully)

`MODULES-DEFINITION.md` contains a “Module Names (Final)” mapping (e.g., future renames like `recruiter → talent`, `scoring → assessment`, `ia-chat → ai-assistant`, `events → ticketing`).

**Current reality (shipping today):** package names in this repo are `@rottay/recruiter`, `@rottay/scoring`, `@rottay/ia-chat`, `@rottay/events`, etc.

**How to write about this in external docs:**
- Use current package names for “shipping today”.
- Mention rename mapping only as **planned** (avoid implying it’s already done).

---

## 5) Source pointers (for verification)

If you need to validate a claim, start here:
- `.ai-docs/CATALOG.md` (doc index + use case catalogs)
- `.ai-docs/apps/*/README.md` (app-level scope notes)
- `.ai-docs/platform/*/USE-CASES.md` (platform use case lists)
- `.ai-docs/domain-modules/*/USE-CASES.md` (domain use case lists)
- `.ai-docs/ARCHITECTURE.md` (mandatory patterns)
- `ACCESS-CONTROL-ARCHITECTURE.md` (plan/feature/quota enforcement)
- `MODULES-DEFINITION.md` (architecture + integration map + planned names)

