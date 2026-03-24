# Rottay Marketing Strategy

> Master document for marketing campaigns, verified numbers, and brand messaging.

---

## The Core Insight

Every B2B SaaS rebuilds the same infrastructure:
- Authentication
- Multi-tenancy
- Compliance
- Permissions
- Feature flags
- Notifications

**We built all of it. Once. Properly.**

---

## Quick Stats (For Marketing)

| Metric | Count |
|--------|-------|
| **Total Use Cases** | 1,000+ |
| **Platform Modules** | 8 |
| **Domain Modules** | 9 |
| **Total Modules** | 15+ |
| **Compliance Frameworks** | 15+ |
| **Auth Use Cases** | 80+ |
| **Compliance Use Cases** | 90+ |
| **Tenancy Use Cases** | 50+ |

---

## Value Proposition Hierarchy

### Level 1: The Problem
> "The average B2B SaaS integrates 10+ infrastructure vendors."

### Level 2: The Pain
> "10 SDKs. 10 invoices. 10 support queues. 10 security surfaces."

### Level 3: The Solution
> "One platform. 1,000+ use cases. Zero integration."

### Level 4: The Proof
> "Auth, compliance, tenancy, permissions, notifications, feature flags. All typed. All tested. All maintained."

### Level 5: The Promise
> "The infrastructure you'd build, if you had time."

---

## Target Audiences

### 1. Developers
**Pain:** SDK fatigue, integration complexity, type inconsistency, auth bugs at 3am
**Desire:** Clean APIs, type safety, "it just works"
**Message:** "Import. Execute. Ship."
**Proof:** Code examples, Result<T> pattern, autocomplete demos

### 2. CTOs / Technical Founders
**Pain:** Vendor sprawl, infrastructure overhead, compliance burden
**Desire:** Focus on product, reduce operational complexity
**Message:** "Replace 10 subscriptions with 1."
**Proof:** Feature comparison, cost analysis, time-to-market

### 3. Enterprise Buyers
**Pain:** Security questionnaires, compliance audits, vendor risk
**Desire:** Check all the boxes, reduce vendor count
**Message:** "The enterprise checklist, already checked."
**Proof:** Compliance certifications, audit trails, SSO/SCIM support

---

## Module Breakdown

### Platform Modules (400+ Use Cases)

| Module | Use Cases | Marketing Angle |
|--------|-----------|-----------------|
| **Auth** | 80+ | "80+ ways to authenticate. Zero auth code to write." |
| **Compliance** | 90+ | "15+ frameworks. 90+ use cases. Zero consultants." |
| **Identity** | 55+ | "Users, groups, SCIM. Identity infrastructure." |
| **Tenancy** | 50+ | "Multi-tenancy in one parameter: { tenantId }" |
| **Permissions** | 40+ | "RBAC that's built-in, not bolted-on." |
| **Feature Flags** | 30+ | "Feature flags without the flag service." |
| **Navigation** | 55+ | "Menus, routes, access control. All managed." |
| **Notifications** | 25+ | "Email, SMS, push, in-app. One interface." |

### Domain Modules (600+ Use Cases)

| Module | Use Cases | Vertical |
|--------|-----------|----------|
| **dm-ia-chat** | 115+ | AI Agents |
| **dm-staff** | 95+ | Workforce |
| **dm-events** | 95+ | Ticketing |
| **dm-recruiter** | 80+ | ATS |
| **dm-bar** | 70+ | POS/Inventory |
| **dm-scoring** | 70+ | AI Evaluation |
| **dm-web3** | 55+ | Blockchain |
| **dm-payments** | 20+ | Payments |

---

## Compliance Frameworks (15+)

| Category | Frameworks |
|----------|------------|
| **Privacy** | GDPR, CCPA/CPRA, BIPA |
| **Healthcare** | HIPAA |
| **Financial** | KYC, AML, PCI-DSS, PSD2, DORA |
| **Securities** | MiFID II |
| **Crypto** | Travel Rule, MiCA |
| **Insurance** | Solvency II |
| **Employment** | FCRA, AI Hiring |
| **Gaming** | Responsible Gaming |

---

## The Replacement Narrative

### What Rottay Replaces

