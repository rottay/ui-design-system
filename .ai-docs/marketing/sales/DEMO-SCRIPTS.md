# Sales Demo Scripts

> Detailed scripts for live sales demonstrations. Each demo is structured with timing, talking points, and "wow moments" to maximize impact.
> Last updated: January 2026

---

## Pre-Demo Checklist

### Environment Setup
- [ ] Demo environment running (localhost or staging)
- [ ] Database seeded with realistic sample data (Acme Corp, TechStart Inc, etc.)
- [ ] Browser tabs ready:
  - Demo app
  - Competitor pricing pages (Auth0, Vanta, LaunchDarkly)
  - Auth0 status page (show outage history)
  - Code editor with Rottay examples
- [ ] Terminal ready for live coding
- [ ] Screen sharing configured (hide notifications)

### Sample Data Ready
- [ ] Test users with different roles (admin, manager, viewer)
- [ ] Multiple tenants to show isolation
- [ ] Feature flags configured (some on, some off)
- [ ] Compliance data (audit logs, DSAR request)
- [ ] Notifications configured

### Competitor Comparison Tabs
- [ ] Auth0 pricing calculator (show MAU scaling)
- [ ] Vanta pricing page (note audit fees separate)
- [ ] LaunchDarkly pricing (show per-seat math)
- [ ] Clerk pricing (show org pricing trap)

---

## Demo 1: The 5-Minute Overview

**For:** First call, discovery meeting, executive overview
**Duration:** 5 minutes
**Goal:** Create interest, qualify next steps

### Flow

#### Minute 1: Problem Statement (Vendor Sprawl)

**Script:**
> "Let me show you something. [Share screen with a typical SaaS stack diagram]
>
> This is what most B2B SaaS companies end up with: Auth0 for authentication - $9,600/year. Vanta for compliance - $10,000/year plus audit fees. LaunchDarkly for feature flags - $2,400/year. Permit.io for permissions - $1,800/year. Custom multi-tenancy - months of engineering. Plus notifications, audit logging...
>
> Six vendors. Six SDKs. Six support queues. Six security surfaces. And you're still writing the glue code to make them work together."

**Pause for reaction. Look for nods or concerns.**

#### Minute 2: Quick Platform Tour

**Script:**
> "Rottay replaces all of this. [Switch to demo app]
>
> One platform. 1,023 use cases. Everything you need for B2B SaaS infrastructure.
>
> [Click through quickly]
> - Auth: 80+ use cases including impossible travel detection, profile merging
> - Compliance: 15 frameworks, not just the 5 Vanta offers
> - Feature flags: Per-tenant, per-user, no seat pricing
> - Permissions: Built into every operation
> - Multi-tenancy: One parameter and data isolation is automatic"

**Keep this high-level. Don't dive deep yet.**

#### Minute 3: Code Example (3 Lines vs 50)

**Script:**
> "Here's what actually matters. [Switch to code editor]
>
> Auth0 integration: 45 lines across 4 files.
> [Show Auth0 code briefly]
>
> Rottay:
> ```typescript
> const login = makeLoginUseCase();
> const result = await login.execute({ email, password }, { tenantId });
> ```
>
> Three lines. Authentication. Multi-tenant. Audit logged. Done.
>
> Same pattern for everything. Compliance, permissions, notifications. Learn once, use everywhere."

**WOW MOMENT:** Show the code side-by-side if time permits.

#### Minute 4: TCO Snapshot

**Script:**
> "Quick math. [Pull up TCO calculator]
>
> Typical stack: $27,880/year minimum. Plus 8-12 weeks of integration.
>
> Rottay: All-inclusive. 1-2 weeks integration.
>
> That's the infrastructure cost. The real savings is engineering time - your team building features instead of plumbing."

#### Minute 5: Q&A Hooks

**Close with these questions:**

> "What's your current auth solution? Are you seeing the pricing surprises everyone talks about?"
>
> "What compliance frameworks do you need? The standard five, or specialized ones like KYC, AML, gaming?"
>
> "How is your team handling multi-tenancy today? Custom code?"

**Goal:** Identify pain points to focus the next conversation.

