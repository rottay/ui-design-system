# Rottay Use Cases Overview

> **1,023+ use cases across 17 modules. Everything your B2B SaaS needs.**

This document provides a comprehensive overview of every module in the Rottay platform. Each module is production-ready, thoroughly tested, and designed to work seamlessly with the others.

---

## Quick Stats

| Category | Modules | Use Cases | Orchestrators |
|----------|---------|-----------|---------------|
| Platform | 8 | 447 | - |
| Domain | 9 | 576+ | 25+ |
| **Total** | **17** | **1,023+** | **25+** |

---

## Why These Numbers Matter

Most SaaS platforms start with 50-100 use cases and grow over years. Rottay ships with **1,000+ use cases** on day one. That means:

- **No building from scratch** - Authentication, billing, compliance? Already done.
- **No integration headaches** - Every module shares the same patterns.
- **No multi-tenancy afterthoughts** - Every use case is tenant-aware by design.

---

# Platform Modules (447 Use Cases)

Platform modules provide the infrastructure layer that every SaaS application needs. They handle authentication, identity, permissions, compliance, and more.

---

## Auth Module (67 Use Cases)

> **From password to passkey. From basic to biometric.**

The Auth module handles everything authentication: user registration, login flows, multi-factor authentication, OAuth integrations, enterprise SSO (SAML), passwordless authentication (Passkeys), and SCIM provisioning.

| Category | Use Cases | Highlights |
|----------|-----------|------------|
| **User Authentication** | 10 | Login, register, password change, MFA enable/disable, password reset |
| **Sessions** | 4 | Create, refresh, revoke, logout with full device tracking |
| **Auth Tokens** | 8 | Magic links, password reset tokens, generic tokens, email verification |
| **OAuth & Social** | 3 | Initiate flow, handle callback, register provider (Google, GitHub, Microsoft, Apple) |
| **Passkeys & WebAuthn** | 5 | Registration challenge, register, auth challenge, authenticate, remove |
| **Enterprise SSO** | 5 | SAML connections: create, update, delete, initiate login, handle response |
| **SCIM Provisioning** | 4 | Token management, user/group request handling |
| **Security** | 6 | Risk evaluation, impossible travel detection, password breach checking, policy enforcement |
| **Secrets** | 1 | JWT secret rotation |
| **Queries** | 21 | User methods, sessions, OAuth providers, passkeys, SSO connections, SCIM tokens, login history, security analytics |

**Standout Capabilities:**

- **Impossible Travel Detection** - Flag logins from impossible geographic locations
- **Risk-Based MFA** - Automatically require MFA for suspicious login attempts
- **Password Breach Checking** - Validate passwords against known breaches via HaveIBeenPwned
- **Admin Impersonation** - Full audit trail when admins act as users for support

---

## Identity Module (98 Use Cases)

> **Users, profiles, groups, and organizations. B2B and B2C in one module.**

The Identity module manages all user identity concerns including user profiles, groups, organizational units, and service accounts. Full support for B2B (enterprise) and B2C (consumer) identity patterns.

| Category | Use Cases | Highlights |
|----------|-----------|------------|
| **User Management** | 5 | Create, update, update email, activate, deactivate |
| **Groups** | 10 | Create, update, delete, add/remove members, sync membership, list, get members |
| **Admin Units** | 5 | Organizational hierarchy with member management |
| **B2B/B2C** | 3 | Guest invitations, guest-to-member conversion |
| **Bulk Operations** | 8 | Bulk create, update, delete, activate, deactivate, import, group membership |
| **SCIM 2.0** | 8 | Full directory sync with enterprise providers |
| **Service Accounts** | 4 | M2M authentication with credential rotation |
| **Profile Merging** | 3 | Link identities, unlink, merge duplicate profiles |
| **Profile Ops** | 3 | Enrichment, normalization, validation |
| **Profile Mastering** | 2 | Attribute source management, conflict resolution |
| **Webhooks** | 2 | Event processing, retry failed deliveries |
| **Queries** | 45 | Users, groups, admin units, guests, advanced search, SCIM, service accounts, privacy exports |

