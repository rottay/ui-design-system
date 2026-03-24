# BitHire — Enterprise GTM, Packaging & Pricing (Internal Draft)

Last updated: 2026-02-09

**Intent:** this is a working document to design an **enterprise-first commercial motion** for BitHire (sales-led, seats + implementation), grounded in what exists in this repo and anchored to external market benchmarks.

---

## 0) Positioning (enterprise-friendly)

BitHire is not “an ATS”.

BitHire is a **voice-first AI screening + explainable scoring system** with a full recruiting operating workflow around it:
- ATS core (jobs, candidates, applications, interviews, offers, pipelines)
- AI phone interviews (multi-provider)
- LLM-as-Judge scoring (rubrics, evidence, calibration patterns)
- Outreach workflow support (LinkedIn extension + templates + tracking)
- Multi-tenant RBAC + audit/compliance primitives

In enterprise terms: **reduce screening time, increase consistency, and add defensible evidence** to hiring decisions.

---

## 1) What we actually ship (repo-backed audit)

### 1.1 BitHire vertical (app)
`app-bithire` is a Next.js admin + recruiter dashboard using:
- `@rottay/recruiter` (ATS + token wallet + outreach + templates)
- `@rottay/scoring` (LLM-as-Judge)
- `@rottay/ia-chat` (providers, phone, pricing engine)
- platform modules (`auth`, `identity`, `tenancy`, `permissions`, `compliance`, `notifications`, `navigation`)

Internally, `app-bithire/bithire-use-cases.json` enumerates **252** server actions (142 mutations, 110 queries) across talent/recruiting + AI + scoring + auth/profile surfaces.

### 1.2 Chrome extension (LinkedIn workflow surface)
`ext-bithire` provides:
- LinkedIn profile detection (`/in/*`)
- Template insertion into LinkedIn messaging (shadow DOM UI)
- Candidate match + outreach activity + template usage tracking via BitHire API

This is not “nice to have” in staffing/outbound contexts; it can be a **major adoption driver**.

---

## 2) Enterprise buyer: what they pay for (and why we can charge “hundreds per seat”)

Enterprise HR/Talent teams pay for:
1) **Time** (screening is expensive and slow)
2) **Consistency** (reduce bias/noise in screening)
3) **Throughput** (volume)
4) **Risk** (audit trails, disclosures, retention, consent)
5) **Integrations** (HRIS/ATS, email/calendar, SSO)
6) **Workflow** (outreach + templates + tracking)

BitHire can be sold as a full-suite OR as “AI screening + scoring layer” that integrates with a customer’s existing ATS.

---

## 3) Competitive stack: what a customer buys today (benchmarks)

> Use these as anchors. Final numbers always require quotes.

### 3.1 LinkedIn Recruiter (usually unavoidable)
LinkedIn Recruiter is commonly budgeted at ~$10k–$15k/seat/year for corporate tiers (varies heavily by region/volume).
It’s often the **single biggest per-seat cost** in recruiting.

### 3.2 Outreach/CRM layer (Gem example)
Gem’s recruiting-firm plans publicly list:
- $99 per user/month (Essentials), billed yearly
- $149 per user/month (Professional), billed yearly

Gem’s positioning is “ATS + CRM + sequencing + analytics” for recruiting firms.

### 3.3 Structured interviews / video intelligence (HireVue anchor)
Vendr reports HireVue averages around ~$50k/year with deals up to ~$145k (directional anchor).

### 3.4 Voice AI runtime (Retell anchor, pay-as-you-go)
Retell publicly lists component pricing for voice agents:
- voice engine: ~$0.07–$0.08/min
- telephony: ~$0.015/min (US)
- LLM cost varies by model (e.g., Gemini Flash ~$0.006/min; higher for stronger models)

BitHire’s actual cost is provider-choice dependent, which is why we should sell **usage transparently** (tokenized) or offer BYOC.

### 3.5 ATS baseline (general market ranges)
Public industry guides commonly cite ATS spend in wide ranges (small → mid → enterprise), and enterprise can reach six figures annually depending on integrations/support.

---

## 3.6 TCO example scenarios (directional)

> These are *back-of-the-envelope* scenarios to decide pricing bands, not final quote tools.

