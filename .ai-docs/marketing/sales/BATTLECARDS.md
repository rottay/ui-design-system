# Rottay Sales Battlecards

> Competitive battlecards for sales conversations. Each card provides quick facts, talking points, discovery questions, and knockout punches.
> Last updated: January 2026

---

## Battlecard: Auth0 (Okta)

### Quick Facts
- **Pricing Model:** MAU-based ($35-$800/mo), Enterprise custom
- **Main Product:** Authentication and identity management
- **Key Weakness:** 4 major outages in 2024, 34% cite pricing concerns

### Their Strengths (Acknowledge)
- Strong brand recognition and market presence
- Extensive documentation and community
- Universal Login customization options
- Wide OAuth/OIDC provider support
- SOC 2 and compliance certifications

### Their Weaknesses (Attack)
- **Reliability issues:** 4 major outages in 2024 (ask for their status page history)
- **Pricing unpredictability:** MAU spikes cause bill shock (34% of developers cite this)
- **Hidden costs:** Impossible travel detection is an extra charge
- **Complexity:** Enterprise features require expensive tiers
- **Okta acquisition:** Support quality has declined post-acquisition
- **SSO tax:** SAML/SSO only available on expensive plans

### Discovery Questions
- "How has your Auth0 bill changed over the last 12 months?"
- "Have you experienced any authentication outages this year?"
- "What's your current MAU count, and what happens if you go viral?"
- "Do you need impossible travel detection? Did you know Auth0 charges extra for that?"
- "How long did it take to implement profile linking across providers?"
- "What was your experience with support response times?"

### Objection Handlers

**"We already use Auth0"**
> "Many of our customers migrated from Auth0. The most common reasons: pricing surprises when they scaled, outage concerns (4 in 2024), and missing features like profile merging. We offer a migration path that preserves your existing user sessions."

**"Auth0 is cheaper"**
> "At what MAU count? Auth0's pricing accelerates quickly. At 50K MAU, you're paying $240+/month just for authentication. We include auth plus 1,000+ other use cases - compliance, feature flags, permissions, multi-tenancy, notifications - all for one price."

**"Auth0 is more established"**
> "Established doesn't mean reliable. They had 4 major outages in 2024. We had zero. Being established also means legacy architecture - we built our auth system on modern patterns like Result<T> that eliminate the exception handling bugs that cause those outages."

### Knockout Punches
- "Auth0 had 4 outages in 2024. We had zero."
- "34% of Auth0 customers cite pricing as their top concern. Our pricing is predictable."
- "We include impossible travel detection. Auth0 charges extra."
- "We have 80+ auth use cases including profile merging - something Auth0 doesn't offer."
- "{ tenantId } automatic isolation makes data leaks architecturally impossible."

---

## Battlecard: Clerk

### Quick Facts
- **Pricing Model:** $0.02/MAU after 10K free + $0.02/org/month
- **Main Product:** Developer-first authentication
- **Key Weakness:** B2B organization pricing compounds quickly

### Their Strengths (Acknowledge)
- Excellent developer experience (fast integration)
- Beautiful pre-built UI components
- Modern React-first approach
- Generous 10K MAU free tier
- Good documentation and onboarding

### Their Weaknesses (Attack)
- **B2B pricing trap:** $0.02/MAU + $0.02/org compounds (50K users + 100 orgs = $2K/mo)
- **Limited enterprise features:** No admin impersonation, limited SCIM
- **No multi-tenancy:** You still need to build tenant isolation yourself
- **Component lock-in:** Hard to customize beyond their UI patterns
- **No compliance:** Zero built-in compliance frameworks

### Discovery Questions
- "How many organizations do you expect to support in year one? Year three?"
- "Have you calculated the B2B pricing with both MAU and org fees?"
- "How are you handling multi-tenant data isolation? Clerk doesn't do that."
- "Do you need compliance frameworks like SOC 2, HIPAA, or GDPR?"
- "What happens when you need features beyond their component library?"

### Objection Handlers

**"We already use Clerk"**
> "Clerk is great for getting started quickly. Where companies outgrow Clerk: B2B pricing compounds fast (50K users + 100 orgs = $2K/mo just for auth), no multi-tenancy built-in, and zero compliance frameworks. We include all three."

