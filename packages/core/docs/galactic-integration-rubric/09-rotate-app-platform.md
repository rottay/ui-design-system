# Rotate / app-platform

## Verdict

`app-platform` is a strong Modern MVP host, but not yet a clean neutral host.

It proves that:

- DS styles are visibly active
- Rotate shell styling can read DS variables
- the provider stack is coherent

But it also shows where the host still bypasses or narrows the DS story.

## Scorecard

| Area | Score | Notes |
|---|---:|---|
| Provider stack coherence | 7 | unified dashboard/auth flow is solid |
| Runtime DS visibility | 8 | visible shell styling clearly reads DS vars |
| Bundled-vs-DB discipline | 6 | better than before, still not file-first soon enough |
| Whitelabel contract alignment | 4 | still too legacy / app-owned |
| Host-owned bypass control | 4 | too much visible shell behavior still lives outside DS |
| Rotate / Modern host readiness | 7 | viable for MVP |

## What The Host Gets Right

### Correct DS style imports

`app-platform/src/app/globals.css` imports:

- `@rottay/design-system/styles/rottay`
- `@rottay/design-system/styles/modern`

### Unified provider contract

Both auth and dashboard route through `DesignSystemProvider` with roughly the same inputs:

- `app-platform/src/components/providers/dashboard-providers/index.tsx`
- `app-platform/src/components/providers/tenant-provider/index.tsx`

### Visible DS variable consumption

The sidebar shell and related host chrome visibly consume:

- `--ds-sidebar-*`
- `--ds-layout-*`

Files:

- `app-platform/src/app/globals.css`
- `app-platform/src/components/_shared/layouts/app-layout/sidebar/index.tsx`

## What The Host Still Gets Wrong

### Bundled tenants still hit DB too early

The app still resolves branding upstream and only later strips it for known tenants.

### The DB adapter is still legacy

`branding-to-tenant-config.ts` still reflects the older:

- `branding`
- `personality`
- `tokenOverrides`

story, not the newer `appearance.general`-first story.

### The shell is only partly DS-owned

Rotate's visible identity is still split between:

- DS variables
- app-owned gradients/separators/layout CSS
- app-owned geometry/motion in shell/sidebar code

### Command/search is still dormant in the live host

`SearchCommandBar` is present, but the full registry-backed path is not active in the main workspace host.

## Rotate-Specific Recommendation

For Rotate, the DS should own:

- shell chrome tokens
- sidebar/header tokens
- navigation states
- command/search surface
- whitelabel core contract

The app should only own:

- business logic
- permissions
- route composition
- app-specific workflows

Not visible structural identity.

## Highest-Value Rotate Waves

- `R-Host-1`: true file-first entrypoints
- `R-Host-2`: DB tenant contract upgrade
- `R-Host-3`: host shell tokenization
- `R-Host-4`: command/search activation and docs cleanup