### Scenario S (25 recruiters, mid-market)
**Assumptions:**
- 25 recruiter seats
- 100 AI screenings per recruiter/month
- 12 minutes average per screening
- Retell-ish runtime cost example: ~$0.101/min (voice + telephony + low-cost LLM)

**Runtime AI minutes:**
- 25 × 100 × 12 = **30,000 minutes/month**
- 30,000 × $0.101 ≈ **$3,030/month** (voice runtime only; scoring adds more)

**Typical “stack” costs (illustrative):**
- ATS: $15k–$50k/year+
- Outreach/CRM: Gem Pro ≈ $149 × 25 = **$3,725/month** (billed annually)
- Interview intelligence: HireVue ≈ **$4,100/month** (avg anchor)
- LinkedIn Recruiter: $10k–$15k × 25 = **$250k–$375k/year** (often already budgeted)

**Pricing takeaway:** if BitHire can replace even 2 out of 3 (CRM + interview platform) *and* reduce screening labor, an enterprise price band like **$300–$800 per recruiter seat/month** is defensible.

---

## 4) Packaging (what we sell to enterprises)

### 4.1 Two enterprise offers (recommended)

#### Offer A — BitHire Enterprise Suite (replace most of the workflow)
For customers willing to run the core recruiting workflow inside BitHire.

Includes:
- ATS + pipeline + offers + analytics
- AI phone screening + scoring + ranking
- Templates + outreach tracking + Chrome extension
- RBAC + audit logs
- Compliance primitives (disclosures/consents/retention tooling; **not** certification)
- Admin panel + integrations panel

#### Offer B — BitHire AI Screening Layer (integrate into their existing ATS)
For customers already locked into Workday/SuccessFactors/Greenhouse/Lever.

Includes:
- AI phone screening + transcript + scoring + evidence + ranking
- Webhooks/API to push results back into their ATS
- Required compliance disclosures/consents flows + audit logs
- BYOC option preferred (they own their provider contracts)

This is often the fastest path to close enterprise in the first 6–12 months.

### 4.2 Add-ons (enterprise-friendly)
- SSO/SAML + SCIM
- Dedicated tenant / isolated deployment (in Rottay infra)
- Customer-hosted deployment (they are superadmin; we have no data access)
- Compliance “profiles” (Privacy/GDPR, AI-Hiring, etc.) as UI/workflows + evidence exports

---

## 5) Pricing model (enterprise-first)

### 5.1 Why “simple self-serve $199” isn’t the enterprise story
Enterprise buyers are not paying for “the app”. They are paying for:
- replacing multiple tools
- risk reduction
- implementation
- support + reliability

So we want **sales-led pricing** with:
- a minimum contract
- seats (recruiter seats are the main driver)
- usage (AI minutes / screenings) either included as credits or billed as overage
- implementation fees for integrations and migration

### 5.2 Proposed enterprise price bands (draft)

These are *proposal bands* to test in pilots; we’ll tune after 3–5 paid implementations.

#### BitHire Enterprise Suite (seats + usage)
- **Recruiter seat**: **$300–$800 / seat / month** (range depends on included AI credits + support tier)
- **Hiring manager seats**: included (or low-cost) to reduce friction
- **AI usage**: included credits + overage, OR BYOC
- **Minimum annual contract**: $30k–$100k (depending on segment)

#### BitHire AI Screening Layer (platform fee + usage)
- **Platform fee**: $2,000–$8,000 / month
- **Usage** (standard screening): $X per screening or $Y per minute (tokenized)
- Strong BYOC story (they pay providers directly; we charge platform + orchestration + product)

### 5.3 Implementation / migration (where we can create “economic backing”)
Enterprise will pay for implementation if it’s a clear path to adoption:
- **Pilot package (2–4 weeks)**: configure workflows, rubrics, templates, train admins
- **Migration (ATS data import)**: candidates/jobs/pipeline/templates
- **Integrations**: HRIS/ATS, calendar, email, background checks, SSO/SCIM

Draft band:
- $10k–$25k pilot
- $25k–$100k migration/integrations bundle (depends on systems + data)

---

## 6) Partner program (enterprise-oriented, paid on closed-won)

You explicitly do **not** want “pay per meeting”. That’s fine.