**Standout Capabilities:**

- **Profile Merging** - Merge duplicate user profiles across identity providers
- **SCIM 2.0 Directory Sync** - Full enterprise directory integration (Azure AD, Okta, Google Workspace)
- **Service Accounts** - First-class M2M authentication for integrations
- **GDPR Export** - Built-in user data export and DPIA report generation

---

## Compliance Module (138 Use Cases)

> **15 regulatory frameworks. Zero consultants.**

The Compliance module provides a comprehensive framework for regulatory compliance across multiple domains and jurisdictions. From KYC/AML to GDPR, HIPAA to AI hiring laws.

| Framework | Use Cases | Coverage |
|-----------|-----------|----------|
| **KYC** | 25 | Verification sessions, document upload, manual review, watchlist screening, officer assignment |
| **AML** | 10 | Transaction recording, risk analysis, alert management, SAR filing |
| **GDPR** | 12 | Consent management, DSAR, portability, right to erasure, LIA, ROPA |
| **HIPAA/Healthcare** | 9 | PHI records, access logging, breach reporting, HHS notification, risk assessment |
| **Gaming** | 15 | Betting/deposit limits, self-exclusion, reality checks, session tracking, licensing |
| **Crypto/MiCA** | 8 | Travel Rule, wallet screening, VASP management, MiCA authorization |
| **Banking/PSD2** | 8 | Open Banking consent (AISP/PISP), SCA challenges, DORA incident reporting |
| **AI Hiring** | 8 | Bias audits, candidate consent, opt-out handling, compliance checks |
| **BIPA** | 6 | Biometric consent, revocation, destruction logging, compliance reports |
| **Breach Management** | 3 | Data breach reporting, authority notification |
| **Consumer Privacy** | 4 | CCPA/CPRA consent and privacy rights |
| **HR/Employment** | 8 | Background checks, worker classification, FCRA adverse action |
| **Insurance** | 4 | Claims, distribution, solvency reporting |
| **Legal** | 3 | Legal ethics, trust accounting |
| **Securities** | 6 | SEC reporting, MiFID II, crowdfunding compliance |

**Standout Capabilities:**

- **15 Regulatory Frameworks** - Competitors typically support 5-6
- **LLM-as-Judge for AI Hiring** - Automated bias audits with human calibration
- **Automatic PII/PHI/PCI Classification** - Built-in DLP (Data Loss Prevention)
- **DSAR Automation** - Streamlined data subject access requests

---

## Tenancy Module (17 Use Cases)

> **Multi-tenancy in one parameter: { tenantId }**

The Tenancy module provides complete multi-tenant infrastructure. Every operation is automatically scoped to the tenant.

| Category | Use Cases | Highlights |
|----------|-----------|------------|
| **Tenant Management** | 5 | Create, update, create company, data residency, user assignment |
| **API Keys** | 4 | Generate, revoke, rotate, update scopes |
| **Workflows** | 2 | Bulk provisioning, orchestrated setup |
| **Queries** | 6 | Get tenant, list companies, user assignments, list/validate API keys, analytics |

**Standout Capabilities:**

- **Automatic Data Isolation** - Architecturally impossible to leak data across tenants
- **Data Residency** - Configure EU, US, or other regions per tenant
- **Tenant Tiers** - Free/Starter (shared DB) to Enterprise (dedicated DB)
- **Company Hierarchies** - Multiple companies within a single tenant

---

## Permissions Module (14 Use Cases)

> **RBAC that's built-in, not bolted-on.**

Role-Based Access Control built into the architecture. Permissions are checked automatically via decorators.

| Category | Use Cases | Highlights |
|----------|-----------|------------|
| **Authorization** | 4 | Create permission, create role, assign role permissions, assign user roles |
| **Impersonation** | 1 | Start impersonation with full audit trail |
| **Queries** | 9 | Validate access, bulk check, list permissions/roles, get user roles, audit log, impersonation status/history |

**Standout Capabilities:**

