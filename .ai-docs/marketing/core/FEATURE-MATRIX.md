# Rottay Feature Matrix

> **The Definitive Feature Comparison**
>
> Hyper-detailed, feature-by-feature comparison of Rottay against 40+ competitors across all infrastructure categories.
> Last updated: January 2026

---

## How to Read This Matrix

### Symbols

| Symbol | Meaning |
|--------|---------|
| Yes | Feature included in base tier |
| No | Feature not available |
| Partial | Limited implementation or missing capabilities |
| Enterprise | Only available on enterprise/custom tier |
| Extra $ | Available but costs additional money |
| Limited | Feature exists but with significant restrictions |
| Beta | Feature in beta/preview |
| Manual | Requires manual configuration/implementation |
| Complex | Feature exists but requires significant setup |
| N/A | Not applicable to this product category |

### Pricing Indicators

| Indicator | Meaning |
|-----------|---------|
| Included | No additional cost |
| +$X/mo | Additional monthly cost |
| +$X/conn | Per-connection pricing |
| +$X/MAU | Per monthly active user |
| +$X/seat | Per team member |
| +$X/event | Per event/action |

---

## Executive Summary

### Quick Overview: What Rottay Replaces

| Category | Rottay Modules | Competitors Replaced | Annual Savings |
|----------|----------------|---------------------|----------------|
| Authentication | @rottay/auth (80+ use cases) | Auth0, Clerk, Cognito, Firebase, Stytch | $9,600-$48,000 |
| Compliance | @rottay/compliance (138 use cases) | Vanta, Drata, Secureframe, Thoropass | $7,500-$100,000 |
| Feature Flags | @rottay/feature-flags (30+ use cases) | LaunchDarkly, Split, Statsig, Flagsmith | $600-$20,000 |
| Permissions | @rottay/permissions (40+ use cases) | Permit.io, Oso, Cerbos, OpenFGA | $1,800-$10,000 |
| Multi-Tenancy | @rottay/tenancy (50+ use cases) | Nile, Turso, PlanetScale, Custom | $2,400-$6,000 |
| Notifications | @rottay/notifications (25+ use cases) | Twilio, SendGrid, Knock, Novu, Resend | $3,000-$50,000 |
| **TOTAL** | **8 platform modules, 500+ use cases** | **6+ vendors** | **$27,880-$250,000+** |

### The Bottom Line

| Metric | Best-of-Breed Stack | Rottay |
|--------|---------------------|--------|
| Vendors to manage | 6-10 | 1 |
| SDKs to learn | 6-10 | 1 |
| Dashboards | 6-10 | 1 |
| Support queues | 6-10 | 1 |
| Security surfaces | 6-10 | 1 |
| Integration time | 10-18 weeks | 1-2 weeks |
| Annual cost (50K MAU) | $27,880-$50,000+ | Unified pricing |

---

## Detailed Feature Comparison

### 1. Authentication Features

#### Core Authentication

| Feature | Rottay | Auth0 | Clerk | Firebase | Cognito | Supabase | Stytch | WorkOS |
|---------|--------|-------|-------|----------|---------|----------|--------|--------|
| Email/Password Auth | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| Username/Password Auth | Yes | Yes | Yes | No | Yes | Yes | No | No |
| OAuth 2.0 | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| OIDC Support | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Social Login (Google) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Social Login (GitHub) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Social Login (Microsoft) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Social Login (Apple) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Social Login (LinkedIn) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Social Login (Twitter/X) | Yes | Yes | Yes | Yes | Limited | Yes | Yes | No |
| Social Login (Facebook) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| Social Login (Discord) | Yes | Yes | Yes | No | No | Yes | No | No |
| Social Login (Slack) | Yes | Yes | Yes | No | No | Yes | No | Yes |
| Custom OAuth Providers | Yes | Yes | Yes | No | Yes | Yes | Yes | Yes |
| JWT Access Tokens | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Refresh Tokens | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Token Revocation | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Custom Claims | Yes | Yes | Yes | Limited | Yes | Yes | Limited | Yes |

#### Passwordless Authentication

| Feature | Rottay | Auth0 | Clerk | Firebase | Cognito | Supabase | Stytch | WorkOS |
|---------|--------|-------|-------|----------|---------|----------|--------|--------|
| Magic Links | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Email OTP | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| SMS OTP | Yes | Yes | Yes | Yes | Yes | No | Yes | No |
| Passkeys/WebAuthn | Yes | Yes | Yes | No | No | No | Yes | No |
| FIDO2 | Yes | Yes | Yes | No | No | No | Yes | No |
| Biometric Auth | Yes | Yes | Yes | No | No | No | Yes | No |
| Hardware Keys (YubiKey) | Yes | Yes | Yes | No | No | No | Yes | No |
| Phone Number Login | Yes | Yes | Yes | Yes | Yes | Limited | Yes | No |

#### Multi-Factor Authentication (MFA)

