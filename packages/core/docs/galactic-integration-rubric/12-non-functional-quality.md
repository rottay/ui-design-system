# Non-Functional Quality

## Scorecard

| Dimension | Score | Notes |
|---|---:|---|
| Performance | 6 | generally okay, but some root runtime work is heavier than needed |
| Accessibility / keyboard / focus | 5 | key overlay-like patterns still miss modal semantics |
| Resilience / fallback behavior | 8 | one of the stronger dimensions |
| Operability / debuggability | 6 | fallback behavior is good, error/noise distinction still weak |
| Security-adjacent multi-tenant hygiene | 6 | bounded, but still under-validated |
| Modern MVP host readiness | 7 | good enough for product, not yet "hardened platform" level |

## Performance

### Strong

- static CSS imports in `app-platform` avoid theme FOUC
- `ThemeProvider` already uses shallow fingerprints in some theming paths

### Weak

- `SystemCssVariablesBridge` still uses `JSON.stringify(tokens)` on every render

Main file:

- `ui-design-system/packages/core/src/runtime/bootstrap/SystemCssVariablesBridge.tsx`

## Accessibility

### Strong

- `Modal` is significantly better than the weaker overlay-like patterns

### Weak

- `CommandPalette` lacks true modal semantics
- `ShortcutsOverlay` still lacks modal-quality focus handling and Escape flow

Files:

- `ui-design-system/packages/core/src/components/patterns/navigation/command-palette/engines/modern.tsx`
- `ui-design-system/packages/core/src/components/patterns/navigation/shortcuts-overlay/engines/modern.tsx`

## Resilience

The DS runtime fallback ladder is one of the strongest parts of the architecture.

Main file:

- `ui-design-system/packages/core/src/runtime/tenant/storage/index.ts`

The main weakness is not fallback coverage. It is observability:

- `getTenantBranding()` returns `null` on DB failures, which is resilient for uptime but weak for diagnosis

Main file:

- `app-platform/src/lib/tenancy/get-tenant-branding.ts`

## Security-Adjacent Concerns

This is not a direct code execution risk, but it is still worth tightening.

Current issue:

- DB whitelabel JSON is cast into branding/personality/token overrides without strong schema validation
- those values then influence CSS variables, URLs, and style tag content

Main files:

- `app-platform/src/lib/tenancy/get-tenant-branding.ts`
- `app-platform/src/lib/tenancy/branding-to-tenant-config.ts`
- `ui-design-system/packages/core/src/runtime/theming/ThemeProvider.tsx`

## Recommended Waves

- `NF1`: overlay accessibility hardening
- `NF2`: runtime performance cleanup
- `NF3`: file-first / DB-first boundary cleanup
- `NF4`: multi-tenant hardening and validation