- **Decorator Pattern** - `@Authorize({ permissions: ['resource:action'] })` on any use case
- **Bulk Permission Checking** - Check multiple permissions in one call
- **Impersonation Audit** - Complete trail when admins act as users

---

## Feature Flags Module (8 Use Cases)

> **Feature flags without the flag service.**

Built-in feature flags with percentage rollouts, user targeting, and A/B testing. No external service required.

| Category | Use Cases | Highlights |
|----------|-----------|------------|
| **Features** | 3 | Create definition, update settings, create targeting rules |
| **Analytics** | 1 | Track feature usage |
| **Queries** | 4 | Get definition, get settings, evaluate rules, get usage statistics |

**Standout Capabilities:**

- **Percentage Rollouts** - Gradual feature releases (10%, 25%, 50%, 100%)
- **User/Tenant Targeting** - Enable for specific users or tenants
- **Scheduled Releases** - Time-based feature activation
- **Usage Analytics** - Track which features are actually used

---

## Navigation Module (74 Use Cases)

> **Menus, routes, access control. All managed.**

The Navigation module provides comprehensive navigation infrastructure with hierarchical menus, route definitions, policy-based authorization, favorites, and history tracking.

| Category | Use Cases | Highlights |
|----------|-----------|------------|
| **Menus** | 9 | Create, update, delete, archive, publish, clone, move branch, feature flags, translations |
| **Routes** | 3 | Create, update, delete |
| **Menu Roles** | 2 | Assign/revoke role from menu |
| **Menu Routes** | 2 | Link/unlink menu from route |
| **Route Policies** | 3 | Create, update, delete access policies |
| **Policy Roles** | 2 | Assign/revoke role from policy |
| **Policy Permissions** | 2 | Assign/revoke permission from policy |
| **Favorites** | 3 | Add, remove, reorder user favorites |
| **History** | 2 | Record visits, clear history |
| **Version History** | 1 | Rollback menu to previous version |
| **Queries** | 45 | Menus, routes, roles, policies, access checks, favorites, history, versions, cache stats, breadcrumbs |

**Standout Capabilities:**

- **Menu Versioning** - Snapshot and rollback navigation changes
- **Per-Tenant Customization** - Different menus per tenant
- **Permission-Filtered Trees** - Only show menus user can access
- **Built-in Caching** - Performance optimized with invalidation

---

## Notifications Module (31 Use Cases)

> **Email, SMS, push, in-app, webhooks. One interface.**

Multi-channel notification system with templates, user preferences, and delivery tracking.

| Category | Use Cases | Highlights |
|----------|-----------|------------|
| **Notifications** | 6 | Send, batch, schedule, cancel, process scheduled, resend failed |
| **Templates** | 3 | Create, update, delete with variable substitution |
| **Preferences** | 4 | Update preferences, register/remove push token, unsubscribe |
| **In-App** | 3 | Mark read, mark all read, archive |
| **Webhooks** | 1 | Process provider webhooks |
| **Providers** | 1 | Configure notification providers |
| **Queries** | 13 | Get/list notifications, delivery status/stats, templates, preferences, in-app, analytics, provider health |

**Standout Capabilities:**

- **Multi-Channel** - Email (SendGrid/SES), SMS (Twilio), Push (Firebase/APNS), In-App, Webhooks
- **Template Variables** - User, tenant, and custom data substitution
- **Delivery Tracking** - Track delivery, opens, clicks, bounces
- **Provider Failover** - Automatic fallback when primary provider fails

---

# Domain Modules (576+ Use Cases)

Domain modules implement specific business logic for different verticals. They build on top of platform modules and integrate seamlessly with each other.

---

## Recruiter Module (87 Use Cases + 11 Orchestrators)

> **Complete ATS infrastructure. AI-powered hiring.**

A full Applicant Tracking System (ATS) for managing the entire hiring lifecycle from job posting to offer acceptance.

