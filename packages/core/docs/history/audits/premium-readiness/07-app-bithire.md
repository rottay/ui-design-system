# App-BitHire Audit

Score: `6.0/10`

## What is good

- provider order is fundamentally sound
- tenant/branding pipeline is materially improved
- root layout and bundled-tenant handling are in better shape
- theme override discipline is better than before

Key files:

- `src/providers/index.tsx`
- `src/lib/tenancy/get-tenant-branding.ts`
- `src/app/layout.tsx`
- `src/lib/theme/index.ts`

## Main problem

BitHire is still the furthest app from a premium DS-consumer shape.

It is credible at the provider/tenant boundary, but it still owns too much:

- shell
- layout
- visible chrome
- product structure

## Top findings

### P1. Shell is still owned locally

BitHire still hardcodes:

- sidebar widths
- header offsets
- mobile drawer behavior
- content padding
- shell transitions

Key files:

- `src/app/(dashboard)/layout.tsx`
- `src/composition/components/layout/sidebar/index.tsx`
- `src/composition/components/layout/header/index.tsx`
- `src/composition/components/layout/main-content/index.tsx`

### P1. BitHire still has a second parallel shell family

The `components/v2/layout/*` path means BitHire is split inside itself.

Key files:

- `src/composition/components/v2/layout/index.ts`
- `src/composition/components/v2/layout/v2-page-shell/index.tsx`
- `src/composition/components/v2/layout/v2-sidebar/index.tsx`
- `src/composition/components/v2/layout/v2-header/index.tsx`

### P1. High-visibility surfaces still bypass DS ownership

Representative examples include:

- candidate profile header
- analytics surfaces
- AI studio and interview flows with dense inline styles and bespoke chrome

Examples:

- `src/composition/components/candidates/profile-header/index.tsx`
- `src/surfaces/analytics/quality-of-hire/index.tsx`
- `src/surfaces/ai-studio/overview/index.tsx`
- `src/surfaces/interviews/create/index.tsx`

### P2. Settings are still too custom

BitHire settings still behave as a separate local workspace/settings system rather than a sibling of the `app-platform` admin direction.

Key files:

- `src/surfaces/settings/general/index.tsx`
- `src/app/(dashboard)/settings/content/index.tsx`

## Conclusion

BitHire is not in bad shape at the transport/provider layer.

But it is still not converged where premium multi-app coherence actually shows up:

- shell
- settings
- visible product structure

The highest-value move is to stop doing more local visual invention and instead converge BitHire onto the same DS-owned shell and shared structural patterns that `app-platform` is moving toward.

