# Rottay TCO Calculator

> Total Cost of Ownership comparison: Rottay vs. assembling the stack.
> Use this for sales conversations, content, and ROI calculations.

---

## Quick Calculator

### Your Company Profile

| Input | Your Value | Notes |
|-------|------------|-------|
| Monthly Active Users (MAU) | _____ | For auth/permissions pricing |
| Engineering Team Size | _____ | For seat-based tools |
| Enterprise Customers (SSO) | _____ | For SSO connection pricing |
| Monthly SMS Verifications | _____ | For notification costs |
| Compliance Frameworks Needed | _____ | GDPR, SOC2, HIPAA, etc. |

---

## Cost Comparison by Company Size

### Startup (10K MAU, 5 Engineers)

| Category | Best-of-Breed | Cost/Year | Rottay |
|----------|---------------|-----------|--------|
| **Auth** | Clerk | $0 (free tier) | Included |
| **Compliance** | Sprinto | $4,000 | Included |
| **Feature Flags** | LaunchDarkly | $600 | Included |
| **Permissions** | Custom | Engineering | Included |
| **Multi-tenancy** | Custom | Engineering | Included |
| **Notifications** | Resend | $240 | Included |
| **Total SaaS** | - | **$4,840/year** | - |
| **Engineering Time** | - | 4-6 weeks | 1 week |

### Growth (50K MAU, 15 Engineers)

| Category | Best-of-Breed | Cost/Year | Rottay |
|----------|---------------|-----------|--------|
| **Auth** | Auth0 Professional | $9,600 | Included |
| **Compliance** | Vanta Core | $10,000 | Included |
| **Feature Flags** | LaunchDarkly (15 seats) | $3,600 | Included |
| **Permissions** | Permit.io Startup | $1,800 | Included |
| **Multi-tenancy** | Nile | $2,400 | Included |
| **Notifications** | Knock Starter | $3,000 | Included |
| **Total SaaS** | - | **$30,400/year** | - |
| **Engineering Time** | - | 8-12 weeks | 1-2 weeks |

### Scale (200K MAU, 50 Engineers, 25 Enterprise Customers)

| Category | Best-of-Breed | Cost/Year | Rottay |
|----------|---------------|-----------|--------|
| **Auth** | Auth0 Enterprise | $48,000 | Included |
| **Compliance** | Vanta Enterprise | $25,000 | Included |
| **Feature Flags** | LaunchDarkly (50 seats) | $12,000 | Included |
| **Permissions** | Permit.io Growth | $5,400 | Included |
| **Multi-tenancy** | Custom + Nile | $6,000 | Included |
| **Notifications** | Knock Growth | $12,000 | Included |
| **SSO Connections** | WorkOS (25) | $37,500 | Included |
| **Total SaaS** | - | **$145,900/year** | - |
| **Engineering Time** | - | 12-16 weeks | 2-3 weeks |

---

## Detailed Pricing Research

### Authentication

| Provider | Pricing Model | At 10K MAU | At 50K MAU | At 200K MAU |
|----------|---------------|------------|------------|-------------|
| **Auth0** | MAU-based | $2,880/year | $9,600/year | $48,000/year |
| **Clerk** | $0.02/MAU after 10K | $0 | $9,600/year | $45,600/year |
| **Supabase** | Flat + features | $300/year | $300/year | Custom |
| **Firebase** | Free + SMS | $0 + SMS | $0 + SMS | $0 + SMS |
| **AWS Cognito** | $0.0055-0.02/MAU | $660/year | $3,300/year | $13,200/year |
| **Stytch** | MAU + SMS | Variable | Variable | Variable |

**Hidden Auth Costs:**
- SMS verification (Firebase): $0.06/SMS = $6,000/year at 100K/year
- SSO connections (WorkOS): $125/connection/month
- Auth0 outages: 4 in 2024 (business disruption cost)

### Compliance

| Provider | Pricing Model | Core | Enterprise | Audit Fees |
|----------|---------------|------|------------|------------|
| **Vanta** | Annual + audit | $7,500/year | $25,000/year | +$10K-$50K |
| **Drata** | Annual + impl | $7,000/year | $100,000/year | +20-35% impl |
| **Secureframe** | Flat | $15,000/year | $25,000/year | Included |
| **Thoropass** | Annual | $8,700/year | Custom | +audit fees |
| **Sprinto** | Annual | $4,000/year | $20,000/year | Variable |

**Hidden Compliance Costs:**
- Vanta audit fees are separate (not in marketing)
- Drata implementation: +20-35% of license
- Limited to 5-6 frameworks (KYC, AML, Gaming not included)
- Ongoing consultant fees for specialized compliance

### Feature Flags

