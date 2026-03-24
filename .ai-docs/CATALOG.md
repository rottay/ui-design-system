# Rottay AI Documentation Catalog

> **Single Source of Truth for AI Agents**
>
> This catalog enables quick discovery of all use cases, entities, and patterns without reading code.

---

## Golden Rule

```
ALWAYS import from @rottay/core first
```

Before creating any type, error, utility, or pattern, check if it already exists in `@rottay/core`. 90% of what you need is already there.

---

## Quick Navigation Index

### By Type

| Type | Description | Link |
|------|-------------|------|
| **Core** | Base of everything, import first | [core/README.md](./core/README.md) |
| **Platform** | Auth, Identity, Tenancy, etc. | [platform/](#platform-modules) |
| **Domain Modules** | Business logic (dm-*) | [domain-modules/](#domain-modules-dm) |
| **Apps** | Web applications | [apps/](#apps) |
| **Design System** | UI Components | [design-system/COMPONENTS.md](./design-system/COMPONENTS.md) |

### By Vertical

| Vertical | Apps | Modules |
|----------|------|---------|
| **Platform** | app-platform, app-website | auth, identity, permissions, tenancy, compliance, feature-flags, navigation, notifications |
| **BitHire** | app-bithire | recruiter, scoring, ia-chat |
| **Evnto** | app-evnto | events, bar, staff, payments, web3 |

### Quick Search

| If you need to... | Go to... |
|-------------------|----------|
| Authenticate users | [auth/USE-CASES.md](./platform/auth/USE-CASES.md#user-auth) |
| OAuth/Social login | [auth/USE-CASES.md](./platform/auth/USE-CASES.md#oauth) |
| Passkeys/WebAuthn | [auth/USE-CASES.md](./platform/auth/USE-CASES.md#passkeys) |
| Enterprise SSO | [auth/USE-CASES.md](./platform/auth/USE-CASES.md#sso) |
| Manage users | [identity/USE-CASES.md](./platform/identity/USE-CASES.md#users) |
| User groups | [identity/USE-CASES.md](./platform/identity/USE-CASES.md#groups) |
| RBAC permissions | [permissions/USE-CASES.md](./platform/permissions/USE-CASES.md) |
| Multi-tenancy | [tenancy/USE-CASES.md](./platform/tenancy/USE-CASES.md) |
| KYC/AML compliance | [compliance/USE-CASES.md](./platform/compliance/USE-CASES.md) |
| Feature flags | [feature-flags/USE-CASES.md](./platform/feature-flags/USE-CASES.md) |
| Navigation/menus | [navigation/USE-CASES.md](./platform/navigation/USE-CASES.md) |
| Send notifications | [notifications/USE-CASES.md](./platform/notifications/USE-CASES.md) |
| Create candidate | [recruiter/USE-CASES.md](./domain-modules/recruiter/USE-CASES.md#candidate) |
| Schedule interview | [recruiter/USE-CASES.md](./domain-modules/recruiter/USE-CASES.md#interview) |
| Score with AI | [scoring/USE-CASES.md](./domain-modules/scoring/USE-CASES.md) |
| AI Chat agents | [ia-chat/USE-CASES.md](./domain-modules/ia-chat/USE-CASES.md) |
| AI provider pricing | [ia-chat/USE-CASES.md](./domain-modules/ia-chat/USE-CASES.md#pricing) |
| Purchase tokens | [recruiter/USE-CASES.md](./domain-modules/recruiter/USE-CASES.md#token-management) |
| Distribute tokens | [recruiter/USE-CASES.md](./domain-modules/recruiter/USE-CASES.md#token-management) |
| Create event | [events/USE-CASES.md](./domain-modules/events/USE-CASES.md) |
| Bar/POS orders | [bar/USE-CASES.md](./domain-modules/bar/USE-CASES.md) |
| Staff scheduling | [staff/USE-CASES.md](./domain-modules/staff/USE-CASES.md) |
| Process payment | [payments/USE-CASES.md](./domain-modules/payments/USE-CASES.md) |
| NFTs/Web3 | [web3/USE-CASES.md](./domain-modules/web3/USE-CASES.md) |
| UI components | [COMPONENTS.md](./design-system/COMPONENTS.md) |
| Multi-tenant theming | [COMPONENTS.md](./design-system/COMPONENTS.md#multi-tenant--white-labeling) |

---

## Quick Navigation

| Section | Description | Link |
|---------|-------------|------|
| **Architecture** | Mandatory project rules | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Architecture Audit** | Platform vs Bithire consistency | [ARCHITECTURE-AUDIT-2026-01.md](./docs/ARCHITECTURE-AUDIT-2026-01.md) |
| **Glossary** | Domain terminology | [GLOSSARY.md](./GLOSSARY.md) |
| **Core** | @rottay/core - Foundation | [core/README.md](./core/README.md) |
| **Platform** | Platform modules | [platform/](#platform-modules) |
| **Domain Modules** | Business modules (dm-*) | [domain-modules/](#domain-modules-dm) |
| **Apps** | Web applications | [apps/](#apps) |
| **Design System** | UI Components | [design-system/COMPONENTS.md](./design-system/COMPONENTS.md) |

---

## Platform Modules

| Module | Use Cases | Description | Link |
|--------|-----------|-------------|------|
| auth | 77 | OAuth, JWT, MFA, Sessions, SSO, Passkeys | [USE-CASES.md](./platform/auth/USE-CASES.md) |
| identity | 77 | Users, Groups, SCIM, B2B/B2C | [USE-CASES.md](./platform/identity/USE-CASES.md) |
| tenancy | 21 | Multi-tenancy, API Keys | [USE-CASES.md](./platform/tenancy/USE-CASES.md) |
| permissions | 33 | RBAC, Access Control | [USE-CASES.md](./platform/permissions/USE-CASES.md) |
| compliance | 141 | KYC, AML, GDPR, Healthcare | [USE-CASES.md](./platform/compliance/USE-CASES.md) |
| feature-flags | 29 | Feature Toggles, A/B Testing | [USE-CASES.md](./platform/feature-flags/USE-CASES.md) |
| navigation | 50 | Menus, Routes, Access Control | [USE-CASES.md](./platform/navigation/USE-CASES.md) |
| notifications | 31 | Email, SMS, Push, In-App | [USE-CASES.md](./platform/notifications/USE-CASES.md) |

**Total Platform Modules: 459 use cases**


---

## Domain Modules (dm-*)

| Module | Use Cases | Factories | Entities | Orchestrators | Link |
|--------|-----------|-----------|----------|---------------|------|
| recruiter | 134 | 134 | Candidate, Job, Application, Interview, Offer, Recruiter, Client, Position, Team, TeamSprint, HiringProcessTemplate, TeamTokenQuota, TeamTokenTransaction | 11 | [USE-CASES.md](./domain-modules/recruiter/USE-CASES.md) |
| ia-chat | 152 | 152 | Agent, Provider, Model, Config, Usage, Health, ApiKey, ProviderRate, PricingConfig, ConversationOutput, ProviderConfigSchema | 3 | [USE-CASES.md](./domain-modules/ia-chat/USE-CASES.md) |
| events | 83 | 83 | Event, Ticket, TicketType, Venue, Artist, Lineup, LiveSession, Waitlist, SeasonPass, ResaleListing, Stage, CheckIn, Tip +20 more | - | [USE-CASES.md](./domain-modules/events/USE-CASES.md) |
| bar | 76 | 76 | Product, ProductCategory, BarOrder, BarOrderItem, BarTip, PointOfSale, Stock, StockItem, StockLocation, StockAlert, Recipe, Supplier, Combo, PriceConfig | 4 | [USE-CASES.md](./domain-modules/bar/USE-CASES.md) |
| staff | 70 | 70 | StaffMember, Shift, ShiftAssignment, ShiftSwapRequest, TimeRecord, Credential, PayrollPeriod, Settlement | - | [USE-CASES.md](./domain-modules/staff/USE-CASES.md) |
| scoring | 53 | 53 | Rubric, Dimension, Scorecard, Calibration, Appeal, ProcessConfig, Embedding, ScoringJob, SkillGap, ProctoringEvent | - | [USE-CASES.md](./domain-modules/scoring/USE-CASES.md) |
| web3 | 46 | 46 | Wallet, Transaction, StakingPosition, PaymentSession, SessionKey, NFTBadge, NFTCertificate | - | [USE-CASES.md](./domain-modules/web3/USE-CASES.md) |
| payments | 20 | 20 | Payment, Subscription, Refund, Payout, IdempotencyKey | 8 | [USE-CASES.md](./domain-modules/payments/USE-CASES.md) |
| template | 6 | 6 | Product | - | [USE-CASES.md](./domain-modules/template/USE-CASES.md) |

**Total Domain Modules: 640 use cases, 640 zero-arg factories (100% coverage)**

---

## Apps

| App | Vertical | Modules Used | Link |
|-----|----------|--------------|------|
| app-platform | Platform | auth, permissions, tenancy, compliance | [README.md](./apps/platform/README.md) |
| app-bithire | BitHire | recruiter, scoring, ia-chat | [README.md](./apps/bithire/README.md) |
| app-evnto | Evnto | events, bar, staff, payments, web3 | [README.md](./apps/evnto/README.md) |

## Extensions

| Extension | Description |
|-----------|-------------|
| ext-bithire | Chrome Extension for LinkedIn recruiting (templates, outreach tracking, candidate matching) |

---

## Tooling & Infrastructure

| Repo | Description | Link |
|------|-------------|------|
| scripts | Development environment scripts (access-resilient) | [README.md](./tooling/scripts/README.md) |
| ui-remotion | Remotion video templates for marketing | [README.md](./tooling/ui-remotion/README.md) |

---

## Marketing

> **Index:** [marketing/README.md](./marketing/README.md) - Guia completa de que y donde buscar

### Core (`marketing/core/`)
| Document | Description | Link |
|----------|-------------|------|
| Marketing Strategy | Master document with verified numbers | [core/MARKETING-STRATEGY.md](./marketing/core/MARKETING-STRATEGY.md) |
| Competitive Analysis | 35+ competitor deep dive with pricing | [core/COMPETITIVE-ANALYSIS.md](./marketing/core/COMPETITIVE-ANALYSIS.md) |
| Feature Matrix | Hyper-detailed feature-by-feature comparison | [core/FEATURE-MATRIX.md](./marketing/core/FEATURE-MATRIX.md) |
| Use Cases Overview | All 1,077+ use cases summarized by module | [core/USE-CASES-OVERVIEW.md](./marketing/core/USE-CASES-OVERVIEW.md) |
| Phrases | 300+ marketing phrases by context and audience | [core/PHRASES.md](./marketing/core/PHRASES.md) |

### Sales (`marketing/sales/`)
| Document | Description | Link |
|----------|-------------|------|
| Battlecards | Sales battlecards for 8 major competitors | [sales/BATTLECARDS.md](./marketing/sales/BATTLECARDS.md) |
| Migration Guides | Step-by-step migration from competitors | [sales/MIGRATION-GUIDES.md](./marketing/sales/MIGRATION-GUIDES.md) |
| TCO Calculator | Cost comparison calculator | [sales/TCO-CALCULATOR.md](./marketing/sales/TCO-CALCULATOR.md) |
| Demo Scripts | Scripts for live sales demos | [sales/DEMO-SCRIPTS.md](./marketing/sales/DEMO-SCRIPTS.md) |
| FAQ | Comprehensive sales Q&A | [sales/FAQ.md](./marketing/sales/FAQ.md) |
| Objection Database | Detailed objection handling | [sales/OBJECTION-DATABASE.md](./marketing/sales/OBJECTION-DATABASE.md) |
| Vertical Messaging | Industry-specific messaging | [sales/VERTICAL-MESSAGING.md](./marketing/sales/VERTICAL-MESSAGING.md) |
| Outreach Templates | Email/LinkedIn templates | [sales/OUTREACH-TEMPLATES.md](./marketing/sales/OUTREACH-TEMPLATES.md) |
| Win/Loss Template | Track competitive wins and losses | [sales/WIN-LOSS-TEMPLATE.md](./marketing/sales/WIN-LOSS-TEMPLATE.md) |

### SEO (`marketing/seo/`)
| Document | Description | Link |
|----------|-------------|------|
| Keywords Analysis | SEO keyword strategy | [seo/KEYWORDS-ANALYSIS.md](./marketing/seo/KEYWORDS-ANALYSIS.md) |
| Comparison Pages | Copy for "Rottay vs X" pages | [seo/COMPARISON-PAGES.md](./marketing/seo/COMPARISON-PAGES.md) |
| Pricing Page | Copy for pricing page | [seo/PRICING-PAGE.md](./marketing/seo/PRICING-PAGE.md) |

### Research (`marketing/research/`)
| Document | Description | Link |
|----------|-------------|------|
| Review Mining | Competitor complaints from G2, Reddit, HN | [research/REVIEW-MINING.md](./marketing/research/REVIEW-MINING.md) |
| Pricing History | Timeline of competitor pricing changes | [research/PRICING-HISTORY.md](./marketing/research/PRICING-HISTORY.md) |
| Competitor Sources | Where to monitor competitors | [research/COMPETITOR-SOURCES.md](./marketing/research/COMPETITOR-SOURCES.md) |

### Content (`marketing/content/`)
| Document | Description | Link |
|----------|-------------|------|
| Developer Marketing | DX-focused messaging for developers | [content/DEVELOPER-MARKETING.md](./marketing/content/DEVELOPER-MARKETING.md) |
| Code Comparison | Side-by-side code vs competitors | [content/CODE-COMPARISON.md](./marketing/content/CODE-COMPARISON.md) |
| Code Showcase | Code examples for videos and marketing | [content/CODE-SHOWCASE.md](./marketing/content/CODE-SHOWCASE.md) |
| Blog Post Ideas | Developer blog content ideas | [content/BLOG-POST-IDEAS.md](./marketing/content/BLOG-POST-IDEAS.md) |
| Podcast Talking Points | Talking points for podcast appearances | [content/PODCAST-TALKING-POINTS.md](./marketing/content/PODCAST-TALKING-POINTS.md) |
| Conference Talking Points | Materials for conference talks | [content/CONFERENCE-TALKING-POINTS.md](./marketing/content/CONFERENCE-TALKING-POINTS.md) |
| Video Prompts | AI prompts for video generation | [content/VIDEO-PROMPTS.md](./marketing/content/VIDEO-PROMPTS.md) |
| Banner Script | 40s home banner detailed script | [content/BANNER-40S-SCRIPT.md](./marketing/content/BANNER-40S-SCRIPT.md) |

### Enterprise (`marketing/enterprise/`)
| Document | Description | Link |
|----------|-------------|------|
| Security Whitepaper | Technical security documentation | [enterprise/SECURITY-WHITEPAPER.md](./marketing/enterprise/SECURITY-WHITEPAPER.md) |
| Analyst Relations Kit | Materials for Gartner/Forrester | [enterprise/ANALYST-RELATIONS-KIT.md](./marketing/enterprise/ANALYST-RELATIONS-KIT.md) |
| Case Study Template | Template for customer success stories | [enterprise/CASE-STUDY-TEMPLATE.md](./marketing/enterprise/CASE-STUDY-TEMPLATE.md) |

### Press (`marketing/press/`)
| Document | Description | Link |
|----------|-------------|------|
| Press Kit | Materials for media coverage | [press/PRESS-KIT.md](./marketing/press/PRESS-KIT.md) |
| Social Proof Collection | System for testimonials | [press/SOCIAL-PROOF-COLLECTION.md](./marketing/press/SOCIAL-PROOF-COLLECTION.md) |
| Investor Slides | Competitive slides for investors | [press/INVESTOR-SLIDES.md](./marketing/press/INVESTOR-SLIDES.md) |

### Brand Assets
| Asset | Description | Location |
|-------|-------------|----------|
| Bull Head Logo | Primary logo with pixel sunglasses | `ui-remotion/src/assets/rottay-bull-head.svg` |
| Bull Full Body | Mascot without sunglasses | `ui-remotion/src/assets/rottay-bull-full.svg` |

### Key Numbers (For Marketing)
- **Total Use Cases:** 1,099+
- **Platform Modules:** 8 (459 use cases)
- **Domain Modules:** 9 (640 use cases, 640 zero-arg factories)
- **Compliance Frameworks:** 15+

---

## How to Find a Use Case

1. **Identify the module** from the tables above
2. **Go to USE-CASES.md** for that module
3. **Use the Quick Index** at the top of each file
4. **Search by name** (CreateXxx, GetXxx, ListXxx, etc.)

### Example

> "I need to create a candidate in the recruiting module"

1. Module: `recruiter`
2. File: [domain-modules/recruiter/USE-CASES.md](./domain-modules/recruiter/USE-CASES.md)
3. Section: [#candidate](./domain-modules/recruiter/USE-CASES.md#candidate)
4. Use case: `create` -> `CreateCandidateUC`

---

## Structure by Vertical

### Platform (Infrastructure)
- **Apps**: `app-platform` (sole API server) + `app-website`
- **Packages**: `platform/packages/` (shared @rottay/* modules only -- no standalone API server)
- **Modules**: auth, identity, permissions, tenancy, compliance, feature-flags, navigation, notifications

### BitHire (Recruiting)
- **App**: `app-bithire`
- **Domain Modules**:
  - [dm-recruiter](./domain-modules/recruiter/USE-CASES.md) - Complete ATS
  - [dm-scoring](./domain-modules/scoring/USE-CASES.md) - LLM-as-Judge
  - [dm-ia-chat](./domain-modules/ia-chat/USE-CASES.md) - AI Chat

### Evnto (Events & Ticketing)
- **App**: `app-evnto`
- **Domain Modules**:
  - [dm-events](./domain-modules/events/USE-CASES.md) - Event management
  - [dm-bar](./domain-modules/bar/USE-CASES.md) - Bar and inventory
  - [dm-staff](./domain-modules/staff/USE-CASES.md) - Staff scheduling
  - [dm-payments](./domain-modules/payments/USE-CASES.md) - Payments
  - [dm-web3](./domain-modules/web3/USE-CASES.md) - NFTs and tokens

---

## Templates

- [USE-CASE-TEMPLATE.md](./templates/USE-CASE-TEMPLATE.md) - Template for documenting use cases
- [CLAUDE-MD-TEMPLATE.md](./templates/CLAUDE-MD-TEMPLATE.md) - Template for project CLAUDE.md files

---

## Update Rule

When modifying a use case:
1. Update `.ai-docs/domain-modules/{module}/USE-CASES.md`
2. Follow the standard template format
3. Include description for each use case
4. Keep class names using `UC` suffix abbreviation