| Feature | Rottay | Auth0 | Clerk | Firebase | Cognito | Supabase | Stytch | WorkOS |
|---------|--------|-------|-------|----------|---------|----------|--------|--------|
| TOTP (Authenticator Apps) | Yes | Yes | Yes | No | Yes | Yes | Yes | Enterprise |
| SMS MFA | Yes | Yes | Yes | Yes | Yes | No | Yes | No |
| Email MFA | Yes | Yes | No | Yes | Yes | No | Yes | No |
| Push Notifications MFA | Yes | Enterprise | No | Yes | No | No | No | No |
| Hardware Key MFA | Yes | Yes | Yes | No | No | No | Yes | No |
| Backup/Recovery Codes | Yes | Yes | Yes | No | Yes | Yes | Yes | No |
| Adaptive MFA | Yes | Enterprise | No | No | Extra $ | No | No | No |
| Step-Up Authentication | Yes | Enterprise | No | No | Yes | No | Yes | No |
| MFA Enrollment Flow | Yes | Yes | Yes | No | Yes | Yes | Yes | No |
| MFA per Application | Yes | Yes | No | No | Yes | No | No | No |
| MFA Remember Device | Yes | Yes | Yes | No | Yes | Yes | Yes | No |

#### Enterprise SSO

| Feature | Rottay | Auth0 | Clerk | WorkOS | Stytch | Cognito | FusionAuth |
|---------|--------|-------|-------|--------|--------|---------|------------|
| SAML 2.0 SSO | Yes | Enterprise | Enterprise | Yes | Enterprise | Yes | Yes |
| OIDC SSO | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Okta Integration | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Azure AD Integration | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Google Workspace SSO | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| OneLogin Integration | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| PingFederate | Yes | Enterprise | No | Yes | No | Yes | Yes |
| ADFS Integration | Yes | Enterprise | No | Yes | No | Yes | Yes |
| Custom SAML IdP | Yes | Enterprise | Enterprise | Yes | Enterprise | Yes | Yes |
| SSO Connection Limit | Unlimited | Limited | $50/conn | $125/conn | Enterprise | Unlimited | Unlimited |
| SSO Portal/SP-Initiated | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| IdP-Initiated SSO | Yes | Yes | Limited | Yes | Limited | Yes | Yes |
| Just-in-Time Provisioning | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SSO + MFA Policies | Yes | Enterprise | Limited | Yes | Limited | Yes | Yes |
| SSO Pricing | Included | +$500/mo | +$50/conn | +$125/conn | Enterprise | Included | Included |

#### Directory Sync & User Provisioning

| Feature | Rottay | Auth0 | Clerk | WorkOS | Okta | Cognito |
|---------|--------|-------|-------|--------|------|---------|
| SCIM 2.0 | Yes | Enterprise | Yes | Yes | Yes | Yes |
| Azure AD Sync | Yes | Enterprise | Yes | Yes | Yes | Yes |
| Google Directory Sync | Yes | Enterprise | Yes | Yes | Yes | Yes |
| Okta Directory Sync | Yes | Enterprise | Yes | Yes | Yes | Yes |
| OneLogin Sync | Yes | Enterprise | Yes | Yes | Yes | Yes |
| Custom Directory Sync | Yes | Enterprise | No | Yes | Yes | Yes |
| Group Provisioning | Yes | Enterprise | Yes | Yes | Yes | Yes |
| Attribute Mapping | Yes | Enterprise | Yes | Yes | Yes | Yes |
| Deprovisioning | Yes | Enterprise | Yes | Yes | Yes | Yes |
| Real-time Sync | Yes | Enterprise | Yes | Yes | Yes | Yes |
| Sync Conflict Resolution | Yes | Enterprise | Limited | Yes | Yes | Limited |

#### Session Management

| Feature | Rottay | Auth0 | Clerk | Firebase | Cognito | Supabase |
|---------|--------|-------|-------|----------|---------|----------|
| Session Management | Yes | Yes | Yes | Yes | Yes | Yes |
| Concurrent Session Limit | Yes | Enterprise | Yes | No | Yes | No |
| Session Revocation | Yes | Yes | Yes | Yes | Yes | Yes |
| Active Sessions View | Yes | Yes | Yes | No | Yes | Yes |
| Session Timeout Config | Yes | Yes | Yes | Yes | Yes | Yes |
| Idle Timeout | Yes | Yes | Yes | No | Yes | No |
| Absolute Timeout | Yes | Yes | Yes | Yes | Yes | Yes |
| Session Extension | Yes | Yes | Yes | Yes | Yes | Yes |
| Device Fingerprinting | Yes | Enterprise | No | No | No | No |
| Geo-Based Sessions | Yes | Enterprise | No | No | No | No |

#### Security Features

| Feature | Rottay | Auth0 | Clerk | Firebase | Cognito | Supabase |
|---------|--------|-------|-------|----------|---------|----------|
| Brute Force Protection | Yes | Yes | Yes | Yes | Yes | Yes |
| Account Lockout | Yes | Yes | Yes | Yes | Yes | Limited |
| Suspicious IP Detection | Yes | Enterprise | Limited | No | No | No |
| **Impossible Travel Detection** | **Yes** | **Extra $** | No | No | No | No |
| Bot Detection | Yes | Enterprise | Yes | No | Yes | No |
| Credential Stuffing Protection | Yes | Enterprise | Yes | No | Yes | No |
| Breached Password Detection | Yes | Enterprise | Yes | No | No | No |
| Password Policies | Yes | Yes | Yes | Yes | Yes | Yes |
| Password History | Yes | Yes | No | No | Yes | No |
| Password Strength Meter | Yes | Yes | Yes | No | Yes | No |
| Account Recovery | Yes | Yes | Yes | Yes | Yes | Yes |
| Security Email Notifications | Yes | Yes | Yes | Yes | Yes | Yes |
| IP Allowlist/Blocklist | Yes | Enterprise | Limited | No | Yes | No |
| Risk-Based Authentication | Yes | Enterprise | No | No | Extra $ | No |
| Anomaly Detection | Yes | Enterprise | No | No | Extra $ | No |

