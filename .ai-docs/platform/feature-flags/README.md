# Feature Flags Module

> **Controlled feature rollouts with A/B testing and user targeting**

## What It Does

The Feature Flags module enables controlled feature releases through toggles, percentage-based rollouts, and user targeting. It supports multiple flag types (boolean, string, number, JSON) for simple toggles and complex A/B testing scenarios.

Rules can target specific users, tenants, user attributes, or percentages of traffic. Scheduled releases allow time-based feature activation. All feature evaluations are tracked for analytics and experiment analysis.

## When to Use

- **Feature Rollout**: Gradually release features to users
- **A/B Testing**: Test variations with user segments
- **Kill Switches**: Quickly disable problematic features
- **Beta Programs**: Enable features for specific users
- **Scheduled Releases**: Time-based feature activation
- **Usage Analytics**: Track feature adoption

## Key Concepts

| Concept | Description |
|---------|-------------|
| **FeatureDefinition** | The feature flag configuration |
| **FeatureSetting** | Per-tenant/environment settings |
| **FeatureRule** | Targeting rule (percentage, user list) |
| **FeatureUsage** | Usage tracking for analytics |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 8 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Feature management
import { makeCreateFeatureDefinitionUC, makeUpdateFeatureSettingsUC } from '@rottay/feature-flags';

// Evaluation
import { makeEvaluateFeatureRulesUC, makeGetFeatureSettingsUC } from '@rottay/feature-flags';

// Analytics
import { makeTrackFeatureUsageUC, makeGetFeatureUsageUC } from '@rottay/feature-flags';
```

## Usage Example

```typescript
import { getFeatureSettings } from '@rottay/feature-flags';

async function checkout(context: TenantContext) {
  const feature = await getFeatureSettings('new-checkout', context);

  if (feature.enabled) {
    return newCheckoutFlow();
  }
  return legacyCheckoutFlow();
}
```

## Database Tables

All tables use the `feature_` prefix. Schema files located in `platform/packages/platform/feature-flags/adapters/out/persistence/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| FeatureDefinition | `feature_definitions` | id, tenant_id, key, name, description, type, default_value, is_active | Feature flag definitions. Types: boolean, string, number, json. |
| FeatureSetting | `feature_settings` | id, tenant_id, feature_id, environment_id, enabled, value, is_active | Per-tenant, per-environment feature settings. |
| FeatureRule | `feature_rules` | id, tenant_id, feature_id, type, operator, value, percentage, priority, is_active | Targeting rules: percentage rollout, user targeting, attribute matching. |
| FeatureUsage | `feature_usage` | id, tenant_id, feature_id, user_id, value, evaluated_at | Feature evaluation tracking for analytics. |
| FeatureEnvironment | `feature_environments` | id, tenant_id, name, key, is_active | Environment definitions (development, staging, production). |
| FeatureSegment | `feature_segments` | id, tenant_id, name, description, rules, is_active | User segments for targeted rollouts. |
| FeatureScheduledChange | `feature_scheduled_changes` | id, tenant_id, feature_id, scheduled_at, changes, status, executed_at, is_active | Time-based feature activation/deactivation. |

## Related Modules

- [Navigation](../navigation/) - Feature-flagged menu items
- [Tenancy](../tenancy/) - Tenant-specific feature settings
