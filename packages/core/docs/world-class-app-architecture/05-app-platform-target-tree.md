# App Platform Target Tree

This tree assumes the final architecture, not the current transitional one.

Tone:

- control-room
- sharp
- precise
- compact

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
      app-layout/
      sidebar/
      topbar/
      breadcrumb-bar/
      main-content/
    navigation/
      index.ts
      sections/
      badges/
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
      telemetry/
      formatting/
    database/
      index.ts
    types/
      index.ts

  features/
    security-ops/
      index.ts
      dashboard/
      home-copilot/
      security/
      service-accounts/
      sessions/

    identity-access/
      index.ts
      identity/
      permissions/
      profile/
      impersonation/

    governance-risk/
      index.ts
      compliance/
      audit-trail/
      legal/
      docs/

    tenant-administration/
      index.ts
      tenancy/
      companies/
      settings/
      admin/

    platform-services/
      index.ts
      navigation/
      notifications/
      feature-flags/
      feature-analytics/
      payments/
      web3/

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

### `security-ops`

This is the main operator-facing cluster:

- dashboard
- home copilot
- security
- sessions
- service accounts

### `identity-access`

This is a different mental model from security ops:

- identity
- permissions
- impersonation
- profile

### `governance-risk`

This groups:

- compliance
- audit trail
- legal
- docs

These are regulation and audit surfaces, not day-to-day operator flows.

### `tenant-administration`

This is the operational admin plane for:

- tenancy
- companies
- settings
- admin

### `platform-services`

These are platform-wide supporting capabilities:

- navigation
- notifications
- feature flags
- analytics
- payments
- web3

## Migration notes

- `src/surfaces/*` screens move into the matching feature `screens/`
- `src/actions/*` move into the owning feature or `core/`
- `src/composition/components/_shared/layouts` becomes `vertical/shell`
- remaining app-owned shared tables/forms/feedback become `ui/`
