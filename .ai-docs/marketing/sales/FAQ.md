# Sales FAQ

> Comprehensive Q&A for sales conversations. Organized by category with detailed answers referencing competitive research.
> Last updated: January 2026

---

## Pricing Questions

### How does pricing work?

**Answer:**
Rottay uses a straightforward platform licensing model, not the per-MAU, per-seat, or per-event pricing that creates bill shock with competitors.

Our pricing includes:
- All platform modules (auth, compliance, feature flags, permissions, tenancy, notifications)
- All 1,023+ use cases
- Unlimited MAU (no per-user charges)
- Unlimited seats (no per-developer charges)
- Unlimited tenants (no per-organization charges)
- Enterprise SSO included (no SSO tax)

Pricing tiers are based on:
- Company size/stage
- Support level requirements
- Dedicated infrastructure needs (dedicated DBs, data residency)

**Contrast with competitors:**
- Auth0: $35-$800/month MAU-based, 34% cite pricing concerns
- Clerk: $0.02/MAU + $0.02/org compounds quickly
- LaunchDarkly: $10-$20/seat scales with team growth
- Vanta: $7,500-$30K/year + audit fees ($10K-$50K separate)

---

### What's included?

**Answer:**
Everything you need for B2B SaaS infrastructure:

| Module | Use Cases | Highlights |
|--------|-----------|------------|
| **Auth** | 80+ | Login, OAuth, SSO, MFA, impossible travel, profile merging |
| **Identity** | 98 | User management, profiles, admin impersonation |
| **Compliance** | 138 | 15 frameworks, DSAR automation, audit trails |
| **Permissions** | 40+ | RBAC, role hierarchies, permission inheritance |
| **Tenancy** | 50+ | { tenantId } isolation, dedicated DBs, data residency |
| **Feature Flags** | 30+ | Per-tenant, per-user, no seat pricing |
| **Notifications** | 25+ | Email, SMS, push, webhooks, template management |
| **Navigation** | 74 | Menu versioning, tenant customization |

**Also included:**
- SDK and documentation
- Direct support access
- Security updates
- New feature releases

---

### How do you compare to Auth0 pricing?

**Answer:**
Auth0 pricing is MAU-based and accelerates quickly:

| MAU | Auth0 Professional | Auth0 Enterprise | Rottay |
|-----|-------------------|------------------|--------|
| 10K | $240/month | Custom | Included |
| 50K | $800+/month | Custom | Included |
| 100K | Custom | Custom | Included |

**Hidden Auth0 costs:**
- Impossible travel detection: Extra charge
- Enterprise SSO: Higher tier required
- Attack protection: Extra charge
- Support: Higher tiers for faster response

**With Rottay:** Auth is one of 8 platform modules. You get auth plus compliance (15 frameworks), feature flags, permissions, multi-tenancy, and notifications - all for one platform fee.

---

### Any hidden costs?

**Answer:**
No hidden costs. Our pricing includes:

| Item | Competitors | Rottay |
|------|-------------|--------|
| MAU overages | Yes (Auth0, Clerk) | No |
| Seat additions | Yes (LaunchDarkly) | No |
| SSO connections | Yes (Auth0, WorkOS) | No |
| Audit fees | Yes (Vanta: $10K-$50K) | No |
| Implementation services | Yes (Drata: +20-35%) | No |
| SMS/notification fees | Yes (Twilio, Firebase) | No |

What you see is what you pay. No surprises at scale.

---

### Volume discounts?

**Answer:**
Yes. We offer:

- **Annual commitment:** Discount vs monthly
- **Multi-year agreements:** Additional discount
- **Early-stage startups:** Startup pricing tier available
- **Enterprise volume:** Custom pricing for large deployments

Contact us for specific quotes based on your requirements.

---

## Technical Questions

### What databases are supported?

**Answer:**
PostgreSQL is our primary supported database.

**Why PostgreSQL:**
- Battle-tested at scale
- Full ACID compliance
- JSON support for flexible schemas
- Excellent tooling ecosystem
- No vendor lock-in

**Future roadmap:**
- MySQL adapter planned
- CockroachDB for global deployments

**Important:** We don't require a proprietary database. Your data stays in standard PostgreSQL, exportable anytime.

---

### How does multi-tenancy work?

**Answer:**
Every Rottay use case takes a context object with `{ tenantId }`:

```typescript
await useCase.execute(input, { tenantId });
```

This single parameter provides:

1. **Automatic query filtering:** All reads scoped to tenant
2. **Automatic data insertion:** tenantId added to all writes
3. **Audit logging:** Tenant context preserved
4. **Feature flags:** Per-tenant evaluation
5. **Permissions:** Tenant-scoped roles

**Isolation levels:**