| Provider | Pricing Model | 5 Seats | 15 Seats | 50 Seats |
|----------|---------------|---------|----------|----------|
| **LaunchDarkly** | Per seat | $600/year | $3,600/year | $12,000/year |
| **Split.io** | Per user | $1,980/year | $5,940/year | $19,800/year |
| **Flagsmith** | Per seat | $540/year | $1,620/year | $5,400/year |
| **Statsig** | Per event | Variable | Variable | Variable |
| **ConfigCat** | Traffic-based | $1,200/year | $5,100/year | $10,200/year |

**Hidden Feature Flag Costs:**
- Seat-based scales with team growth
- Event-based can create "surprise billing"
- Traffic-based unpredictable at scale

### Permissions

| Provider | Pricing Model | 1K MAU | 5K MAU | 25K MAU |
|----------|---------------|--------|--------|---------|
| **Permit.io** | MAU + resources | $1,800/year | $5,400/year | Custom |
| **Oso Cloud** | MAU-based | $1,788/year | Custom | Custom |
| **Cerbos** | Custom (MAP) | Custom | Custom | Custom |
| **OpenFGA** | Self-host | $0 + DevOps | $0 + DevOps | $0 + DevOps |

**Hidden Permission Costs:**
- MAU limits compound with growth
- Resource quotas add complexity
- Self-hosting requires DevOps investment

### Multi-Tenancy

| Provider | Pricing Model | Starter | Growth | Enterprise |
|----------|---------------|---------|--------|------------|
| **Nile** | Query tokens + storage | Variable | Variable | Variable |
| **Turso** | Flat + storage | $60/year | $348/year | Custom |
| **PlanetScale** | Per instance | $180/year | $540/year | Custom |
| **Custom** | Engineering | 4-8 weeks | 4-8 weeks | 4-8 weeks |

**Hidden Multi-Tenancy Costs:**
- Serverless models = unpredictable costs
- Custom builds require ongoing maintenance
- Data isolation bugs = security incidents

### Notifications

| Provider | Pricing Model | Low Volume | Medium | High Volume |
|----------|---------------|------------|--------|-------------|
| **Twilio SMS** | Per message | $500/year | $5,000/year | $50,000/year |
| **SendGrid** | Email tiers | $240/year | $1,080/year | $4,800/year |
| **Resend** | Email tiers | $240/year | $1,080/year | $4,080/year |
| **Knock** | Platform fee | $3,000/year | $6,000/year | Custom |
| **OneSignal** | MAU + usage | Variable | Variable | Variable |

**Hidden Notification Costs:**
- Carrier fees on top of Twilio rates
- Overage charges (SendGrid)
- Per-provider integration time

---

## Integration Time Comparison

### Assembling the Stack

| Task | Time Estimate |
|------|---------------|
| Auth0 integration | 1-2 weeks |
| Vanta setup | 2-3 weeks |
| LaunchDarkly integration | 1 week |
| Permit.io integration | 1-2 weeks |
| Custom multi-tenancy | 4-8 weeks |
| Notification setup (multi-channel) | 1-2 weeks |
| **Total** | **10-18 weeks** |

**Plus ongoing:**
- 6 SDKs to maintain
- 6 API versions to track
- 6 dashboards to monitor
- 6 support queues to manage

### With Rottay

| Task | Time Estimate |
|------|---------------|
| SDK installation | 30 minutes |
| Auth setup | 1-2 days |
| Compliance integration | 2-3 days |
| Feature flags, permissions, tenancy | 1 week |
| **Total** | **1-2 weeks** |

**Ongoing:**
- 1 SDK to maintain
- 1 API version to track
- 1 dashboard to monitor
- 1 support queue

---

## Engineering Cost Calculator

### Hourly Rates (US Market)

| Role | Rate |
|------|------|
| Senior Engineer | $150/hour |
| Staff Engineer | $200/hour |
| Engineering Manager | $175/hour |

### Integration Engineering Costs

| Approach | Hours | Cost |
|----------|-------|------|
| **Best-of-breed (6 vendors)** | 400-720 hours | $60,000-$108,000 |
| **Rottay** | 40-80 hours | $6,000-$12,000 |
| **Savings** | 360-640 hours | **$54,000-$96,000** |

---

## ROI Summary Table

### Year 1 Total Cost of Ownership

| Company Size | Best-of-Breed | Rottay | Savings |
|--------------|---------------|--------|---------|
| **Startup** | $64,840* | TBD | TBD |
| **Growth** | $120,400* | TBD | TBD |
| **Scale** | $253,900* | TBD | TBD |

*Includes SaaS costs + estimated integration engineering (conservative)

### 3-Year TCO

