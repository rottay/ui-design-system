# Runtime and Tenancy

## Current State

The DS runtime itself is mostly coherent:

- `DesignSystemProvider` has a defensible precedence chain.
- `ThemeProvider` has strong fallback behavior.
- the tenant storage facade is well-structured.

The main drift is not inside the DS core. It is at the app boundary, especially in `app-platform`.

## What Is Strong

- `ui-design-system/packages/core/src/infrastructure/runtime/bootstrap/composition/react/provider/index.tsx`
- `ui-design-system/packages/core/src/infrastructure/runtime/theming/composition/react/provider/index.tsx`
- `ui-design-system/packages/core/src/infrastructure/runtime/tenant/runtime/store/index.ts`
- `ui-design-system/packages/core/src/infrastructure/runtime/tenant/foundation/configuration/registry/index.ts`
- `ui-design-system/packages/core/src/infrastructure/runtime/theming/composition/react/tokens/index.ts`

The DS already has:

- explicit sync-vs-async tenant resolution
- a strong fallback ladder
- product-profile / vertical / engine / theme composition
- bundled first-party registry separation

## What Is Still Wrong

### 1. Bundled tenants are not file-first early enough

`app-platform` still fetches DB branding in route/layout code and only later discards it for known tenants.

Main evidence:

- `app-platform/src/app/(dashboard)/layout.tsx`
- `app-platform/src/app/(auth)/layout.tsx`
- `app-platform/src/composition/components/providers/dashboard-providers/index.tsx`
- `app-platform/src/composition/components/providers/tenant-provider/index.tsx`

This means the intended rule exists, but the app still pays DB latency and complexity for bundled first-party tenants.

### 2. app-platform bypasses the DS storage facade

Instead of relying on the DS tenant storage chain, `app-platform` uses its own DB normalization path:

- `app-platform/src/lib/tenancy/get-tenant-branding.ts`
- `app-platform/src/lib/tenancy/branding-to-tenant-config.ts`

This creates a parallel runtime story that `app-evnto` and `app-bithire` do not share.

### 3. The DB tenant path is still legacy

The DB adapter maps:

- `branding`
- `personality`
- `tokenOverrides`

but not:

- `appearance`
- `brandTheme`
- `brandThemeId`

That keeps DB tenants on a smaller, older contract, but without formally describing it as the intended MVP model.

## Architecture Recommendation

### Bundled first-party verticals

Desired rule:

`tenantSlug only -> DS registry / bundled CSS / brandTheme / product profile`

For these, the app should not fetch DB styling before it knows whether the tenant is bundled.

### Runtime DB tenants, v1

Desired rule:

`DB -> bounded core contract -> DesignSystemProvider`

That contract should be intentionally smaller than bundled premium styling:

- `branding`
- `appearance.general`
- locale
- optional `vertical`

### Runtime DB tenants, v2 optional

Only if explicitly supported:

- `appearance.advanced`
- optional `brandTheme` or `brandThemeId`

That path should require validation and documentation, not just permissive casting.

## Runtime Rubric

| Sub-area | Score | Notes |
|---|---:|---|
| Provider precedence | 8 | Good. |
| Storage facade quality | 8 | Good. |
| Bundled first-party boundary | 5 | Still too late in the app path. |
| DB tenant contract clarity | 4 | Still underdefined. |
| Static/runtime parity | 5 | `appearance` is not yet equally present in the static/generator path. |

## Immediate Waves

- `T1`: short-circuit bundled tenants before DB fetch in `app-platform`
- `T2`: define DB tenant v1 core contract formally
- `T3`: decide whether `app-platform` should move onto the DS storage facade or continue with an app adapter, but document one model only