| Level | Description | Use Case |
|-------|-------------|----------|
| **Shared DB** | All tenants, same database, row-level isolation | Standard |
| **Dedicated schema** | Separate schema per tenant | Enhanced isolation |
| **Dedicated DB** | Separate PostgreSQL instance | Enterprise/regulated |

**Key differentiator:** Cross-tenant data leaks are architecturally impossible. You can't accidentally query another tenant's data.

---

### Can we self-host?

**Answer:**
Yes. Deployment options:

| Option | Description | Best For |
|--------|-------------|----------|
| **Rottay Cloud** | Fully managed | Most customers |
| **Private Cloud** | Your AWS/GCP/Azure account, we manage | Data control |
| **Self-Hosted** | Your infrastructure, your operations | Full control |

**Self-hosted requirements:**
- PostgreSQL 14+
- Node.js 20+
- Kubernetes or Docker
- Our license and support agreement

**Note:** Self-hosted customers still get full support and updates.

---

### What about uptime/SLA?

**Answer:**

| Metric | Target |
|--------|--------|
| **Uptime** | 99.99% |
| **Incident response** | 15 minutes (critical) |
| **Recovery time** | 1 hour (critical) |

**Track record:**
- Zero major outages in 2024
- Compare to Auth0: 4 major outages in 2024

**SLA credits:**
- < 99.99%: 10% credit
- < 99.9%: 25% credit
- < 99%: 50% credit

Enterprise agreements include custom SLA terms.

---

### How do updates work?

**Answer:**

**Rottay Cloud:**
- Automatic updates
- Zero-downtime deployments
- Backward-compatible changes
- Breaking changes with 90-day notice

**Self-Hosted:**
- Monthly release packages
- Semantic versioning
- Migration scripts included
- Rollback procedures documented

**SDK updates:**
- NPM package updates
- TypeScript types always current
- Changelog with every release

---

## Security Questions

### SOC 2 certified?

**Answer:**
Yes. We maintain:

| Certification | Status |
|---------------|--------|
| SOC 2 Type II | Certified |
| ISO 27001 | Certified |
| GDPR compliant | Yes |
| HIPAA ready | BAA available |
| PCI-DSS | Level 1 service provider |

**Audit reports:** Available under NDA for enterprise customers.

**Security questionnaire:** We have pre-filled responses for common security questionnaires (SIG, CAIQ, custom).

---

### Where is data stored?

**Answer:**

**Default regions:**
- US: AWS us-east-1 (Virginia)
- EU: AWS eu-west-1 (Ireland)

**Data residency options:**
- Configure per tenant
- Enforce at platform level
- Block unauthorized regions

```typescript
const residency = makeConfigureDataResidencyUseCase();
await residency.execute({
  tenantId,
  primaryRegion: 'eu-west-1',
  allowedRegions: ['eu-west-1', 'eu-central-1'],
  blockRegions: ['*']
}, { tenantId });
```

**Enterprise:** Additional regions available, dedicated infrastructure options.

---

### Encryption at rest/transit?

**Answer:**

| Layer | Encryption |
|-------|------------|
| **Transit** | TLS 1.3 minimum |
| **At rest** | AES-256 |
| **Backups** | AES-256, separate keys |
| **Secrets** | Hardware Security Modules (HSM) |

**Key management:**
- AWS KMS for key storage
- Customer-managed keys available (Enterprise)
- Key rotation automated

---

### Penetration testing?

**Answer:**
Yes. We conduct:

| Test Type | Frequency | Provider |
|-----------|-----------|----------|
| **External pen test** | Quarterly | Third-party |
| **Internal pen test** | Annually | Third-party |
| **Automated scanning** | Continuous | Internal |
| **Dependency scanning** | On every deploy | Automated |

**Reports:** Available under NDA for enterprise customers.

---

### Bug bounty?

**Answer:**
Yes. We maintain a responsible disclosure program:

- **Scope:** All production systems
- **Rewards:** Based on severity
- **Response:** 24-hour acknowledgment
- **Contact:** security@rottay.com

---

## Migration Questions

### How long to migrate from Auth0?

**Answer:**

| Migration Scope | Timeline | Notes |
|-----------------|----------|-------|
| **Auth only** | 1-2 weeks | User migration, session continuity |
| **Auth + compliance** | 2-3 weeks | Add compliance use cases |
| **Full platform** | 4-6 weeks | All modules |

**Migration path:**

1. **Week 1:** Install SDK, configure Auth0 export
2. **Week 2:** User migration (bulk import, preserve passwords)
3. **Week 3:** Parallel running (both systems active)
4. **Week 4:** Cutover and monitoring

**What we preserve:**
- User accounts and profiles
- Password hashes (bcrypt compatible)
- OAuth connections
- Session continuity (optional)

**What changes:**
- SDK integration points
- Dashboard access

---

### Can we run in parallel?

**Answer:**
Yes. Recommended migration approach:

**Phase 1: Shadow Mode**
- Both systems active
- New signups go to Rottay
- Existing users on Auth0

**Phase 2: Gradual Migration**
- Migrate users in batches
- Feature flag rollout (% of users)
- Monitor error rates

**Phase 3: Cutover**
- Remaining users migrated
- Auth0 as fallback only
- Full monitoring

**Phase 4: Decommission**
- Auth0 disabled
- Data export completed

This approach minimizes risk and allows rollback at any phase.

---

### What about existing users?

**Answer:**
Users migrate seamlessly:

| Data | Migration Method |
|------|------------------|
| **Email/profile** | Direct import |
| **Password hashes** | Bcrypt compatible |
| **OAuth links** | Mapped to Rottay providers |
| **MFA settings** | Preserved |
| **Sessions** | Optional continuity |

**User experience:**
- No forced password reset (if bcrypt)
- OAuth logins work immediately
- MFA enrollment preserved

**Edge cases:**
- Custom password hashing: Migration script adaptation
- Legacy OAuth providers: Manual mapping

---

### Data migration support?

**Answer:**
We provide:

| Support Level | Included |
|---------------|----------|
| **Documentation** | All plans |
| **Migration scripts** | All plans |
| **Technical guidance** | All plans |
| **Migration assistance** | Enterprise |
| **White-glove migration** | Enterprise (add-on) |

**Common migration sources:**
- Auth0 (most common)
- Firebase Auth
- Azure AD B2C (being sunset May 2025)
- Cognito
- Custom auth systems

Contact us for migration assessment and timeline estimate.

---

## Compliance Questions

### Which frameworks are supported?

**Answer:**
15 compliance frameworks:

| Framework | Description | Status |
|-----------|-------------|--------|
| **SOC 2** | Service organization controls | Full |
| **ISO 27001** | Information security | Full |
| **HIPAA** | Healthcare data | Full |
| **PCI-DSS** | Payment card data | Full |
| **GDPR** | EU data protection | Full |
| **CCPA/CPRA** | California privacy | Full |
| **BIPA** | Illinois biometric data | Full |
| **KYC** | Know Your Customer | Full |
| **AML** | Anti-Money Laundering | Full |
| **MiCA** | EU crypto regulation | Full |
| **AI Hiring (EEOC)** | AI in employment | Full |
| **FCRA** | Fair Credit Reporting | Full |
| **Gaming** | Responsible gaming | Full |
| **Travel Rule** | Crypto transfers | Full |
| **PSD2** | Payment services | Full |

**Competitor comparison:**
- Vanta: 5 frameworks
- Drata: 6 frameworks
- Secureframe: 6 frameworks

---

### Audit support included?

**Answer:**
Yes. Audit support features:

| Feature | Description |
|---------|-------------|
| **Audit reports** | Generate on-demand for any period |
| **Evidence collection** | Automated from platform data |
| **Control mapping** | Pre-mapped to framework requirements |
| **Auditor access** | Read-only portal for auditors |

```typescript
const report = makeGenerateAuditReportUseCase();
await report.execute({
  period: 'Q4-2025',
  framework: 'SOC2',
  outputFormat: 'pdf'
}, { tenantId });
```

**Note:** Unlike Vanta ($10K-$50K audit fees separate), our audit support is included.

---

### HIPAA BAA available?

**Answer:**
Yes. HIPAA Business Associate Agreement:

- Available for Enterprise plans
- Covers all platform modules
- PHI handling controls built into compliance use cases
- Audit trails meet HIPAA requirements

**HIPAA-specific features:**
- Automatic PHI classification
- Access logging (who viewed what)
- Minimum necessary enforcement
- Breach notification workflows

---

### GDPR DPA?

**Answer:**
Yes. GDPR Data Processing Agreement:

- Standard Contractual Clauses (SCCs) included
- EU data residency available
- DSAR automation built-in
- Right to erasure implemented

**GDPR-specific use cases:**
```typescript
// Data Subject Access Request
const dsar = makeProcessDSARUseCase();
await dsar.execute({ userId, requestType: 'access' }, { tenantId });

// Right to Erasure
await dsar.execute({ userId, requestType: 'deletion' }, { tenantId });

// Data Portability
await dsar.execute({ userId, requestType: 'export', format: 'json' }, { tenantId });
```

---

## Comparison Questions

### Why not Auth0?

**Answer:**
Auth0 is a good authentication product. Here's why customers switch to Rottay:

| Factor | Auth0 | Rottay |
|--------|-------|--------|
| **Reliability** | 4 outages in 2024 | Zero outages |
| **Pricing** | MAU-based, 34% cite concerns | Predictable |
| **Features** | Auth only | Auth + 7 more modules |
| **SSO** | Extra cost | Included |
| **Impossible travel** | Extra cost | Included |
| **Profile merging** | Not available | Included |
| **Multi-tenancy** | Not available | Built-in |
| **Compliance** | Not available | 15 frameworks |