#### Unique Rottay Auth Features

| Feature | Rottay | Auth0 | Clerk | Firebase | Cognito | Others |
|---------|--------|-------|-------|----------|---------|--------|
| **Profile Merging** | **Yes** | No | No | No | No | No |
| **Admin Impersonation** | **Yes** | Limited | No | No | No | WorkOS: Limited |
| **Device Trust** | **Yes** | Enterprise | No | No | No | No |
| **Result<T> Pattern** | **Yes** | No | No | No | No | No |
| **Multi-Tenant Isolation** | **Yes** | Limited | Limited | No | Limited | Nile: Yes |
| **Auth Event Webhooks** | **Yes** | Yes | Yes | Yes | Yes | Yes |
| **Custom Auth Flows** | **Yes** | Enterprise | Limited | Limited | Yes | Yes |
| **Auth Analytics** | **Yes** | Yes | Yes | Limited | Yes | Limited |

---

### 2. Compliance Features

#### Standard Frameworks

| Feature | Rottay | Vanta | Drata | Secureframe | Thoropass | Sprinto |
|---------|--------|-------|-------|-------------|-----------|---------|
| SOC 2 Type I | Yes | Yes | Yes | Yes | Yes | Yes |
| SOC 2 Type II | Yes | Yes | Yes | Yes | Yes | Yes |
| ISO 27001 | Yes | Yes | Yes | Yes | Yes | Yes |
| ISO 27017 | Yes | Yes | Yes | Yes | Limited | Limited |
| ISO 27018 | Yes | Yes | Yes | Yes | Limited | Limited |
| HIPAA | Yes | Yes | Yes | Yes | Yes | Yes |
| PCI-DSS Level 1 | Yes | Yes | Yes | Yes | Yes | Yes |
| PCI-DSS Level 2-4 | Yes | Yes | Yes | Yes | Yes | Yes |
| GDPR | Yes | Yes | Yes | Yes | Yes | Yes |
| CCPA/CPRA | Yes | Limited | Limited | Limited | Limited | Limited |
| Total Standard Frameworks | 10 | 5 | 6 | 6 | 5 | 6 |

#### Specialized Compliance (Rottay Exclusives)

| Feature | Rottay | Vanta | Drata | Secureframe | Thoropass | Sprinto |
|---------|--------|-------|-------|-------------|-----------|---------|
| **BIPA (Biometric)** | **Yes** | No | No | No | No | No |
| **KYC (Know Your Customer)** | **Yes** | No | No | No | No | No |
| **AML (Anti-Money Laundering)** | **Yes** | No | No | No | No | No |
| **MiCA (Crypto EU)** | **Yes** | No | No | No | No | No |
| **Travel Rule (Crypto)** | **Yes** | No | No | No | No | No |
| **AI Hiring Compliance** | **Yes** | No | No | No | No | No |
| **FCRA (Background Checks)** | **Yes** | No | No | No | No | No |
| **Responsible Gaming** | **Yes** | No | No | No | No | No |
| **PSD2 (Payments EU)** | **Yes** | No | No | No | No | No |
| **DORA (Digital Operations)** | **Yes** | No | No | No | No | No |
| **MiFID II (Securities)** | **Yes** | No | No | No | No | No |
| **Solvency II (Insurance)** | **Yes** | No | No | No | No | No |
| **Total Specialized** | **12** | **0** | **0** | **0** | **0** | **0** |
| **Total All Frameworks** | **15+** | **5** | **6** | **6** | **5** | **6** |

#### Data Privacy & GDPR Features

| Feature | Rottay | Vanta | Drata | Secureframe | OneTrust | Osano |
|---------|--------|-------|-------|-------------|----------|-------|
| DSAR Automation | Yes | Yes | Yes | Yes | Yes | Yes |
| DSAR Response Time | <24 hours | Manual | Manual | Manual | Automated | Automated |
| Consent Management | Yes | Limited | Limited | Limited | Yes | Yes |
| Cookie Consent | Yes | No | No | No | Yes | Yes |
| Data Inventory | Yes | Yes | Yes | Yes | Yes | Yes |
| **Auto Data Classification** | **Yes** | No | No | No | Limited | No |
| **PII Detection** | **Yes** | No | No | No | Limited | No |
| **PHI Detection** | **Yes** | No | No | No | Limited | No |
| **PCI Data Detection** | **Yes** | No | No | No | Limited | No |
| Data Retention Policies | Yes | Yes | Yes | Yes | Yes | Yes |
| **Automated Deletion** | **Yes** | Manual | Manual | Manual | Yes | Limited |
| Data Portability | Yes | Limited | Limited | Limited | Yes | Limited |
| Encryption at Rest | Yes | Yes | Yes | Yes | Yes | Yes |
| Encryption in Transit | Yes | Yes | Yes | Yes | Yes | Yes |
| Field-Level Encryption | Yes | No | No | No | No | No |
| Cross-Border Transfers | Yes | Yes | Yes | Yes | Yes | Yes |
| Privacy Impact Assessment | Yes | Yes | Yes | Yes | Yes | Yes |

#### Audit & Evidence