### Objections During Demo

| Objection | Response |
|-----------|----------|
| "We already have Auth0" | "Many of our customers migrated from Auth0. The most common reasons: pricing surprises when they scaled, outage concerns - 4 in 2024 - and missing features like profile merging. We offer a migration path." |
| "This seems too good to be true" | "Fair. Let me show you the actual code. [Pull up repository stats] 500K lines. 65% test coverage. 3 years of development. This is real software." |
| "What about [specific feature]?" | "Great question. Let me show you exactly how that works in the next demo." |

---

## Demo 2: Auth Deep Dive (vs Auth0/Clerk)

**For:** Technical evaluation, security review
**Duration:** 15-20 minutes
**Goal:** Prove auth capability, highlight differentiators

### Pre-Demo Setup
- Auth0 status page open (status.auth0.com/history)
- Auth0 pricing calculator open
- Clerk pricing page open (show org pricing)
- Terminal ready with Rottay auth examples

### Flow

#### Section 1: Login Flow (3 minutes)

**Script:**
> "Let's start with the basics. Login. [Open terminal]
>
> ```typescript
> import { makeLoginUseCase } from '@rottay/auth';
>
> const login = makeLoginUseCase();
> const result = await login.execute({ email, password }, { tenantId });
>
> if (result.isOk()) {
>   // result.value.session, result.value.user
> } else {
>   // result.error - typed, not a string
> }
> ```
>
> Three things to notice:
> 1. `{ tenantId }` - every operation is automatically scoped to a tenant
> 2. `result.isOk()` - no exceptions, typed errors
> 3. Audit log created automatically - who logged in, when, from where"

**Run the code live. Show the session created.**

#### Section 2: OAuth Setup (3 minutes)

**Script:**
> "[Show OAuth provider configuration]
>
> Adding Google OAuth:
> ```typescript
> const oauth = makeInitiateOAuthUseCase();
> await oauth.execute({ provider: 'google' }, { tenantId });
> ```
>
> That's it. No redirect URIs to configure in Auth0's dashboard. No client IDs to manage per provider. The use case handles the flow.
>
> We support Google, GitHub, Microsoft, Apple, LinkedIn - all the standard providers. Plus SAML and OIDC for enterprise SSO."

**WOW MOMENT:** Show that SSO is included, not a $15K/year add-on like Auth0.

#### Section 3: MFA Configuration (3 minutes)

**Script:**
> "MFA in two lines:
> ```typescript
> const mfa = makeConfigureMFAUseCase();
> await mfa.execute({ userId, method: 'totp' }, { tenantId });
>
> // Or SMS
> await mfa.execute({ userId, method: 'sms', phone: '+1...' }, { tenantId });
> ```
>
> SMS, TOTP, email codes - all included. Auth0 charges for some of these on lower tiers."

**Show MFA enrollment in the demo app.**

#### Section 4: Impossible Travel Detection (4 minutes)

**Script:**
> "Here's something Auth0 charges extra for. [Show feature]
>
> ```typescript
> const check = makeDetectSuspiciousLoginUseCase();
> const result = await check.execute({
>   userId,
>   ipAddress,
>   userAgent,
>   timestamp
> }, { tenantId });
>
> // result.value.risk: 'low' | 'medium' | 'high'
> // result.value.reason: 'impossible_travel' | 'new_device' | etc.
> ```
>
> User logs in from New York at 2pm. Same user logs in from Tokyo at 2:30pm? That's physically impossible travel. We flag it automatically.
>
> Auth0 charges extra for this. It's included with every Rottay plan."

**WOW MOMENT:** Run a demo showing a flagged login.

#### Section 5: Profile Merging (3 minutes)

**Script:**
> "This is unique to Rottay. No competitor offers this.
>
> Your user signs up with Google. Later, they try to sign up with GitHub using the same email. What happens?
>
> Auth0: Duplicate accounts. Manual merge process.
> Clerk: Duplicate accounts.
> Rottay:
> ```typescript
> const merge = makeMergeProfilesUseCase();
> await merge.execute({
>   primaryUserId,
>   secondaryUserId,
>   strategy: 'keep_primary_data'
> }, { tenantId });
> ```
>
> Federated identity linking. One user, multiple providers. Automatic or manual merge options."