**"Clerk is cheaper"**
> "For single-product consumer apps, maybe. But you're building B2B - let's do the math: 50K users at $0.02 = $1,000/mo + 100 orgs at $0.02 = $2K more. That's $3K/mo just for auth. We include auth, compliance, multi-tenancy, feature flags, permissions, and notifications."

**"Clerk is easier to integrate"**
> "Clerk is fast for basic auth. But you'll spend weeks building what we include: tenant isolation, feature flags, permissions, compliance. Their 30-minute integration becomes 3 months of additional work."

### Knockout Punches
- "Clerk charges per organization. We include unlimited organizations."
- "50K users + 100 orgs = $2K/month on Clerk. Plus you still need multi-tenancy, compliance, feature flags..."
- "We have 80+ auth use cases. Clerk focuses only on authentication."
- "{ tenantId } multi-tenancy is built-in. Clerk makes you build it yourself."
- "Profile merging across providers - Clerk doesn't offer this."

---

## Battlecard: Vanta

### Quick Facts
- **Pricing Model:** $7,500-$30K/year + audit fees ($10K-$50K separate)
- **Main Product:** Compliance automation (SOC 2, ISO, HIPAA)
- **Key Weakness:** Only 5 frameworks, audit fees separate, tracks but doesn't implement

### Their Strengths (Acknowledge)
- Good SOC 2 automation and evidence collection
- Established relationships with auditors
- Continuous monitoring dashboards
- Integrations with common tools (AWS, GitHub, Okta)
- Trust center pages for customers

### Their Weaknesses (Attack)
- **Limited frameworks:** Only 5 (SOC 2, ISO 27001, HIPAA, PCI-DSS, GDPR) vs our 15
- **Hidden costs:** Audit fees are $10K-$50K separate from platform fee
- **Tracks, doesn't implement:** You still need to build the compliant code
- **No specialized compliance:** No KYC, AML, BIPA, Gaming, Crypto, AI Hiring
- **No technical controls:** Dashboard shows status, doesn't enforce policies

### Discovery Questions
- "What's your total cost including audit fees? Vanta charges those separately."
- "Do you need compliance beyond SOC 2 and ISO? KYC, AML, BIPA, gaming regulations?"
- "How are you actually implementing the compliant code? Vanta just tracks it."
- "Are you in a regulated industry like fintech, healthcare, or gaming?"
- "What's your plan for AI hiring compliance as EEOC regulations expand?"

### Objection Handlers

**"We already use Vanta"**
> "Vanta is a tracking tool - it tells you what's compliant and what's not. We're an implementation platform - we make your code compliant. They're complementary, but we reduce the work Vanta tracks by 80% because compliance is built into every use case."

**"Vanta is the industry standard"**
> "For SOC 2, yes. But they only support 5 frameworks. We support 15 including KYC, AML, BIPA, Gaming, Crypto, and AI Hiring. If you're in fintech, healthcare, gaming, or using AI - you need more than Vanta offers."

**"Vanta handles compliance"**
> "Vanta tracks compliance status. You still write the compliant code. Our 138 compliance use cases implement the actual controls. Result: Vanta shows fewer gaps because Rottay eliminates them in the codebase."

### Knockout Punches
- "15 compliance frameworks. Vanta stops at 5."
- "Vanta tracks compliance. We implement it."
- "Vanta's audit fees are separate - add $10K-$50K to their quoted price."
- "We have 138 compliance use cases including KYC, AML, BIPA, Gaming, and AI Hiring."
- "Compliance is code, not a dashboard. Every use case is compliant by default."

---

## Battlecard: Drata

### Quick Facts
- **Pricing Model:** $7K-$100K/year depending on company size
- **Main Product:** Compliance automation and continuous monitoring
- **Key Weakness:** +20-35% hidden implementation costs, 6 frameworks max

### Their Strengths (Acknowledge)
- Strong continuous monitoring capabilities
- Good automation for evidence collection
- Multiple compliance frameworks (6)
- Integrations with common infrastructure
- Custom control mapping

### Their Weaknesses (Attack)
- **Hidden costs:** +20-35% for implementation, premium support, professional services
- **Framework limitations:** 6 frameworks vs our 15
- **Implementation heavy:** Requires professional services for complex setups
- **No technical enforcement:** Policy engine without code-level controls
- **Pricing opacity:** Requires demo to get pricing, no transparency