| Feature | Rottay | Vanta | Drata | Secureframe | Thoropass |
|---------|--------|-------|-------|-------------|-----------|
| Audit Trails | Yes | Yes | Yes | Yes | Yes |
| Evidence Collection | Automatic | Automatic | Automatic | Automatic | Automatic |
| Evidence Storage | Unlimited | Limited | Limited | Limited | Limited |
| Continuous Monitoring | Yes | Yes | Yes | Yes | Yes |
| Real-Time Alerts | Yes | Yes | Yes | Yes | Yes |
| Custom Controls | Yes | Yes | Yes | Yes | Yes |
| Control Mapping | Yes | Yes | Yes | Yes | Yes |
| Gap Analysis | Yes | Yes | Yes | Yes | Yes |
| **Audit Fee Included** | **Yes** | No (+$10-50K) | No | Varies | No |
| **Implementation Fee** | **No** | No | +20-35% | No | No |
| Auditor Portal | Yes | Yes | Yes | Yes | Yes |
| Evidence Export | Yes | Yes | Yes | Yes | Yes |
| SOC 2 Report Generation | Yes | Yes | Yes | Yes | Yes |

#### Vendor Management

| Feature | Rottay | Vanta | Drata | Secureframe | SecurityScorecard |
|---------|--------|-------|-------|-------------|-------------------|
| Vendor Inventory | Yes | Yes | Yes | Yes | Yes |
| Vendor Risk Assessment | Yes | Yes | Yes | Yes | Yes |
| Vendor Questionnaires | Yes | Yes | Yes | Yes | Yes |
| Auto-Populate Answers | Yes | Yes | Yes | Yes | Yes |
| Vendor Monitoring | Yes | Yes | Yes | Yes | Yes |
| Vendor SOC 2 Tracking | Yes | Yes | Yes | Yes | Yes |
| Contract Management | Yes | Limited | Limited | Limited | No |
| Vendor Offboarding | Yes | Yes | Yes | Yes | No |

#### Incident Response

| Feature | Rottay | Vanta | Drata | Secureframe | PagerDuty |
|---------|--------|-------|-------|-------------|-----------|
| Incident Response Plans | Yes | Playbooks | Playbooks | Playbooks | Yes |
| Breach Detection | Yes | Yes | Yes | Yes | Yes |
| Breach Notification | Yes | Yes | Yes | Yes | Yes |
| **Auto Breach Response** | **Yes** | Manual | Manual | Manual | Automated |
| Incident Tracking | Yes | Yes | Yes | Yes | Yes |
| Post-Incident Analysis | Yes | Yes | Yes | Yes | Yes |
| Regulatory Notification | Yes | Yes | Yes | Yes | No |

#### KYC/AML Features (Rottay Exclusive in Category)

| Feature | Rottay | Vanta | Drata | Jumio | Onfido | Persona |
|---------|--------|-------|-------|-------|--------|---------|
| Identity Verification | Yes | N/A | N/A | Yes | Yes | Yes |
| Document Verification | Yes | N/A | N/A | Yes | Yes | Yes |
| Face Matching | Yes | N/A | N/A | Yes | Yes | Yes |
| Liveness Detection | Yes | N/A | N/A | Yes | Yes | Yes |
| Address Verification | Yes | N/A | N/A | Yes | Yes | Yes |
| PEP/Sanctions Screening | Yes | N/A | N/A | No | No | Yes |
| Adverse Media Screening | Yes | N/A | N/A | No | No | Yes |
| Transaction Monitoring | Yes | N/A | N/A | No | No | No |
| Suspicious Activity Reports | Yes | N/A | N/A | No | No | No |
| Risk Scoring | Yes | N/A | N/A | Yes | Yes | Yes |
| Ongoing Monitoring | Yes | N/A | N/A | No | No | Limited |
| **Integrated with Auth** | **Yes** | N/A | N/A | No | No | No |

---

### 3. Feature Flags

| Feature | Rottay | LaunchDarkly | Split.io | Statsig | Flagsmith | ConfigCat | Unleash |
|---------|--------|--------------|----------|---------|-----------|-----------|---------|
| Boolean Flags | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| String Flags | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Number Flags | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| JSON Flags | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Per-Tenant Flags** | **Yes** | Limited | Limited | Limited | No | No | No |
| Per-User Flags | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Per-Group Flags | Yes | Yes | Yes | Yes | Limited | Limited | Yes |
| Percentage Rollouts | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Scheduled Releases | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Gradual Rollouts | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| A/B Testing | Yes | Yes | Yes | Yes | Yes | Limited | Yes |
| Multivariate Testing | Yes | Yes | Yes | Yes | Limited | Limited | Yes |
| Feature Targeting | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Custom Targeting Rules | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Environment Support | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Flag Dependencies | Yes | Yes | Yes | Limited | No | No | Yes |
| Kill Switch | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Audit Log | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Webhooks | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| API Access | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SDK (JavaScript) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SDK (React) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SDK (Node.js) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SDK (Python) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SDK (Go) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SDK (Java) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SDK (Mobile) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Real-time Updates | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Offline Mode | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Pricing Model** | **Included** | Per-seat | Per-user | Per-event | Per-seat | Traffic | Self-host |
| **At 10 Seats** | $0 | $1,200/yr | $3,960/yr | Variable | $540/yr | Variable | $0 |
| **At 50 Seats** | $0 | $12,000/yr | $19,800/yr | Variable | $5,400/yr | Variable | $0 |

