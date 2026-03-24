# Investor Deck Content

Competitive and market slides for investor presentations.

---

## Slide: The Problem

### Headline
"Every B2B SaaS Rebuilds the Same Infrastructure"

### Content
Every B2B SaaS company builds the same foundation:
- Authentication (login, MFA, SSO)
- Multi-tenancy (workspaces, data isolation)
- Compliance (SOC 2, HIPAA, GDPR)
- Permissions (RBAC, ABAC)
- Feature flags (rollouts, experiments)
- Notifications (email, push, in-app)

**Visual:** Stack of vendor logos arranged in chaotic pile (Auth0, Vanta, LaunchDarkly, Permit.io, OneSignal, Nile)

**Speaker notes:** "Before any company can build their unique product, they spend months assembling infrastructure from disparate vendors. This is the tax every B2B SaaS pays."

---

## Slide: The Pain

### Headline
"6+ Vendors. $30K+/Year. 6 Months to Integrate."

### Content
| Metric | Reality |
|--------|---------|
| Vendors needed | 6-10 |
| Annual cost | $27,880+ |
| Integration time | 3-6 months |
| SDKs to maintain | 6+ |
| Security surfaces | 6+ |
| Support tickets | 6+ queues |

**Cost breakdown:**
- Auth0: $4,200-$10,560/year
- Vanta: $9,000-$15,000/year
- LaunchDarkly: $4,000-$9,600/year
- Permit.io: $1,680-$6,000/year
- Others: $5,000+/year

**Visual:** Calculator showing vendor costs stacking up

**Speaker notes:** "And this is just the direct cost. The real cost is the 3-6 months of engineering time before you can write a single feature."

---

## Slide: The Solution

### Headline
"One Platform. 1,000+ Use Cases. 1 SDK."

### Content
Rottay replaces the entire infrastructure vendor stack with a single, unified platform.

**Before:** 6 vendors, 6 SDKs, 6 billing relationships, 6 security surfaces
**After:** 1 platform, 1 SDK, 1 relationship, 1 security surface

**Visual:** Animation of 6 vendor boxes consolidating into single Rottay box

**Speaker notes:** "We built what every B2B SaaS needs. Not a point solution - the whole foundation."

---

## Slide: What We Built

### Headline
"17 Modules. 1,023+ Use Cases."

### Content

**Platform Modules (8):**
| Module | Use Cases | Replaces |
|--------|-----------|----------|
| Auth | 150+ | Auth0, Clerk |
| Identity | 80+ | Custom code |
| Compliance | 200+ | Vanta, Drata |
| Tenancy | 60+ | Nile, custom |
| Permissions | 120+ | Permit.io |
| Feature Flags | 90+ | LaunchDarkly |
| Navigation | 40+ | Custom code |
| Notifications | 100+ | OneSignal |

**Domain Modules (9):**
Recruiter, Events, Bar, Staff, Payments, Scoring, IA-Chat, Web3, and more

**Visual:** Module diagram showing interconnected platform and domain modules

**Speaker notes:** "Every use case is production-ready, documented, and tested. This isn't a framework - it's implemented business logic."

---

## Slide: Technical Moat

### Headline
"3 Years of Development. 500,000+ Lines of Code."

### Content
| Metric | Value |
|--------|-------|
| Lines of code | 500,000+ |
| TypeScript files | 13,777 |
| Test coverage | 65% |
| NPM packages | 77 |
| Use cases | 1,023+ |
| Compliance frameworks | 15 |

**Architecture highlights:**
- Result<T> types - no exceptions in business logic
- Multi-tenancy at the core, not bolted on
- Domain-driven design with 17 bounded contexts
- Every use case returns typed, predictable results

**Visual:** Code snippet showing Result type pattern

**Speaker notes:** "This isn't a weekend project. This is 3 years of full-time development, building the infrastructure layer the right way."

---

## Slide: Competitive Landscape

### Headline
"Fragmented Market. Consolidation Opportunity."

### Content
| Category | Incumbents | Their Limitation | Rottay Advantage |
|----------|------------|------------------|------------------|
| Auth | Auth0, Clerk | Auth only, pricing complaints | Full auth + 16 more modules |
| Compliance | Vanta, Drata | Tracks, doesn't implement | Implements 15 frameworks in code |
| Flags | LaunchDarkly | Per-seat pricing | Unlimited seats, per-tenant |
| Permissions | Permit.io | MAU pricing | Flat pricing |
| Tenancy | Nile | Database only | Full-stack tenancy |

**Visual:** Positioning map with:
- Y-axis: Breadth of solution (point vs. platform)
- X-axis: Depth of implementation (tracking vs. implemented)
- Rottay in upper-right quadrant

**Speaker notes:** "Every incumbent solves one piece. We're the only ones solving the whole puzzle."

---

## Slide: Why Now

### Headline
"The Market is Ready"

### Content

**Forced migrations:**
- Azure AD B2C sunset (May 2025) - millions of apps need new auth
- AWS Cognito 3x price increase (December 2025)

**Market pain:**
- 34% of Auth0 customers cite pricing as main complaint
- Average B2B SaaS uses 6-10 infrastructure vendors
- Compliance burden increasing (GDPR, state laws, AI regulations)

**Developer sentiment:**
- "Vendor fatigue" trending on HN, Reddit
- Growing preference for unified solutions
- Backlash against per-seat and MAU pricing

**Visual:** Timeline showing Azure AD B2C sunset and Cognito price increase