### Discovery Questions
- "What was your total Drata cost including implementation services?"
- "Did you factor in the 20-35% additional for professional services?"
- "How much engineering time are you spending on compliance code?"
- "Do you need compliance beyond the 6 frameworks Drata supports?"
- "What's your plan for KYC/AML if you're doing financial transactions?"

### Objection Handlers

**"We already use Drata"**
> "Drata is excellent at compliance tracking. The challenge: their quoted price typically excludes 20-35% in implementation costs. Plus, you still need engineers to write compliant code. Our 138 use cases make the code compliant - Drata just needs to observe it."

**"Drata seemed comprehensive"**
> "For SOC 2 and ISO, yes. But 6 frameworks doesn't cover specialized industries. Fintech needs KYC/AML, AI companies need EEOC/BIPA, gaming needs responsible gaming controls. We support 15 frameworks including all of these."

**"Drata is cheaper than building compliance"**
> "Compare total cost: Drata $7K-$100K + 20-35% implementation + engineering time to write compliant code. With Rottay, compliance is built into every use case. Your engineers use pre-compliant code instead of building it."

### Knockout Punches
- "Add 20-35% to Drata's quoted price for the real cost."
- "6 frameworks vs our 15. No KYC, AML, BIPA, Gaming, or AI Hiring support."
- "Drata tracks. We implement. Your engineers write 80% less compliance code."
- "138 compliance use cases built into the platform, not bolted on."
- "No separate implementation fees. The platform is the implementation."

---

## Battlecard: LaunchDarkly

### Quick Facts
- **Pricing Model:** $10-$20/seat/month, Enterprise custom
- **Main Product:** Feature flags and experimentation
- **Key Weakness:** Per-seat pricing scales badly (50 engineers = $1K/mo minimum)

### Their Strengths (Acknowledge)
- Market leader in feature flags
- Excellent targeting rules and segmentation
- Strong experimentation capabilities
- Comprehensive SDKs across languages
- Good operational dashboards

### Their Weaknesses (Attack)
- **Per-seat pricing trap:** 50 engineers = $500-$1,000/mo just for feature flags
- **Single purpose:** Only does feature flags, need other vendors for auth, permissions, etc.
- **Complexity overkill:** Many teams only use 10% of features
- **Integration tax:** Another SDK, another dashboard, another vendor
- **No tenant awareness:** Multi-tenant feature flags require custom work

### Discovery Questions
- "How many engineers will need access to feature flags?"
- "Have you calculated the cost at $10-$20 per seat per month?"
- "How are you handling feature flags for different tenants/customers?"
- "How many different SaaS tools do you have for infrastructure?"
- "What percentage of LaunchDarkly's features do you actually use?"

### Objection Handlers

**"We already use LaunchDarkly"**
> "LaunchDarkly is great at feature flags. The question: should feature flags be a separate $1K+/month line item? Our feature flags are included, plus they're tenant-aware out of the box - something LaunchDarkly requires custom work to achieve."

**"LaunchDarkly is the industry leader"**
> "For standalone feature flags, yes. But the industry is moving toward unified platforms. You're paying LaunchDarkly for flags, Auth0 for auth, Vanta for compliance, Permit.io for permissions... We include all of these with one SDK, one dashboard, one vendor."

**"LaunchDarkly is only $10/seat"**
> "Times 50 engineers = $500/mo. Times $20 for Pro = $1,000/mo. Just for feature flags. We include feature flags plus 30+ other capability categories. At enterprise scale, the per-seat model doesn't make sense."

### Knockout Punches
- "LaunchDarkly charges per seat. We don't."
- "50 engineers x $20/seat = $1,000/month just for feature flags."
- "Our feature flags are tenant-aware by default. LaunchDarkly requires custom work."
- "Feature flags are included with 1,000+ other use cases."
- "One SDK, one dashboard vs. adding another vendor to your stack."

---

## Battlecard: Firebase Auth

### Quick Facts
- **Pricing Model:** Free for password/OAuth + $0.06/SMS verification
- **Main Product:** Authentication for mobile and web apps
- **Key Weakness:** Hidden SMS costs ($6K/month at 100K verifications)

