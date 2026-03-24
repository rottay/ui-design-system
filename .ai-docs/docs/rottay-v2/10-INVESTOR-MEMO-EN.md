# Rottay — Investor Memo (Shareable)

**Last updated:** 2026-02-10  
**Audience:** angels, seed investors, strategic partners.  
**Ground truth for “what exists”:** [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## 1) TL;DR

Rottay is building a modular, multi‑tenant‑first SaaS platform and using it to ship vertical products.

The strategy is a practical wedge + compounding platform:

1) **Vertical SaaS** (near-term revenue): ship complete products where buyers pay for outcomes (BitHire, Evnto exist in this repo).  
2) **Platform bundles** (compounding): sell reusable platform modules and compliance tooling as bundles to builders and operators.

The long-term bet is simple:

> The winners in SaaS will not be the teams that write the most code — they will be the teams that reuse the most high‑quality, operable foundations across multiple products.

---

## 2) The problem (why the “boring parts” dominate outcomes)

Modern SaaS teams run into the same three walls:

### 2.1 Platform fundamentals are unavoidable

Even “simple” products require:
- secure authentication and sessions
- tenant isolation (multi-tenant boundaries)
- roles and permissions
- billing tiers and enforcement
- auditability and operational tooling

These are table-stakes, but building them well takes years.

### 2.2 Vendor sprawl creates glue debt

Teams assemble a stack of point solutions and pay the cost in:
- integration complexity
- inconsistent mental models
- multiple dashboards
- long-term glue maintenance

### 2.3 AI accelerates features but doesn’t solve foundations

AI increases build velocity, which increases the value of:
- a strict architecture
- reusable modules
- enforceable plans and operational surfaces

---

## 3) The Rottay solution: one platform, many products (by design)

Rottay is structured as:

- **`@rottay/core`** — shared primitives and enforcement patterns  
- **Platform modules** — auth, identity, tenancy, permissions, flags/quotas, navigation, notifications, compliance tooling  
- **Domain modules** — reusable business engines (recruiting, events, AI, etc.)  
- **Apps (verticals)** — products built by composing the same modules  

This modularity is also a business control:
- collaborators can work on vertical/domain scope without holding the entire blueprint
- the system becomes packageable into bundles that match how buyers buy

---

## 4) What exists today (proof points)

In this workspace today, Rottay includes:

- a set of publishable packages (`@rottay/*`) across platform and domain modules  
- a platform admin app (`app-platform/`)  
- two vertical apps (BitHire and Evnto)  
- a shared design system (`@rottay/design-system`)  
- a BitHire Chrome extension (`ext-bithire/`) for recruiting workflows  

Investor implication:
- “can they build it?” is de-risked
- the dominant risks shift to packaging, distribution, and customer pull

---

## 5) Business model (coherent, separable motions)

ASCII model:

```text
Vertical buyers (outcomes)  -> subscribe -> BitHire / Evnto / future verticals
Platform buyers (builders)  -> subscribe -> Platform bundles (auth/tenancy/perms/flags/...)
Agencies/operators          -> pay premium -> White-label + enterprise scope (branding/domains/isolation)
Regulated buyers            -> add-on -> Compliance tooling profiles (controls + evidence)
```

### 5.1 Vertical SaaS (wedge)

Sell complete products to buyers who want an outcome now, not a toolkit.

### 5.2 Platform bundles (compounding)

Sell reusable foundations to teams building SaaS:
- multi-tenant primitives
- consistent architecture and patterns
- enforceable plans (RBAC + features + quotas)

### 5.3 White‑label / enterprise

Premium pricing for:
- branding and custom domain direction (where scoped)
- operational separation and higher isolation tiers (explicitly contracted)

### 5.4 Compliance tooling profiles (no certification claims)

Sell compliance as:
- controls, workflows, evidence surfaces, and configuration
- enabled per tenant/plan as profiles

Boundary:
- controls/evidence tooling ✅
- “certified by default” ❌

---

## 6) Go-to-market hypothesis (how we get paid first)

### 6.1 Wedge: one vertical that converts

A vertical can fund the platform and validate distribution.
BitHire is the most direct wedge because:
- recruiting is workflow-heavy
- evaluation consistency is a pain
- outreach tooling is a clear lever for agencies

### 6.2 Use vertical proof to sell the platform

Verticals prove:
- multi-tenancy in practice
- plan enforcement in practice
- UI consistency and operability

That proof becomes a credible platform story for builders/operators.

### 6.3 Partnerships (future channel, not a substitute for product-market pull)

Partners can accelerate distribution once direct conversion is proven.
The partner program must be designed so partners generate leads without becoming operational bottlenecks.

---

## 7) Competition (how to frame the category)

Rottay competes with the “bundle” customers assemble today:

- platform vendors (auth, flags, permissions, audit/compliance, notifications)
- vertical incumbents (ATS, ticketing/events)
- custom internal builds

Rottay’s bet:

> A unified, multi‑tenant‑first platform + reusable domain modules can be a superior long-term default versus vendor sprawl + glue code.

---

## 8) Risks and mitigation (honest)

### Risk #1 — Distribution (primary)
- Mitigation: vertical wedge + strong demoability + packaging aligned with buyer intent

### Risk #2 — Compliance positioning
- Mitigation: “controls + evidence tooling” language; no certification claims; clear scope statements

### Risk #3 — “Modular moat” is not enough
- Mitigation: distribution + operator experience + integration depth + fast iteration; use modularity as leverage, not as a magic wall

### Risk #4 — Complexity and maintenance across modules
- Mitigation: strict architecture rules, consistent module structure, shared design system, test strategy

---

## 9) What to validate next (investor diligence focus)

- which buyer segment converts fastest (agency vs in-house recruiting vs platform builders)
- packaging that is simple enough to sell (bundles vs many SKUs)
- pricing boundaries that preserve margin while scaling support

---

## Appendix: verified inventory

All “what exists today” claims in this memo are grounded in:
- [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)