---

### 4. Permissions & Authorization

| Feature | Rottay | Permit.io | Oso Cloud | Cerbos | OpenFGA | Casbin |
|---------|--------|-----------|-----------|--------|---------|--------|
| RBAC | Yes | Yes | Yes | Yes | Yes | Yes |
| ABAC | Yes | Yes | Yes | Yes | Yes | Yes |
| ReBAC | Yes | Yes | Yes | Yes | Yes | Limited |
| Role Hierarchies | Yes | Yes | Yes | Yes | Yes | Yes |
| Permission Inheritance | Yes | Yes | Yes | Yes | Yes | Yes |
| Dynamic Permissions | Yes | Yes | Yes | Yes | Yes | Yes |
| Custom Policies | Yes | Yes | Yes | Yes | Yes | Yes |
| Policy as Code | Yes | Yes | Yes | Yes | Yes | Yes |
| Condition-Based Access | Yes | Yes | Yes | Yes | Yes | Yes |
| Time-Based Access | Yes | Yes | Limited | Yes | Limited | Yes |
| Resource Permissions | Yes | Yes | Yes | Yes | Yes | Yes |
| Tenant Permissions | Yes | Yes | Limited | Yes | Limited | Limited |
| Group Permissions | Yes | Yes | Yes | Yes | Yes | Yes |
| Permission Templates | Yes | Yes | Limited | Yes | Limited | No |
| Real-time Updates | Yes | Yes | Yes | Yes | Yes | Yes |
| Audit Logs | Yes | Yes | Yes | Yes | Yes | Yes |
| Permission Checks | Yes | Yes | Yes | Yes | Yes | Yes |
| Bulk Operations | Yes | Yes | Limited | Yes | Yes | Yes |
| API Access | Yes | Yes | Yes | Yes | Yes | Yes |
| **Admin Impersonation** | **Yes** | No | No | No | No | No |
| **Built into Use Cases** | **Yes** | No | No | No | No | No |
| **Pricing Model** | Included | MAU | MAU | Custom | Free | Free |
| **At 5K MAU** | $0 | $5,400/yr | Custom | Custom | $0 | $0 |

---

### 5. Multi-Tenancy

| Feature | Rottay | Nile | Turso | PlanetScale | Crunchy | Custom Build |
|---------|--------|------|-------|-------------|---------|--------------|
| Tenant Isolation | Yes | Yes | Yes | Yes | Yes | Manual |
| **{ tenantId } Context** | **Yes** | No | No | No | No | Manual |
| Shared DB Multi-tenancy | Yes | Yes | Yes | Yes | Yes | Manual |
| Dedicated DB Multi-tenancy | Yes | Yes | No | Yes | Yes | Complex |
| **Auto DB Provisioning** | **Yes** | Limited | No | No | No | Manual |
| Row-Level Security | Yes | Yes | Yes | Yes | Yes | Manual |
| Schema-per-Tenant | Yes | Yes | No | Yes | Yes | Manual |
| Tenant Onboarding | Yes | Limited | No | No | No | Manual |
| Tenant Offboarding | Yes | Limited | No | No | No | Manual |
| Tenant Billing | Yes | No | No | No | No | Manual |
| Tenant Usage Tracking | Yes | Limited | No | No | No | Manual |
| Tenant Limits/Quotas | Yes | Limited | No | No | No | Manual |
| Tenant Settings | Yes | No | No | No | No | Manual |
| Custom Domains | Yes | No | No | No | No | Manual |
| White-labeling | Yes | No | No | No | No | Manual |
| Tenant Switching | Yes | No | No | No | No | Manual |
| Super Admin Access | Yes | No | No | No | No | Manual |
| Data Residency (EU/US) | Yes | Limited | Yes | Yes | Yes | Complex |
| Cross-Tenant Reporting | Yes | No | No | No | No | Manual |
| **API Keys per Tenant** | **Yes** | No | No | No | No | Manual |
| **Cross-Tenant Leaks Impossible** | **Yes** | Yes | Yes | Limited | Limited | Risk |
| Pricing Model | Included | Tokens | Flat | Instances | Instances | Engineering |
| At Scale (50 Tenants) | $0 | Variable | $348/yr | $540+/yr | Custom | 4-8 weeks |

---

### 6. Notifications

| Feature | Rottay | Twilio | SendGrid | Knock | Novu | Resend | OneSignal |
|---------|--------|--------|----------|-------|------|--------|-----------|
| Email Notifications | Yes | Via SendGrid | Yes | Yes | Yes | Yes | Limited |
| SMS Notifications | Yes | Yes | No | Yes | Yes | No | Yes |
| Push Notifications (Web) | Yes | No | No | Yes | Yes | No | Yes |
| Push Notifications (iOS) | Yes | No | No | Yes | Yes | No | Yes |
| Push Notifications (Android) | Yes | No | No | Yes | Yes | No | Yes |
| In-App Notifications | Yes | No | No | Yes | Yes | No | Yes |
| Webhooks | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| WhatsApp | Yes | Yes | No | Limited | Yes | No | No |
| Slack | Yes | No | No | Yes | Yes | No | No |
| Discord | Yes | No | No | Limited | Yes | No | No |
| MS Teams | Yes | No | No | Yes | Yes | No | No |
| Template Management | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Dynamic Templates | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Template Versioning | Yes | Limited | Yes | Yes | Yes | Yes | No |
| A/B Testing | Yes | No | Yes | Yes | Yes | No | Yes |
| Personalization | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Localization | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Scheduling | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Batching | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Rate Limiting | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Delivery Tracking | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Open Tracking | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Click Tracking | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Bounce Handling | Yes | Yes | Yes | Yes | Yes | Yes | Limited |
| Unsubscribe Handling | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Preference Management | Yes | Limited | Limited | Yes | Yes | Limited | Yes |
| **Provider Health Monitor** | **Yes** | N/A | N/A | Limited | Yes | No | No |
| **Provider Failover** | **Yes** | N/A | N/A | Limited | Yes | No | No |
| **Pricing Model** | Included | Per-message | Tiers | Platform fee | Free/Pro | Tiers | MAU |
| **SMS (100K/mo)** | $0 | $8,300+ | N/A | Pass-through | Pass-through | N/A | Pass-through |
| **Email (100K/mo)** | $0 | N/A | $20/mo | $0 (usage) | $0 | $20/mo | N/A |

