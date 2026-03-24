# Tenancy Module - Use Cases

> **Multi-tenancy: Tenants, Companies, API Keys, Data Residency**

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [tenant-management](#tenant-management) - Create, update tenants
  - [tenant-lifecycle](#tenant-lifecycle) - Activate, deactivate, suspend tenants
  - [api-keys](#api-keys) - API key lifecycle
  - [workflows](#workflows) - Branding and insights
- [Queries](#queries)
- [Entities](#entities)
- [Related](#related)

---

## Overview

The Tenancy module provides complete multi-tenant infrastructure for the Rottay platform. It handles tenant creation and management, company hierarchies within tenants, API key management for external integrations, and data residency configuration for compliance requirements.

**Stats:**
- **Total:** 21 use cases (11 mutations, 10 queries)
- **Entities:** Tenant, Company, ApiKey, UserAssignment, DataResidency

**Key Features:**
- Tenant lifecycle management (activate, deactivate, suspend)
- Company hierarchy within tenants
- API key generation and rotation
- Data residency configuration (EU, US, etc.)
- User-to-tenant assignment
- Tenant usage analytics and stats
- Company statistics

---

## Mutations

### tenant-management

> Core tenant and company operations.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-company` | Create company within tenant | `CreateCompanyUC` | `makeCreateCompanyUseCase()` |
| `update-company` | Update company details | `UpdateCompanyUC` | `makeUpdateCompanyUseCase()` |
| `delete-company` | Delete company from tenant | `DeleteCompanyUC` | `makeDeleteCompanyUseCase()` |

> **Note:** `UC` = UseCase, `make*UC()` = `make*UseCase()`

---

### tenant-lifecycle

> Tenant lifecycle state management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `activate-tenant` | Activate tenant | `ActivateTenantUC` | `makeActivateTenantUseCase()` |
| `deactivate-tenant` | Deactivate tenant | `DeactivateTenantUC` | `makeDeactivateTenantUseCase()` |
| `suspend-tenant` | Suspend tenant | `SuspendTenantUC` | `makeSuspendTenantUseCase()` |

---

### api-keys

> API key lifecycle management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-api-key` | Generate new API key | `CreateApiKeyUC` | `makeCreateApiKeyUseCase()` |
| `revoke-api-key` | Revoke existing API key | `RevokeApiKeyUC` | `makeRevokeApiKeyUseCase()` |
| `rotate-api-key` | Rotate API key with new secret | `RotateApiKeyUC` | `makeRotateApiKeyUseCase()` |
| `update-api-key-scopes` | Update API key permissions | `UpdateApiKeyScopesUC` | `makeUpdateApiKeyScopesUseCase()` |

---

### workflows

> Branding and tenant insights.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `update-branding` | Update tenant branding | `UpdateBrandingUC` | `makeUpdateBrandingUseCase()` |

---

## Queries

### tenant-management

> Query tenant and company data.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-companies` | List companies in tenant | `ListCompaniesByTenantQ` | `makeListCompaniesByTenantQuery()` |
| `find-company-by-id` | Find company by ID | `FindCompanyByIdQ` | `makeFindCompanyByIdQuery()` |

---

### tenant-lifecycle

> Tenant lookup and analytics.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `find-tenant-by-slug` | Find tenant by slug | `FindTenantBySlugQ` | `makeFindTenantBySlugQuery()` |
| `find-tenant-by-id` | Find tenant by ID | `FindTenantByIdQ` | `makeFindTenantByIdQuery()` |
| `get-tenant-stats` | Get tenant statistics | `GetTenantStatsQ` | `makeGetTenantStatsQuery()` |
| `get-tenant-usage-analytics` | Get tenant usage analytics | `GetTenantUsageAnalyticsQ` | `makeGetTenantUsageAnalyticsQuery()` |

---

### company-stats

> Company statistics.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-company-stats` | Get company statistics | `GetCompanyStatsQ` | `makeGetCompanyStatsQuery()` |

---

### api-keys

> Query API keys.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-api-keys` | List tenant API keys | `ListApiKeysUC` | `makeListApiKeysUseCase()` |
| `validate-api-key` | Validate API key and scopes | `ValidateApiKeyUC` | `makeValidateApiKeyUseCase()` |

---

### workflows

> Analytics and monitoring.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `generate-tenant-insights` | Generate tenant insights report | `GenerateTenantInsightsQ` | `makeGenerateTenantInsightsQuery()` |

---

## Entities

| Entity | Description |
|--------|-------------|
| **Tenant** | Root tenant organization |
| **Company** | Company within a tenant |
| **ApiKey** | API keys for external access |
| **UserAssignment** | User-to-tenant assignments |
| **DataResidency** | Data residency configuration |

---

## API Key Scopes

```typescript
type ApiKeyScope =
  | 'read:users'
  | 'write:users'
  | 'read:products'
  | 'write:products'
  | 'admin'
  | 'billing';
```

---

## Tenant Tiers

```typescript
type TenantTier =
  | 'free'       // Shared database
  | 'starter'    // Shared database
  | 'business'   // Shared database
  | 'enterprise' // Dedicated database
```

---

## Related

- [Auth Module](../auth/USE-CASES.md) - Authentication per tenant
- [Identity Module](../identity/USE-CASES.md) - User management
- [Permissions Module](../permissions/USE-CASES.md) - Tenant-scoped RBAC
- [Compliance Module](../compliance/USE-CASES.md) - Data residency compliance
