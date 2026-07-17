# Current-To-Target Mapping

This file tells Claude how to rehome the current roots without losing behavior.

## Global mapping

### `src/actions/`

Do not delete.

Rehome:

- business actions -> `features/<family>/<feature>/actions`
- infra actions -> `core/*`

Examples:

- auth actions with app-global runtime impact -> `core/lib/auth` or `core/providers`
- candidate/job/interview actions -> owning feature

### `src/surfaces/`

Do not keep as a permanent root.

Rehome:

- screen entrypoints -> `features/<family>/<feature>/screens`

### `src/composition/components/`

Split by ownership:

- domain components -> `features/<family>/<feature>/components`
- app-owned shared presentation -> `ui/`
- DS-worthy reusable patterns -> upstream to DS

### `src/constants/`

Rehome to:

- `core/config/`

### `src/hooks/`

Split by ownership:

- cross-app hooks -> `core/hooks/`
- domain hooks -> owning feature

### `src/providers/`

Rehome to:

- `core/providers/`

### `src/stores/`

Rehome to:

- `core/state/`

### `src/types/`

Split by ownership:

- app-global contracts -> `core/types/`
- domain contracts -> owning feature `types/`

### `src/lib/`

Split by ownership:

- app infra -> `core/lib/`
- domain adapters -> owning feature `lib/`

### `src/database/`

Rehome to:

- `core/database/`

## Platform mapping

Current:

- `src/surfaces/compliance`
- `src/surfaces/security`
- `src/surfaces/settings`
- `src/actions/compliance`
- `src/actions/tenancy`

Target:

- `features/governance-risk/compliance/screens`
- `features/security-ops/security/screens`
- `features/tenant-administration/settings/screens`
- `features/governance-risk/compliance/actions`
- `features/tenant-administration/tenancy/actions`

## BitHire mapping

Current:

- `src/actions/ai-chat`
- `src/actions/ai-models`
- `src/actions/ai-providers`
- `src/surfaces/candidates`
- `src/composition/components/candidates`

Target:

- `features/ai-operations/copilot/actions`
- `features/ai-operations/model-management/actions`
- `features/ai-operations/provider-management/actions`
- `features/talent-acquisition/candidates/screens`
- `features/talent-acquisition/candidates/components`

## Evnto mapping

Current:

- `src/surfaces/bar`
- `src/surfaces/inventory`
- `src/surfaces/settings`
- `src/actions/bar`
- `src/actions/inventory`

Target:

- `features/commerce-operations/bar/screens`
- `features/commerce-operations/inventory/screens`
- `features/intelligence-admin/settings/screens`
- `features/commerce-operations/bar/actions`
- `features/commerce-operations/inventory/actions`

## Important migration rule

Rehome in three steps:

1. create the target folder and `index.ts`
2. move ownership and update imports
3. leave compat re-exports only when needed and delete them quickly
