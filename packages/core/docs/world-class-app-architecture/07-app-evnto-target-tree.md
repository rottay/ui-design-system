# App Evnto Target Tree

This tree assumes the final architecture, not the current transitional one.

Tone:

- lively-venue
- rounded
- expressive
- airy

## Target tree

```text
src/
  app/

  vertical/
    manifest.ts
    index.ts
    profile/
      index.ts
    shell/
      index.ts
    navigation/
      index.ts
    routes/
      index.ts
      registry/
      use-route-meta/
    recipes/
      index.ts
      shell.ts
      workspace.ts
      dashboard.ts
      settings.ts

  core/
    index.ts
    config/
      index.ts
    providers/
      index.ts
    state/
      index.ts
    hooks/
      index.ts
    lib/
      index.ts
      api/
      auth/
      tenancy/
      analytics/
      formatting/
    database/
      index.ts
    types/
      index.ts

  features/
    event-operations/
      index.ts
      dashboard/
      events/
      onboarding/
      check-in/
      credentials/
      scheduling/
      artists/

    venue-operations/
      index.ts
      venues/
      staffing/
      staff/
      time-tracking/
      vip-tables/

    commerce-operations/
      index.ts
      bar/
      products/
      inventory/
      suppliers/
      purchasing/
      season-passes/

    finance-operations/
      index.ts
      finance/
      payroll/

    intelligence-admin/
      index.ts
      analytics/
      reports/
      settings/

  ui/
    index.ts
    brand/
      index.ts
    feedback/
      index.ts
    forms/
      index.ts
    tables/
      index.ts

  styles/
```

## Why these family names

### `event-operations`

This is the core event-running plane:

- events
- onboarding
- check-in
- credentials
- scheduling
- artists

### `venue-operations`

This is physical venue staffing and service:

- venues
- staffing
- staff
- time tracking
- vip tables

### `commerce-operations`

This groups the transactional stack:

- bar
- products
- inventory
- suppliers
- purchasing
- season passes

### `finance-operations`

This keeps finance and payroll explicit rather than scattering them.

### `intelligence-admin`

This groups operational intelligence and admin settings:

- analytics
- reports
- settings

## Migration notes

- `src/surfaces/*` move into `features/*/*/screens`
- `src/actions/*` move into owning feature or `core/`
- app-owned shared UI converges into `ui/`
