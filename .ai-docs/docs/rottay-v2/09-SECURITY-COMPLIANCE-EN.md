# Rottay — Security & Compliance Positioning (Tooling, Not Certifications)

**Last updated:** 2026-02-10  
**Audience:** sales, product, security-minded buyers, partners.  
**Disclaimer:** This is not legal advice. “Compliance” depends on your company, your policies, and your auditors.

---

## 1) The principle (non‑negotiable): sell controls + evidence, not certificates

Rottay can ship:
- **technical controls** (tenant isolation rules, RBAC, audit trails, retention tooling, etc.)
- **evidence surfaces** (logs, reports, access history, workflows)
- **configuration** (enable/disable compliance domains per tenant via plans)

Rottay should **not** claim:
- “We are SOC 2 / ISO / HIPAA certified” unless completed and provable
- “Guaranteed compliance” for any customer

Safe framing:
> “Rottay provides compliance tooling to help you implement required controls and produce evidence; you still need legal/policy work and formal certification processes if required.”

---

## 2) Security posture (repo-backed architectural constraints)

These items are explicitly documented constraints:

### 2.1 Tenant-first isolation

Multi-tenancy is mandatory and enforced as an architectural rule:
- data access is scoped by `tenantId`
- use cases receive a tenant context

Source: `.ai-docs/ARCHITECTURE.md`

### 2.2 RBAC + feature gating + quotas

Rottay’s plan enforcement is a 3-layer model:
- **Permissions** (RBAC): user can/can’t do action
- **Feature flags**: tenant/plan can/can’t access capability
- **Quotas**: tenant/plan has/doesn’t have remaining allowance

Source: `ACCESS-CONTROL-ARCHITECTURE.md`

### 2.3 Auditability patterns

Entities are expected to keep audit fields and soft deletes (`isActive`), enabling:
- traceability
- retention workflows
- forensic investigation primitives

Source: `.ai-docs/ARCHITECTURE.md`

---

## 3) What “Compliance Module” means in Rottay

Rottay includes a compliance module (`@rottay/compliance`) that documents use cases across multiple domains (examples):

- KYC (identity verification workflows)
- AML (transaction monitoring + alerting)
- GDPR (privacy requests, consent, portability)
- Healthcare / HIPAA tooling (access logs, disclosures, breach workflows)
- Gaming (responsible gambling controls)
- Crypto / Banking / Securities / HR-Employment (domain-specific workflows)

Source of scope: `.ai-docs/platform/compliance/USE-CASES.md`

**Interpretation:** this is a *tooling framework and workflow set*, not a “you’re certified now” stamp.

---

## 4) Compliance profiles (how to package it commercially)

Instead of selling “Compliance” as one huge monolith, package **profiles** that map to real buyer needs.

Example profiles:

### Profile: Privacy (GDPR/CCPA-style)
- consent tracking surfaces
- DSAR workflows (export/delete)
- data retention configuration
- auditability evidence

### Profile: Fintech (KYC/AML)
- verification workflows
- transaction monitoring + alerts
- SAR/reporting primitives (where implemented)

### Profile: Healthcare (HIPAA-style tooling)
- PHI access logging workflows
- breach management workflows
- disclosures/accounting tooling

ASCII model:

```text
Tenant plan (features + quotas)
   |
   v
Feature flags (per profile)
   |
   v
Compliance module (enabled domains + workflows)
   |
   v
Evidence surfaces (logs / reports / trails)
```

**Commercial benefit:**
- buyers pay only for relevant scope
- easier messaging
- simpler internal maintenance and support

---

## 5) Shared responsibility (how to avoid legal risk)

No matter the deployment model, compliance is shared responsibility.

Rottay can provide:
- controls/tooling and documentation
- implementation patterns and operational surfaces

Customer still must provide:
- policies and procedures
- staff training
- vendor due diligence
- legal review and certification process (if needed)

**Recommendation:** every “Compliance profile” SKU should have a clear scope statement:
- what is included (technical controls/tooling)
- what is not included (legal certification, audit sign-off)

Scope statement template (copy/paste safe):

```text
This package provides technical controls and evidence tooling intended to support compliance efforts.
It does not include legal advice, policy drafting, auditor sign-off, or certification guarantees.
Your organization remains responsible for implementing policies/procedures and completing any required audits.
```

---

## 6) What to say in sales calls (script-safe)

Use this wording:

- “We provide multi-tenant-first architecture, auditability patterns, and a compliance tooling module.”
- “We can enable compliance workflows per tenant via plan configuration.”
- “We support evidence generation surfaces; certification depends on your organization and auditors.”

Avoid:
- “You’ll be compliant automatically”
- “We are certified” (unless true, with evidence)

---

## 7) Where to go deeper

- Platform plan enforcement (source): `ACCESS-CONTROL-ARCHITECTURE.md`
- Compliance use cases (source): `.ai-docs/platform/compliance/USE-CASES.md`
- Platform overview: [`04-PLATFORM-OVERVIEW-EN.md`](./04-PLATFORM-OVERVIEW-EN.md)
