# Rottay — Critique, Risks, and What I’d Improve (Internal)

**Last updated:** 2026-02-10  
**Audience:** founders / internal strategy only.  
**Tone:** candid on purpose.

---

## 1) What’s strong (the “why this can win”)

### 1.1 Modular architecture is not just engineering — it’s business leverage

You’re using modularity for:
- reuse across verticals
- limiting blast radius of collaborators
- packaging and selling bundles

That’s coherent. Many teams modularize too late, after they’re stuck.

### 1.2 Tenant-first constraints reduce future enterprise pain

Multi-tenancy, RBAC, plan enforcement, audit fields — these are the things that kill early-stage teams when they try to “upgrade to enterprise later”.

Having them as architectural rules is a real advantage (and it’s doc-backed in this repo).

### 1.3 Verticals as “proof” is the right move

Platform-only stories often fail because buyers don’t trust abstractions. Verticals:
- demonstrate the platform is real
- create real buyer feedback loops
- force the platform to stay practical

---

## 2) The biggest risks (ranked)

### Risk #1 — Distribution / GTM (not engineering)

The codebase is impressive, but the hardest part is:
- picking a buyer
- getting them to pay
- keeping them

This is the single biggest existential risk.

**What I’d do:** commit to a *wedge* (BitHire) and measure the funnel obsessively before expanding the story.

### Risk #2 — “Too many products” dilutes the narrative

Rottay can easily become:
- 15 modules
- 10 vertical ideas
- 5 audiences

…and nobody understands what you sell.

**What I’d do:** keep the public story simple:
- “Rottay Platform” (foundation + enforcement)
- “BitHire” (first vertical)
Everything else is “available modules / roadmap” until it’s real revenue.

### Risk #3 — Compliance messaging can create legal/expectation debt

Selling “compliance” is dangerous if the buyer hears “certified”.

**What I’d do:** keep it brutally clear:
- “controls + evidence tooling” ✅
- “certification guarantee” ❌

And enforce it in marketing copy and sales scripts (see `09-SECURITY-COMPLIANCE-EN.md`).

### Risk #4 — The “modular moat” isn’t a moat by itself

Shipping compiled modules and restricting access reduces exposure, but:
- code can be reimplemented
- customers buy outcomes, not architecture

**What I’d do:** treat moat as:
- distribution + brand
- operator experience (white-label, onboarding, dashboards)
- integration depth (event-driven platform + workflows)
- continuous iteration speed

### Risk #5 — Chrome extension / LinkedIn surface area

The extension is a strong wedge for recruiter workflows, but:
- policy/compliance risks (LinkedIn ToS, scraping perception)
- browser extension maintenance is non-trivial

**What I’d do:** position it as “premium workflow enhancer” and keep strict boundaries:
- no risky scraping claims
- clear user consent
- robust authentication and auditing

---

## 3) What I would change (product strategy)

### 3.1 Clarify the “core product” per audience

Right now, Rottay can be interpreted as:
- a platform
- a suite of vertical SaaS products
- a private module marketplace
- a white-label operator engine

All true — but not all should be equally prominent.

**Recommendation:** choose one primary story per stage.

For 0→1 revenue:
1) BitHire as product
2) White-label as upsell
3) Platform bundles as “proof + future expansion”

### 3.2 Package modules into bundles (don’t sell 15 SKUs too early)

Selling many individual modules increases:
- buyer confusion
- support burden
- pricing complexity

**Recommendation:** sell bundles that match buyer intent:
- Foundation bundle (auth/identity/tenancy/permissions)
- Plan enforcement bundle (feature flags + quotas)
- Experience bundle (notifications + navigation)
- Compliance profiles (add-ons)

### 3.3 Make “plan enforcement” a headline differentiator

Most platforms talk about “features”.
Rottay should also talk about “selling features safely”:
- enforceable tiers
- quotas
- auditability

This is a strong story for builders and operators.

### 3.4 Use the design system as a distribution channel (but keep focus)

Open-sourcing primitives is a smart way to:
- build trust
- attract developers
- create inbound

But it should not become the main product.

**Recommendation:** ship it as a marketing engine with strict scope:
- public primitives + tokens
- private premium components (optional)
- documentation and examples that lead back to Platform/Verticals

---

## 4) What I would change (execution)

### 4.1 “Truth model” in docs and demos

Every doc/demo should clearly label:
- **Shipping** (in product)
- **In progress**
- **Planned**

This prevents trust erosion.

### 4.2 Instrument the funnel early

Decide the one metric that matters for BitHire:
- activation (time-to-first value)
- weekly active recruiters
- churn

Without this, you’ll overbuild and under-sell.

### 4.3 Enterprise only when forced by pull

Enterprise deals are tempting, but:
- long cycle
- heavy support
- custom demands

**Recommendation:** define an “enterprise boundary”:
- minimum contract length
- clear scope of isolation and white-label
- strict “no custom feature without roadmap alignment”

---

## 5) A practical 30‑day focus plan (if you want momentum)

1) **Choose BitHire ICP** (agency vs internal HR teams) and write one landing page for that ICP  
2) **Demo script** that ends in a paid plan decision (not a “cool features” tour)  
3) **Onboarding checklist** (first job, first candidate, first pipeline stage, first interview, first scorecard)  
4) **Pricing packaging** (3 tiers + 1 white-label upsell) with enforceable feature/quota mapping  
5) **Partner model** only after you can convert direct inbound (otherwise you scale noise)

---

## 6) Questions to ask you (to sharpen strategy)

1) BitHire: is the first buyer **recruiting agencies** or **in-house HR teams**? (Pick one.)  
2) What is the *first paid outcome* you want to guarantee? (e.g., “pipeline visibility”, “interview automation”, “scoring consistency”)  
3) White-label: do you want “branding + domain” first, and “dedicated isolation” later — or is isolation part of the first enterprise pitch?  