---

### 7. Identity & User Management

| Feature | Rottay | Auth0 | Clerk | Cognito | Okta | Azure AD |
|---------|--------|-------|-------|---------|------|----------|
| User CRUD | Yes | Yes | Yes | Yes | Yes | Yes |
| User Profiles | Yes | Yes | Yes | Yes | Yes | Yes |
| Custom User Attributes | Yes | Yes | Yes | Yes | Yes | Yes |
| User Search | Yes | Yes | Yes | Yes | Yes | Yes |
| Advanced User Filters | Yes | Yes | Yes | Limited | Yes | Yes |
| User Import/Export | Yes | Yes | Yes | Yes | Yes | Yes |
| Bulk Operations | Yes | Yes | Yes | Yes | Yes | Yes |
| User Groups | Yes | Yes | Yes | Yes | Yes | Yes |
| Nested Groups | Yes | Limited | No | No | Yes | Yes |
| Dynamic Groups | Yes | Enterprise | No | No | Yes | Yes |
| Group Rules | Yes | Enterprise | Limited | No | Yes | Yes |
| User Organizations | Yes | Enterprise | Yes | No | Yes | Yes |
| Organization Hierarchy | Yes | Enterprise | Yes | No | Yes | Yes |
| User Invitations | Yes | Yes | Yes | Limited | Yes | Yes |
| User Verification | Yes | Yes | Yes | Yes | Yes | Yes |
| Account Linking | Yes | Yes | Limited | Limited | Yes | Yes |
| **Profile Merging** | **Yes** | No | No | No | No | No |
| User Metadata | Yes | Yes | Yes | Yes | Yes | Yes |
| User Roles | Yes | Yes | Yes | Yes | Yes | Yes |
| User Permissions | Yes | Yes | Yes | Yes | Yes | Yes |
| B2B Organizations | Yes | Enterprise | Yes | No | Yes | Yes |
| B2C Profiles | Yes | Yes | Yes | Yes | Yes | Limited |
| **SCIM Provisioning** | **Yes** | Enterprise | Yes | Yes | Yes | Yes |
| **Use Cases** | **98** | ~30 | ~25 | ~20 | ~50 | ~40 |

---

### 8. Navigation & Access Control

| Feature | Rottay | Custom Build | LaunchDarkly | Split |
|---------|--------|--------------|--------------|-------|
| Menu Management | Yes | Manual | No | No |
| Dynamic Menus | Yes | Manual | No | No |
| Role-Based Menus | Yes | Manual | Via flags | Via flags |
| Permission-Based Menus | Yes | Manual | Via flags | Via flags |
| **Menu Versioning** | **Yes** | No | No | No |
| Menu Rollback | Yes | Manual | No | No |
| Route Access Control | Yes | Manual | No | No |
| Sidebar Configuration | Yes | Manual | No | No |
| Navigation Analytics | Yes | Manual | No | No |
| Breadcrumbs | Yes | Manual | No | No |
| Multi-Tenant Navigation | Yes | Complex | No | No |
| A/B Test Navigation | Yes | Complex | Possible | Possible |
| **Use Cases** | **74** | Variable | 0 | 0 |

---

## Pricing Comparison

### Authentication Pricing at Scale

| Provider | At 10K MAU | At 50K MAU | At 200K MAU | At 1M MAU |
|----------|------------|------------|-------------|-----------|
| **Rottay** | Included | Included | Included | Included |
| Auth0 Essentials | $420/yr | N/A | N/A | N/A |
| Auth0 Professional | $2,880/yr | $9,600/yr | $48,000/yr | Custom |
| Auth0 Enterprise | Custom | Custom | Custom | Custom |
| Clerk | $0 | $9,600/yr | $45,600/yr | $237,600/yr |
| Supabase | $300/yr | $300/yr | Custom | Custom |
| Firebase | $0 + SMS | $0 + SMS | $0 + SMS | $0 + SMS |
| Cognito Lite | $660/yr | $3,300/yr | $13,200/yr | $66,000/yr |
| Cognito Plus | $2,400/yr | $12,000/yr | $48,000/yr | $240,000/yr |
| Stytch | Variable | Variable | Variable | Variable |
| FusionAuth Cloud | $1,500/yr | $6,000/yr | Custom | Custom |

### Compliance Platform Pricing