| Entity | Use Cases | Coverage |
|--------|-----------|----------|
| **Application** | 15 | Create, update, submit, withdraw, advance stage, reject, score, add note, assign recruiter, queries |
| **Candidate** | 13 | Create, update, archive, merge, do-not-contact, experience, education, skills, search |
| **Interview** | 13 | Schedule, reschedule, cancel, start, complete, feedback, AI sessions, templates |
| **Job** | 12 | Create, update, publish, pause, close, reactivate, duplicate, queries with metrics |
| **Offer** | 8 | Create, update, send, approve, accept, decline, negotiate, withdraw |
| **Recruiter** | 7 | Create, update, deactivate, assign to job, workload queries |
| **Analytics** | 5 | Hiring analytics, pipeline analytics, recruiter performance, source effectiveness, time-to-hire |
| **Other** | 14 | Approvals, clients, positions, scoped team metrics |

**Orchestrators:** Job Publishing, Application Pipeline, Interview Scheduling, Offer Management, AI Interview, Candidate Engagement, Hiring Process, Notifications, Analytics, Token Management

**Standout Capabilities:**

- **AI-Powered Interviews** - Automated candidate screening with LLM evaluation
- **Configurable Pipelines** - Custom stages per job or company
- **Source Tracking** - Know which channels deliver the best candidates
- **Time-to-Hire Metrics** - Track and optimize hiring velocity

---

## Events Module (100 Use Cases)

> **From intimate gatherings to massive festivals. Same codebase.**

Complete event lifecycle management and ticketing operations. Handles venues, lineups, tickets, waitlists, resale, live sessions, and more.

| Entity | Use Cases | Coverage |
|--------|-----------|----------|
| **Event** | 7 | Create, update, publish, cancel, get by ID/slug, list |
| **Venue** | 4 | Create, update, get, list |
| **Artist** | 4 | Create, update, get, list |
| **Lineup/Stage** | 4 | Create and update lineups and stages |
| **Ticket Type** | 5 | Create, update, delete, get, list by event |
| **Ticket** | 7 | Purchase, transfer, cancel, check-in, get by ID/QR, list by owner |
| **Check-In** | 3 | Get by ID, list by event, get statistics |
| **Waitlist** | 7 | Create, join, leave, presale codes, list entries, get position, validate codes |
| **Resale** | 5 | Create listing, purchase, cancel, get by ID, list by event |
| **Season Pass** | 7 | Create, purchase, transfer, use, get, list, check eligibility |
| **Live Session** | 10 | Create, start, end, messages, song requests, tips, get active, list messages/requests |
| **Media** | 5 | Upload, moderate, react, list by event, list pending |
| **Analytics** | 8 | Dashboard, snapshots, predictions, benchmarks, actual recording |
| **Finance** | 6 | Budget creation/approval, expense creation/approval, summaries |
| **Zone Capacity** | 1 | Get capacity by event |

**Standout Capabilities:**

- **QR Code Check-In** - Fast entry with real-time statistics
- **Resale Marketplace** - Controlled secondary ticket market
- **Season Passes** - Multi-event passes with eligibility verification
- **Live Tipping** - Real-time tips during performances
- **Event Predictions** - AI-powered attendance and sales forecasting

---

## Bar Module (81 Use Cases + 4 Orchestrators)

> **POS and inventory for hospitality. From single bar to venue chain.**

Complete bar operations and inventory management including orders, products, POS terminals, stock tracking, recipes, and supplier management.

| Entity | Use Cases | Coverage |
|--------|-----------|----------|
| **Bar Order** | 11 | Create, cancel, pay, start preparing, mark ready, confirm pickup, get by ID/number/QR, queue, list user orders |
| **Bar Tip** | 1 | Add tip to order |
| **Product** | 9 | Create, update, delete, set availability, get by ID/category, list, search, get catalog |
| **Product Category** | 2 | Create, update |
| **Combo** | 1 | Create product combo |
| **Point of Sale** | 8 | Create, update, open, close, pause, get by ID, list, get stats |
| **Recipe** | 3 | Create, update, get by ID |
| **Stock** | 4 | Adjust, reserve, release, transfer |
| **Stock Item** | 5 | Create, update, delete, list, get levels |
| **Stock Location** | 2 | Create, update |
| **Stock Alert** | 4 | Acknowledge, resolve, get low stock alerts |
| **Supplier** | 6 | Create, update, delete, set status, get, list |
| **Purchase Order** | 12 | Create, update, submit, approve, reject, cancel, mark ordered, add/remove items, get, list, pending approval |
| **Goods Receipt** | 5 | Create, update, get, list, list by purchase order |
| **Price Config** | 1 | Create pricing configuration |

