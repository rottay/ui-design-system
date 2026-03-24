# BitHire — Pricing & Partner Program (Internal Draft)

Last updated: 2026-02-09

This document is an **internal working draft** to converge on BitHire packaging, pricing, and partner incentives.
It intentionally separates:
- **Confirmed (repo-backed)** facts from what we already built
- **Assumptions / proposals** we want to test in pilots

---

## 1) Confirmed scope (from this repo)

### 1.1 What BitHire is (product)
BitHire is a **voice-first recruiting product**: it turns AI phone conversations into **structured, explainable hiring decisions** (transcripts → scorecards → ranking).

**Core flows implemented/defined across the stack:**
- Multi-tenant + RBAC (Recruiter / Team Manager / Admin Manager)
- ATS: jobs, candidates, applications, interviews, offers, pipeline stages
- AI phone interviews + transcript normalization
- LLM-as-Judge scoring (rubrics, evidence, calibration primitives)
- Token wallet + usage tracking (purchase → allocate → reserve → consume → settle)
- Analytics + activity timeline foundations

### 1.2 Modules BitHire depends on (repo-backed)
**Domain modules**
- `@rottay/recruiter` — ATS + token wallet layer
- `@rottay/scoring` — LLM-as-Judge scoring
- `@rottay/ia-chat` — multi-provider LLM/TTS/STT/phone infrastructure + pricing engine

**Platform modules**
- `@rottay/auth`, `@rottay/identity`, `@rottay/tenancy`, `@rottay/permissions`
- `@rottay/compliance` (BitHire-relevant: AI-hiring + privacy + biometric consent patterns)
- `@rottay/notifications`, `@rottay/navigation`

### 1.3 Provider surface (BitHire already supports/configures)
From `app-bithire/.env.example`, BitHire is ready to work with:
- LLM: OpenAI, Anthropic, Google, Mistral, Groq
- Voice/TTS: ElevenLabs (+ self-hosted adapters exist in dm-ia-chat)
- STT/transcription: Deepgram, AssemblyAI
- Voice call orchestration: Retell, Vapi, Bland

### 1.4 Plan knobs already exist (important for pricing)
BitHire already has the concept of plans and plan-gated features/limits (Free/Starter/Professional/Enterprise), via feature flags + plan limits in `app-bithire/PLAN-PLATFORM.md`.

---

## 2) COGS model (what actually costs money)

The **main variable cost** is AI usage (voice + LLM + transcription) per screened candidate.

### 2.1 Voice interview cost (example using Retell per-minute components)
Retell publishes per-minute components (voice engine + LLM + telephony). Example costs shown on their pricing page:
- Voice engine: **$0.04–$0.07/min** (OpenAI voices vs ElevenLabs voices)
- LLM: e.g. **gpt-4o = $0.05/min**, **gpt-4o-mini = $0.01/min**
- Telephony: about **$0.015/min** (US outbound)

**Illustrative unit economics (12-minute screening call):**
- *Standard quality*: OpenAI voice ($0.04) + gpt-4o-mini ($0.01) + telephony ($0.015)
  - ≈ **$0.065/min → $0.78 per 12 min**
- *Higher quality*: ElevenLabs voice ($0.07) + gpt-4o ($0.05) + telephony ($0.015)
  - ≈ **$0.135/min → $1.62 per 12 min**

### 2.2 Scoring cost (LLM-as-Judge)
Scoring adds incremental LLM cost. In practice, we should treat this as **$0.10–$0.80 per candidate** depending on model + rubric size + transcript length.

### 2.3 Practical COGS range per “AI Screening”
For early pilots, a realistic target range is:
- **Low/standard**: ~$1.00 per candidate (voice + basic scoring)
- **High/premium**: ~$2.50 per candidate (premium voice + richer scoring)

This is the range we should protect with pricing (usage tokens / overage).

---

## 3) Market anchors (external — directional, not authoritative)

We should avoid claiming “exact” competitor prices unless we quote a public pricing page.
For internal calibration, the market *tends* to look like:
- SMB ATS tools often land around **$149–$599/month** (starter → team) for self-serve plans.
- Mid-market and enterprise ATS pricing is commonly “contact sales” and can reach **tens of thousands/year** (especially with integrations, SSO, SLAs).

BitHire’s differentiated wedge is **voice-first AI screening + explainable ranking**, not “another ATS”.

---

## 4) Pricing model recommendation (v1)

