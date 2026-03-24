# Rottay — The Story (ELI5, Non‑Technical)

**Last updated:** 2026-02-10  
**Audience:** family, friends, non‑technical customers, and anyone asking “what is this, really?”

---

## 1) The real world: building software is expensive… and keeping it alive is harder

Imagine you want to build a digital business:

- “We want to hire faster.”
- “We want to sell event tickets.”
- “We want to run our operations in one place.”

The idea sounds simple — until you run into the boring but unavoidable parts:

- secure login
- roles and permissions (who can see/do what)
- multi‑client separation (multi‑tenant)
- billing tiers and limits
- notifications and workflows
- audit logs (so you can prove what happened)

None of that is your “unique product idea”.  
But without it, you don’t have a real SaaS — you have a demo.

---

## 2) The hidden human problem: “How do I scale without giving away the blueprint?”

AI changed something important:

With a small team, you can now build a lot.

But when your product grows, you eventually need help:
- more developers
- partners
- agencies
- contractors

And when more people touch the codebase, two risks show up:

1) **Engineering risk:** more hands can break more things if there aren’t strict rules.  
2) **Business risk:** if someone sees the entire architecture, they can copy the essentials.

Contracts help, but they’re not magic.  
A stronger approach is **designing the system so you never need to share the entire “brain.”**

---

## 3) The idea behind Rottay: a kit of reusable building blocks

Rottay is built as a modular ecosystem:

- **Rottay (company)** = the umbrella brand
- **Rottay Platform** = the reusable foundation (security, multi‑tenant, plan enforcement, compliance tooling, etc.)
- **Domain modules** = reusable business domains (recruiting, events, payments, AI, etc.)
- **Vertical products** = complete apps built from those modules (in this repo: BitHire and Evnto)

Here’s the simplest picture:

```text
Rottay (Company)
|
|-- Rottay Platform  (the foundations every SaaS needs)
|    |-- Auth / Identity / Tenancy / Permissions
|    |-- Feature Flags + Quotas (sell tiers safely)
|    |-- Navigation / Notifications
|    |-- Compliance tooling
|
|-- Domain Modules   (reusable “business engines”)
|    |-- Recruiting (ATS)
|    |-- Scoring (LLM-as-Judge)
|    |-- AI Chat/Voice/Transcription
|    |-- Events / Bar / Staff / Payments / Web3
|
|-- Vertical Products (finished apps)
     |-- BitHire (Recruiting)
     |-- Evnto   (Events)
```

The point is not “we have code.”  
The point is: **we have a system designed to be reused, controlled, and sold in parts.**

---

## 4) Why modular matters (in plain language)

Modular means:

> People can work on one part without touching the entire system.

That gives you practical advantages:

- you can collaborate without exposing everything
- you can build new products faster by reusing existing blocks
- you can maintain consistency (same rules everywhere)
- you can sell bundles (“foundation”, “compliance”, etc.) instead of one giant blob

---

## 5) Multi‑tenant + white‑label: why agencies don’t trust generic SaaS

Many service businesses (agencies, recruiting firms, operators) worry about SaaS platforms because:

> “If I put my clients inside someone else’s system, I’m building their asset — not mine.”

Rottay is built so companies can:

- operate multiple client companies in one system (multi‑tenant)
- apply branding per tenant (logo/colors)
- support white‑label direction (your brand, your domain) where contracted and implemented

The goal is that an agency can deliver a real product experience **under their own brand** — without having to build everything from scratch.

---

## 6) What does Rottay sell?

Rottay is designed to support multiple business lines:

1) **Vertical subscriptions** (finished products you use)  
2) **Platform subscriptions** (module bundles for builders/operators)  
3) **White‑label / enterprise plans** (branding + custom domains + higher isolation tiers where scoped)  

---

## 7) “Compliance” (important clarification — no hype)

Some buyers want to be compliant but don’t know where to start.

Rottay can provide:
- technical controls
- workflows
- audit trails and evidence surfaces

But we must be clear:

> Compliance tooling is not the same thing as being officially certified.

Rottay can help you implement requirements — but certifications depend on audits, policies, and legal processes.

---

## 8) What exists today (in this repo)

This repo contains:
- platform modules (auth/tenancy/permissions/etc.)
- two vertical apps (BitHire and Evnto)
- a platform admin app
- a shared design system
- a Chrome extension for BitHire recruiting workflows

If you want the verified inventory, start here:
- [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## 9) The “no-bullshit” summary sentence

Rottay turns building SaaS from:

> “rebuild everything, stitch many vendors, maintain forever”

into:

> “compose proven modules with strict rules, and focus on the business outcomes.”

