# Rottay Platform — Product Overview

**Last updated:** 2026-02-10  
**Audience:** platform buyers, operators, solution architects, product leaders.  
**Verified inventory:** [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## 1) What is “Rottay Platform” (in plain terms)?

Rottay Platform is the reusable foundation that powers Rottay’s vertical products (BitHire, Evnto) and is designed to be sold as bundles to teams building their own SaaS.

It is not “just libraries”. It’s a combination of:

- **Core primitives (`@rottay/core`)** — shared errors, Result pattern, tenant context, enforcement decorators, and strict architecture rules.
- **Platform modules (`@rottay/*`)** — SaaS fundamentals (auth, tenancy, permissions, plan enforcement, notifications, etc.).
- **Platform operations app (`app-platform/`)** — the admin surface to operate tenants, plans, features, and compliance tooling.

The defining constraint is simple:

> Multi‑tenancy is a first‑class rule, not a later refactor.

---

## 2) What buyers actually get from the platform layer

If you’re building SaaS, the platform gives you a “pre‑wired baseline” for:

- security primitives (auth + identity + access control)
- tenant isolation (data boundaries you can actually enforce)
- product monetization enforcement (features + quotas)
- operational surfaces (admin + configuration)
- consistency (the same patterns across modules and apps)

This reduces vendor sprawl and makes your product easier to maintain as it grows.

---

## 3) Platform modules (current packages in this repo)

> Names below match the package inventory in this workspace.

| Capability | Package | What it’s for |
|---|---|---|
| Authentication | `@rottay/auth` | sessions, login flows, MFA, OAuth/SSO-related surfaces (as implemented/documented) |
| Identity | `@rottay/identity` | user profiles, groups/org structures, identity primitives |
| Tenancy | `@rottay/tenancy` | tenants + companies, plan config/overrides, branding primitives |
| Permissions | `@rottay/permissions` | RBAC and access control (who can do what, per tenant) |
| Feature flags | `@rottay/feature-flags` | feature gating for plans/tenants, rollouts/targeting as implemented |
| Navigation | `@rottay/navigation` | dynamic menus/routes and policy‑driven navigation |
| Notifications | `@rottay/notifications` | notifications primitives (templates/channels as implemented) |
| Compliance tooling | `@rottay/compliance` | compliance workflows and evidence surfaces across domains |

For use-case-level catalogs (the deepest documentation):
- `.ai-docs/platform/*/USE-CASES.md`

---

## 4) The “secret sauce” for SaaS monetization: enforceable plans

Rottay Platform treats plan enforcement as a core product capability.

It uses three layers together (see `ACCESS-CONTROL-ARCHITECTURE.md`):

1) **Permissions (RBAC)** — user‑level authorization: “can this user do X?”  
2) **Feature flags** — tenant/plan capabilities: “is feature X enabled?”  
3) **Quotas** — tenant/plan usage limits: “does this tenant have allowance left?”

ASCII flow:

```text
User logs in
   |
   v
Session is built (plan + tenant overrides resolved)
   |
   +--> Frontend gates (UX only)
   |      - show/hide UI
   |      - warnings and upsell prompts
   |
   +--> Backend enforcement (security)
          - RBAC permission checks
          - RequireFeature checks
          - EnforceQuota checks
              |
              v
           Allow / Deny
```

What this enables commercially:

- sell “Foundation / Pro / Enterprise” without forking code
- ship features early and control rollout safely
- run usage-based models with predictable enforcement

---

## 5) Multi‑tenant + white‑label (what it means, what it doesn’t)

Rottay Platform is designed for SaaS and for operator/agency scenarios.

**What “white‑label ready” means (directionally):**
- tenant-level branding primitives (logo/colors, etc.)
- custom-domain direction (where implemented and contracted)
- per-tenant plan control (features/quotas)
- strong tenant isolation semantics

**What it does not automatically mean:**
- fully dedicated infrastructure for every tenant

If an enterprise buyer requires “hard isolation” (dedicated DB / dedicated infra), that must be:
- explicitly scoped
- operationally defined
- priced and contracted

---

## 6) Compliance tooling (sell it responsibly)

The compliance module should be treated as:

- **tooling** (controls, workflows, audit trails, evidence surfaces)
- **profiles** (enable scoped subsets per tenant/plan)

Hard rule for external messaging:
- “controls and evidence tooling” ✅
- “certifications guaranteed” ❌

More: [`09-SECURITY-COMPLIANCE-EN.md`](./09-SECURITY-COMPLIANCE-EN.md)

---

## 7) Packaging recommendation (bundles, not 15 SKUs)

This is a commercial packaging proposal (not a claim of final SKUs).

```text
Bundle A — Foundation (must-have)
  - Auth + Identity
  - Tenancy + Permissions

Bundle B — Plan Enforcement
  - Feature flags + quotas

Bundle C — Product Experience
  - Navigation + Notifications

Add-on — Compliance Profiles
  - compliance tooling (scoped by domain)
```

Why bundles:
- buyers don’t want to assemble 15 parts
- support and pricing become simpler
- easier upsell path (enforcement → experience → compliance)

---

## 8) Platform operations app (why it matters)

`app-platform/` is the operations surface for:
- tenant lifecycle and branding
- users, groups, roles, permissions
- flags, quotas, usage surfaces
- compliance dashboards and workflows

This is a strategic differentiator:

> The platform is visible and operable — not just an SDK.

---

## 9) Next reading

- Developer guide: [`08-DEVELOPER-GUIDE-EN.md`](./08-DEVELOPER-GUIDE-EN.md)
- Mandatory architecture rules (source): `.ai-docs/ARCHITECTURE.md`