### Their Strengths (Acknowledge)
- Generous free tier for basic auth
- Excellent mobile SDK (Firebase's core strength)
- Easy Google/Apple OAuth integration
- Good real-time database integration
- No server required for basic flows

### Their Weaknesses (Attack)
- **Hidden SMS costs:** $0.06/verification, 100K/month = $6,000 (not in marketing)
- **Google lock-in:** Tightly coupled to GCP ecosystem
- **Limited enterprise features:** No SCIM, basic SAML, no admin impersonation
- **No multi-tenancy:** Designed for consumer apps, not B2B SaaS
- **Scaling limits:** Real-time database doesn't scale for large enterprises

### Discovery Questions
- "Do you use SMS verification? How many verifications per month?"
- "Have you calculated the SMS costs at $0.06 per verification?"
- "Are you building B2B SaaS or consumer? Firebase is designed for consumer."
- "Do you need SCIM provisioning for enterprise customers?"
- "What's your strategy if you need to move off Google Cloud?"

### Objection Handlers

**"We already use Firebase"**
> "Firebase is excellent for mobile apps and consumer products. Where companies outgrow Firebase: B2B multi-tenancy (not supported), SMS verification costs (100K verifications = $6K/month), and enterprise features like SCIM and admin impersonation."

**"Firebase is free"**
> "Until you need SMS verification. 100K verifications/month = $6,000. Plus, 'free' locks you into Google's ecosystem. We include notifications (including SMS) without per-message fees, and you're not locked to any cloud provider."

**"Firebase integrates with our Google setup"**
> "That integration becomes lock-in. What if you need multi-cloud? What about your enterprise customers who require AWS? We're cloud-agnostic and include features Firebase lacks: multi-tenancy, admin impersonation, impossible travel detection."

### Knockout Punches
- "100K SMS verifications/month = $6,000 on Firebase. We include notifications."
- "Firebase doesn't support multi-tenancy. Every B2B SaaS needs it."
- "No admin impersonation, limited SCIM, basic enterprise support."
- "Google lock-in - what happens when an enterprise customer requires AWS?"
- "We have 80+ auth use cases. Firebase has basic authentication."

---

## Battlecard: Azure AD B2C (Migration Focus)

### Quick Facts
- **Pricing Model:** Being sunset (external identities retiring May 2025)
- **Main Product:** Customer identity for Azure ecosystem
- **Key Weakness:** BEING DISCONTINUED - customers must migrate

### Their Strengths (Acknowledge)
- (Historical) Strong Microsoft enterprise integration
- (Historical) Good Active Directory compatibility
- (Historical) Established compliance certifications

### Their Weaknesses (Attack)
- **BEING SUNSET:** External identities retiring May 2025 - customers must migrate
- **Migration deadline:** No choice but to move, creates urgency
- **Microsoft alternatives:** Entra External ID is different architecture, not a simple migration
- **Uncertainty:** Customers don't know what's next

### Discovery Questions
- "Are you aware Azure AD B2C external identities are being retired in May 2025?"
- "What's your migration plan? Microsoft's Entra External ID isn't a drop-in replacement."
- "How complex is your current B2C setup? Custom policies, API connectors?"
- "Would you like to see a migration assessment? We've helped other Azure customers."

### Objection Handlers

**"We're waiting to see Microsoft's next move"**
> "May 2025 is the deadline. Microsoft's Entra External ID is a different architecture - it's not a simple migration. Waiting creates risk. We can start the migration now and ensure you're not scrambling at the deadline."

**"We'll migrate to Entra External ID"**
> "Entra External ID is a different product with different architecture. Custom policies don't transfer directly. You're essentially rebuilding either way. We offer a modern platform with features Azure never had: Result<T> pattern, 80+ auth use cases, profile merging."

**"Microsoft is our standard vendor"**
> "Understood. But they're discontinuing this product. For customer identity specifically, a specialized platform outperforms a sunset product. You can keep Azure for infrastructure while using Rottay for customer identity."

### Knockout Punches
- "Azure AD B2C is being discontinued May 2025. We're actively investing."
- "Entra External ID isn't a simple migration - you're rebuilding anyway. Build modern."
- "We've migrated multiple Azure customers. We have a proven migration path."
- "Features Azure never had: impossible travel detection, profile merging, admin impersonation."
- "Don't wait until May 2025. Migration takes time."

---

## Battlecard: Permit.io

### Quick Facts
- **Pricing Model:** $150+/month (Starter), MAU + resource quotas
- **Main Product:** Authorization and permissions management
- **Key Weakness:** MAU + resource quota pricing is complex and compounds

### Their Strengths (Acknowledge)
- Good policy-as-code approach
- Multiple authorization models (RBAC, ABAC, ReBAC)
- Visual policy editor
- Dedicated authorization focus
- Good documentation

### Their Weaknesses (Attack)
- **Complex pricing:** MAU + resource quotas + UI seats all compound
- **Single purpose:** Only handles permissions, need other vendors for auth, compliance, etc.
- **Integration overhead:** Another SDK, another dashboard, another vendor
- **No compliance integration:** Permissions without compliance context
- **Standalone cost:** $150+/month just for authorization

### Discovery Questions
- "How many MAUs and resource types do you expect? Permit.io charges for both."
- "How many different SaaS vendors are you using for infrastructure today?"
- "Have you calculated the total cost across auth + permissions + compliance + flags?"
- "How are you handling the connection between permissions and compliance?"

### Objection Handlers

**"We already use Permit.io"**
> "Permit.io is good for standalone authorization. The question: should permissions be disconnected from auth, compliance, and tenancy? Our permissions are built into every use case - they work with { tenantId } context automatically."

**"Permit.io specializes in authorization"**
> "Specialization can mean isolation. Permissions should connect to auth (who is this user?), compliance (what are they allowed to access?), and tenancy (which tenant's data?). Our 40+ permission use cases integrate all of these."

**"Permit.io is only $150/month"**
> "At the starter tier. Add MAU overages, resource quotas, and you scale quickly. Plus you still need auth, compliance, feature flags, notifications... We include all of these. One platform vs. assembling vendors."

### Knockout Punches
- "Permit.io has MAU limits. We don't count your users against you."
- "Permissions + auth + compliance + tenancy should be unified. Permit.io is isolated."
- "40+ permission use cases built into the platform, not bolted on."
- "{ tenantId } automatic isolation - permissions are always tenant-aware."
- "Admin impersonation with full audit trails - included, not an add-on."

---

## Rottay Competitive Summary

### Platform Stats
| Metric | Value |
|--------|-------|
| Total Use Cases | 1,023+ |
| Platform Modules | 8 |
| Domain Modules | 9 |
| Compliance Frameworks | 15 |
| Auth Use Cases | 80+ |

### Unique Capabilities No Competitor Has

| Feature | Why It Matters |
|---------|----------------|
| **Result<T> Pattern** | Typed errors, no exceptions - eliminates entire categories of bugs |
| **{ tenantId } Context** | Automatic tenant isolation - data leaks architecturally impossible |
| **Impossible Travel Detection** | Included (Auth0 charges extra) |
| **Profile Merging** | Unique - link identities across providers |
| **Admin Impersonation** | Full audit trails for support workflows |
| **LLM-as-Judge** | AI scoring with human calibration for hiring |
| **15 Compliance Frameworks** | KYC, AML, Gaming, Crypto, BIPA, AI Hiring |
| **Dedicated Tenant DBs** | Enterprise tier auto-provisions databases |

### The Unified Platform Argument

**Prospect's Current Stack (Typical)**
- Auth: Auth0 ($9,600/year)
- Compliance: Vanta ($10,000/year)
- Feature Flags: LaunchDarkly ($2,400/year)
- Permissions: Permit.io ($1,800/year)
- Multi-tenancy: Custom (engineering time)
- Notifications: SendGrid + Knock ($4,080/year)
- **Total: $27,880/year + 6 SDKs + 6 dashboards + 6 support queues**

**Rottay**
- All of the above included
- 1,023+ use cases
- 1 SDK, 1 dashboard, 1 support queue
- 1-2 weeks integration vs 8-12 weeks

---

## Related Documents

| Document | Description |
|----------|-------------|
| [COMPETITIVE-ANALYSIS.md](./COMPETITIVE-ANALYSIS.md) | Detailed competitor research |
| [MARKETING-STRATEGY.md](./MARKETING-STRATEGY.md) | Overall marketing strategy |
| [PHRASES.md](./PHRASES.md) | Marketing phrases by context |
| [TCO-CALCULATOR.md](./TCO-CALCULATOR.md) | Cost comparison calculator |
