# Cross-App Coherence

Score: `6.2/10`

## Short reading

The apps are now reasonably coherent at the:

- tenant boundary
- provider layer
- branding transport layer

They are still materially incoherent at the:

- shell layer
- shared visible patterns
- settings/admin model

## Strongest convergence

### 1. Tenant pipeline

All three apps now share the core idea:

- bundled first-party tenants skip DB styling fetches
- DB tenants can provide `appearance`
- DS runtime can preserve `appearance`

### 2. Provider intent

All three apps now mount `DesignSystemProvider` and `NavigationLinkProvider` in a directionally correct way.

### 3. Navigation-link integration

The apps now share the `next/link` integration pattern for DS structures.

## Largest mismatches

### P1. One shell contract is not shared

`app-platform` uses `AppShell`.

Evnto and BitHire still use bespoke shell stacks.

### P1. BitHire has two shell architectures

That is drift inside one app, not only across apps.

### P1. Settings/admin are not one product family

Today the visible story is:

- `app-platform`: tenant admin plus advanced whitelabel
- `app-evnto`: lightweight product-level settings
- `app-bithire`: custom settings/workspace flow

These do not feel like sibling apps built from one system.

### P2. Shared page/surface headers are still local variants

Instead of one DS-owned page/surface header family, the apps still use:

- local command header
- local page header
- local page-shell variants

### P2. Guardrails do not yet protect sibling quality

Current guardrails help with:

- token presence
- registry/static checks

They do not yet protect:

- shell convergence
- settings convergence
- shared pattern ownership
- end-to-end sibling behavior

## Desired sibling model

### Shared across apps

- one shell contract
- one page/surface header family
- one settings/admin grammar with product-specific depth
- one search/notification/command structure family

### Different across apps

- brand theme
- content model
- domain-specific workflows
- product-specific priorities

## Coherence conclusion

The apps now feel like:

- siblings in plumbing
- cousins in visible product structure

That is real progress, but not yet the finish line.

