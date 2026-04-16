# Methodology

Date: 2026-04-13

This audit measures three things at once:

1. How much of the public design-system surface is actually used in the three product apps.
2. How deeply each app reads and applies its own vertical identity layer.
3. Which gaps, duplications, and missed abstractions are worth fixing next.

## Inputs

- Design system package:
  - [package.json](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/package.json)
  - [src/index.ts](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/index.ts)
  - [src/components](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components)
  - [src/hooks](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks)
  - [src/runtime](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/runtime)
- Product apps:
  - [app-platform/src](/Users/daniel/Developer/Rottay/app-platform/src)
  - [app-bithire/src](/Users/daniel/Developer/Rottay/app-bithire/src)
  - [app-evnto/src](/Users/daniel/Developer/Rottay/app-evnto/src)

## Evidence Model

The package favors real code evidence over description.

- Usage counts are based on resolved import declarations in source files.
- Vertical adoption counts focus on actual imports from `@/vertical/*`, not comments.
- Wrapper layers are measured separately from direct `@rottay/design-system` usage.
- “Underused” means the package exposes a capability that is either absent or very lightly used in the apps.

## Local Quantitative Checks

The audit used repo-wide shell scans to establish the baseline:

- DS import statements across all three apps: `1424`
- DS import statements by app:
  - Platform: `508`
  - BitHire: `472`
  - Evnto: `444`
- Vertical import statements by app:
  - Platform: `64`
  - BitHire: `55`
  - Evnto: `6`
- UI import statements by app:
  - Platform: `57`
  - BitHire: `100`
  - Evnto: `82`
- DS style entrypoint references by app:
  - Platform: `18`
  - BitHire: `4`
  - Evnto: `4`

The DS source itself was also sized locally:

- top-level primitive families: `6`
- top-level pattern families: `9`
- top-level structure families: `7`
- top-level surface families: `3`
- hook families: `18`
- top-level contract families: `9`

## Specialist Passes

This package includes evidence from 12 distinct explorer passes:

1. DS public surface inventory
2. Platform app adoption
3. BitHire app adoption
4. Evnto app adoption
5. Platform vertical-style consumption
6. BitHire vertical-style consumption
7. Cross-app duplication audit
8. DS underutilization audit
9. Platform opportunity audit
10. BitHire opportunity audit
11. Evnto opportunity audit
12. Evnto vertical-style consumption

## Caveats

- Import counts do not equal user-facing quality by themselves.
- Some DS capabilities are intentionally showroom-only or infra-facing.
- Vertical styling can be centralized in shell/layout rather than spread through all leaf components, so low downstream vertical imports are not automatically a failure.
- The package still flags meaningful asymmetries when one app relies heavily on primitives/tokens while barely reading its vertical layer.
