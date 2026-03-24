# Compliance Module

> **Comprehensive regulatory compliance: KYC, AML, GDPR, Healthcare, and more**

## What It Does

The Compliance module provides a unified framework for regulatory compliance across multiple domains. It handles identity verification (KYC), anti-money laundering (AML), data privacy (GDPR), healthcare (HIPAA), gaming regulations, cryptocurrency compliance, and more.

The module integrates with external verification providers, manages document collection and review, tracks consent and data subject requests, and generates regulatory reports. It supports both automated and manual review workflows with full audit trails.

With 138 use cases across 15 compliance domains, this is one of the most comprehensive modules in the platform.

## REVIEW-2026 Changes

- ComplianceEventWorker now correctly consumes from `compliance-events` queue (fixed from `domain-events`)
- 138 use cases across 15 domains: ai-hiring, aml, banking, bipa, breach-management, consumer, crypto, gaming, gdpr, healthcare, hr-employment, insurance, kyc, legal, securities
- Canonical structure: `adapters/in/{controllers,dto,handlers,middleware}/{domain}/`, `application/use-cases/commands/{domain}/{feature}/{action}/`

## Application Layer Structure

```
adapters/in/
├── controllers/{domain}/
├── dto/{domain}/
├── handlers/{domain}/
└── middleware/{domain}/

application/
├── use-cases/
│   ├── commands/{domain}/{feature}/{action}/   # Commands across 15 domains
│   ├── queries/{domain}/{feature}/{action}/    # Queries across domains
│   ├── jobs/{domain}/{job}/                    # 4 jobs (AML, breach-management)
│   └── index.ts
├── services/                                    # data-enricher, event-router, feature-resolver
├── utils/                                       # result-helpers
└── workers/                                     # compliance-event-worker (consumes from compliance-events queue)
```

Domains are nested inside `commands/`, `queries/`, and `jobs/` (not the other way around).
This matches the canonical structure used by other platform modules (auth, identity, permissions, tenancy).

## When to Use

- **KYC Verification**: Verify user identity with documents
- **AML Screening**: Screen users and transactions for risk
- **GDPR Compliance**: Handle DSARs, consent, data deletion
- **Healthcare (HIPAA)**: Manage PHI access and disclosures
- **Gaming Compliance**: Self-exclusion, betting limits
- **Crypto Compliance**: Travel rule, wallet screening
- **AI Hiring**: Bias audits, candidate consent

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Verification** | KYC identity verification process |
| **Screening** | AML/sanctions list checking |
| **Consent** | User consent management (GDPR) |
| **DSAR** | Data Subject Access Request |
| **SelfExclusion** | Gaming self-exclusion |
| **TravelRule** | Crypto transfer compliance |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 138 use cases by domain |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Compliance Domains (15)

| Domain | Description |
|--------|-------------|
| ai-hiring | NYC Local Law 144, bias audits, candidate consent |
| aml | Anti-money laundering screening |
| banking | Open banking, DORA |
| bipa | Biometric Information Privacy Act |
| breach-management | Data breach response and notification |
| consumer | Consumer protection compliance |
| crypto | Blockchain compliance, travel rule, wallet screening |
| gaming | Responsible gambling, self-exclusion |
| gdpr | EU data privacy, DSARs, consent |
| healthcare | HIPAA compliance, PHI access |
| hr-employment | HR and employment law compliance |
| insurance | Insurance regulatory compliance |
| kyc | Identity verification |
| legal | Legal compliance and contract management |
| securities | Securities regulation compliance |

## Import

```typescript
// KYC
import { makeInitiateVerificationUC, makeSubmitVerificationUC } from '@rottay/compliance';

// AML
import { makeAnalyzeTransactionUC, makeCreateAlertUC } from '@rottay/compliance';

// GDPR
import { makeProcessDsarUC, makeExecuteDeletionUC } from '@rottay/compliance';
```

## Database Tables

The compliance module has 73 tables across 15 domains. Schema files are organized in two locations:
- `platform/packages/platform/compliance/adapters/out/persistence/schemas/` (outbound adapters)
- `platform/packages/platform/compliance/adapters/in/{framework|industry}/out/persistence/schemas/` (inbound adapter schemas)
- `platform/packages/platform/compliance/adapters/shared/persistence/schemas/` (shared/cross-domain tables)

### Shared Tables (Cross-Domain)