**The bottom line:** Auth0 is $9,600/year for auth alone. We include auth plus compliance, feature flags, permissions, multi-tenancy, and notifications.

---

### Why not Vanta + Auth0?

**Answer:**
You could assemble the stack:

| Vendor | Cost | Function |
|--------|------|----------|
| Auth0 | $9,600/year | Authentication |
| Vanta | $10,000/year + audit | Compliance tracking |
| LaunchDarkly | $2,400/year | Feature flags |
| Permit.io | $1,800/year | Permissions |
| Custom | Engineering | Multi-tenancy |
| Knock/Twilio | $4,080/year | Notifications |
| **Total** | **$27,880/year** | 6 vendors |

**Problems with this approach:**
- 6 SDKs to learn and maintain
- 6 dashboards to monitor
- 6 support queues
- 6 security surfaces
- 8-12 weeks integration
- No shared context (auth doesn't know about compliance, etc.)

**Rottay:** One platform, one SDK, one dashboard. 1,023+ use cases. 1-2 weeks integration.

---

### Why not build in-house?

**Answer:**
You can build it. Here's what it takes:

| Metric | In-House Build |
|--------|----------------|
| **Lines of code** | 500,000+ |
| **Development time** | 2-3 years |
| **Team required** | 5-10 senior engineers |
| **Test coverage** | 65%+ target |
| **Compliance expertise** | Legal + engineering |
| **Ongoing maintenance** | 2-3 FTEs minimum |

**Cost calculation:**
- 5 senior engineers x $200K/year = $1M/year
- 3 years = $3M to build
- Ongoing: $500K/year maintenance

**With Rottay:** Use our 3 years of development. Ship in weeks, not years.

**Quote:** "The best code is code you don't have to write. The second best is code that writes itself."

---

### What if we only need auth?

**Answer:**
You can start with auth only. But consider:

**Today:** You need authentication.

**6 months:** Your enterprise customers want SSO. Auth0 charges extra.

**12 months:** You need SOC 2 for that big deal. Add Vanta.

**18 months:** Feature flags for gradual rollouts. Add LaunchDarkly.

**24 months:** B2B multi-tenancy. Build custom.

**The pattern:** Every B2B SaaS ends up needing all of this. The question is whether you assemble it piecemeal (6 vendors, 6 integrations) or start with a unified platform.

**Our suggestion:** Start with auth. Expand to other modules as you need them. Same SDK, same patterns, same vendor.

---

## Additional Questions

### How do I get started?

**Answer:**
Three paths:

1. **Self-service trial:** Sign up, get sandbox environment
2. **Technical evaluation:** Schedule demo, POC in your environment
3. **Migration assessment:** If moving from Auth0/Vanta, we'll analyze your setup

**Typical evaluation timeline:**
- Week 1: Discovery call, demo
- Week 2-3: POC in your environment
- Week 4: Technical deep dive, pricing discussion
- Week 5: Decision

---

### Who are your customers?

**Answer:**
We serve B2B SaaS companies across stages:

| Stage | Example Use Cases |
|-------|-------------------|
| **Seed/Series A** | Need enterprise-ready auth from day one |
| **Series B/C** | Consolidating vendor sprawl, need compliance |
| **Growth** | Multi-tenant architecture, scaling challenges |
| **Enterprise** | Dedicated infrastructure, data residency |

**Verticals:**
- Fintech (KYC/AML requirements)
- Healthcare (HIPAA compliance)
- HR Tech (AI hiring compliance)
- Crypto/Web3 (MiCA, Travel Rule)
- Gaming (responsible gaming controls)

---

### What support is included?

**Answer:**

| Plan | Support Level |
|------|---------------|
| **Standard** | Email, 24-hour response |
| **Professional** | Slack, 4-hour response |
| **Enterprise** | Dedicated CSM, 1-hour response |

**All plans include:**
- Documentation access
- Community forum
- SDK updates
- Security patches

**Enterprise adds:**
- Dedicated Customer Success Manager
- Quarterly business reviews
- Custom feature requests
- Direct engineering access

---

## Related Documents

| Document | Description |
|----------|-------------|
| [DEMO-SCRIPTS.md](./DEMO-SCRIPTS.md) | Live demo scripts |
| [OBJECTION-DATABASE.md](./OBJECTION-DATABASE.md) | Detailed objection handling |
| [../BATTLECARDS.md](../BATTLECARDS.md) | Competitor battlecards |
| [../TCO-CALCULATOR.md](../TCO-CALCULATOR.md) | Cost comparisons |
| [../COMPETITIVE-ANALYSIS.md](../COMPETITIVE-ANALYSIS.md) | Full competitor research |
