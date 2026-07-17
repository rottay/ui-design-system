# Methodology

## Audit shape

This pass was designed as a premium sign-off audit rather than a narrow regression review.

It evaluated:

1. design system truthfulness
2. app consumption quality
3. product-level visible quality
4. cross-app coherence
5. maintainability and guardrail strength

## Repos audited

- `ui-design-system`
- `app-platform`
- `app-evnto`
- `app-bithire`

## Parallel passes

Six specialized audit passes were run:

1. `ui-design-system` premium/runtime/token/accessibility audit
2. `app-platform` architecture and DS-consumption audit
3. `app-platform` premium UX and visual-direction audit
4. `app-evnto` architecture and DS-consumption audit
5. `app-bithire` architecture and DS-consumption audit
6. cross-app coherence audit

## Local verification

After agent synthesis, the highest-risk claims were checked directly in code, including:

- `useTenantBranding`
- tenant preview types and authoring helpers
- `TenantPreview` rendering path
- `AppShell` mobile drawer behavior
- `Descriptions.Modern`
- `DataTable.Modern` reorder grip behavior
- `app-platform` settings authoring path
- `app-platform` workspace local styling
- `app-platform` dashboard/workspace/settings file-size density
- `app-evnto` shell/layout ownership
- `app-evnto` host CSS override layers
- `app-bithire` shell ownership and `v2` layout duplication

## Worktree note

Audit state was based on the current local worktrees at audit time.

Clean worktrees:

- `ui-design-system`
- `app-evnto`
- `app-bithire`

Dirty worktree:

- `app-platform`

Observed uncommitted files in `app-platform`:

- `src/composition/components/_shared/layouts/app-layout/index.tsx`
- `src/composition/components/_shared/layouts/app-layout/sidebar/index.tsx`
- `src/lib/tenancy/branding-to-tenant-config.ts`

This matters because the audit reflects the most current state you are actually working with, not just the last commit boundary.

## Scoring

Each section was scored from `1` to `10`.

Interpretation:

- `9-10`: premium-final, low drift, strong truthfulness
- `7-8`: strong and mostly trustworthy, but still with notable gaps
- `5-6`: credible and moving in the right direction, but not premium-final
- `3-4`: structurally weak or visibly inconsistent
- `1-2`: misleading, broken, or largely non-functional for the claimed scope

## What this audit is not

This is not:

- a full browser-based QA run across every flow
- a benchmark/performance lab run
- a full mobile device matrix

It is:

- a deep code and architecture audit
- a premium product-surface audit
- a DS ownership/coherence audit

