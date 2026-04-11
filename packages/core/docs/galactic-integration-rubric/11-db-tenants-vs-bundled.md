# Bundled Verticals vs DB Tenants

This is the most important architecture decision in the whole audit.

## Recommended Model

### Bundled first-party verticals

These are code-owned product identities.

Examples:

- `rottay`
- `evnto`
- `bithire`

Recommended source of truth:

`tenantSlug -> DS registry -> bundled CSS -> brandTheme -> product profile`

DB should not define their baseline styling contract.

### Runtime DB tenants v1

These are unknown-at-build-time tenants created after deployment.

Recommended MVP contract:

- `branding.companyName`
- `branding.logo`
- `branding.logoMark`
- `branding.favicon`
- `appearance.general.palette.primary`
- `appearance.general.palette.secondary`
- `appearance.general.palette.accent`
- `appearance.general.palette.backgroundMode`
- `appearance.general.typography.fontFamilyBase`
- `appearance.general.typography.fontFamilyHeading`
- `appearance.general.shape.buttonStyle`
- `appearance.general.density`
- `appearance.general.surfaces.elevation`
- `appearance.general.navigation.sidebarTone`
- locale
- optional `vertical`

This is intentionally "core-first".

### Runtime DB tenants v2 optional

Optional premium layer, only if explicitly supported:

- `appearance.advanced`
- optional `brandTheme`
- optional `brandThemeId`

Only after:

- schema validation exists
- static/runtime parity exists
- authoring UI supports it honestly

## What We Should Avoid

- treating DB tenants as if they already have first-party premium parity
- letting app-platform continue to infer its own silent partial contract
- keeping `personality` and `tokenOverrides` as the default authoring story for new DB tenants

## Contract Table

| Contract element | Bundled first-party | Runtime DB v1 | Runtime DB v2 |
|---|---|---|---|
| `brandTheme` | yes | no | optional |
| `brandThemeId` | optional if implemented | no | optional if implemented |
| `appearance.general` | yes | yes | yes |
| `appearance.advanced` | yes | no | optional |
| `branding` identity | yes | yes | yes |
| `personality` | compat only | avoid as primary | compat only |
| `tokenOverrides` | compat only | avoid as primary | compat / escape hatch |
| bundled CSS artifacts | yes | no | no |

## Why This Model Fits The Product

The user requirement is not "every tenant gets full advanced premium editing on day one".

The user requirement is:

- first-party verticals must look deeply differentiated
- DB tenants must be able to change the core look safely
- advanced styling can come later or be optional

That is exactly what this split supports.

## Immediate Work To Support This Model

1. upgrade `app-platform` DB adapter from legacy fields toward `appearance.general`
2. short-circuit bundled tenants before DB fetch
3. update whitelabel UI to teach core-first authoring
4. document advanced tier as optional, not assumed
