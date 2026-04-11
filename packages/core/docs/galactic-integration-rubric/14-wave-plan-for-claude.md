# Wave Plan For Claude

This plan is ordered by product leverage, not by internal elegance.

## Completion Status

| Wave | Name | Status |
|------|------|--------|
| G0 | Tenant Model Decision | COMPLETE |
| G1 | True File-First Entry Points | COMPLETE |
| G2 | DB Tenant Core Contract v1 | COMPLETE |
| G3 | Static / Preview / Runtime Parity | COMPLETE |
| G4 | Modern Display Alignment | COMPLETE |
| G5 | Modern Inputs Closure | COMPLETE |
| G6 | Navigation / Overlay / Accessibility | COMPLETE |
| G7 | Rotate Host Tokenization | COMPLETE |
| G8 | Hook Story Decision | COMPLETE |
| G9 | Docs / Tests / Guardrails Truth Pass | COMPLETE |
| G10 | Non-Functional Hardening | PENDING |

## Wave G0 - Tenant Model Decision

Goal:

Freeze the intended product model:

- bundled first-party verticals are file-first and premium-capable
- runtime DB tenants are core-first in v1
- advanced runtime tenant styling is optional and explicitly bounded

Acceptance:

- docs and contracts say this clearly
- app-platform authoring/UI matches it

## Wave G1 - True File-First Entry Points

Goal:

Stop hitting the DB for bundled tenants before the app even knows whether the tenant is bundled.

Primary files:

- `app-platform/src/app/(dashboard)/layout.tsx`
- `app-platform/src/app/(auth)/layout.tsx`
- metadata or other early tenant resolution helpers

Acceptance:

- known bundled tenants short-circuit before DB branding fetch
- auth/dashboard/metadata all follow the same rule

## Wave G2 - DB Tenant Core Contract v1

Goal:

Move `app-platform` from legacy `branding/personality/tokenOverrides` toward a core-first `appearance.general` contract.

Primary files:

- `app-platform/src/lib/tenancy/get-tenant-branding.ts`
- `app-platform/src/lib/tenancy/branding-to-tenant-config.ts`
- `app-platform/src/surfaces/settings/overview.tsx`
- `ui-design-system/packages/core/src/contracts/tenants/index.ts`
- `ui-design-system/packages/core/src/contracts/themes/index.ts`

Acceptance:

- DB tenant payload can express the agreed core contract
- app-platform authoring UI writes/reads that contract
- legacy compat remains explicit, not accidental

## Wave G3 - Static / Preview / Runtime Parity

Goal:

Make `appearance` behave consistently in:

- runtime provider
- static generator
- tenant preview

Primary files:

- `ui-design-system/packages/core/src/runtime/tenant/storage/static/generator/index.ts`
- `ui-design-system/packages/core/src/components/patterns/misc/tenant-preview/engines/modern.tsx`
- `ui-design-system/packages/core/src/compilers/appearance/index.ts`

Acceptance:

- preview tells the same truth as runtime
- generated CSS can represent the live supported `appearance` contract

## Wave G4 - Modern Display Alignment

Goal:

Fix high-value display primitives where contract, theme bridge, and renderer have drifted apart.

Primary files:

- `Card/engines/modern.tsx`
- `Carousel/engines/modern.tsx`
- `Image/engines/modern.tsx`
- `Statistic/engines/modern.tsx`
- `Descriptions/engines/modern.tsx`
- `QRCode/engines/modern.tsx`
- `tokens/css/engines/modern/theme.css`

Acceptance:

- one canonical appearance path per primitive
- rendered behavior changes when the declared tokens change

## Wave G5 - Modern Inputs Closure

Goal:

Finish the highest-value input gaps in Modern.

Primary files:

- `AutoComplete`
- `DatePicker`
- `TimePicker`
- `TreeSelect`
- `Cascader`
- `ColorPicker`
- `Slider`
- `Upload`

Acceptance:

- major props are either honored or narrowed
- popup/internal states use canonical token paths
- native/Daisy leakage is reduced in the worst offenders

## Wave G6 - Navigation / Overlay / Accessibility

Goal:

Bring overlay-like patterns and key navigation primitives up to modal-quality semantics and stronger DS ownership.

Primary files:

- `command-palette/engines/modern.tsx`
- `shortcuts-overlay/engines/modern.tsx`
- `Link/engines/modern.tsx`
- `Breadcrumb/engines/modern.tsx`
- `Tabs/engines/modern.tsx`
- `Stepper/engines/modern.tsx`
- `Steps/engines/modern.tsx`

Acceptance:

- `role="dialog"` / `aria-modal` / Escape / focus trap / focus return where appropriate
- less Daisy-first appearance ownership

## Wave G7 - Rotate Host Tokenization

Goal:

Move more visible Rotate shell styling from app-owned CSS and local geometry into canonical DS tokens/components.

Primary files:

- `app-platform/src/app/globals.css`
- `app-platform/src/components/_shared/layouts/app-layout/sidebar/index.tsx`
- DS shell/sidebar/pattern token consumers as needed

Acceptance:

- the DS owns more of what users actually see
- app-platform keeps business logic, not styling authority

## Wave G8 - Hook Story Decision

Goal:

Stop carrying a confusing middle state where many hook families are exported but not truly fused.

Primary files:

- `ui-design-system/packages/core/src/hooks/index.ts`
- command/search/data/routing/state/notifications/dnd/ai hook barrels
- app-platform host consumers

Acceptance:

- each hook family is either activated with real consumers or clearly narrowed as app-facing

## Wave G9 - Docs / Tests / Guardrails Truth Pass

Goal:

Make the repository tell one accurate story again.

Primary files:

- stale docs in `packages/core/docs`
- `app-platform/src/config/tenant/index.ts`
- `audit-integration.mjs`
- provider/integration tests in all three apps

Acceptance:

- no stale "not wired" docs for live features
- guardrails catch new contract/runtime divergence
- critical hosts have real provider tests, not only mocked boot tests

## Wave G10 - Non-Functional Hardening

Goal:

Address the most important performance, accessibility, and multi-tenant hardening items.

Primary files:

- `SystemCssVariablesBridge.tsx`
- `ThemeProvider.tsx`
- overlay/palette patterns
- `get-tenant-branding.ts`
- DB branding validation layer

Acceptance:

- no `JSON.stringify(tokens)` root fingerprinting
- better modal semantics
- better validation and clearer error/absence distinction for tenant data