| Tool | Category | Our Module |
|------|----------|------------|
| Auth0, Clerk | Authentication | @rottay/auth |
| Vanta, Drata | Compliance | @rottay/compliance |
| LaunchDarkly | Feature Flags | @rottay/feature-flags |
| Permit.io, WorkOS | Permissions | @rottay/permissions |
| Nile, Turso | Multi-tenancy | @rottay/tenancy |
| Twilio, Resend | Notifications | @rottay/notifications |

### The Math (Verified)
- **Before:** 6 vendors, 6 SDKs, $27,880/year
- **After:** 1 platform, 1 SDK, predictable pricing

### Total Cost of Ownership Breakdown

#### Scenario: B2B SaaS with 50K users, 10 enterprise customers

| Service | What You Get | Annual Cost |
|---------|--------------|-------------|
| Auth0 Professional | Authentication | $9,600/year |
| Vanta Core | Compliance (5 frameworks) | $10,000/year |
| LaunchDarkly (10 seats) | Feature flags | $2,400/year |
| Permit.io Startup | Permissions | $1,800/year |
| SendGrid Pro | Email notifications | $1,080/year |
| Knock Starter | Multi-channel notifications | $3,000/year |
| **TOTAL** | **Basics only** | **$27,880/year** |

**Hidden Costs Not Included:**
- Vanta audit fees: $10,000-$50,000/year (separate)
- Integration engineering: 8-12 weeks
- Multi-tenancy: Custom build required
- SMS costs: Variable (Firebase: $0.06/verification)

#### With Rottay

| What You Get | Use Cases | Included |
|--------------|-----------|----------|
| Authentication | 80+ | Yes |
| Compliance (15 frameworks) | 138 | Yes |
| Feature Flags | 30+ | Yes |
| Permissions | 40+ | Yes |
| Multi-tenancy | 50+ | Yes |
| Notifications | 25+ | Yes |
| Navigation | 74 | Yes |
| Identity | 98 | Yes |
| **Total** | **500+ platform** | **One price** |

---

## Key Differentiators

### 1. Result<T> Everywhere
Every use case returns a typed Result. Never throws. Always predictable.
```typescript
const result = await login.execute(input, context);
if (result.isSuccess) { /* typed success */ }
if (result.isFailure) { /* typed error */ }
```

### 2. Multi-Tenancy Native
One parameter isolates everything. Impossible to leak data across tenants.
```typescript
await useCase.execute(input, { tenantId }); // That's it.
```

### 3. RBAC Built-In
Every use case inherits role and permission checks. Declare, don't implement.
```typescript
class CreateInvoice extends BaseUseCase {
  protected readonly requiredPermissions = ['invoices:create'];
  // Authorization is automatic
}
```

### 4. Domain Modules
Not just infrastructure. Complete business logic for recruiting, events, payments, and more.

### 5. Production-Tested
Running in production across multiple verticals. Not a framework. Real code.

---

## Content Strategy

### By Funnel Stage

| Stage | Content Type | Message Focus |
|-------|--------------|---------------|
| **Awareness** | Social, blog | The problem (vendor sprawl) |
| **Interest** | Landing page, videos | The solution (unified platform) |
| **Consideration** | Docs, comparisons | The proof (features, code) |
| **Decision** | Demo, pricing | The value (ROI, time savings) |

### By Format

| Format | Primary Audience | Key Message |
|--------|------------------|-------------|
| **Code snippets** | Developers | Simplicity, DX |
| **Comparison charts** | CTOs | Consolidation |
| **Compliance lists** | Enterprise | Coverage |
| **Video demos** | All | Visual proof |
| **Case studies** | Decision makers | Real results |

---

## Video Strategy

### Priority Videos

1. **Home Banner (40s)** - Hero video for website
2. **Developer Demo (2min)** - Code walkthrough
3. **Product Overview (60s)** - For all audiences
4. **Module Spotlights (30s each)** - Auth, Compliance, Tenancy

### Video Tone
- Dark, minimal aesthetic
- Black backgrounds, white text
- Copper/bronze accents
- Code-focused visuals
- No stock footage

---

## Competitive Positioning

### vs. Auth0 / Clerk
"Auth0 solves authentication. We solve authentication, compliance, tenancy, permissions, and everything else your B2B SaaS needs."

