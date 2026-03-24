# Comparison Landing Page Content

Ready-to-use copy for "Rottay vs X" landing pages.

---

## Rottay vs Auth0

### Meta

- **Title**: Rottay vs Auth0: Complete B2B SaaS Infrastructure
- **Description**: Auth0 solves authentication. Rottay solves authentication, compliance, multi-tenancy, permissions, and everything else.

### Hero

- **Headline**: "Auth0 Solves Authentication. We Solve Everything."
- **Subhead**: 80+ auth use cases, plus compliance, multi-tenancy, permissions, feature flags, and notifications.

### Comparison Table

| Feature | Auth0 | Rottay |
|---------|-------|--------|
| Authentication | Yes | Yes |
| Multi-tenancy | No | Yes |
| Compliance (SOC2, GDPR, etc.) | No | Yes |
| Permissions/RBAC | Basic | Advanced |
| Feature Flags | No | Yes |
| Notifications | No | Yes |
| SSO Connections | Extra cost | Included |
| Audit Logging | Limited | Full |

### Pain Points We Address

- Auth0 pricing (34% cite concerns)
- 4 outages in 2024
- SSO connection costs ($500+/month per connection)
- Limited to authentication only

### Code Comparison

```typescript
// Before: Auth0 + 5 other vendors
import { Auth0Client } from '@auth0/auth0-spa-js';
import { LaunchDarkly } from 'launchdarkly-js-client-sdk';
import { VantaClient } from '@vanta/sdk';
// ... more imports

// After: Rottay
import { auth, compliance, flags } from '@rottay/platform';
```

### Pricing Comparison

| Scale | Auth0 TCO | Rottay TCO | Savings |
|-------|-----------|------------|---------|
| 10K MAU | $1,200/mo | $500/mo | 58% |
| 50K MAU | $4,800/mo | $1,200/mo | 75% |
| 100K MAU | $9,600/mo | $2,000/mo | 79% |

*Includes SSO, MFA, compliance features

### Migration Section

- Zero-downtime migration path
- Auth0 session compatibility
- User data import tools
- Link to: MIGRATION-GUIDES.md

### CTA

"See the difference in 15 minutes"

---

## Rottay vs Vanta

### Meta

- **Title**: Rottay vs Vanta: Compliance That Implements Itself
- **Description**: Vanta tracks compliance in a dashboard. Rottay implements compliance in your code.

### Hero

- **Headline**: "Vanta Tracks Compliance. We Implement It."
- **Subhead**: 138 compliance use cases across 15 frameworks. Built into your code, not a separate dashboard.

### Key Differentiators

| Capability | Vanta | Rottay |
|------------|-------|--------|
| Compliance Frameworks | 5 | 15 |
| Audit Fees | Separate | Included |
| Implementation | Dashboard-only | Code-based |
| KYC/AML | No | Yes |
| Gaming Compliance | No | Yes |
| Crypto/DeFi | No | Yes |

### Pain Points We Address

- Vanta tracks, doesn't implement
- Audit fees add 30-50% to cost
- Dashboard disconnected from code
- Limited to common frameworks

### Comparison Table

| Framework | Vanta | Rottay |
|-----------|-------|--------|
| SOC 2 | Yes | Yes |
| ISO 27001 | Yes | Yes |
| GDPR | Yes | Yes |
| HIPAA | Yes | Yes |
| PCI DSS | Partial | Yes |
| Gaming (GLI, BMM) | No | Yes |
| Crypto (MiCA, Travel Rule) | No | Yes |
| AML/KYC | No | Yes |

### CTA

"Compliance in code, not dashboards"

---

## Rottay vs Clerk

### Meta

- **Title**: Rottay vs Clerk: Beyond Authentication Components
- **Description**: Clerk provides auth components. Rottay provides the complete B2B SaaS infrastructure.

### Hero

- **Headline**: "Clerk Gives You Auth Components. We Give You Infrastructure."
- **Subhead**: Same beautiful auth UI, plus multi-tenancy, compliance, permissions, and more.

### Comparison Table

| Feature | Clerk | Rottay |
|---------|-------|--------|
| Auth UI Components | Yes | Yes |
| Multi-tenancy | Basic | Advanced |
| Organization Management | Yes | Yes |
| Compliance | No | Yes |
| Feature Flags | No | Yes |
| Permissions/RBAC | Basic | Advanced |
| Audit Logging | Limited | Full |

### Pain Points We Address

- Organization pricing compounds quickly
- Limited to auth + basic org management
- No compliance, feature flags, or advanced permissions
- Scaling costs unpredictable

### CTA

"Beautiful auth UI with complete infrastructure"

---

## Rottay vs LaunchDarkly

### Meta

- **Title**: Rottay vs LaunchDarkly: Feature Flags Without Seat Limits
- **Description**: LaunchDarkly charges per seat. Rottay includes unlimited feature flags in your infrastructure.

### Hero

