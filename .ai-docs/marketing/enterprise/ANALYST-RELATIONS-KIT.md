# Analyst Relations Kit

Materials for briefings with Gartner, Forrester, IDC, and other analysts.

---

## Company Overview

### One-Liner

"Unified B2B SaaS infrastructure platform: auth, compliance, multi-tenancy, permissions, and more in one SDK."

### Elevator Pitch (30 seconds)

"Every B2B SaaS rebuilds the same infrastructure - authentication, multi-tenancy, compliance, permissions. That's 6+ vendors, $30K+/year, and 3-6 months of integration. Rottay provides all of this in one platform, one SDK, with 1,000+ ready-to-use cases."

### Extended Pitch (60 seconds)

"B2B SaaS companies face a paradox: they need enterprise features to win customers, but building them delays their core product. Today, companies stitch together Auth0 for authentication, Vanta for compliance, LaunchDarkly for feature flags, and build custom multi-tenancy - that's 6+ vendors, $30K+ annually, and 3-6 months of integration work.

Rottay is the unified infrastructure platform that replaces this fragmented stack. We provide 17 modules with 1,000+ production-ready use cases - from passwordless auth to SOC 2 compliance to team billing. One SDK, one dashboard, one vendor. Companies launch enterprise-ready products in weeks, not months, at a fraction of the cost."

### Key Messages

1. **Unified Platform vs. Point Solutions**
   - One SDK replaces 6+ vendors
   - Single integration, single dashboard
   - Coherent developer experience

2. **1,023+ Production-Ready Use Cases**
   - Not just building blocks - complete implementations
   - 17 modules across platform and domain needs
   - Battle-tested across multiple verticals

3. **15 Compliance Frameworks (vs. 5 from Competitors)**
   - Implements controls, not just tracks them
   - Automatic evidence collection
   - Continuous compliance monitoring

4. **Production-Tested Across Verticals**
   - HR Tech (BitHire)
   - Events (Evnto)
   - Hospitality (Bar management)
   - Staffing platforms

---

## Market Positioning

### Category

| Type | Category |
|------|----------|
| Primary | B2B SaaS Infrastructure Platform |
| Adjacent | Identity & Access Management (IAM) |
| Adjacent | Governance, Risk & Compliance (GRC) |
| Adjacent | Developer Tools / DevEx Platforms |

### Target Market

**Primary: B2B SaaS Companies (Seed to Series C)**
- Building products that need enterprise features
- Resource-constrained engineering teams
- Need to move fast without sacrificing security
- Typical team size: 5-50 engineers

**Secondary: Enterprise Software Teams**
- Internal tools requiring enterprise-grade security
- Greenfield projects within large organizations
- Modernization initiatives
- Platform teams building shared infrastructure

**Verticals with Deep Domain Modules:**
- Fintech (payments, compliance-heavy)
- Healthcare (HIPAA, PHI handling)
- HR Tech (candidate management, onboarding)
- Events & Hospitality (ticketing, venues, staff)

### Competitive Landscape

| Category | Key Players | Rottay Advantage |
|----------|-------------|------------------|
| Auth | Auth0, Clerk, Supabase, Firebase, Cognito | Auth is one module of 17; unified with compliance, tenancy, permissions |
| Compliance | Vanta, Drata, Secureframe | We implement controls, not just track them; 15 vs. 5 frameworks |
| Feature Flags | LaunchDarkly, Split, Statsig | Included in platform, not additional per-seat cost |
| Permissions | Permit.io, Oso, Cerbos | Native RBAC with 1000+ granular permissions; no separate integration |
| Multi-Tenancy | Nile, custom-built | Native isolation pattern; every query filtered by tenantId |

### Key Differentiators

| Differentiator | Point Solutions | Rottay |
|----------------|-----------------|--------|
| Integration | Multiple APIs, docs, patterns | Single SDK, unified types |
| Coherence | Each vendor different conventions | Result<T> pattern everywhere |
| Compliance | Track controls manually | Automatic implementation |
| Multi-tenancy | Build from scratch | Built-in isolation |
| Pricing | Per-seat/MAU, costs scale unpredictably | Predictable platform fee |
| Domain logic | Generic, vertical-agnostic | Domain modules for specific verticals |

---

## Product Capabilities

### Platform Modules (8)

| Module | Use Cases | Description |
|--------|-----------|-------------|
| Auth | 150+ | Authentication (password, passwordless, SSO, MFA, passkeys) |
| Identity | 80+ | User profiles, account management, verification |
| Permissions | 120+ | RBAC, granular permissions, role management |
| Tenancy | 90+ | Multi-tenant isolation, tenant management |
| Compliance | 200+ | 15 frameworks, evidence collection, audit trails |
| Observability | 60+ | Logging, monitoring, alerting |
| Notifications | 70+ | Email, SMS, push, in-app notifications |
| Feature Management | 50+ | Feature flags, A/B testing, rollouts |

### Domain Modules (9)

| Module | Vertical | Description |
|--------|----------|-------------|
| Events | Events | Event creation, ticketing, attendee management |
| Venues | Hospitality | Venue booking, capacity, layouts |
| Staff | HR/Staffing | Staff scheduling, availability, assignments |
| Bar | Hospitality | POS, inventory, menu management |
| Billing | All | Subscriptions, invoicing, usage billing |
| Recruiting | HR Tech | ATS features, candidate pipeline |
| Onboarding | HR | Employee onboarding workflows |
| Documents | All | Document management, signing, storage |
| Analytics | All | Business intelligence, reporting |

### Technical Differentiators

**Result<T> Pattern**
```typescript
// Predictable error handling everywhere
const result = await makeLoginUseCase().execute(input);
if (result.isErr()) {
  // Type-safe error handling
  return handleError(result.error);
}
// result.value is typed correctly
```