**Orchestrators:** Order, Inventory, Pricing, Purchase Order

**Standout Capabilities:**

- **Recipe-Based Stock Deduction** - Automatic inventory updates per order
- **Multi-Location Inventory** - Track stock across venues
- **Dynamic Pricing** - Event-based or time-based pricing rules
- **Purchase Order Workflow** - Full approval and receiving process

---

## Staff Module (68 Use Cases)

> **Workforce management. Scheduling to payroll.**

Comprehensive personnel management for events and venues including profiles, skills, certifications, shifts, time tracking, credentials, and payroll.

| Entity | Use Cases | Coverage |
|--------|-----------|----------|
| **Staff Member** | 14 | Create, update, status, availability, skills, certifications, evaluations, get, list |
| **Scheduling** | 14 | Create/update/delete shift, assign, unassign, confirm, start, swap requests, get schedule/shifts |
| **Staffing** | 12 | Requirements, assignments, confirmations, invitations, get by event |
| **Time Tracking** | 7 | Check-in, check-out, breaks, get status/records |
| **Credentials** | 9 | Generate, activate, revoke, suspend, zone access, validate, get by staff/event |
| **Payroll** | 12 | Calculate, generate settlement, approve, process, record payment, bonuses, deductions, summaries |

**Standout Capabilities:**

- **Shift Swap Workflow** - Staff-initiated swaps with approval
- **Zone Access Control** - Credential-based access to restricted areas
- **Automatic Payroll Calculation** - Hours, rates, bonuses, deductions
- **Certification Tracking** - Verify required certifications haven't expired

---

## Scoring Module (44 Use Cases)

> **LLM-as-Judge with human calibration.**

AI-powered evaluation system for scoring candidates, call center interactions, sales pitches, and more. Supports multiple industries with configurable rubrics.

| Entity | Use Cases | Coverage |
|--------|-----------|----------|
| **Rubric** | 12 | Create, update, clone, publish, archive, add/update/reorder/remove dimensions, get, list by industry |
| **Scoring** | 4 | Score with LLM, submit human score, approve, batch score |
| **Scorecard** | 5 | Get by ID/scorable, list, get with evidence, get analytics |
| **Calibration** | 7 | Create session, submit sample, complete, calculate metrics, get, list, get samples |
| **Appeal** | 3 | Create, resolve, list |
| **Fraud** | 5 | Check similarity (plagiarism), record proctoring event, review, get events, get suspicious scorables |
| **Analytics** | 2 | Analyze skill gaps, get skill gaps |
| **Process** | 4 | Create process config, create scorable, get config, list configs |
| **Embeddings** | 1 | Find similar answers |

**Standout Capabilities:**

- **Multi-Dimensional Rubrics** - Evaluate across multiple criteria with weights
- **Human-AI Calibration** - Align LLM scores with human judgment
- **Evidence Extraction** - Automatic supporting evidence for each score
- **Plagiarism Detection** - Similarity checking across submissions
- **Industry Templates** - Pre-built rubrics for recruiting, call center, healthcare, sales, education

---

## IA-Chat Module (160+ Use Cases + 3 Orchestrators)

> **AI agent infrastructure. Every provider, one interface.**

The most complex domain module. Unified interface for AI-powered chat, voice, and transcription across multiple providers with fallback orchestration.

