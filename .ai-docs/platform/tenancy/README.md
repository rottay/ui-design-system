# Tenancy Module

> **Multi-tenant infrastructure for SaaS applications**

## What It Does

The Tenancy module provides the foundational multi-tenant architecture for the Rottay platform. It manages tenant isolation, company hierarchies within tenants, and API key management for external integrations.

The module supports different tenant tiers from free (shared database) to enterprise (dedicated database), with configurable data residency for compliance requirements. It handles the complete tenant lifecycle including provisioning, configuration, and user assignments.

API keys with scoped permissions enable secure external access to tenant resources, with full key rotation and revocation capabilities.

## When to Use

- **Tenant Setup**: Create and configure new tenants
- **Company Hierarchy**: Manage companies within a tenant
- **API Integration**: Generate and manage API keys
- **Data Residency**: Configure regional data storage
- **User Assignment**: Assign users to tenants
- **Bulk Provisioning**: Set up multiple tenants at once

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Tenant** | Root organization in the platform |
| **Company** | Sub-organization within a tenant |
| **ApiKey** | Scoped API access credentials |
| **DataResidency** | Regional data storage config |
| **TenantTier** | free, starter, business, enterprise |

## REVIEW-2026 Changes

- Self-referential package dependency (`"@rottay/tenancy"` in its own package.json) was REMOVED
- 17 use cases total (confirmed)

### Session 2026-02-06

- **Dead code cleaned**: Removed `MultiTenantErrorFactory`, `ValidationError` wrapper, and 12 type aliases that duplicated types already available from `@rottay/core`

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 17 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Tenant management
import { makeCreateTenantUC, makeUpdateTenantUC } from '@rottay/tenancy';

// API keys
import { makeCreateApiKeyUC, makeRotateApiKeyUC, makeRevokeApiKeyUC } from '@rottay/tenancy';

// User assignment
import { makeAssignUserToTenantUC } from '@rottay/tenancy';

// Queries
import { makeGetTenantUC, makeValidateApiKeyUC } from '@rottay/tenancy';
```

## Database Tables

All tables use the `tenancy_` prefix. Schema files located in `platform/packages/platform/tenancy/adapters/out/persistence/schemas/tenancy/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Tenant | `tenancy_tenants` | id, name, slug, plan, status, domain, data_residency, settings, is_active, created_at | Root organization. Unique on slug. |
| Company | `tenancy_companies` | id, tenant_id, name, logo, settings, is_active, created_at | Sub-organizations within a tenant. |
| UserCompanyAssignment | `tenancy_user_company_assignments` | id, tenant_id, user_id, company_id, role, is_active | User-to-company assignments. |
| ApiKey | `tenancy_api_keys` | id, tenant_id, name, key_hash, prefix, scopes, expires_at, last_used_at, is_active | Scoped API access credentials with rotation support. |
| SubscriptionPlan | `tenancy_subscription_plans` | id, key, name, description, sort_order, is_public, config (JSONB), pricing (JSONB), is_active | Tenant plan definitions (free, starter, pro, enterprise). Unique on key. |
| UsageMonthly | `tenancy_usage_monthly` | id, tenant_id, quota_key, period_start, period_end, usage_count, quota_limit | Monthly period-based usage tracking. Unique on (tenant_id, quota_key, period_start). |
| ResourceCounts | `tenancy_resource_counts` | id, tenant_id, users_count, companies_count, active_jobs_count, storage_used_gb, active_events_count | Current resource counts per tenant (one row per tenant). |
| UsageEvents | `tenancy_usage_events` | id, tenant_id, user_id, quota_key, amount, operation, resource_id, resource_type | Append-only audit trail of quota consumption events. |

## Related Modules

- [Auth](../auth/) - Tenant-scoped authentication
- [Identity](../identity/) - User management within tenants
- [Permissions](../permissions/) - Tenant-scoped RBAC
- [Compliance](../compliance/) - Data residency compliance