**{ tenantId } Isolation**
```typescript
// Every operation requires tenant context
const users = await getUsers({ tenantId });
// Cross-tenant data access is impossible
```

**Built-in RBAC**
```typescript
// 1000+ granular permissions
const canEdit = await checkPermission({
  userId,
  tenantId,
  permission: 'documents:edit'
});
```

**15 Compliance Frameworks**
- Not just tracking - actual implementation
- Automatic evidence collection
- Continuous compliance verification
- Audit-ready reports

---

## Business Model

### Pricing Approach

- **Platform fee** based on usage tier, not per-seat
- Predictable costs that don't scale with user count
- All modules included (no nickel-and-diming)
- Volume discounts for enterprise

### Customer Segments

| Segment | Characteristics | Typical Deal |
|---------|-----------------|--------------|
| Startup | Seed-Series A, <10 engineers | Self-serve, low-touch |
| Scaleup | Series A-C, 10-50 engineers | Sales-assisted, annual contract |
| Enterprise | 50+ engineers, complex requirements | Enterprise sales, custom terms |

### Go-to-Market

- **Product-led growth**: Free tier, self-serve onboarding
- **Developer marketing**: Technical content, open-source contributions
- **Outbound sales**: Target companies using multiple point solutions
- **Partner channel**: System integrators, dev agencies

---

## Customer Evidence

### Verticals in Production

- **HR Tech**: BitHire recruiting platform
- **Events**: Evnto event management
- **Hospitality**: Bar and venue management

### Use Case Highlights

- **Multi-tenant SaaS**: Full isolation with single codebase
- **Compliance automation**: SOC 2 achieved in 6 weeks (vs. 6 months)
- **Auth consolidation**: Replaced Auth0 + custom MFA + session management
- **Permission management**: 1000+ permissions across 50+ roles

### Metrics

- Time to integrate: Days, not months
- Vendor consolidation: 6+ vendors to 1
- Cost reduction: 40-60% vs. point solutions combined
- Engineering time saved: 20+ hours/month on infrastructure

---

## Roadmap Themes

*High-level direction without specific dates*

### Near-term Focus

- Enhanced analytics and reporting
- Additional compliance frameworks
- Expanded SSO provider support
- Developer experience improvements

### Medium-term Vision

- AI-powered compliance automation
- Self-healing infrastructure
- Expanded domain modules
- International data residency options

### Long-term Direction

- Platform ecosystem (marketplace)
- Custom module builder
- White-label capabilities
- Industry-specific certifications

---

## Analyst Meeting Agenda Templates

### 30-Minute Briefing

| Time | Topic |
|------|-------|
| 0-5 min | Company overview and positioning |
| 5-10 min | Market problem and opportunity |
| 10-20 min | Solution demo (key differentiators) |
| 20-25 min | Differentiation and competitive positioning |
| 25-30 min | Q&A |

### 60-Minute Deep Dive

| Time | Topic |
|------|-------|
| 0-10 min | Company overview and vision |
| 10-20 min | Market problem deep dive |
| 20-40 min | Technical demo and architecture |
| 40-50 min | Customer evidence and case studies |
| 50-55 min | Roadmap themes |
| 55-60 min | Q&A and next steps |

### Suggested Demo Flow

1. **The Problem** (2 min)
   - Show typical multi-vendor stack
   - Highlight integration complexity

2. **Quick Start** (3 min)
   - npm install
   - Initialize SDK
   - Show type-safe APIs

3. **Auth Module** (3 min)
   - Login with multiple methods
   - MFA setup
   - Session management

4. **Multi-Tenancy** (3 min)
   - Tenant creation
   - Data isolation
   - Tenant switching

5. **Compliance** (3 min)
   - Framework selection
   - Automatic evidence
   - Audit dashboard

6. **Domain Module** (3 min)
   - Show vertical-specific capability
   - Highlight depth vs. generic tools

---

## Follow-Up Materials

### For Security-Focused Analysts

- Security Whitepaper (SECURITY-WHITEPAPER.md)
- SOC 2 Type II report (under NDA)
- Penetration test summary (under NDA)
- Architecture security overview

### For Technical Analysts

- API documentation
- SDK reference
- Architecture diagrams
- Integration guides

### For Business Analysts

- TCO calculator
- ROI case studies
- Pricing comparison
- Customer references

### Customer References

*Available upon request with customer approval:*
- Technical decision makers
- Security/compliance officers
- Engineering leads
- Founders/executives

---

## Key Talking Points by Analyst Type

### Gartner (Magic Quadrant / Market Guide)

- Focus on vision and execution
- Emphasize completeness of platform
- Highlight customer momentum
- Discuss roadmap themes

### Forrester (Wave / Now Tech)

- Focus on current capabilities
- Emphasize customer outcomes
- Provide demo access
- Share customer references

### IDC (MarketScape)

- Focus on market positioning
- Emphasize growth trajectory
- Discuss go-to-market strategy
- Share competitive wins

### Boutique/Independent Analysts

- Focus on technical differentiation
- Provide hands-on access
- Deep dive on architecture
- Discuss specific use cases

---

## Analyst Relationship Goals

### Near-term

- Establish awareness of Rottay category
- Secure inclusion in relevant research
- Build analyst understanding of differentiation

### Medium-term

- Achieve coverage in market guides
- Position for Wave/Quadrant inclusion
- Develop ongoing briefing cadence

### Long-term

- Category leadership recognition
- Analyst endorsement for enterprise deals
- Speaking opportunities at analyst events

---

*Last Updated: January 2026*
*Contact: analyst-relations@rottay.com*