**Speaker notes:** "The next 12 months will see the largest auth migration event in history. We're positioned to capture it."

---

## Slide: Go-to-Market

### Headline
"Land with Developers. Expand with Enterprise."

### Content

**Phase 1: Developer Acquisition**
- Developer-first content (docs, tutorials, open source)
- Migration tools (Auth0, Clerk, Cognito, Azure AD B2C)
- Free tier for indie developers
- Developer community building

**Phase 2: Startup Growth**
- Self-serve signup with immediate value
- Compliance-driven upsell (SOC 2, HIPAA)
- Vertical-specific packages (Fintech, Healthcare, HR Tech)

**Phase 3: Enterprise Expansion**
- SSO and enterprise auth requirements
- Custom compliance frameworks
- Dedicated support and SLAs
- Professional services

**Visual:** Funnel showing dev -> startup -> enterprise progression

**Speaker notes:** "Developers choose the tools. We win developers with DX, then expand with enterprise features."

---

## Slide: Pricing Strategy

### Headline
"Simple, Predictable, Fair"

### Content

**Pricing principles:**
- No per-seat pricing (vs. LaunchDarkly)
- No MAU pricing (vs. Auth0, Permit.io)
- Per-tenant/workspace model
- Predictable scaling costs

**Competitive advantage:**
| Vendor | Pricing Model | At Scale Problem |
|--------|---------------|------------------|
| Auth0 | Per MAU | 10K users = $10K/year |
| LaunchDarkly | Per seat | 50 devs = $9,600/year |
| Permit.io | Per MAU | Unpredictable costs |
| Rottay | Per tenant | Flat, predictable |

**Speaker notes:** "Our customers know exactly what they'll pay at 10x scale. That's rare in this market."

---

## Slide: Traction

### Headline
"[X] Customers. [X] ARR. [X]% MoM Growth."

### Content
[Insert actual metrics when available]

**Key metrics:**
- ARR: $[X]
- Customers: [X]
- Monthly growth: [X]%
- NRR: [X]%
- Logo retention: [X]%

**Notable customers:**
[Customer logos when available]

**Visual:** Growth chart showing MRR over time

**Speaker notes:** "[Specific traction story and customer wins]"

---

## Slide: Team

### Headline
"[X] Years Combined Experience in B2B Infrastructure"

### Content

**[Founder/CEO Name]**
- [Previous role and company]
- [Relevant achievement]
- [Why this problem]

**[Other key team members]**
- [Same format]

**Team highlights:**
- [X] years combined B2B SaaS experience
- Built infrastructure at [notable companies]
- [X] successful exits / [X] products shipped

**Visual:** Team headshots with brief credentials

**Speaker notes:** "We've built this infrastructure 3 times before. This time, we productized it."

---

## Slide: The Ask

### Headline
"Raising $[X] to [Primary Goals]"

### Content

**Use of funds:**
| Category | Allocation | Purpose |
|----------|------------|---------|
| Engineering | [X]% | Complete platform, enterprise features |
| Go-to-market | [X]% | Developer marketing, content, community |
| Compliance | [X]% | SOC 2 Type II, additional certifications |
| Team | [X]% | Key hires in [roles] |

**12-month goals:**
- [X] customers
- [X] ARR
- [X] key enterprise features
- [X] compliance certifications

**Visual:** Simple pie chart of fund allocation

**Speaker notes:** "This round gets us to [milestone], positioning us for [next milestone]."

---

## Appendix Slides

### Appendix A: Market Size

**TAM: $XX Billion**
Global B2B SaaS infrastructure spend
- Authentication: $X billion
- Compliance: $X billion
- Feature management: $X billion
- Other infrastructure: $X billion

**SAM: $XX Billion**
Companies actively using 3+ infrastructure vendors
- Mid-market SaaS: $X billion
- Startups with compliance needs: $X billion
- Enterprise modernization: $X billion

**SOM: $XX Million**
Year 1 realistic capture
- Migration targets (Auth0, Cognito): $X million
- New startups choosing unified: $X million
- Word of mouth / organic: $X million

---

### Appendix B: Financial Projections

[If appropriate to share]

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| ARR | $[X] | $[X] | $[X] |
| Customers | [X] | [X] | [X] |
| Team size | [X] | [X] | [X] |
| Gross margin | [X]% | [X]% | [X]% |

---

### Appendix C: Product Roadmap

**Q1 2025:**
- [Feature/milestone]
- [Feature/milestone]

**Q2 2025:**
- [Feature/milestone]
- [Feature/milestone]

**H2 2025:**
- [Feature/milestone]
- [Feature/milestone]

---

### Appendix D: Customer Logos

[Insert customer logos when available]

"Trusted by [X] companies including:"
[Logo grid]

---

### Appendix E: Competitive Deep Dive

**Auth0 Vulnerabilities:**
- 4 outages in 2024
- 34% pricing complaints
- Complex pricing tiers
- Actions/flows limitations

**Vanta Vulnerabilities:**
- Only 5 frameworks
- Doesn't implement controls
- Evidence collection manual
- No multi-tenancy

**LaunchDarkly Vulnerabilities:**
- Per-seat pricing
- Limited to feature flags
- No auth integration
- Enterprise-only features

---

### Appendix F: Technical Architecture

[Architecture diagram]

**Key technical decisions:**
- TypeScript end-to-end
- Result<T> for all business logic
- Multi-tenant from day one
- Domain-driven design
- 77 NPM packages for modularity
