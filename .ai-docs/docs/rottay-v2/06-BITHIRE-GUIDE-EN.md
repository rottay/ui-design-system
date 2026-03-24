# BitHire — Product Guide (Rottay Vertical)

**Last updated:** 2026-02-10  
**Audience:** recruiting agencies, recruiters, hiring teams, partners evaluating the product.  
**Ground truth:** this guide references what exists in the repo and the capability surface of the underlying modules.

---

## 1) What is BitHire?

BitHire is Rottay’s recruiting vertical: an ATS (Applicant Tracking System) designed to run real recruiting operations with AI‑powered evaluation and workflow automation.

The product goal is not “a cool AI demo”.
The goal is to help recruiting teams and agencies:
- move candidates through pipelines with less manual work
- standardize interviews and feedback
- evaluate consistently (rubrics + scorecards + evidence)
- operate across multiple client companies (multi‑tenant model)

BitHire is built by composing:
- **platform modules** (auth/identity/tenancy/permissions + plan enforcement patterns)
- **domain modules** (recruiting workflows + scoring + AI providers/voice/transcription)

---

## 2) What BitHire does (capability map)

BitHire’s capabilities come from `@rottay/recruiter` + supporting modules. At a high level:

### 2.1 Core ATS operations
- jobs, positions, and hiring processes
- candidates and applications
- pipeline stages and bulk ops
- interviews scheduling and feedback
- offers and approvals
- analytics and activity timelines

### 2.2 AI-driven evaluation (structured, not “vibes”)
- rubric definitions (dimensions, criteria)
- scorecards with evidence
- calibration workflows (align AI with human evaluation)
- fraud/proctoring primitives (where applicable)

### 2.3 Outreach tooling (workflow meets reality)
- templates and outreach tracking
- LinkedIn surface via Chrome extension (see section 6)

---

## 3) The end-to-end workflow (ASCII)

```text
Job / Position
   |
   v
Candidate profile  <--- sourcing/outreach can feed here
   |
   v
Application
   |
   v
Pipeline stages  (applied -> screening -> interview -> offer)
   |
   v
Interview  (human-led, AI-assisted, or AI-driven where enabled)
   |
   v
Scoring  (rubric + scorecard + evidence)
   |
   v
Offer -> Hire / Reject / Archive
```

Recruiting domain catalog (deep detail):
- `.ai-docs/domain-modules/recruiter/USE-CASES.md` (145 documented use cases)

---

## 4) What “AI” means in BitHire (no AI spaghetti)

BitHire separates AI concerns into dedicated modules so AI stays upgradeable and controllable.

### 4.1 Scoring & evaluation (LLM-as-Judge)

`@rottay/scoring` provides rubric-based evaluation:
- define rubrics/dimensions
- generate scorecards and evidence
- calibration workflows
- appeal/fraud/proctoring primitives (as documented)

Reference:
- `.ai-docs/domain-modules/scoring/USE-CASES.md`

### 4.2 AI providers + voice + transcription (multi-provider)

`@rottay/ia-chat` provides a unified interface for:
- multiple LLM providers
- voice synthesis + transcription providers
- phone-call oriented provider adapters (as documented)
- usage tracking and quota/cost primitives

Reference:
- `.ai-docs/domain-modules/ia-chat/USE-CASES.md`

Why this matters:
- you can change providers without rewriting your product
- you can meter usage and control cost
- you can gate AI capabilities per plan/tenant

---

## 5) Multi-tenant & agency reality (why BitHire is not “just an ATS”)

Agencies don’t want to put their business inside someone else’s black-box SaaS.
They want:
- tenant separation
- roles/permissions
- white-label direction (branding/custom domains where scoped)
- enforceable plans (so they can sell their own tiers)

BitHire is built on Rottay Platform’s tenant-first enforcement model:
- RBAC + feature flags + quotas

Platform overview:
- [`04-PLATFORM-OVERVIEW-EN.md`](./04-PLATFORM-OVERVIEW-EN.md)

---

## 6) LinkedIn Chrome extension (outreach in the place recruiters already live)

BitHire includes a Chrome extension (`ext-bithire/`) intended to support recruiter workflows inside LinkedIn:
- message templates
- outreach tracking
- candidate matching (link LinkedIn profiles to candidates)

Repo evidence:
- `ext-bithire/manifest.json` (Manifest V3 + LinkedIn host permissions)

Important operational note:
- production use should be reviewed against platform policies and customer risk tolerance.

---

## 7) Cost control: token / usage economics

AI features have real variable cost, so cost-awareness is a product requirement.

BitHire includes “token economy” and cost-aware UX surfaces such as:
- token balances
- purchase/distribution controls (team-level)
- quota warnings and cost estimators (UX)

Repo pointers:
- `.ai-docs/apps/bithire/README.md` (audit notes)
- `@rottay/recruiter` includes “Token Management” use cases in its catalog

---

## 8) What’s verifiable in the BitHire app today (repo-backed)

### 8.1 Server actions inventory

BitHire includes a generated server-actions catalog:
- `app-bithire/bithire-use-cases.json`

Computed directly from that file:
- **252 total server actions**
  - 142 mutations
  - 110 queries

### 8.2 Billing UI exists in the app

Repo evidence:
- `app-bithire/src/app/(dashboard)/settings/billing/`

---

## 9) Why BitHire matters for Rottay (strategy)

BitHire is both:
- a product buyers can pay for (outcomes)
- a real-world proof of the platform’s multi-tenant and plan enforcement model

That proof can later support the platform subscription story for builders/operators.

---

## 10) Next docs

- Verticals overview: [`05-VERTICALS-OVERVIEW-EN.md`](./05-VERTICALS-OVERVIEW-EN.md)
- Developer guide: [`08-DEVELOPER-GUIDE-EN.md`](./08-DEVELOPER-GUIDE-EN.md)
