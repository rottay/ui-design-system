# Rottay — One‑Pager (Executive)

**Last updated:** 2026-02-10  
**Verified inventory & status labels:** [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## The one sentence

**Rottay is a modular, multi‑tenant‑first software ecosystem that lets teams ship and operate SaaS products by composing proven platform modules and reusable business domains — and proves it through real vertical products.**

---

## What is Rottay (practically)?

Rottay is three things that reinforce each other:

1) **Rottay Platform** — reusable SaaS fundamentals (auth, identity, tenancy, permissions, feature flags + quotas, navigation, notifications, compliance tooling).  
2) **Domain modules** — reusable business engines (recruiting, scoring, AI chat/voice/transcription, events, bar/POS, staff, payments, web3).  
3) **Vertical products** — complete apps built on the same modules (in this repo today: **BitHire** and **Evnto**).

---

## Why it exists (the problem we actually solve)

Most teams can build “the main feature”.
What breaks them is everything that must exist around it:

- secure authentication + sessions
- multi‑tenant separation (and the admin surface to operate it)
- RBAC permissions + auditability
- enforceable plans (feature gating + quotas)
- notifications and workflows
- consistent UI + theming (especially for white‑label)

The usual outcome is vendor sprawl + glue code + long-term maintenance debt.

---

## The Rottay approach (ASCII overview)

```text
                           +----------------------+
                           |   Customers / Users  |
                           +----------+-----------+
                                      ^
                                      |
                         +------------+------------+
                         |   Vertical Products     |
                         |  BitHire  |   Evnto     |
                         +-----+-----+-----+-------+
                               ^           ^
                               |           |
                 +-------------+-----------+-------------+
                 |      Domain Modules (reusable)        |
                 | recruiter | scoring | ia-chat | events |
                 | bar | staff | payments | web3 | ...    |
                 +------------------+---------------------+
                                    ^
                                    |
                   +----------------+----------------+
                   |      Rottay Platform Modules    |
                   | auth | identity | tenancy | perms|
                   | flags+quotas | nav | notifs | ...|
                   +----------------+----------------+
                                    ^
                                    |
                         +----------+----------+
                         |       @rottay/core  |
                         | rules + primitives  |
                         +---------------------+
```

---

## Who buys it (and why)?

### Vertical buyers (want outcomes)
- recruiting teams and agencies (BitHire)
- event operators and venues (Evnto)

### Platform buyers (want foundations)
- founders and small teams building SaaS
- engineering teams tired of stitching vendors
- agencies/operators who want white‑label without losing the customer relationship

---

## What makes it different (without hype)

- **Multi‑tenant is not optional**: tenant-first patterns are architectural rules, not “phase 2”.  
- **Plans are enforceable**: RBAC + feature flags + quotas are part of the platform story (sell tiers safely).  
- **Modularity is a collaboration strategy**: contributors can work on vertical/domain scope without owning the entire blueprint.  
- **Proof through products**: BitHire/Evnto exist in this repo; the platform is not theoretical.

---

## Business model (cleanly separable)

1) **Vertical subscriptions** (BitHire, Evnto)  
2) **Platform subscriptions** (module bundles for builders/operators)  
3) **White‑label / enterprise** (branding + custom domains + higher isolation tiers where scoped)

---

## Security & compliance (what we will and won’t claim)

- Rottay is built around **tenant isolation**, **auditability**, and **access control**.  
- Rottay can package **compliance tooling profiles** (controls, workflows, evidence surfaces).  
- **We do not claim certifications** (SOC 2 / ISO / HIPAA, etc.) unless obtained and verifiable.

---

## Next reading (pick one)

- Platform overview: [`04-PLATFORM-OVERVIEW-EN.md`](./04-PLATFORM-OVERVIEW-EN.md)
- Verticals overview: [`05-VERTICALS-OVERVIEW-EN.md`](./05-VERTICALS-OVERVIEW-EN.md)
- Developer guide: [`08-DEVELOPER-GUIDE-EN.md`](./08-DEVELOPER-GUIDE-EN.md)