**WOW MOMENT:** This is unique. Emphasize no competitor offers this.

### Talking Points Against Auth0

| Topic | Point |
|-------|-------|
| **Outages** | "Pull up status.auth0.com/history. 4 major outages in 2024. When auth goes down, your entire app goes down. We had zero." |
| **Pricing** | "34% of developers cite Auth0 pricing as their top concern. Let me show you why. [Pull up pricing calculator] 50K MAU? That's $240/month on Professional. And that doesn't include impossible travel detection." |
| **SSO Tax** | "SAML/SSO connections? Auth0 charges per connection on lower tiers. We include unlimited SSO connections." |
| **Okta Acquisition** | "Since the Okta acquisition, support quality has declined. Check the Reddit threads. Our support is direct access to the engineering team." |

### Talking Points Against Clerk

| Topic | Point |
|-------|-------|
| **Org Pricing** | "Clerk looks cheap until you're B2B. $0.02/MAU plus $0.02/org/month. 50K users + 100 orgs = $2K/month. Just for auth." |
| **No Multi-Tenancy** | "Clerk handles auth. You still build multi-tenancy yourself. We include { tenantId } everywhere." |
| **Component Lock-in** | "Clerk's pre-built components are great until you need customization. Then you're stuck or rebuilding." |

---

## Demo 3: Compliance Deep Dive (vs Vanta)

**For:** Compliance-focused buyers, regulated industries
**Duration:** 20-25 minutes
**Goal:** Show implementation vs tracking, framework breadth

### Pre-Demo Setup
- Vanta pricing info ready (note audit fees separate)
- Framework comparison chart ready
- DSAR demo request queued
- Audit report generator ready

### Flow

#### Section 1: Framework Comparison (5 minutes)

**Script:**
> "Let's talk frameworks. [Show comparison table]
>
> | Framework | Vanta | Rottay |
> |-----------|-------|--------|
> | SOC 2 | Yes | Yes |
> | ISO 27001 | Yes | Yes |
> | HIPAA | Yes | Yes |
> | PCI-DSS | Yes | Yes |
> | GDPR | Yes | Yes |
> | CCPA/CPRA | Limited | Yes |
> | **BIPA** | No | **Yes** |
> | **KYC** | No | **Yes** |
> | **AML** | No | **Yes** |
> | **MiCA (Crypto)** | No | **Yes** |
> | **AI Hiring (EEOC)** | No | **Yes** |
> | **Gaming** | No | **Yes** |
>
> Vanta: 5 frameworks. Rottay: 15 frameworks.
>
> If you're in fintech (KYC/AML), gaming (responsible gaming), or using AI in hiring (EEOC/BIPA), Vanta doesn't cover you."

**Pause. Ask:** "Which frameworks do you need?"

#### Section 2: GDPR DSAR in Code (5 minutes)

**Script:**
> "Here's the fundamental difference. Vanta tracks compliance. We implement it.
>
> GDPR Article 15: Data Subject Access Request. User wants their data.
>
> Vanta: You get a ticket. Your team builds the export.
>
> Rottay:
> ```typescript
> const dsar = makeProcessDSARUseCase();
> const result = await dsar.execute({
>   userId,
>   requestType: 'access',
>   format: 'json'
> }, { tenantId });
>
> // result.value contains all user data, ready for export
> ```
>
> Article 17: Right to erasure? Same pattern:
> ```typescript
> const deletion = makeProcessDSARUseCase();
> await deletion.execute({
>   userId,
>   requestType: 'deletion',
>   retainAuditLogs: true  // Required for compliance
> }, { tenantId });
> ```
>
> The use case handles data collection, PII identification, secure export. Compliance is code, not a checklist."

**WOW MOMENT:** Run the DSAR request live. Show the data export.

#### Section 3: KYC/AML (5 minutes)