| Entity | Use Cases | Coverage |
|--------|-----------|----------|
| **Agent** | 12 | Create, update, delete, duplicate, set default, versioning, get, list, count |
| **API Key** | 3 | Create, rotate, revoke |
| **Chat** | 8 | Send message, streaming, thinking mode, code execution, capabilities, models, deployments |
| **Config** | 15 | Create, update, delete, priority, get by ID/tenant/provider, primary, fallbacks, exists, count, summary |
| **Provider** | 16 | Create, update, delete, activate, deactivate, set default, get by ID/code, list active/by type, stats |
| **Model** | 15 | Create, update, delete, deprecate, get by ID/external ID, list by provider/chat/STT, voices, search |
| **Batch** | 7 | Create batch calls (OpenAI, Anthropic, Groq), get status/results, list, cancel |
| **Transcription** | 4 | Transcribe with PII redaction, Groq transcribe, auto highlights |
| **Voice** | 8 | Synthesize (TTS), transcribe (STT), translate, isolate voice, sound effects, batch, voice library |
| **Phone** | 9 | Initiate, end, transfer, hold, mute, get status, recording, transcript, list calls |
| **Conversation** | 3 | Start, end, get status |
| **Knowledge** | 2 | Create knowledge base, create for Retell |
| **Document/OCR** | 2 | Process PDF, extract text from images |
| **Dubbing** | 1 | Create audio/video dubbing |
| **Intelligence** | 2 | Summarize transcript, extract action items |
| **OpenAI** | 4 | Files, images (DALL-E), moderation, batch |
| **Quota** | 3 | Consume, reset, upsert |
| **Usage** | 9 | Record, get summary, trend, cost breakdown, current quota, estimate cost, list |
| **Health** | 11 | Record check, update circuit, check available, get provider health, all health, summary, circuit state, history, availability, list unhealthy/open circuits |
| **Squad** | 1 | Create agent squad |
| **Project** | 1 | Create audio project |

**Orchestrators:** Fallback, Provider Selection, Session

**Supported Providers:**
- **Chat:** OpenAI (GPT-4), Anthropic (Claude), Mistral, Groq, Together AI, Replicate
- **Voice:** ElevenLabs (TTS), Deepgram (STT), AssemblyAI (STT), Retell (Voice AI)

**Standout Capabilities:**

- **Automatic Fallback** - Provider switching when primary is unavailable
- **Circuit Breakers** - Prevent cascade failures
- **Agent Versioning** - Track and rollback agent configurations
- **Knowledge Bases** - RAG-enabled document retrieval
- **Phone Integration** - AI-powered phone calls with transcription
- **Quota Management** - Usage tracking and cost estimation per tenant

---

## Payments Module (22 Use Cases + 7 Orchestrators)

> **Payment infrastructure without the headache.**

Unified interface for payment processing, subscriptions, refunds, payouts, and crypto transactions across multiple providers.

| Entity | Use Cases | Coverage |
|--------|-----------|----------|
| **Payment** | 6 | Create, update status, capture, cancel, get, list |
| **Subscription** | 5 | Create, update, pause, resume, cancel |
| **Refund** | 2 | Create, get |
| **Payout** | 1 | Create payout to third party |
| **Crypto** | 5 | On-ramp, off-ramp, get supported assets, get quote |
| **Provider** | 1 | Get available providers |

**Orchestrators:** Payment, Subscription, Refund, Payout, Crypto, Fallback, Provider Operation

**Supported Providers:** Stripe, PayPal, MercadoPago, MoonPay, Transak

**Standout Capabilities:**

- **Provider-Agnostic** - Same API regardless of payment provider
- **Automatic Fallback** - Switch providers if primary fails
- **Crypto On/Off Ramp** - Fiat to crypto and back
- **LatAm Support** - MercadoPago integration for Latin America

---

## Web3 Module (49 Use Cases)

> **NFTs, wallets, staking, and blockchain integration.**

Blockchain integration for tokens, NFTs, staking, and crypto payments. Supports multiple chains and wallet types.

