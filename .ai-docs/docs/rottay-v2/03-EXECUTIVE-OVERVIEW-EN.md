# Rottay — Executive Overview (Business)

**Last updated:** 2026-02-10  
**Audience:** founders, operators, business stakeholders, partners.  
**Verified inventory:** [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## 1) Executive summary (what we are building)

Rottay is a modular, multi‑tenant‑first software ecosystem.

It is intentionally designed to solve two problems at the same time:

1) **The SaaS problem:** shipping a real product requires a long list of “non‑differentiating fundamentals” (auth, tenant isolation, permissions, plan enforcement, auditability, notifications, etc.).  
2) **The scaling problem:** as you add collaborators (engineers, partners, agencies), you increase exposure of your blueprint — unless your system is built to be shared in parts.

Rottay’s structure makes this possible:

- **Rottay Platform** (reusable SaaS fundamentals)  
- **Domain modules** (reusable business engines)  
- **Vertical products** (complete SaaS apps built from those modules)

In this repo today, the vertical products are **BitHire** (recruiting) and **Evnto** (events).  
The platform layer is a set of publishable packages plus an admin app.

---

## 2) The origin logic (why this is not “just another codebase”)

AI lets a small team build a surprising amount — but it doesn’t remove the need to collaborate.

The moment you bring in more people, the risk profile changes:

- **Engineering risk:** inconsistent patterns create fragile systems.  
- **Business risk:** broad code access makes it easier to replicate your core blueprint.

Rottay treats modularity as a *business control*:

> People should be able to build a vertical or a domain feature without ever holding the entire platform in their hands.

That’s why the system is separated into platform modules, domain modules, and apps.

---

## 3) The market pain: “it’s not the feature, it’s everything around it”

Most teams can build the headline feature.
What slows them down (or kills them later) is:

- secure authentication and sessions
- multi‑tenant separation (and operating it)
- RBAC permissions and audit trails
- enforceable plans (feature gating + quotas)
- notifications, workflows, and operational tooling
- UI consistency and theming (especially for white‑label)

The default approach is vendor sprawl:

```text
Typical SaaS stack
------------------
Your App
 |-- Auth vendor
 |-- Feature flags vendor
 |-- Permissions vendor
 |-- Notifications vendor
 |-- Audit/compliance tooling
 |-- Billing vendor

Result: many dashboards + SDKs + glue code + maintenance debt
```

---

## 4) The Rottay approach: one platform, many products

Rottay reduces glue and improves reuse by standardizing the foundation:

```text
Rottay approach
--------------
Your App / Vertical
 |-- Rottay Platform modules (auth/tenancy/perms/flags/...)
 |-- Rottay Domain modules  (recruiting/events/ai/payments/...)
 |-- Rottay Design System   (consistent UI primitives + theming)

Result: consistent model + reusable building blocks + fewer moving parts
```

### 4.1 Platform modules (SaaS fundamentals)

The platform layer includes modules such as:
- `@rottay/auth`, `@rottay/identity`
- `@rottay/tenancy`, `@rottay/permissions`
- `@rottay/feature-flags` (plus quota enforcement patterns)
- `@rottay/navigation`, `@rottay/notifications`
- `@rottay/compliance` (tooling)

This is the “foundation bundle” for building real SaaS.

### 4.2 Domain modules (reusable business engines)

Domain modules capture repeatable business domains:
- recruiting workflows (`@rottay/recruiter`)
- evaluation/scoring (`@rottay/scoring`)
- AI providers + voice/transcription primitives (`@rottay/ia-chat`)
- events + bar/POS + staff operations (`@rottay/events`, `@rottay/bar`, `@rottay/staff`)
- payments and web3 where applicable

Domain modules are the compounding asset: they enable future verticals without rebuilding.

### 4.3 Verticals (the proof layer)

Rottay ships vertical products built from the same modules:
- **BitHire**: recruiting/ATS + AI workflows + outreach tooling
- **Evnto**: event operations (events + bar/POS + staff)

Verticals create:
- revenue potential
- real-world feedback
- proof that the platform model is not theoretical

---

## 5) Multi‑tenancy and white‑label (why agencies care)

Multi‑tenancy is treated as a first‑class constraint:
- tenant scoping is a mandatory architectural rule (tenantId everywhere)
- RBAC + features + quotas allow plan‑based capability boundaries
- branding can be configured at the tenant level (where implemented)

This enables two buyers:

1) **End customers** — use the vertical as SaaS.  
2) **Agencies / operators** — deliver the same product under their own brand (white‑label direction).

Important scope note:
- “Dedicated isolation tiers” can exist as enterprise offerings, but must be described as **contracted and scoped**, not assumed for every plan.

---

## 6) Monetization (coherent, separable, and enforceable)

Rottay is structured so each motion can stand alone:

1) **Vertical subscriptions** (BitHire/Evnto): buyers want outcomes, not modules.  
2) **Platform subscriptions** (bundles): buyers want foundations and enforcement.  
3) **White‑label / enterprise**: premium for branding, domains, and isolation where scoped.  
4) **Compliance tooling profiles** (add‑on): controls + evidence surfaces (not certification claims).

---

## 7) Compliance positioning (how to sell responsibly)

Rottay can sell compliance as **tooling**:
- controls, audit trails, workflows, evidence surfaces
- enabled per tenant/plan (profiles)

Rottay should not sell compliance as **certification**:
- we do not claim SOC 2 / ISO / HIPAA certifications unless actually obtained and verifiable

See the script-safe version:
- [`09-SECURITY-COMPLIANCE-EN.md`](./09-SECURITY-COMPLIANCE-EN.md)

---

## 8) What exists today (repo-backed)

In this workspace:
- publishable packages (`@rottay/*`) for platform and domain modules
- **app-platform** for operating tenants, plans, and platform features
- **BitHire** and **Evnto** vertical apps
- `@rottay/design-system` and a BitHire Chrome extension

Verified list:
- [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## 9) What to avoid overselling (trust preservation)

Avoid:
- hard time promises (“build in X days”)
- certification claims
- “impossible to copy”

Use:
- “multi‑tenant-first constraints”
- “enforceable plans: RBAC + features + quotas”
- “proof via real vertical products”

---

## 10) Narrative template (for non‑technical audiences)

Use this structure:

1) **Reality:** real SaaS needs many fundamentals  
2) **Pain:** vendor sprawl + glue code + maintenance  
3) **Trust:** agencies want brand ownership and isolation  
4) **Solution:** modular platform + domain reuse + vertical proof  
5) **Proof:** show what exists today and the architecture rules  

Non‑technical story version:
- [`01-ELI5-STORY-EN.md`](./01-ELI5-STORY-EN.md)