**Script:**
> "If you're doing anything with money - fintech, crypto, payments - you need KYC/AML.
>
> Vanta doesn't have this. You'd need a separate vendor.
>
> ```typescript
> const kyc = makeVerifyIdentityUseCase();
> const result = await kyc.execute({
>   userId,
>   verificationType: 'document',
>   documentType: 'passport'
> }, { tenantId });
>
> const aml = makeScreenAgainstSanctionsUseCase();
> await aml.execute({
>   userId,
>   lists: ['OFAC', 'UN', 'EU']
> }, { tenantId });
> ```
>
> Identity verification. Sanctions screening. Transaction monitoring. All in the platform."

**If prospect is in fintech, spend more time here.**

#### Section 4: Audit Trails (5 minutes)

**Script:**
> "Every use case in Rottay automatically creates an audit log.
>
> ```typescript
> // This happens automatically on every execute():
> // - Who did it (userId from context)
> // - What changed (automatic diff)
> // - When (timestamp)
> // - From where (IP, user agent)
> // - Immutable storage
> ```
>
> Generate a compliance report:
> ```typescript
> const report = makeGenerateAuditReportUseCase();
> await report.execute({
>   period: 'Q4-2025',
>   framework: 'SOC2',
>   outputFormat: 'pdf'
> }, { tenantId });
> ```
>
> Auditors love this. Evidence collection that used to take weeks happens in seconds."

**WOW MOMENT:** Generate a real audit report live.

### Talking Points Against Vanta

| Topic | Point |
|-------|-------|
| **Audit Fees** | "Vanta's $7,500/year doesn't include audit fees. That's $10K-$50K additional. Our platform fee includes everything." |
| **Implementation Gap** | "Vanta shows you what's compliant. You still have to implement the controls. Our 138 compliance use cases ARE the implementation." |
| **Framework Limits** | "5 frameworks vs our 15. If you need KYC, AML, gaming, or AI hiring compliance, Vanta can't help." |
| **Tracking vs Building** | "Vanta is a compliance tracking tool. We're a compliance implementation platform. They're complementary, but we do the hard part." |

---

## Demo 4: Multi-Tenancy Deep Dive

**For:** B2B SaaS technical teams, architects
**Duration:** 20-25 minutes
**Goal:** Show automatic isolation, dedicated DB capability

### Pre-Demo Setup
- Two tenant accounts ready (Acme Corp, TechStart Inc)
- Both logged in different browser profiles
- Database query tool ready to show isolation
- Dedicated DB provisioning ready for enterprise demo

### Flow

#### Section 1: { tenantId } Isolation (5 minutes)

**Script:**
> "Multi-tenancy is the hardest thing to retrofit. Build it wrong early, and you're rewriting your entire data layer later.
>
> Every Rottay use case takes a context object:
> ```typescript
> await useCase.execute(input, { tenantId });
> ```
>
> That single parameter does everything:
> - Query filtering (all reads scoped to tenant)
> - Data insertion (tenantId added automatically)
> - Audit logging (tenant context preserved)
> - Feature flags (per-tenant evaluation)
> - Permissions (tenant-scoped roles)
>
> Cross-tenant data leaks are architecturally impossible. You can't accidentally query another tenant's data because the context is enforced at the use case layer."

**Show code that demonstrates the automatic filtering.**

#### Section 2: Side-by-Side Tenant Demo (5 minutes)

**Script:**
> "Let me show you this live. [Open two browser profiles]
>
> Browser 1: Logged in as admin@acmecorp.com
> Browser 2: Logged in as admin@techstart.com
>
> [Create a user in Acme Corp]
>
> See? Only appears in Acme Corp. TechStart can't see it. Same database, automatic isolation.
>
> [Show the database query]
>
> Every row has a tenantId. Every query includes WHERE tenantId = ?. But you never write that code - the platform handles it."

**WOW MOMENT:** Show the same UI with different data based on tenant.

#### Section 3: Dedicated DB Provisioning (5 minutes)

**Script:**
> "Some enterprise customers require dedicated databases. HIPAA, SOC 2 with specific controls, data residency requirements.
>
> ```typescript
> const provision = makeProvisionDedicatedDatabaseUseCase();
> await provision.execute({
>   tenantId,
>   region: 'eu-west-1',  // Data residency
>   configuration: {
>     encryption: 'AES-256',
>     backupRetention: '7-years'
>   }
> }, { adminContext });
> ```
>
> One API call. We provision a dedicated PostgreSQL instance, run migrations, update routing. The tenant's data moves to their own database.
>
> No other multi-tenancy solution offers this. Nile has virtual tenants. We have virtual tenants AND dedicated databases."