### 6.1 Recommended partner payout for enterprise
Pay partners only for **new logos** they bring.

Model:
- **Upfront bounty** at contract signature (small, so we don’t overpay before collections)
- **Trailing %** on collected subscription revenue for a limited period (6–12 months)
- No trailing after that (partner focuses on hunting, we focus on retention/support)

Example envelope:
- 6–10% of subscription revenue for 12 months
- Optional bounty (e.g., $1k–$5k) depending on contract size

### 6.2 Proposed partner tiers (simple + scalable)

All partners are **approved** (curated). Tiering is based on performance and trust.

| Tier | Who it’s for | What they do | Payout (example) |
|------|--------------|--------------|------------------|
| Approved (Referral) | Warm intros | Intro + context + help with trust | 6% trailing for 12 months |
| Certified (Closer-lite) | Strong operators | Can run discovery calls + basic demos | 8% trailing for 12 months + bounty |
| Strategic (Channel) | Firms / communities | Consistent pipeline + co-marketing | 10% trailing for 12 months + bounty |

**Bounty suggestion (paid at 1st invoice collected):**
- <$50k ACV: $1,000
- $50k–$150k ACV: $3,000
- >$150k ACV: $5,000

**Example payouts (subscription only, paid on collections):**

| Deal ACV (subscription) | Tier | Trailing | Bounty | Total payout (illustrative) |
|-------------------------|------|----------|--------|------------------------------|
| $30k/year | Approved | 6% × 12 mo | $0 | $1,800 |
| $60k/year | Certified | 8% × 12 mo | $3,000 | $7,800 |
| $150k/year | Strategic | 10% × 12 mo | $5,000 | $20,000 |

Notes:
- Consider a **cap per customer** (e.g., $20k) so one big logo doesn’t blow up CAC.
- Pay trailing monthly on collected invoices; bounty only after first invoice is collected.

### 6.3 What revenue counts for commission

To keep it clean:
- **Commissionable:** subscription / platform fees
- **Optional:** usage fees (AI runtime) can be commissionable at a smaller % (e.g. half-rate) or excluded
- **Usually excluded:** one-time implementation/migration (or pay a small fixed bounty instead)

### 6.4 Avoid MLM/pyramid risk (“tree” concept, safe version)

If we add a “tree”, keep it:
- **1 level max**
- override is small (e.g., **+1–2%**)
- time-limited (6 months)
- paid only on real collected revenue
- only while the Lead maintains minimum production (to avoid passive “tree farming”)

---

## 7) Risks we must manage (so enterprise doesn’t kill us)

### 7.1 LinkedIn extension risk
Any LinkedIn automation/scraping can create ToS risk. Keep the extension positioned as:
- workflow assist + templates + tracking
- minimal automation
- customer-controlled usage

### 7.2 AI-hiring legal risk
We can sell tooling, but we must **not** sell “certified compliance”.
BitHire should ship:
- disclosures/consents, retention tooling, audit logs, evidence
- explicit disclaimers: “not legal advice; audits depend on process + operations”

### 7.3 Data security expectations
Enterprise will ask for:
- SSO/SAML, SCIM
- audit logs
- encryption, key management story
- incident response posture

---

## 8) What we need to decide next (so we can quote real deals)

1) Which offer is the first enterprise wedge?
   - Suite (replace workflow) vs Screening Layer (integrate with existing ATS)
2) BYOC stance:
   - default BYOC for enterprise, or hybrid?
3) How we define “seat”:
   - recruiter seats paid, manager seats included?
4) Implementation SKU:
   - what’s included in a $25k package vs what becomes custom SOW?

---

## Sources (for pricing anchors)

- LinkedIn Recruiter seat ranges (directional): LiteSpace.  
  https://litespace.io/blog/linkedin-recruiter-pricing
- Gem recruiting-firm pricing: Gem (official).  
  https://www.gem.com/recruiting-firms-pricing
- HireVue spend anchors: Vendr buyer guide (directional).  
  https://www.vendr.com/marketplace/hirevue/pricing
- Retell component pricing: Retell (official).  
  https://www.retellai.com/pricing
- ATS costs overview (directional): Gem blog.  
  https://www.gem.com/blog/ats-costs