| Provider | Core Tier | Enterprise Tier | Hidden Costs |
|----------|-----------|-----------------|--------------|
| **Rottay** | Included | Included | None |
| Vanta | $7,500/yr | $25,000/yr | Audit: +$10K-$50K |
| Drata | $7,000/yr | $100,000/yr | Impl: +20-35% |
| Secureframe | $15,000/yr | $25,000/yr | Varies |
| Thoropass | $8,700/yr | Custom | Audit fees |
| Sprinto | $4,000/yr | $20,000/yr | Variable |

### Feature Flags Pricing

| Provider | 5 Seats | 15 Seats | 50 Seats | 100 Seats |
|----------|---------|----------|----------|-----------|
| **Rottay** | $0 | $0 | $0 | $0 |
| LaunchDarkly Foundation | $600/yr | $1,800/yr | $6,000/yr | $12,000/yr |
| LaunchDarkly Pro | $1,200/yr | $3,600/yr | $12,000/yr | $24,000/yr |
| Split.io | $1,980/yr | $5,940/yr | $19,800/yr | $39,600/yr |
| Flagsmith | $540/yr | $1,620/yr | $5,400/yr | $10,800/yr |
| ConfigCat | $1,200/yr | ~$5,000/yr | ~$10,000/yr | Custom |

### Permissions Pricing

| Provider | 1K MAU | 5K MAU | 25K MAU | 100K MAU |
|----------|--------|--------|---------|----------|
| **Rottay** | $0 | $0 | $0 | $0 |
| Permit.io Starter | $1,800/yr | $5,400/yr | Custom | Custom |
| Oso Cloud | $1,788/yr | Custom | Custom | Custom |
| Cerbos | Custom | Custom | Custom | Custom |
| OpenFGA | $0 (self-host) | $0 (self-host) | $0 (self-host) | $0 (self-host) |

### Notifications Pricing

| Provider | Low Volume | Medium | High Volume | 1M SMS/mo |
|----------|------------|--------|-------------|-----------|
| **Rottay** | $0 | $0 | $0 | $0 |
| Twilio SMS | $500/yr | $5,000/yr | $50,000/yr | $100,000/yr |
| SendGrid | $240/yr | $1,080/yr | $4,800/yr | N/A |
| Knock | $3,000/yr | $6,000/yr | Custom | Custom |
| Novu Pro | $0 (self-host) | $2,400/yr | Custom | Custom |
| Resend | $240/yr | $1,080/yr | $4,080/yr | N/A |

### Total Cost of Ownership (Annual)

| Company Size | Best-of-Breed | With Hidden Costs | Rottay |
|--------------|---------------|-------------------|--------|
| **Startup** (10K MAU, 5 eng) | $4,840 | $64,840* | Included |
| **Growth** (50K MAU, 15 eng) | $30,400 | $120,400* | Included |
| **Scale** (200K MAU, 50 eng) | $145,900 | $253,900* | Included |
| **Enterprise** (1M MAU, 100 eng) | $400,000+ | $600,000+* | Included |

*Includes SaaS costs + estimated integration engineering ($60K-$108K)

---

## Integration Time Comparison

### Time to Production

| Platform | Initial Setup | Full Integration | Ongoing Maintenance |
|----------|---------------|------------------|---------------------|
| **Rottay** | 1 day | 1-2 weeks | Minimal |
| Auth0 alone | 1-2 days | 1-2 weeks | Moderate |
| Vanta alone | 1 week | 2-3 weeks | High |
| Full Stack (6 vendors) | 2-3 weeks | 10-18 weeks | Very High |

### Integration Engineering Hours

| Approach | Setup Hours | Annual Maintenance | 3-Year Total |
|----------|-------------|-------------------|--------------|
| **Rottay** | 40-80 | 20 | 100-140 hours |
| Best-of-breed (6 vendors) | 400-720 | 200+ | 1,000-1,320 hours |
| **Savings** | 360-640 | 180+ | 900-1,180 hours |

### Engineering Cost ($150/hour)

| Approach | Year 1 | Year 2 | Year 3 | 3-Year Total |
|----------|--------|--------|--------|--------------|
| **Rottay** | $6,000-$12,000 | $3,000 | $3,000 | $12,000-$18,000 |
| Best-of-breed | $60,000-$108,000 | $30,000 | $30,000 | $120,000-$168,000 |
| **Savings** | $54,000-$96,000 | $27,000 | $27,000 | $108,000-$150,000 |

---

## Features Only Rottay Has

### Unique Platform Features

| Feature | Description | Why It Matters | Alternative |
|---------|-------------|----------------|-------------|
| **Result<T> Pattern** | Every use case returns typed Result, never throws exceptions | Predictable error handling, no try/catch everywhere | None |
| **{ tenantId } Context** | Single parameter isolates all data by tenant automatically | Data leaks between tenants architecturally impossible | Custom code |
| **Impossible Travel Detection** | Flags logins from geographically impossible locations | Prevents account takeover, Auth0 charges extra | Auth0 +$ |
| **Profile Merging** | Links multiple auth providers to single user identity | User consolidation across OAuth providers | None |
| **Admin Impersonation** | Support team can act as user with full audit trail | Enterprise support requirement | WorkOS: Limited |
| **Menu Versioning** | Rollback navigation/menu configurations | Safe UI deployments, instant rollback | None |
| **LLM-as-Judge with Human Calibration** | AI scoring with bias detection and human oversight | Compliant AI hiring, EEOC/BIPA requirements | None |
| **Dedicated Tenant DB Provisioning** | Auto-provision isolated databases for enterprise tenants | True enterprise data isolation | Nile: Different |
| **Data Loss Prevention** | Automatic PII/PHI/PCI classification and protection | Compliance automation, breach prevention | Separate DLP tools |
| **15 Compliance Frameworks** | Beyond SOC2/HIPAA: KYC, AML, Gaming, Crypto, BIPA | Specialized industry compliance | Multiple vendors |