**Show the provisioning process if time permits.**

#### Section 4: Data Residency (5 minutes)

**Script:**
> "GDPR requires EU data stays in EU. Some customers need US-only. Some need specific regions.
>
> ```typescript
> const residency = makeConfigureDataResidencyUseCase();
> await residency.execute({
>   tenantId,
>   primaryRegion: 'eu-west-1',
>   allowedRegions: ['eu-west-1', 'eu-central-1'],
>   blockRegions: ['*']  // Deny all others
> }, { tenantId });
> ```
>
> Data residency configuration per tenant. Enforced at the platform level. Your application code doesn't change."

#### Section 5: API Key Management (3 minutes)

**Script:**
> "B2B SaaS means API access for your customers.
>
> ```typescript
> const key = makeCreateAPIKeyUseCase();
> const result = await key.execute({
>   name: 'Production Integration',
>   permissions: ['read:users', 'write:users'],
>   expiresIn: '90d',
>   rateLimit: { requests: 1000, period: '1h' }
> }, { tenantId });
>
> // result.value.key (show once, store hash)
> // result.value.keyId (for management)
> ```
>
> Per-tenant API keys. Scoped permissions. Rate limiting. Expiration. All built in."

---

## Demo 5: Full Platform (Enterprise)

**For:** Enterprise evaluation committees, 45-minute demo slot
**Duration:** 45 minutes
**Goal:** Comprehensive capability demonstration, justify platform investment

### Agenda (Share with Attendees)

| Time | Topic |
|------|-------|
| 0-5 min | Platform overview and problem statement |
| 5-15 min | Authentication and identity |
| 15-25 min | Compliance and security |
| 25-35 min | Multi-tenancy and permissions |
| 35-40 min | Feature flags, notifications, integration |
| 40-45 min | Q&A and next steps |

### Flow

#### Opening (5 minutes)

**Script:**
> "Thank you all for joining. Before we dive in, I want to understand what matters most to your team.
>
> [Quick poll]
> - Who's focused on the auth/identity piece?
> - Who's here for compliance?
> - Who cares most about the multi-tenancy story?
> - Who wants to see the developer experience?
>
> Great. I'll make sure to cover those areas in depth.
>
> [Show stack diagram]
>
> The challenge: Building B2B SaaS infrastructure means assembling 6+ vendors, integrating 6+ SDKs, and maintaining 6+ relationships. We've built a unified platform that replaces all of this."

#### Auth Section (10 minutes)

Cover:
- Login flow (3 lines)
- OAuth providers
- Enterprise SSO (SAML/OIDC)
- MFA options
- Impossible travel detection
- Profile merging
- Admin impersonation

**Key talking points:**
> "Auth0 had 4 outages in 2024. We had zero."
> "SSO is included, not a $15K add-on."
> "Profile merging is unique - no competitor offers federated identity linking."

#### Compliance Section (10 minutes)

Cover:
- 15 frameworks comparison
- GDPR DSAR in code
- Automatic audit trails
- KYC/AML capabilities
- Compliance report generation

**Key talking points:**
> "Vanta tracks compliance. We implement it."
> "138 compliance use cases, not a dashboard."
> "KYC, AML, gaming, AI hiring - frameworks Vanta doesn't offer."

#### Multi-Tenancy Section (10 minutes)

Cover:
- { tenantId } automatic isolation
- Side-by-side tenant demo
- Dedicated database provisioning
- Data residency configuration
- API key management

**Key talking points:**
> "Cross-tenant data leaks are architecturally impossible."
> "Dedicated databases for enterprise customers - one API call."
> "Data residency enforcement at the platform level."

#### Additional Capabilities (5 minutes)

Cover:
- Feature flags (per-tenant, no seat pricing)
- Permissions (RBAC built into every use case)
- Notifications (multi-channel, no per-message fees)
- Navigation (menu versioning, tenant customization)

