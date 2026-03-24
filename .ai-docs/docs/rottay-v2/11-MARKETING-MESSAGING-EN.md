# Rottay — Marketing & Messaging (Draft)

**Last updated:** 2026-02-10  
**Audience:** marketing, sales, founders doing outreach, partner enablement.  
**Rule:** messaging must stay consistent with verified facts: [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md).

---

## 1) Positioning (the 1 sentence)

**Rottay helps teams build and run multi‑tenant SaaS products by composing production‑grade platform modules and reusable domain modules — and proves it through real vertical products.**

Alternative (more direct):
- “One modular platform to ship many SaaS products.”
- “Stop rebuilding auth, tenancy, permissions, and plan enforcement.”
- “Ship products, not glue code.”
- “A platform you can actually operate — not just integrate.”

---

## 2) Messaging pillars (what we want people to remember)

### Pillar A — Modular by design (build from pieces)
Rottay is not a one-off app. It’s a modular system:
- platform modules (auth/tenancy/perms/flags/…)
- domain modules (recruiting/events/payments/…)
- vertical products (BitHire/Evnto)

### Pillar B — Multi‑tenant first (not an afterthought)
Tenant isolation, auditability, and plan enforcement are first-class constraints — not “we’ll add it later.”

### Pillar C — Sell plans safely (feature flags + quotas)
The platform story is not only “features”; it includes mechanisms to monetize:
- feature gating (what a tenant can use)
- quotas (how much they can use)
- RBAC (who can do what)

### Pillar D — White‑label ready (agencies don’t lose the relationship)
Customers can operate under their own brand, domain, and UI theme (where implemented and contracted).

### Pillar E — AI-ready product surface (without hype promises)
AI is not just “one chat box”; it shows up as reusable modules and workflows (e.g., provider/metering patterns, recruiting automation, etc.) — but we avoid hard time-to-build promises.

---

## 3) The narrative structure (works for most audiences)

1) **Reality:** every SaaS needs the same foundation  
2) **Pain:** vendor sprawl + glue code + maintenance  
3) **Risk:** multi-tenant + compliance + plan enforcement are hard to retrofit  
4) **Solution:** modular platform + reusable domains + vertical proof  
5) **Proof:** show BitHire/Evnto and the module inventory  

ASCII flywheel:

```text
Platform fundamentals + Domain modules
              |
              v
      Vertical products (BitHire, Evnto)
              |
              v
   Real users -> proof -> iteration -> better modules
              |
              +------------------------------+
```

---

## 4) Personas and what they care about

### 4.1 Founder / small team
Pain:
- “I can build features, but running a real SaaS is a grind.”
Message:
- “Rottay gives you the foundations and patterns so you can focus on differentiation.”

### 4.2 Agency / operator (white-label)
Pain:
- “If I use someone else’s SaaS, I lose the client relationship.”
Message:
- “Deliver a real product under your brand without building everything from scratch.”

### 4.3 Engineering lead / platform engineer
Pain:
- “We don’t want a black box; we want consistent architecture and enforceable constraints.”
Message:
- “Tenant-first rules + Result pattern + consistent module boundaries. Less chaos, more reuse.”

### 4.4 Regulated / security-minded buyer
Pain:
- “We need auditability and controls; we can’t gamble.”
Message:
- “Compliance tooling and evidence patterns are built into the platform — without claiming certifications we don’t have.”

---

## 5) Proof points we can safely say (repo-backed)

Use these because they are verifiable inside this workspace:
- Rottay ships multiple publishable packages (`@rottay/*`) and multiple apps.
- There is a platform admin app and two vertical apps (BitHire, Evnto).
- Multi-tenancy is a documented architectural requirement.
- Feature gating + quotas are documented as part of the plan enforcement model.

Source: [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## 6) Claims to avoid (do not put on the website)

Avoid these unless we can prove them with public evidence:

- “SOC 2 / ISO / HIPAA certified”
- “Guaranteed compliance”
- “Build any SaaS in days” (hard time promises)
- “Impossible to copy”

Safe alternative language:
- “Compliance tooling to help you meet requirements”
- “Modular architecture that reduces exposure and improves collaboration”
- “Faster iteration by reusing production-grade modules” (qualitative)

---

## 7) Website copy blocks (ready-to-use)

### Hero options (pick one tone)

**Option A (builder):**  
Build multi‑tenant SaaS by composing proven modules — not by stitching vendors.

**Option B (operator/agency):**  
Deliver a real product under your brand. Keep the client relationship. Operate it like a SaaS.

**Option C (platform):**  
One platform. Many products. Enforceable plans. Operable tenants.

### Subheadline (safe, no hype)

Rottay combines platform fundamentals (auth, tenancy, permissions, plan enforcement) with reusable domain modules and real vertical products — so you can ship with confidence and scale without rewriting the foundation.

### “Why now” block

AI made building features easier.  
It did not make multi‑tenancy, security, enforcement, and operations disappear.  
Rottay is built to make those foundations reusable and operable across products.

---

## 8) Landing page outline (copy skeleton)

### Hero
**Build multi‑tenant SaaS products by composing proven modules.**  
Platform modules + reusable domains + vertical products.

CTA ideas:
- “See the platform modules”
- “See BitHire / Evnto”
- “Talk to us”

### Section: Why now
Small teams can ship more than ever, but the “platform fundamentals” still slow everyone down.

### Section: What’s included
- Auth + identity
- Tenancy + branding
- Permissions + auditability
- Feature flags + quotas (sell plans safely)
- Notifications + workflows
- Compliance tooling (controls + evidence patterns)

### Section: Proof via verticals
- BitHire (Recruiting)
- Evnto (Events)

### Section: White‑label
Explain brand ownership and why agencies/operators care.

### Section: Developer trust
Explain consistent architecture rules and module boundaries (link to dev guide).

---

## 9) 30‑second pitch (outreach-friendly)

“Rottay is a modular multi‑tenant SaaS platform. Instead of stitching together a dozen vendors and rebuilding the same basics, you compose platform modules (auth, tenancy, permissions, plan enforcement) and reusable domain modules. We also ship real vertical products like BitHire and Evnto, so the platform isn’t theoretical.”

---

## 10) Where to take people next

- One-pager: [`02-ONE-PAGER-EN.md`](./02-ONE-PAGER-EN.md)
- Platform overview: [`04-PLATFORM-OVERVIEW-EN.md`](./04-PLATFORM-OVERVIEW-EN.md)
- Verticals overview: [`05-VERTICALS-OVERVIEW-EN.md`](./05-VERTICALS-OVERVIEW-EN.md)
- Developer guide: [`08-DEVELOPER-GUIDE-EN.md`](./08-DEVELOPER-GUIDE-EN.md)

---

## Appendix: deeper marketing research (existing)

There is a deeper internal marketing corpus in `.ai-docs/marketing/` (competitive analysis, battlecards, etc.). This doc intentionally stays “shareable” and avoids unverified numbers.