| Company Size | Best-of-Breed | Rottay | 3-Year Savings |
|--------------|---------------|--------|----------------|
| **Startup** | $74,520* | TBD | TBD |
| **Growth** | $181,200* | TBD | TBD |
| **Scale** | $545,700* | TBD | TBD |

*Includes annual maintenance, SDK updates, and ongoing support overhead

---

## Objection Handlers

### "We already use Auth0"

**Response:** Auth0 solves authentication. We solve authentication plus compliance (15 frameworks vs Vanta's 5), multi-tenancy, permissions, feature flags, and notifications. You're paying $X for Auth0 alone. We include Auth0-level auth plus everything else.

**Key facts:**
- Auth0 had 4 outages in 2024
- Auth0 pricing is #1 developer complaint (34%)
- Impossible travel detection costs extra on Auth0

### "Vanta is our compliance tool"

**Response:** Vanta tracks compliance for 5 frameworks. We implement compliance for 15 frameworks, including KYC, AML, Gaming, Crypto, and AI Hiring that Vanta doesn't offer. Plus, audit fees are separate with Vanta ($10K-$50K/year).

**Key facts:**
- Vanta: 5 frameworks. Rottay: 15 frameworks.
- Vanta audit fees not included in pricing
- Vanta doesn't implement compliance, it tracks it

### "We need best-of-breed"

**Response:** "Best-of-breed" means 6 vendors, 6 invoices, 6 support queues, 6 security surfaces, and 10-18 weeks of integration. We're best-of-breed in every category, unified into one platform.

**Key facts:**
- 6 vendors = 6 points of failure
- Each vendor has your data (security surface)
- Context switching costs engineering time

### "What about lock-in?"

**Response:** With 6 vendors, you're already locked in to 6 different platforms. We use standard patterns (PostgreSQL, TypeScript, REST) and every use case returns Result<T> with no exceptions. Your business logic stays portable.

**Key facts:**
- Standard database (PostgreSQL)
- Standard language (TypeScript)
- No proprietary query languages

---

## Sales Scenarios

### Scenario 1: Startup Evaluating Stack

**Profile:** Pre-seed to Series A, 3-10 engineers, <50K users
**Current stack:** Clerk + Vercel + manual compliance
**Pain:** Compliance audit coming, need enterprise features

**Pitch:**
"You're paying $0 for Clerk now, but when you hit 50K users, that's $9,600/year for auth alone. Add Vanta at $7,500/year (plus audit fees) and you're at $17K+ for just auth and compliance. We include auth, compliance (15 frameworks), feature flags, permissions, multi-tenancy, and notifications. Enterprise-ready from day one."

### Scenario 2: Growth Company Rationalizing Vendors

**Profile:** Series A-B, 15-50 engineers, 50K-500K users
**Current stack:** Auth0 + Vanta + LaunchDarkly + custom
**Pain:** $50K+/year in infrastructure vendors, integration overhead

**Pitch:**
"You're spending $30K+ on Auth0, Vanta, and LaunchDarkly. Add in custom multi-tenancy maintenance and notification infrastructure, you're approaching $50K/year. And that's 4+ SDKs your team maintains. We consolidate everything into one platform, one SDK, one support queue."

### Scenario 3: Enterprise Consolidation

**Profile:** Series C+, 50+ engineers, 500K+ users, 50+ enterprise customers
**Current stack:** Full vendor stack, compliance pressure
**Pain:** $150K+/year, 10+ vendors, security questionnaire fatigue

**Pitch:**
"At your scale, you're spending $150K+ across authentication, compliance, permissions, feature flags, and notifications. Each vendor is a security questionnaire you have to answer and a SOC 2 report you have to verify. We consolidate your infrastructure vendor count and your security surface area."

---

## Appendix: Pricing Sources

| Competitor | Source | Last Verified |
|------------|--------|---------------|
| Auth0 | auth0.com/pricing | January 2026 |
| Clerk | clerk.com/pricing | January 2026 |
| Vanta | Industry research, demos | January 2026 |
| Drata | G2 reviews, demos | January 2026 |
| LaunchDarkly | launchdarkly.com/pricing | January 2026 |
| Permit.io | permit.io/pricing | January 2026 |
| Nile | nile.build | January 2026 |
| Knock | knock.app/pricing | January 2026 |
| Twilio | twilio.com/pricing | January 2026 |
| SendGrid | sendgrid.com/pricing | January 2026 |

---

## Related Documents

| Document | Description |
|----------|-------------|
| [COMPETITIVE-ANALYSIS.md](./COMPETITIVE-ANALYSIS.md) | Full competitor breakdown |
| [MARKETING-STRATEGY.md](./MARKETING-STRATEGY.md) | Overall strategy |
| [PHRASES.md](./PHRASES.md) | Marketing phrases |