**Key attacks:**
- Auth0 had 4 outages in 2024
- Auth0 pricing is #1 developer complaint (34%)
- Clerk B2B org pricing compounds fast ($0.02/org/mo)
- Neither includes impossible travel detection (Auth0 charges extra)

### vs. Vanta / Drata
"Vanta tracks compliance. We implement compliance. 138 use cases, built into your codebase."

**Key attacks:**
- Vanta: 5 frameworks. Rottay: 15 frameworks.
- Audit fees are separate ($10K-$50K/year)
- Drata hidden costs: +20-35% for implementation
- Neither offers: KYC, AML, Gaming, Crypto, BIPA, AI Hiring

### vs. LaunchDarkly / Split
"LaunchDarkly is a feature flag service. We include feature flags as one of 15+ modules."

**Key attacks:**
- Per-seat pricing scales expensive (50 engineers = $1,000/mo)
- Split.io compounds faster ($33-$60/user/mo)
- Statsig has "surprise billing" risks
- We include feature flags at no additional cost

### vs. Azure AD B2C
"Azure AD B2C is being sunset. We're just getting started."

**Key attacks:**
- Being discontinued May 2025
- Customers need migration path NOW
- Major opportunity for direct outreach

### vs. Firebase Auth
"Firebase's SMS costs can hit $1,000s/month. We include notifications."

**Key attacks:**
- 100K SMS verifications = $6,000/month
- Hidden costs not in marketing
- We include multi-channel notifications

### vs. Building In-House
"3 years of infrastructure development. Ready to import. Maintained by us."

**Key stats:**
- 500,000+ lines of code
- 13,777 TypeScript files
- 9,013 test files (~65% coverage)
- 77 NPM packages

---

## Key Research Insights

1. **Auth0's pricing is the #1 complaint** - 34% of developers cite pricing concerns
2. **Azure AD B2C is being sunset** - Major migration opportunity (May 2025)
3. **Firebase SMS costs surprise users** - Hidden costs at scale create trust issues
4. **Vanta/Drata max 5-6 frameworks** - We have 15, covering specialized industries
5. **No competitor has Result<T> pattern** - Architectural differentiation
6. **No competitor offers domain modules** - Unique vertical integration
7. **LLM-as-Judge is unique** - AI hiring compliance differentiator
8. **AWS Cognito 3x price increase** - December 2025 creates migration urgency

---

## Brand Voice

### Tone
- Confident, not arrogant
- Technical, not jargon-heavy
- Direct, not aggressive
- Helpful, not salesy

### Do Say
- "We built..."
- "Import and use..."
- "Zero configuration..."
- "Production-tested..."

### Don't Say
- "Revolutionary..."
- "Best-in-class..."
- "Cutting-edge..."
- "Game-changing..."

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [COMPETITIVE-ANALYSIS.md](./COMPETITIVE-ANALYSIS.md) | 35+ competitor deep dive with pricing |
| [TCO-CALCULATOR.md](./TCO-CALCULATOR.md) | Cost comparison calculator |
| [PHRASES.md](./PHRASES.md) | 300+ marketing phrases by context |
| [CODE-SHOWCASE.md](./CODE-SHOWCASE.md) | Code examples for marketing |
| [VIDEO-PROMPTS.md](./VIDEO-PROMPTS.md) | AI prompts for video generation |
| [BANNER-40S-SCRIPT.md](./BANNER-40S-SCRIPT.md) | Home banner detailed script |

---

## Brand Assets

### Logos
- `rottay-bull-head.svg` - Primary (pixel sunglasses)
- `rottay-bull-full.svg` - Mascot (friendly)

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Background | #000000 | Primary |
| Text | #FFFFFF | Primary |
| Copper | #B87333 | Accent |
| Copper Glow | rgba(184,115,51,0.4) | Effects |

### Typography
- Display: Geist, Inter
- Code: Geist Mono, JetBrains Mono

---

## Launch Checklist

- [ ] Website hero with video
- [ ] Documentation site
- [ ] GitHub org setup
- [ ] Twitter/X presence
- [ ] LinkedIn company page
- [ ] Product Hunt prep
- [ ] Hacker News post
- [ ] Dev.to / Hashnode articles
- [ ] Discord community
- [ ] Email capture / waitlist
