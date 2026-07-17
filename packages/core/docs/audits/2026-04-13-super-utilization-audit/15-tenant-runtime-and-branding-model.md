# Tenant Runtime And Branding Model

## Executive Read

The base tenant story already exists.

It is not hypothetical.

Today, the repo already supports:

- bundled first-party tenants from the design system
- static-file tenant resolution
- remote/API tenant resolution
- app-level default overrides
- runtime merge of DB token overrides on top of app defaults

That matters because the next phase should build on this model instead of reinventing it app-by-app.

## Current Source Of Truth

### Design-System Tenant Runtime

Evidence:

- `ui-design-system/packages/core/src/infrastructure/runtime/tenant/index.ts`
- `ui-design-system/packages/core/src/infrastructure/runtime/tenant/foundation/configuration/registry/index.ts`
- `ui-design-system/packages/core/src/infrastructure/runtime/tenant/runtime/store/index.ts`

Current DS guarantees:

- a bundled registry for first-party tenants
- a static-file loading path
- a remote/API loading path
- cache + localStorage reuse
- guaranteed default fallback

### Built-In Tenants

From the bundled registry:

- `rottay`
- `bithire`
- `evnto`

The registry also tracks bundled CSS availability separately from runtime config, which is important because bundled CSS can exist without a full tenant runtime config.

Current bundled CSS set includes:

- `rottay`
- `bithire`
- `evnto`
- `themanagementmiami`

### Current Resolution Chain

The DS storage facade documents a six-step resolution chain:

1. memory cache
2. localStorage cache
3. known tenant registry
4. static files
5. remote API
6. default tenant config

This is exactly the right shape for what we need next.

## What “Original Tenants Read From Static” Should Mean

There are two valid interpretations, and the repo already supports both.

### Option A: Bundled First-Party Tenants In The DS Registry

Use when:

- the tenant is a product-owned, first-party baseline
- you want zero-latency dev/CI/storybook behavior
- the tenant should ship with the DS bundle

Current examples:

- `rottay`
- `bithire`
- `evnto`

Best for:

- flagship products
- official starter tenants
- storybook/demo/reference themes

### Option B: Static File Tenant Payloads

Use when:

- the tenant should not be hardcoded into the DS registry
- you still want filesystem/static hosting rather than DB dependency
- the tenant needs to travel as a versioned deployment artifact

The DS storage facade already supports static files before remote API.

Best for:

- seed tenants
- partner demo tenants
- controlled white-label presets
- environments where DB resolution is not guaranteed yet

## What Remote / DB Tenants Should Mean

Use remote/API-backed tenants when:

- the tenant is customer-managed
- branding can change without a DS release
- token overrides or plan/features come from the platform
- you need runtime governance and auditability

The right model is:

- keep a strong static base
- layer remote overrides on top
- cache aggressively
- never let the UI fail hard when remote resolution is unavailable

## Current App Integration Model

### Platform

Evidence:

- `app-platform/src/vertical/config/tenant/index.ts`

Read:

- Platform does not define tenant configs itself
- it treats the DS as the source of tenant truth
- unknown tenants are expected to resolve through API/default logic

This is a good direction.

### BitHire

Evidence:

- `app-bithire/src/core/providers/index.tsx`

Read:

- BitHire resolves a theme tenant from the runtime slug
- it calls `useTenantBranding`
- it merges app defaults from `getBithireTenantOverrides(...)`
- DB token overrides win over app defaults

This is the correct precedence order:

- app structural defaults first
- customer-specific DB overrides second

### Evnto

Evidence:

- `app-evnto/src/app/layout.tsx`
- `app-evnto/src/core/providers/index.tsx`

Read:

- bundled tenants skip DB metadata fetch in layout metadata generation
- provider resolves branding through `useTenantBranding`
- app defaults from `getEvntoTenantOverrides(...)` are merged first
- DB token overrides win second

This is also the correct model.

## Recommended Final Model

Cloud should treat tenant resolution as four layers:

1. **Base tenant identity**
   - bundled registry tenant or static-file tenant
2. **Vertical/product defaults**
   - Platform, BitHire, Evnto structural defaults
3. **Customer/tenant overrides**
   - token overrides, logos, brand assets, personality tuning
4. **User/runtime preferences**
   - theme mode, locale, motion preferences, density preferences if introduced later

### Why This Layering Works

- it keeps first paint predictable
- it avoids DB dependence for known tenants
- it still supports customer-specific customization
- it keeps vertical identity stronger than arbitrary tenant drift

## What Cloud Should Implement For Static Tenants

For “original” or curated tenants that should not require DB:

1. define a complete base tenant config
2. choose whether it belongs in the bundled registry or a static-file payload
3. ensure it has:
   - brand theme
   - personality baseline
   - token overrides if needed
   - branding metadata
   - any tenant-scoped feature flags

Use the bundled registry when zero-latency availability matters.

Use static files when you want deploy-time configurability without bundling every tenant into the DS package.

## What Cloud Should Implement For DB Tenants

DB tenants should only need to define the things that are truly tenant-specific:

- company name
- logos
- favicon
- primary/secondary/accent colors if applicable
- token overrides
- optional personality tuning
- feature flags or plan entitlements

They should **not** redefine the whole vertical from scratch.

The vertical still owns:

- layout grammar
- shell behavior
- default density
- motion posture
- major component archetypes

## Non-Negotiable Invariants

1. A tenant should never break first paint because the DB is slow.
2. A tenant should never be forced to redefine the whole app’s structural grammar.
3. Vertical identity should remain stronger than arbitrary per-tenant styling.
4. Brand differentiation should be able to express more than just colors.
5. Known first-party tenants should stay resolvable in development, CI, and Storybook without network dependence.

## Recommended Data Model Additions

If Cloud needs to strengthen the tenant contract, the safest additions are:

- `motionProfile`
- `densityProfile`
- `surfaceProfile`
- `iconTreatment`
- `illustrationTone`
- `marketingTheme`

These let tenant identity influence presentation without forking component code.

## Implementation Guidance

When Cloud builds new theming or tenant work:

1. keep the DS storage facade as the single resolution orchestrator
2. keep built-in tenants bundled
3. use static-file payloads for curated non-DB tenants
4. use API/DB for customer-managed tenants
5. merge app defaults before tenant overrides

That keeps the model fast, resilient, and understandable.