4 tables exist in the database. The remaining 14 are conceptual abstractions handled within domain-specific tables.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| AuditLog | `compliance_audit_logs` | id, tenant_id, domain, action, resource, user_id, metadata, created_at | Cross-domain compliance audit trail. |
| Notification | `compliance_notifications` | id, tenant_id, type, recipient, subject, status, sent_at | (conceptual - handled within domain tables) |
| Screening | `compliance_screenings` | id, tenant_id, type, subject_id, status, result, provider, created_at | (conceptual - handled within domain tables, see KYC screening_results) |
| Verification | `compliance_verifications` | id, tenant_id, user_id, type, status, provider, result, created_at | (conceptual - handled within domain tables, see KYC verification_sessions) |
| Transaction | `compliance_transactions` | id, tenant_id, type, amount, currency, parties, risk_score, created_at | (conceptual - handled within domain tables, see AML financial_transactions) |
| Case | `compliance_cases` | id, tenant_id, type, status, priority, assigned_to, created_at | (conceptual - handled within domain tables) |
| Consent | `compliance_consents` | id, tenant_id, user_id, type, purpose, granted_at, revoked_at | (conceptual - handled within domain tables, see GDPR consent_records/consent_history) |
| DataRequest | `compliance_data_requests` | id, tenant_id, user_id, type, status, completed_at | (conceptual - handled within domain tables, see GDPR data_access_requests) |
| Policy | `compliance_policies` | id, tenant_id, domain, name, version, status, is_active | Compliance policy management. |
| Evidence | `compliance_evidence` | id, tenant_id, case_id, type, file_url, metadata, created_at | (conceptual - handled within domain tables) |
| RiskProfile | `compliance_risk_profiles` | id, tenant_id, entity_type, entity_id, risk_score, factors, updated_at | (conceptual - handled within domain tables, see Insurance/AML risk_profiles) |
| Limit | `compliance_limits` | id, tenant_id, type, entity_id, limit_value, current_value, period | Regulatory limit tracking. |
| Session | `compliance_sessions` | id, tenant_id, user_id, type, status, started_at, ended_at | (conceptual - handled within domain tables, see Gaming gameplay_sessions) |
| ControlTest | `compliance_control_tests` | id, tenant_id, control_id, status, tested_by, result, tested_at | (conceptual - handled within domain tables) |
| Registry | `compliance_registries` | id, tenant_id, type, entries, updated_at | (conceptual - handled within domain tables) |
| Integration | `compliance_integrations` | id, tenant_id, provider, type, config, status, is_active | (conceptual - handled within domain tables) |
| Disclosure | `compliance_disclosures` | id, tenant_id, type, content, recipient, disclosed_at | (conceptual - handled within domain tables, see Insurance policy_disclosures) |
| Assessment | `compliance_assessments` | id, tenant_id, type, status, score, assessed_by, completed_at | Risk/compliance assessments. |

### Domain-Specific Tables (by compliance domain)

**KYC (5):** verification_sessions, documents, screening_results, screening_matches, status
**AML (4):** financial_transactions, aml_alerts, transaction_rules, aml_user_risk_profiles
**GDPR (8):** consent_history, consent_records, data_access_requests, data_deletion_records, data_portability_requests, legitimate_interest_assessments, privacy_policies, processing_activities
**Healthcare/HIPAA (5):** phi_records, phi_access_logs, hipaa_breaches, patient_access_requests, breach_risk_assessments
**Gaming (11):** self_exclusions, user_limits, limit_usage, reality_checks, gameplay_sessions, player_complaints, affiliates, operator_licenses, license_renewals, ggr_reports, rg_compliance_reports
**Breach Management (4):** breach_incidents, breach_notifications, suites, tenant_suites
**AI Hiring (3):** bias_audits, candidate_consents, ai_disclosures
**BIPA (2):** biometric_consents, biometric_destruction_records
**Consumer (3):** privacy_choices, do_not_sell_requests, data_sold_records
**Banking (5):** open_banking_consents, sca_challenges, ict_incidents, incident_reports, resilience_tests
**Insurance (4):** claims, solvency_reports, risk_profiles, policy_disclosures
**Securities (3):** suitability_assessments, investor_profiles, crowdfunding_investments
**Legal (4):** conflict_checks, trust_transactions, trust_reconciliations, client_ledgers
**Crypto (5):** travel_rule_messages, wallet_screenings, counterparty_vasps, mica_authorizations, crypto_suspicious_reports
**HR Employment (3):** worker_classifications, adverse_action_notices, background_check_requests

For the complete list of all 73 table definitions, see the schema files in the compliance adapter directories.

## Related Modules

- [Identity](../identity/) - User data for compliance
- [Auth](../auth/) - Authentication for verification
- [Tenancy](../tenancy/) - Data residency configuration