- **Headline**: "LaunchDarkly Charges Per Seat. We Don't."
- **Subhead**: Unlimited feature flags included with your B2B SaaS infrastructure.

### Comparison Table

| Feature | LaunchDarkly | Rottay |
|---------|--------------|--------|
| Feature Flags | Yes | Yes |
| Pricing Model | Per seat | Flat rate |
| Auth Integration | No | Yes |
| Multi-tenancy | No | Yes |
| Compliance | No | Yes |
| Targeting | Advanced | Advanced |
| Analytics | Yes | Yes |

### Pain Points We Address

- Seat-based pricing scales badly (10 devs = $1,500+/mo)
- Feature flags isolated from auth/permissions
- Separate vendor to manage
- No multi-tenant awareness

### CTA

"Feature flags included, not extra"

---

## Rottay vs Firebase Auth

### Meta

- **Title**: Rottay vs Firebase Auth: Enterprise-Ready Authentication
- **Description**: Firebase Auth is great for consumer apps. Rottay is built for B2B SaaS.

### Hero

- **Headline**: "Firebase Auth for Consumers. Rottay for B2B."
- **Subhead**: Enterprise SSO, multi-tenancy, compliance, and advanced permissions included.

### Comparison Table

| Feature | Firebase Auth | Rottay |
|---------|---------------|--------|
| Basic Auth | Yes | Yes |
| Enterprise SSO | Limited | Full |
| Multi-tenancy | No | Yes |
| B2B Features | No | Yes |
| Compliance | No | Yes |
| SMS Costs | Hidden | Transparent |
| Permissions | Basic | Advanced |

### Pain Points We Address

- SMS verification costs hidden until bill arrives
- No native multi-tenancy
- Enterprise SSO requires Identity Platform upgrade
- Not built for B2B use cases

### CTA

"Built for B2B from day one"

---

## Rottay vs Azure AD B2C (Migration Focus)

### Meta

- **Title**: Migrate from Azure AD B2C Before Sunset | Rottay
- **Description**: Azure AD B2C sunset announced. Migrate to Rottay with zero downtime and full feature parity.

### Hero

- **Headline**: "Azure AD B2C Sunset Approaching. Migrate Now."
- **Subhead**: Zero-downtime migration with session compatibility and enhanced features.

### Urgency Banner

"Azure AD B2C external identities transition deadline approaching. Start planning your migration today."

### Migration Path

| Phase | Timeline | Actions |
|-------|----------|---------|
| Assessment | Week 1 | Audit current setup, map features |
| Parallel Run | Week 2-3 | Deploy Rottay alongside B2C |
| Migration | Week 4 | Gradual user migration |
| Cutover | Week 5 | Full transition, B2C sunset |

### Feature Parity

| Azure AD B2C Feature | Rottay Equivalent |
|----------------------|-------------------|
| User Flows | Configurable auth flows |
| Custom Policies | Code-based customization |
| Identity Providers | 50+ providers supported |
| MFA | Multiple MFA methods |
| Self-service Password | Yes |
| Branding | Full white-label |

### CTA

"Start your free migration assessment"

---

## Rottay vs Building In-House

### Meta

- **Title**: Build vs Buy: Why Teams Choose Rottay
- **Description**: 18-24 months to build. 1 day to deploy Rottay. Focus on your product, not infrastructure.

### Hero

- **Headline**: "18 Months to Build. 1 Day to Deploy."
- **Subhead**: 1,847 use cases ready to use. Focus on your product, not plumbing.

### Build vs Buy Analysis

| Factor | Build In-House | Rottay |
|--------|----------------|--------|
| Time to Production | 18-24 months | 1 day |
| Engineering Cost | $1.5M+ | $0 |
| Ongoing Maintenance | 2-3 FTE | Included |
| Security Updates | Your responsibility | Automatic |
| Compliance | Build from scratch | Pre-built |
| Total 3-Year Cost | $3M+ | ~$100K |

### What You'd Have to Build

- Authentication (80+ use cases)
- Multi-tenancy (14 use cases)
- Permissions/RBAC (48 use cases)
- Compliance (138 use cases)
- Feature Flags (45 use cases)
- Notifications (66 use cases)
- Audit Logging
- And more...

### Engineering Time Calculator

| Component | Estimated Build Time |
|-----------|---------------------|
| Auth System | 4-6 months |
| Multi-tenancy | 3-4 months |
| Permissions | 2-3 months |
| Compliance | 6-8 months |
| Feature Flags | 1-2 months |
| Notifications | 1-2 months |
| **Total** | **17-25 months** |

### CTA

"Ship your product, not infrastructure"

---

## Template Structure

For each comparison page, include:

1. **Meta** - Title, description for SEO
2. **Hero** - Headline, subhead
3. **Comparison Table** - Feature-by-feature
4. **Pain Points** - What we address
5. **Code Comparison** - Before/after (where applicable)
6. **Pricing Comparison** - TCO analysis
7. **Migration Section** - Path forward
8. **CTA** - Clear next step
