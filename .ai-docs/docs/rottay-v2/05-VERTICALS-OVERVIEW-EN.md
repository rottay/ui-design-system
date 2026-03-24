# Rottay — Verticals Overview (Products)

**Last updated:** 2026-02-10  
**Audience:** business stakeholders, partners, sales.  
**Rule:** “Current verticals” must match what exists in this repo today.

---

## 1) Why verticals exist in the Rottay model

Verticals are complete SaaS products built from the same platform and domain modules.

They matter because they are both:

- a **revenue engine** (buyers pay for outcomes, not building blocks)
- a **platform proof engine** (verticals force the platform to stay real and operable)
- a **compounding engine** (each vertical creates reusable domain modules)

This is the vertical/platform flywheel:

```text
Ship vertical -> Learn from real users -> Improve platform + domain modules -> Reuse -> Ship next vertical
```

In other words: verticals are both a business line and a product validation tool.

---

## 2) Current verticals in this repo

### 2.1 BitHire (Recruiting)

**What it is:** an ATS / recruiting system with AI-driven workflows and outreach tooling.  
**Who it’s for:** recruiters, agencies, hiring managers.

**Outcome framing (what buyers actually want):**
- faster candidate throughput
- consistent interview processes
- structured evaluation and decision-making
- agency workflows that can scale without hiring 10 more recruiters

**Primary domain modules:**
- `@rottay/recruiter` (ATS workflows)
- `@rottay/scoring` (LLM-as-Judge evaluation)
- `@rottay/ia-chat` (AI providers, chat/voice/transcription primitives)

**Guide:** [`06-BITHIRE-GUIDE-EN.md`](./06-BITHIRE-GUIDE-EN.md)

### 2.2 Evnto (Events)

**What it is:** an event management vertical built around event operations.  
**Who it’s for:** event organizers, venues, operators.

**Outcome framing:**
- reliable event operations (setup → execution → post-event)
- reduce chaos for venue staff and bar operations
- unify event data and operational workflows

**Primary domain modules (repo-based app deps):**
- `@rottay/events` (events + ticketing domain module)
- `@rottay/bar` (bar/POS + inventory domain module)
- `@rottay/staff` (staff scheduling and operations domain module)

**Guide:** [`07-EVNTO-GUIDE-EN.md`](./07-EVNTO-GUIDE-EN.md)

---

## 3) How verticals are composed (shared platform + shared UI)

All verticals reuse the same platform primitives and UI foundation:

- platform modules like auth/identity/tenancy/permissions (varies per app)
- shared design system (`@rottay/design-system`) for consistent UX and theming

ASCII composition map:

```text
                  +---------------------------+
                  |     @rottay/design-system |
                  +-------------+-------------+
                                |
                                v
+---------------------+   +---------------------------+   +--------------------+
| Platform modules     |-->|   Vertical App (UI/API)  |-->| Tenant-branded UX  |
| auth/tenancy/perms   |   | BitHire or Evnto         |   | (where contracted) |
| flags/quotas/notifs  |   +---------------------------+   +--------------------+
| compliance tooling   |
+----------+----------+
           |
           v
  +-------------------+
  | Domain modules     |
  | recruiting/events  |
  | bar/staff/ai/...   |
  +-------------------+
```

---

## 4) Cross-vertical reuse (why modules matter)

Some domains are naturally reusable across multiple verticals:

- notifications
- payments
- web3 (where relevant)
- AI provider/metering patterns

The Rottay strategy is to keep these as modules so each new vertical starts with a strong baseline.

---

## 5) White-label direction (important but scope-controlled)

White-label is a spectrum:

- **Branding** (logo/colors/emails)
- **Custom domains**
- **Tenant isolation** (data boundaries)
- **Operational isolation** (dedicated infra, etc.)

The platform supports tenant-level configuration primitives; operational isolation must be treated as an enterprise capability with explicit scope.

---

## 6) Build new verticals (how we scale)

The repeatable recipe:

1) pick domain modules to reuse  
2) define tenant-first data model  
3) wire plan enforcement (features/quotas) early  
4) keep vertical-specific code thin  
5) prove it in a real app (vertical), not only in docs  

Developer workflow: [`08-DEVELOPER-GUIDE-EN.md`](./08-DEVELOPER-GUIDE-EN.md)

---

## 7) Verified inventory references

- Packages and app deps: [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)
