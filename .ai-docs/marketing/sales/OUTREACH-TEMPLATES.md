# Outreach Templates

> Ready-to-use templates for sales and marketing outreach.

---

## Urgent: Azure AD B2C Migration

### Email 1: Initial Outreach

**Subject:** Azure AD B2C sunset - migration path

**Body:**

Hi [First Name],

I noticed [Company] is using Azure AD B2C for authentication. Microsoft announced they're discontinuing external identity services in May 2025.

That's less than 6 months to migrate your entire auth stack.

We built Rottay specifically for B2B SaaS companies facing this exact transition. Unlike Auth0 (which had 4 major outages in 2024) or Clerk (where B2B org pricing compounds fast), we offer:

- 80+ authentication use cases (password, OAuth, SAML, passkeys, MFA, SCIM)
- Enterprise SSO included - not an enterprise pricing tier add-on
- Impossible travel detection built-in - Auth0 charges extra for this
- Multi-tenancy native - one parameter, complete data isolation

[SOCIAL PROOF: "We migrated from Azure AD B2C in 2 weeks. The impossible travel detection alone would have cost us $X/year with Auth0." - [Customer Name], [Title]]

Would 15 minutes next week make sense to walk through a migration path?

Best,
[Your Name]

P.S. We've documented the Azure AD B2C migration process specifically. Happy to share that doc even if a call doesn't make sense right now.

---

### Email 2: Follow-up

**Subject:** [Company] - 90 days until Azure AD B2C sunset

**Body:**

Hi [First Name],

Following up on my note about the Azure AD B2C discontinuation.

I've been tracking companies in your situation. The ones who started migration 6+ months out are in good shape. The ones who waited until 90 days out? Let's just say their engineers aren't happy.

You're at the 90-day mark now.

The auth migration itself isn't the hard part. It's the downstream effects - session management, token handling, MFA re-enrollment, SSO configuration for enterprise customers.

We've built tooling specifically for this transition. Our customers report 2-3 week migration timelines instead of the 8-12 weeks typical for Auth0 integrations.

[SOCIAL PROOF: Placeholder for migration success story]

Worth a quick call to see if we can help?

Best,
[Your Name]

P.S. I can also connect you with [Customer Name] who just went through this migration. Sometimes it helps to hear from someone who's done it.

---

### LinkedIn Message

**Message:**

Hi [First Name] - saw [Company] is using Azure AD B2C. With Microsoft sunsetting it in May, wanted to share a migration guide we put together. We've helped several B2B SaaS companies migrate in 2-3 weeks instead of the typical 8-12 weeks with Auth0. Worth a look?

---

## Auth0 Users

### Email: Pricing Pain

**Subject:** Spending $X/month on Auth0?

**Body:**

Hi [First Name],

Auth0's pricing model is the #1 complaint among developers - 34% cite pricing concerns in recent surveys. And that was before the Okta acquisition made things worse.

If you're spending more than $500/month on Auth0, you're probably feeling it.

Here's what most companies don't realize: Auth0 charges extra for features that should be standard:

- Impossible travel detection? Extra.
- Admin impersonation for support? Extra.
- Custom domains? Enterprise tier.
- More than basic MFA? Enterprise tier.

We built Rottay with all of that included. No MAU traps. No surprise tier upgrades. No "contact sales" for features you actually need.

[SOCIAL PROOF: "We cut our auth costs by 60% and got impossible travel detection as a bonus. Should have switched sooner." - [Customer Name]]

I can show you a side-by-side cost comparison for [Company]'s user count. Takes about 10 minutes.

Best,
[Your Name]

P.S. If you've already budgeted for Auth0 this year, that's fine. We can do the comparison now and revisit at renewal time.

---

### Email: After Outage

**Subject:** Auth0 down again - there's a better way

**Body:**

Hi [First Name],

Auth0 had another outage today. Their fourth major incident this year.

When your authentication provider goes down, your entire application goes down. Your users can't log in. Your support team gets flooded. Your reputation takes the hit.

We built Rottay with reliability as a core requirement. Our architecture uses:

- Multi-region deployment with automatic failover
- No single points of failure in the auth chain
- Session persistence that survives infrastructure issues

[SOCIAL PROOF: "[Company]'s auth hasn't gone down since we switched. That alone was worth the migration." - [Customer Name]]

Auth downtime isn't just an inconvenience - it's a trust issue. Worth 15 minutes to see how we handle it differently?

Best,
[Your Name]

