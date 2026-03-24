# Rottay — FAQ

**Last updated:** 2026-02-10  
**Audience:** public-facing FAQ draft (safe language, no hard promises).

---

## What is Rottay?

Rottay is a modular multi-tenant SaaS ecosystem:
- a platform layer (auth, tenancy, permissions, plan enforcement, etc.)
- reusable domain modules (recruiting, events, bar/POS, AI, etc.)
- vertical products built from those modules (today: BitHire and Evnto)

See the one-pager: [`02-ONE-PAGER-EN.md`](./02-ONE-PAGER-EN.md)

---

## Is Rottay a framework or a SaaS?

It’s both:
- **Verticals** are SaaS products (BitHire, Evnto).
- **Platform modules** can be packaged as reusable building blocks.

How modules are licensed/operated depends on the commercial model (bundle access, white-label, etc.).

---

## What vertical products exist today?

In this repo today:
- BitHire (recruiting/ATS)
- Evnto (events operations)

Verified inventory:
- [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## What’s included in “Rottay Platform”?

Platform modules include:
- auth, identity, tenancy, permissions
- feature flags + quotas (plan enforcement)
- navigation, notifications
- compliance tooling module

Platform overview:
- [`04-PLATFORM-OVERVIEW-EN.md`](./04-PLATFORM-OVERVIEW-EN.md)

---

## How does multi-tenancy work?

Multi-tenancy is a first-class constraint:
- data access is scoped by `tenantId`
- permissions, features, and quotas can vary per tenant/plan
- branding can be tenant-configured (where implemented)

---

## How do you enforce pricing tiers?

Rottay’s enforcement model combines:
- RBAC permissions (who can do what)
- feature flags (what a tenant can use)
- quotas (how much a tenant can use)

Architecture reference:
- `ACCESS-CONTROL-ARCHITECTURE.md`

---

## Does Rottay make us “compliant”?

Rottay can provide compliance tooling (controls, workflows, evidence surfaces), but:
- we do not claim certifications unless obtained and verifiable
- compliance also requires policies, training, and legal/auditor processes

More:
- [`09-SECURITY-COMPLIANCE-EN.md`](./09-SECURITY-COMPLIANCE-EN.md)

---

## Is the design system open source?

There is a strategic intent to make design system primitives public/open (and keep custom premium components private), but the public/open-source packaging is a product decision and should be described as “planned” unless already executed.

---

## Where do I start?

- One page: [`02-ONE-PAGER-EN.md`](./02-ONE-PAGER-EN.md)
- Platform: [`04-PLATFORM-OVERVIEW-EN.md`](./04-PLATFORM-OVERVIEW-EN.md)
- Verticals: [`05-VERTICALS-OVERVIEW-EN.md`](./05-VERTICALS-OVERVIEW-EN.md)
- Developers: [`08-DEVELOPER-GUIDE-EN.md`](./08-DEVELOPER-GUIDE-EN.md)