**Key talking points:**
> "LaunchDarkly charges per seat. We don't."
> "Every notification channel - SMS, email, push, webhooks - included."

#### Q&A and Next Steps (5 minutes)

**Close with:**
> "What questions do you have?
>
> [After Q&A]
>
> Here are typical next steps:
> 1. Technical deep dive with your engineering team
> 2. POC in your environment (2 weeks)
> 3. Migration planning session if moving from Auth0/Vanta
>
> Which of these makes sense as a next step?"

---

## "Wow Moments" Checklist

Hit at least 3 of these in every demo:

| Moment | Demo | Impact |
|--------|------|--------|
| 3 lines vs 45 lines | Code comparison | Developer excitement |
| Auth0 outage history | Status page | Trust/reliability |
| Profile merging | Unique feature | Differentiation |
| Impossible travel included | vs Auth0 pricing | Value proposition |
| 15 vs 5 frameworks | Compliance comparison | Breadth |
| DSAR in one call | Live demo | Implementation vs tracking |
| Side-by-side tenant isolation | Live demo | Security confidence |
| Dedicated DB provisioning | Architecture | Enterprise readiness |
| $27,880 vs included | TCO | Business case |

---

## Objection Handling During Demos

### "We already use [Competitor]"

| Competitor | Response |
|------------|----------|
| Auth0 | "Many customers migrate from Auth0 due to pricing surprises and the 4 outages in 2024. We offer a migration path that preserves existing sessions." |
| Clerk | "Clerk is great for getting started. Where companies outgrow it: B2B org pricing compounds, no multi-tenancy, zero compliance frameworks." |
| Vanta | "Vanta is complementary - they track, we implement. Our 138 compliance use cases reduce what Vanta needs to track by 80%." |
| LaunchDarkly | "LaunchDarkly is excellent at feature flags. The question: should flags be a separate $1K+/month line item? Ours are included and tenant-aware." |

### "This seems like a lot to migrate"

**Response:**
> "Migration concern is valid. Here's our approach:
> 1. Run in parallel - your existing stack stays live
> 2. Migrate one capability at a time (usually auth first)
> 3. We provide migration scripts for common paths (Auth0, Firebase, Azure AD B2C)
> 4. Typical timeline: 1-2 weeks for auth, 1-2 weeks for each additional module"

### "What if you go away?"

**Response:**
> "Fair concern with any vendor. Three things:
> 1. We use standard tech - PostgreSQL, TypeScript, REST APIs. No proprietary languages.
> 2. Your data is always yours - export anytime in standard formats
> 3. Every use case returns Result<T> - standard patterns, not magic"

### "We need to evaluate more options"

**Response:**
> "Absolutely. I'd suggest a POC to evaluate properly. Two weeks, your environment, real requirements. You'll know for sure. Want me to set that up?"

---

## Demo Environment Quick Reference

### Sample Accounts

| Tenant | Email | Password | Role |
|--------|-------|----------|------|
| Acme Corp | admin@acmecorp.demo | Demo123! | Super Admin |
| Acme Corp | manager@acmecorp.demo | Demo123! | Manager |
| TechStart | admin@techstart.demo | Demo123! | Super Admin |

### Feature Flags Pre-Configured

| Flag | Acme Corp | TechStart |
|------|-----------|-----------|
| new-dashboard | ON | OFF |
| beta-reports | OFF | ON |
| enterprise-sso | ON | ON |

### Sample Data

- 50 users per tenant
- 100 audit log entries
- 1 pending DSAR request
- 3 compliance reports generated

---

## Related Documents

| Document | Description |
|----------|-------------|
| [FAQ.md](./FAQ.md) | Common questions and answers |
| [OBJECTION-DATABASE.md](./OBJECTION-DATABASE.md) | Full objection handling |
| [../BATTLECARDS.md](../BATTLECARDS.md) | Competitor battlecards |
| [../CODE-COMPARISON.md](../CODE-COMPARISON.md) | Code examples for demos |
| [../TCO-CALCULATOR.md](../TCO-CALCULATOR.md) | Cost comparison data |