### Unique Architectural Advantages

| Feature | Rottay | Competitors |
|---------|--------|-------------|
| Single SDK | 1 | 6-10 SDKs to maintain |
| Unified Dashboard | 1 | 6-10 dashboards |
| Single Support Queue | 1 | 6-10 support queues |
| Security Surface | 1 vendor | 6-10 vendors with data access |
| Type Safety | End-to-end TypeScript | Varies by vendor |
| Error Handling | Consistent Result<T> | Different patterns per SDK |
| Multi-tenancy | Native to every module | Manual integration |
| RBAC Integration | Built into BaseUseCase | Separate implementation |

### Domain Modules (Competitors Have None)

| Module | Use Cases | Description |
|--------|-----------|-------------|
| dm-recruiter | 83 | Complete ATS with AI hiring compliance |
| dm-events | 83 | Ticketing, venues, artists, schedules |
| dm-bar | 74 | POS, inventory, recipes, suppliers |
| dm-staff | 68 | Scheduling, time tracking, payroll |
| dm-scoring | 44 | LLM-as-Judge evaluation system |
| dm-ia-chat | 144 | AI agent management |
| dm-web3 | 46 | NFT, wallets, blockchain |
| dm-payments | 20 | Payments, subscriptions, payouts |
| **Total** | **576** | Complete vertical solutions |

---

## Summary Comparison

### Feature Count by Category

| Category | Rottay | Best Competitor | Rottay Advantage |
|----------|--------|-----------------|------------------|
| Auth Use Cases | 80+ | ~50 (Auth0) | +60% |
| Compliance Frameworks | 15+ | 6 (Drata) | +150% |
| Compliance Use Cases | 138 | ~20 (Vanta) | +590% |
| Feature Flag Use Cases | 30+ | ~20 (LD) | +50% |
| Permission Use Cases | 40+ | ~15 (Permit) | +167% |
| Tenancy Use Cases | 50+ | ~10 (Nile) | +400% |
| Notification Use Cases | 25+ | ~15 (Knock) | +67% |
| Navigation Use Cases | 74 | 0 | Unique |
| Identity Use Cases | 98 | ~30 (Auth0) | +227% |
| **Total Platform** | **500+** | ~150 combined | **+233%** |
| **Domain Modules** | **576** | **0** | **Unique** |

### The Final Comparison

| Metric | Assembling Stack | Rottay |
|--------|------------------|--------|
| Total Use Cases | ~150 across vendors | 1,000+ |
| Platform Modules | 0 (assembled) | 8 |
| Domain Modules | 0 | 9 |
| Compliance Frameworks | 5-6 | 15+ |
| SDKs to Learn | 6-10 | 1 |
| Annual Cost (Growth) | $30,400-$120,400 | Unified |
| Integration Time | 10-18 weeks | 1-2 weeks |
| Result<T> Pattern | No | Yes |
| Native Multi-tenancy | No | Yes |
| Built-in RBAC | No | Yes |
| Single Dashboard | No | Yes |
| Single Support Queue | No | Yes |

---

## Related Documents

| Document | Description |
|----------|-------------|
| [COMPETITIVE-ANALYSIS.md](./COMPETITIVE-ANALYSIS.md) | 35+ competitor deep dive with verified pricing |
| [TCO-CALCULATOR.md](./TCO-CALCULATOR.md) | Interactive cost comparison calculator |
| [MARKETING-STRATEGY.md](./MARKETING-STRATEGY.md) | Overall marketing strategy and messaging |
| [PHRASES.md](./PHRASES.md) | 300+ marketing phrases by context and audience |
| [CODE-SHOWCASE.md](./CODE-SHOWCASE.md) | Code examples demonstrating Rottay DX |

---

## Appendix: Data Sources

| Category | Sources | Last Verified |
|----------|---------|---------------|
| Auth0 | auth0.com/pricing, G2, Reddit | January 2026 |
| Clerk | clerk.com/pricing | January 2026 |
| AWS Cognito | aws.amazon.com/cognito/pricing | January 2026 |
| Vanta | Industry research, demos | January 2026 |
| Drata | G2 reviews, demos | January 2026 |
| LaunchDarkly | launchdarkly.com/pricing | January 2026 |
| Permit.io | permit.io/pricing | January 2026 |
| Nile | nile.build | January 2026 |
| Knock | knock.app/pricing | January 2026 |
| Twilio | twilio.com/pricing | January 2026 |
| SendGrid | sendgrid.com/pricing | January 2026 |
| Statsig | statsig.com/pricing | January 2026 |
| Split.io | split.io/pricing | January 2026 |
| Flagsmith | flagsmith.com/pricing | January 2026 |
| Oso | osohq.com/pricing | January 2026 |
| Cerbos | cerbos.dev | January 2026 |
| Resend | resend.com/pricing | January 2026 |
| OneSignal | onesignal.com/pricing | January 2026 |
| Novu | novu.co/pricing | January 2026 |
