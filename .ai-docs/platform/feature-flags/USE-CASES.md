# Feature Flags Module - Use Cases

> **Feature Toggles: A/B Testing, Percentage Rollouts, User Targeting**

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [flags](#flags) - Feature definitions
  - [rules](#rules) - Feature targeting rules
  - [settings](#settings) - Feature settings per tenant
  - [usage](#usage) - Usage tracking and quotas
- [Queries](#queries)
- [Entities](#entities)
- [Related](#related)

---

## Overview

The Feature Flags module enables controlled feature rollouts, A/B testing, and user targeting. It supports various rule types including percentage rollouts, user lists, tenant targeting, and scheduled releases. All feature evaluations are tracked for analytics.

**Stats:**
- **Total:** 29 use cases (14 mutations, 15 queries)
- **Entities:** FeatureDefinition, FeatureSetting, FeatureRule, FeatureUsage

**Key Features:**
- Boolean, string, number, and JSON flag types
- Percentage-based rollouts
- User and tenant targeting
- Scheduled feature releases
- Usage tracking and analytics
- Feature catalog and search
- Batch evaluation of rules
- Quota enforcement

---

## Mutations

### flags

> Feature definition and configuration.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-feature-definition` | Create new feature flag | `CreateFeatureDefinitionUC` | `makeCreateFeatureDefinitionUseCase()` |
| `update-feature-definition` | Update feature flag | `UpdateFeatureDefinitionUC` | `makeUpdateFeatureDefinitionUseCase()` |
| `delete-feature-definition` | Delete feature flag | `DeleteFeatureDefinitionUC` | `makeDeleteFeatureDefinitionUseCase()` |
| `track-feature-usage` | Record feature usage event | `TrackFeatureUsageUC` | `makeTrackFeatureUsageUseCase()` |

> **Note:** `UC` = UseCase, `make*UC()` = `make*UseCase()`

---

### rules

> Feature targeting rule management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `create-feature-rule` | Create targeting rule | `CreateFeatureRuleUC` | `makeCreateFeatureRuleUseCase()` |
| `update-feature-rule` | Update targeting rule | `UpdateFeatureRuleUC` | `makeUpdateFeatureRuleUseCase()` |
| `delete-feature-rule` | Delete targeting rule | `DeleteFeatureRuleUC` | `makeDeleteFeatureRuleUseCase()` |
| `activate-feature-rule` | Activate targeting rule | `ActivateFeatureRuleUC` | `makeActivateFeatureRuleUseCase()` |
| `deactivate-feature-rule` | Deactivate targeting rule | `DeactivateFeatureRuleUC` | `makeDeactivateFeatureRuleUseCase()` |
| `reorder-feature-rules` | Reorder rule priority | `ReorderFeatureRulesUC` | `makeReorderFeatureRulesUseCase()` |

---

### settings

> Per-tenant feature settings management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `set-feature-setting` | Set feature setting for tenant | `SetFeatureSettingUC` | `makeSetFeatureSettingUseCase()` |
| `remove-feature-setting` | Remove feature setting | `RemoveFeatureSettingUC` | `makeRemoveFeatureSettingUseCase()` |

---

### usage

> Usage tracking and quota management.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `enforce-quota-limit` | Enforce feature usage quota | `EnforceQuotaLimitUC` | `makeEnforceQuotaLimitUseCase()` |
| `reset-feature-usage` | Reset feature usage counters | `ResetFeatureUsageUC` | `makeResetFeatureUsageUseCase()` |

---

## Queries

### flags

> Feature retrieval and resolution.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-feature-definitions` | List all feature flags | `ListFeatureDefinitionsQ` | `makeListFeatureDefinitionsQuery()` |
| `get-feature-by-key` | Get feature by key | `GetFeatureByKeyQ` | `makeGetFeatureByKeyQuery()` |
| `resolve-feature-value` | Resolve feature value for context | `ResolveFeatureValueQ` | `makeResolveFeatureValueQuery()` |
| `get-feature-catalog` | Get feature catalog | `GetFeatureCatalogQ` | `makeGetFeatureCatalogQuery()` |
| `search-feature-definitions` | Search feature definitions | `SearchFeatureDefinitionsQ` | `makeSearchFeatureDefinitionsQuery()` |
| `get-feature-settings` | Get feature settings for tenant | `GetFeatureSettingsQ` | `makeGetFeatureSettingsQuery()` |

---

### rules

> Rule queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `list-feature-rules-by-feature` | List rules for feature | `ListFeatureRulesByFeatureQ` | `makeListFeatureRulesByFeatureQuery()` |
| `get-feature-rule-by-id` | Get rule by ID | `GetFeatureRuleByIdQ` | `makeGetFeatureRuleByIdQuery()` |

---

### evaluation

> Feature evaluation queries.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `check-feature-enabled` | Check if feature is enabled | `CheckFeatureEnabledQ` | `makeCheckFeatureEnabledQuery()` |
| `resolve-feature-access` | Resolve feature access for user | `ResolveFeatureAccessQ` | `makeResolveFeatureAccessQuery()` |
| `evaluate-feature-rules` | Evaluate rules for user context | `EvaluateFeatureRulesQ` | `makeEvaluateFeatureRulesQuery()` |
| `batch-evaluate-feature-rules` | Batch evaluate rules | `BatchEvaluateFeatureRulesQ` | `makeBatchEvaluateFeatureRulesQuery()` |
| `count-feature-definitions` | Count feature definitions | `CountFeatureDefinitionsQ` | `makeCountFeatureDefinitionsQuery()` |

---

### usage

> Usage analytics.

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| `get-usage-statistics` | Get feature usage statistics | `GetUsageStatisticsQ` | `makeGetUsageStatisticsQuery()` |
| `list-feature-usage` | List feature usage records | `ListFeatureUsageQ` | `makeListFeatureUsageQuery()` |

---

## Entities

| Entity | Description |
|--------|-------------|
| **FeatureDefinition** | Feature flag definition |
| **FeatureSetting** | Per-tenant/environment settings |
| **FeatureRule** | Targeting rules (percentage, user list, etc.) |
| **FeatureUsage** | Usage tracking records |

---

## Feature Flag Types

```typescript
type FeatureFlagType =
  | 'boolean'  // On/Off toggle
  | 'string'   // String value (A/B testing)
  | 'number'   // Numeric value
  | 'json'     // Complex configuration
```

---

## Rule Types

```typescript
type RuleType =
  | 'percentage'   // Percentage-based rollout
  | 'user_list'    // Specific user IDs
  | 'tenant_list'  // Specific tenants
  | 'attribute'    // User attribute matching
  | 'schedule'     // Date/time based
```

---

## Usage Example

```typescript
import { getFeatureSettings } from '@rottay/feature-flags';

async function myFeature(context: TenantContext) {
  const feature = await getFeatureSettings('new-checkout', context);

  if (feature.enabled) {
    return newCheckoutFlow();
  }

  return legacyCheckoutFlow();
}
```

---

## Configuration Example

```typescript
// Feature definition
const feature: FeatureDefinition = {
  id: 'new-checkout',
  key: 'new-checkout',
  name: 'New Checkout Flow',
  description: 'Redesigned checkout experience',
  type: 'boolean',
  defaultValue: false,
  tags: ['checkout', 'experiment'],
};

// 25% rollout rule
const rule: FeatureRule = {
  id: 'rule-1',
  featureId: 'new-checkout',
  type: 'percentage',
  percentage: 25,
  priority: 1,
};
```

---

## Related

- [Navigation Module](../navigation/USE-CASES.md) - Feature-flagged menus
- [Tenancy Module](../tenancy/USE-CASES.md) - Tenant-specific features