| Entity | Use Cases | Coverage |
|--------|-----------|----------|
| **Token** | 7 | Deploy ERC-20, mint, burn, transfer, approve, get balance, get by company |
| **NFT** | 10 | Deploy collection, mint badge/certificate, burn, transfer, verify, get badges/certificates by wallet |
| **Staking** | 9 | Deploy pool, configure tiers, stake, unstake, claim rewards, compound, get pool stats/position, list pools |
| **Transaction** | 4 | Submit, retry, cancel, get history |
| **Wallet** | 10 | Create custodial, create smart wallet (AA), link external, deactivate, set primary, verify, get by ID/user/company, balances |
| **Payment** | 3 | Create on-ramp/off-ramp session, handle webhook |
| **Session Key** | 2 | Create, revoke (for gasless transactions) |
| **Analytics** | 3 | Holder distribution, staking metrics, transaction volume |

**Supported Chains:** Ethereum, Polygon, Arbitrum, Optimism, Base, Avalanche

**Standout Capabilities:**

- **Smart Wallets (Account Abstraction)** - Improved UX with gasless transactions
- **NFT Badges & Certificates** - Verifiable credentials on-chain
- **Staking Pools** - Configurable tiers with reward distribution
- **Session Keys** - Temporary keys for better UX

---

# The Rottay Difference

## Every Use Case Returns Result<T>

No exceptions. No try-catch gymnastics. Just typed success or typed failure.

```typescript
const result = await useCase.execute(input, { tenantId });

if (result.isSuccess) {
  const user = result.value;  // Fully typed
}

if (result.isFailure) {
  const error = result.error;  // Typed error with code
}
```

---

## Multi-Tenancy is Automatic

Every query, every mutation, every operation is automatically scoped to the tenant. It's architecturally impossible to leak data across tenants.

```typescript
// Every use case execution includes tenant context
await useCase.execute(input, { tenantId });

// Data isolation is enforced at the repository level
// No manual filtering required
```

---

## RBAC is Built-In

Permissions are declared on use cases. Authorization happens automatically.

```typescript
class CreateInvoice extends BaseUseCase {
  protected readonly requiredPermissions = ['invoices:create'];

  async execute(input: Input, context: TenantContext) {
    // Only executes if user has the permission
    // No manual checking required
  }
}
```

---

## Full Audit Trail

Every operation is logged. Who did what, when, and from where.

```typescript
// Built into BaseUseCase
// Automatic logging of:
// - userId, tenantId
// - operation name
// - input (sanitized)
// - result (success/failure)
// - timestamp
// - IP address (from context)
```

---

# Want to See More?

Each module has detailed documentation with:

- Complete use case list with inputs/outputs
- Code examples
- Entity relationships
- Integration patterns

See the [full documentation catalog](../CATALOG.md).

---

## Module Quick Reference

| Module | Use Cases | Primary Purpose |
|--------|-----------|-----------------|
| **auth** | 67 | OAuth, JWT, MFA, Sessions, SSO, Passkeys |
| **identity** | 98 | Users, Groups, SCIM, B2B/B2C |
| **compliance** | 138 | KYC, AML, GDPR, HIPAA, Gaming, Crypto, AI Hiring |
| **tenancy** | 17 | Multi-tenancy, API Keys, Data Residency |
| **permissions** | 14 | RBAC, Access Control, Impersonation |
| **feature-flags** | 8 | Feature Toggles, A/B Testing, Rollouts |
| **navigation** | 74 | Menus, Routes, Policies, Versioning |
| **notifications** | 31 | Email, SMS, Push, In-App, Webhooks |
| **recruiter** | 87 | ATS, Candidates, Jobs, Interviews, Offers |
| **events** | 100 | Events, Tickets, Venues, Live Sessions |
| **bar** | 81 | POS, Inventory, Orders, Recipes, Suppliers |
| **staff** | 68 | Scheduling, Time Tracking, Payroll, Credentials |
| **scoring** | 44 | LLM-as-Judge, Rubrics, Calibration |
| **ia-chat** | 160+ | AI Agents, Chat, Voice, Phone, Transcription |
| **payments** | 22 | Payments, Subscriptions, Refunds, Crypto |
| **web3** | 49 | NFTs, Tokens, Staking, Wallets |

---

*Last updated: 2026-01-29*