P.S. We maintain a public status page with 99.99% uptime SLA. Happy to share our incident history (it's short).

---

## Post-Series A Startups

### Email: Enterprise Readiness

**Subject:** Enterprise features before your first enterprise customer

**Body:**

Hi [First Name],

Congrats on the Series A. Saw the announcement in [Publication].

Here's what happens next for most startups in your position: You close your first enterprise deal, and then scramble for 3 months adding SSO, audit logs, compliance documentation, and proper multi-tenancy.

Your new enterprise customer waits. Your product roadmap stalls. Your engineers build infrastructure instead of product.

What if all that was already done?

Rottay gives you enterprise-grade infrastructure from day one:

- SSO (SAML, OIDC, SCIM) - ready for the security questionnaire
- Audit trails - every action logged, searchable, exportable
- Multi-tenancy - data isolation that passes security reviews
- 15 compliance frameworks - SOC 2, HIPAA, GDPR, and 12 more

[SOCIAL PROOF: "We closed our first enterprise deal in 60 days instead of 6 months. The infrastructure was already there." - [Customer Name], [Series A Company]]

Worth a call to see how this fits your roadmap?

Best,
[Your Name]

P.S. We have a post-Series A playbook that maps out the enterprise readiness timeline. Happy to share it regardless.

---

### Email: Compliance Coming

**Subject:** Your SOC 2 audit is coming

**Body:**

Hi [First Name],

At your stage, SOC 2 is probably on the roadmap. Maybe 6-12 months out. Maybe sooner if an enterprise deal requires it.

Here's what most startups do: They buy Vanta or Drata ($10-25K/year), spend 2-3 months implementing controls, pay $10-50K for the audit itself, and then maintain it all ongoing.

Total cost: $30-75K first year. Plus engineering time. Plus annual renewals.

What if compliance was built into your codebase instead of tracked in a separate tool?

Rottay implements 15 compliance frameworks directly - not as a dashboard, but as actual code that enforces the controls. GDPR data deletion? It's a use case you call. Audit trails? Automatic. Access controls? Built into every operation.

[SOCIAL PROOF: "Our SOC 2 auditor said it was the cleanest audit they'd done. Everything was already implemented." - [Customer Name]]

Want to see how compliance-as-code actually works?

Best,
[Your Name]

P.S. We support GDPR, SOC 2, HIPAA, PCI-DSS, and 11 other frameworks. If you're in fintech, healthcare, or AI, you probably need more than Vanta offers.

---

## Companies Using Multiple Vendors

### Email: Vendor Consolidation

**Subject:** 6 infrastructure vendors - 1

**Body:**

Hi [First Name],

Based on [Company]'s stack, I'm guessing you're using some combination of:

- Auth0 or Clerk for authentication
- Vanta or Drata for compliance
- LaunchDarkly or Split for feature flags
- Twilio or SendGrid for notifications
- Plus custom code for multi-tenancy and permissions

That's 5-6 vendors. 5-6 SDKs. 5-6 invoices. 5-6 different dashboards. 5-6 support queues when something breaks.

And here's the real cost: your engineers spend 20% of their time on integration maintenance instead of building product.

What if it was one platform?

Rottay consolidates all of that into a single SDK:

```typescript
import { makeLoginUseCase, makeCreateTenantUseCase } from '@rottay/auth';
// Auth, compliance, tenancy, permissions, flags, notifications
// One import pattern. One support channel. One invoice.
```

[SOCIAL PROOF: "We eliminated 6 vendor contracts and reduced our infrastructure maintenance by 80%. Our engineers actually build product now." - [Customer Name]]

Worth 20 minutes to see the consolidation math for [Company]?

Best,
[Your Name]

P.S. We put together a TCO calculator that compares the real cost (including engineering time) of your current stack vs. consolidated. Happy to run the numbers.

---

## Vertical-Specific

### Fintech

**Subject:** KYC + AML + PCI-DSS in one platform

**Body:**

Hi [First Name],

Fintech compliance is a nightmare. You need:

- KYC verification and ongoing monitoring
- AML screening against sanctions lists
- PCI-DSS for payment data
- Maybe PSD2 for European operations
- Plus the standard SOC 2 that everyone asks for

Most fintech companies cobble this together from 4-5 vendors. Each vendor has their own integration, their own dashboard, their own audit trail format.

We built Rottay with financial services in mind:

- KYC use cases (identity verification, document checks, ongoing monitoring)
- AML screening (sanctions, PEP, adverse media)
- PCI-DSS controls built into payment handling
- PSD2 SCA compliance for European transactions
- Unified audit trails across all compliance domains

[SOCIAL PROOF: Placeholder for fintech customer]

The compliance audit is so much easier when everything is in one system.

Worth a call to see how this maps to [Company]'s requirements?

Best,
[Your Name]

P.S. We also support Travel Rule for crypto transactions if that's relevant to your roadmap.

---

### Healthcare

**Subject:** HIPAA compliance that's actually built-in

**Body:**

Hi [First Name],

HIPAA compliance in software usually means: buy a compliance tool, implement controls manually, document everything separately, and hope your auditor agrees you did it right.

What if the compliance controls were the code itself?

Rottay implements HIPAA at the infrastructure level:

- Automatic PHI detection and classification
- Audit trails for every data access (required by HIPAA)
- Encryption at rest and in transit (with key management)
- Access controls with minimum necessary enforcement
- Breach notification workflows built-in

Your developers don't have to think about HIPAA compliance. It's enforced automatically by the platform.

[SOCIAL PROOF: "Our HIPAA audit went from a 3-month ordeal to a 2-week process. The auditor could see the controls directly in the code." - [Customer Name]]

Worth a quick call to see if this fits your compliance strategy?

Best,
[Your Name]

P.S. We also handle SOC 2 and HITRUST if you're pursuing multiple certifications.

---

### HR Tech / Recruiting

**Subject:** AI hiring compliance (BIPA, EEOC, FCRA)

**Body:**

Hi [First Name],

AI in hiring is a regulatory minefield right now:

- BIPA in Illinois requires consent before biometric analysis
- EEOC is actively auditing AI hiring tools for bias
- FCRA applies to automated background decisions
- NYC Local Law 144 requires bias audits for AI hiring
- EU AI Act classifies recruiting AI as high-risk

Most recruiting platforms are scrambling to add compliance after the fact.

We built it in from the start:

- BIPA consent management and biometric data handling
- LLM-as-Judge with human calibration for bias audits
- FCRA-compliant adverse action workflows
- Bias detection and mitigation in scoring models
- Full audit trails for regulatory inquiries

[SOCIAL PROOF: Placeholder for HR tech customer]

This isn't just about avoiding fines. It's about building trust with candidates and customers.

Worth a conversation about how [Company] is handling AI compliance?

Best,
[Your Name]

P.S. We have a specific module for recruiting (dm-recruiter) with 80+ use cases if you're building an ATS.

---

### Crypto

**Subject:** MiCA compliance before the deadline

**Body:**

Hi [First Name],

MiCA enforcement starts in 2025. If you're operating in the EU, you need:

- Travel Rule compliance for transfers
- KYC/AML for customer onboarding
- Transaction monitoring and reporting
- Custody requirements documentation
- Market abuse surveillance

Most crypto companies are still figuring out what MiCA even requires. The ones who will struggle are the ones who wait until enforcement to implement.

Rottay has crypto-specific compliance built in:

- Travel Rule implementation (FATF compliant)
- MiCA reporting workflows
- KYC with crypto-specific risk scoring
- Wallet analysis integration points
- Cross-border transaction handling

[SOCIAL PROOF: Placeholder for crypto customer]

Worth a call to map your MiCA timeline?

Best,
[Your Name]

P.S. We also support Web3 authentication (wallet connect, signature verification) if you need that alongside the compliance stack.

---

## Cold Outreach

### Developer-Focused

**Subject:** Your backend stack, simplified

**Body:**

Hi [First Name],

Quick question: how much of your week goes to infrastructure instead of product?

Most backend engineers I talk to spend 20-30% of their time on auth bugs, permission edge cases, notification delivery issues, and multi-tenancy complexity.

We built Rottay to eliminate that overhead:

```typescript
const result = await loginUseCase.execute(input, { tenantId });
if (result.isSuccess) { /* typed success */ }
if (result.isFailure) { /* typed error, never throws */ }
```

That's auth, multi-tenancy, and permissions in one line. The Result<T> pattern means you never chase down unexpected exceptions. The { tenantId } parameter means you never accidentally leak data across customers.

[SOCIAL PROOF: "I used to spend Monday mornings debugging auth issues. Now I actually write product code." - [Developer Name], [Company]]

Worth 10 minutes to see the DX?

Best,
[Your Name]

P.S. Full TypeScript, complete type inference, and autocomplete that actually works. Happy to share the docs.

---

### CTO-Focused

**Subject:** Replace 6 vendors with 1

**Body:**

Hi [First Name],

The average B2B SaaS company uses 6+ infrastructure vendors:

- Authentication (Auth0, Clerk)
- Compliance (Vanta, Drata)
- Feature flags (LaunchDarkly)
- Permissions (Permit.io, custom)
- Notifications (Twilio, SendGrid)
- Multi-tenancy (custom build)

That's 6 invoices, 6 SDKs, 6 support relationships, and 6 security surfaces to monitor.

Each vendor integration takes 1-3 weeks. Each vendor upgrade requires testing. Each vendor outage affects your product.

We built Rottay as a single platform: 1,000+ use cases across auth, compliance, tenancy, permissions, notifications, and feature flags. One SDK. One invoice. One security review.

[SOCIAL PROOF: "We cut our vendor count from 8 to 1 and our infrastructure costs by 65%. The engineering time savings alone paid for it." - [CTO Name], [Company]]

Worth 20 minutes to see the consolidation opportunity?

Best,
[Your Name]

P.S. We've put together a TCO comparison that includes the hidden costs (engineering time, integration maintenance, security review overhead). Happy to share.

---

### Enterprise Buyer

**Subject:** The security questionnaire you'll actually pass

**Body:**

Hi [First Name],

Enterprise security questionnaires are getting longer. 200 questions. 500 questions. Some vendors have automated them just to keep up.

But here's the problem: most B2B SaaS platforms can't actually answer yes to the hard questions.

- Do you support SCIM provisioning? (Usually no)
- Can you provide dedicated infrastructure per customer? (Usually no)
- Do you have impossible travel detection? (Usually no)
- Can you support data residency requirements? (Usually no)
- Do you have admin impersonation with audit trails? (Usually no)

We built Rottay to answer yes to all of them:

- SCIM 2.0 provisioning and deprovisioning
- Dedicated database provisioning for enterprise tier
- Impossible travel detection built into auth
- Data residency (EU/US) with automated compliance
- Admin impersonation with complete audit trails
- 15 compliance frameworks, not 5

[SOCIAL PROOF: "We went from losing enterprise deals on security reviews to winning them. The platform does what other vendors can't." - [Enterprise Sales Lead], [Company]]

Worth a call to see which features matter most for your enterprise push?

Best,
[Your Name]

P.S. We can share our own SOC 2 report and security documentation if that helps with your vendor evaluation process.

---

## Template Components Reference

### Opening Hooks by Audience

| Audience | Hook Style |
|----------|------------|
| Developers | Pain point (time waste, bugs, complexity) |
| CTOs | Numbers (vendor count, cost, time) |
| Enterprise | Risk/compliance angle |
| Urgent situations | Deadline/urgency lead |

### Value Propositions by Pain

| Pain | Value Prop |
|------|------------|
| Pricing | Predictable, no MAU traps, no per-seat scaling |
| Complexity | One SDK, one support queue, one integration |
| Compliance | 15 frameworks built-in, not tracked in separate tool |
| Reliability | Uptime SLA, no Auth0-style outages |
| Time | 2-3 week integration vs 8-12 weeks |

### CTA Options

| CTA Type | When to Use |
|----------|-------------|
| "15 minutes" | Standard meeting request |
| "See the DX" | Developer audience |
| "Run the numbers" | Cost-focused conversation |
| "Map your timeline" | Deadline-driven situations |
| "Share regardless" | Lower commitment, lead nurturing |

### P.S. Line Purposes

| Purpose | Example |
|---------|---------|
| Lower commitment offer | "Happy to share the doc even if a call doesn't make sense" |
| Social proof | "Can connect you with someone who went through this" |
| Value add | "We have a calculator/guide/doc that might help" |
| Future hook | "Happy to revisit at renewal time" |

---

## Best Practices

1. **Personalize the first line** - Reference something specific about the company or person
2. **One clear ask** - Don't offer multiple CTAs in the same email
3. **Keep it scannable** - Bullet points, short paragraphs, clear structure
4. **Specific numbers** - "80+ use cases" beats "many use cases"
5. **Name competitors** - Shows you understand their current stack
6. **Social proof placeholder** - Replace with real quotes when available
7. **P.S. lines work** - They get read even when the email doesn't

---

## Related Documents

| Document | Description |
|----------|-------------|
| [COMPETITIVE-ANALYSIS.md](./COMPETITIVE-ANALYSIS.md) | Pain points and competitor weaknesses |
| [MARKETING-STRATEGY.md](./MARKETING-STRATEGY.md) | Positioning and messaging |
| [PHRASES.md](./PHRASES.md) | Approved marketing language |
| [TCO-CALCULATOR.md](./TCO-CALCULATOR.md) | Cost comparison data |