### 4.1 Principles
1) Keep it **simple**: 4 plans max.
2) Separate **platform revenue** (predictable) from **usage revenue** (tokens/overage).
3) Don’t promise certifications. Compliance is **tooling + evidence**.
4) Make the first “Aha moment” easy: include a small amount of usage for free trials/pilots.

### 4.2 What we sell (components)
- **Subscription (per tenant)**: unlocks product capabilities + limits + support tier
- **AI Usage (tokens / overage)**: pays for provider COGS + our margin

### 4.3 Suggested plan structure (first draft)

**Option A (recommended): subscription + included AI usage + overage**

| Plan | Monthly (USD) | Intended buyer | What’s included | AI usage included | AI overage |
|------|---------------|----------------|-----------------|------------------|-----------|
| Free / Trial | $0 (14 days) | Evaluating | ATS basics + resume parsing | Small starter credits (enough for a couple AI screenings) | n/a |
| Starter | $199 | Small HR team | ATS core + AI phone interviews | ~10 AI screenings/month | pay-as-you-go |
| Professional | $499 | HR teams using AI weekly | + AI scoring/rubrics + better analytics | ~30 AI screenings/month | pay-as-you-go |
| Enterprise | From $1,499 | High volume / compliance needs | + SSO + BYOC option + SLAs | ~100 AI screenings/month | custom |

**Why these numbers:** they keep “platform” pricing competitive with SMB ATS while still leaving room for AI COGS and support.

### 4.4 Usage billing (how to avoid surprises)
We already have a token economy foundation. Recommendation:
- Sell **AI Screening** as a first-class metered unit (internally: tokenized per minute + scoring).
- Provide a **cost estimator** before starting an interview (already referenced in docs).
- Offer two quality modes:
  - Standard (lower cost)
  - Premium (higher cost)

---

## 5) Partner program (v1 — designed to scale without MLM/pyramid risk)

Goal: pay partners for **closed-won customers** they bring, keep them motivated to bring *new* customers, and keep CAC bounded.

### 5.1 Principles
1) Pay on **collected revenue** (not meetings).
2) Keep commissions **time-limited** (e.g., 6–12 months).
3) Optional small “manager override” can exist, but only **1 level** and only on real revenue.
4) “Approved partners only” (curated).

### 5.2 Why 5–8% might be too low (math)
If BitHire is priced like:
- Starter $199/mo
- Pro $499/mo

Then the total payout per customer is small if limited to 6 months:
- **5% x 6 months** → $60 (Starter), $150 (Pro)
- **8% x 6 months** → $96 (Starter), $240 (Pro)

That can be uncompetitive unless partners close a lot of deals.

### 5.3 Recommended structure (simple and motivating)
**Partner payout = Bounty (one-time) + Trailing % (time-limited)**.

Example (tunable):
- **Bounty on first paid invoice**
  - Starter: $150
  - Pro: $250
  - Enterprise: $500
- **Trailing commission on subscription revenue**
  - 8% for 12 months (cap per customer, e.g. $2,000)

This keeps the program attractive even for small plans, while still being bounded and predictable.

### 5.4 Tiering by performance (optional)
- Tier 1: 8% trailing
- Tier 2 (>= 5 active customers): 10% trailing
- Tier 3 (>= 15 active customers): 12% trailing

### 5.5 “Tree” concept (safe version)
If we want partners to build a team, do it as:
- **Partner Lead** gets **+2% override** on *direct* sub-partners only
- Only for **6 months**
- Only while the Lead maintains a minimum of their own production

Avoid paying for “recruiting people” itself; pay only on customer revenue.

---

## 6) What we must measure in pilots (to set final pricing)

Without this, we’re guessing.

**Usage + cost**
- Average minutes per AI screening call
- Model/voice mode mix (standard vs premium)
- Cost per screening (voice + scoring)
- Token consumption distribution (p50/p90)

**Value**
- Recruiter time saved (minutes per candidate)
- Conversion lift: screened → next stage
- Time-to-hire delta

**Business**
- CAC by channel (partner vs inbound)
- Churn reasons after 30/60/90 days

---

## 7) Open decisions (next iteration)

1) Pick a pricing band: **aggressive** (lower) vs **base** vs **premium**.
2) Decide whether Starter includes scoring, or scoring is Pro-only.
3) Confirm partner payout envelope: “8% x 12 months + bounty” vs simpler % only.

